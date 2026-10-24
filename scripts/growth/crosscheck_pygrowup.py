#!/usr/bin/env python3
"""Independent cross-check of the WHO REFERENCE used by scripts/growth/audit.mjs (not of the tool).

Part A  Re-parses the cached WHO expanded daily xlsx files with the Python stdlib (zipfile + ElementTree,
        independent of the JS zip/xlsx reader) and recomputes the reference z of every grid case in the
        audit JSON (checks 1, 1b, 2). Expect |dz| ~ 1e-12.
Part B  Compares the daily reference against pygrowup 0.8.2 (WHO weekly 0-13 wk + monthly tables, no
        interpolation: it uses floor(week) for age <= 13 weeks, else floor(month), and rounds z to 0.01).
        For each pygrowup table row we evaluate measurements at z in {-4..4} at the row's exact age
        (week w = day 7w; month m = day m*30.4375, LMS linearly interpolated between the two whole days)
        and compare pygrowup's z with the reference z (restricted LMS for weight-for-age |z|>3).
        The lhfa month-24 row is skipped: pygrowup's combined 0-5 table has two month-24 rows (length and
        height) and keeps the height one, while day 730.5 straddles the length/height split.

Setup:  python3 -m venv /tmp/t015-venv
        /tmp/t015-venv/bin/pip install six setuptools
        /tmp/t015-venv/bin/pip install --no-build-isolation pygrowup   # plain install fails: setup.py imports six
Run:    node scripts/growth/audit.mjs --json /tmp/growth-audit.json
        /tmp/t015-venv/bin/python -I scripts/growth/crosscheck_pygrowup.py --audit-json /tmp/growth-audit.json
"""
import argparse
import json
import math
import os
import sys
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from decimal import Decimal

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
FILES = {  # (who metric, sex) -> cached file name (same files as scripts/growth/who-tables.mjs)
    ('wfa', 'male'): 'wfa-boys-zscore-expanded-tables.xlsx',
    ('wfa', 'female'): 'wfa-girls-zscore-expanded-tables.xlsx',
    ('lhfa', 'male'): 'lhfa-boys-zscore-expanded-tables.xlsx',
    ('lhfa', 'female'): 'lhfa-girls-zscore-expanded-tables.xlsx',
    ('hcfa', 'male'): 'hcfa-boys-zscore-expanded-tables.xlsx',
    ('hcfa', 'female'): 'hcfa-girls-zscore-expanded-tables.xlsx',
}
AUDIT_METRICS = {'wfa': ('wfa', 0, 1856, True), 'lfa': ('lhfa', 0, 730, False),
                 'hfa': ('lhfa', 731, 1856, False), 'hcfa': ('hcfa', 0, 1856, False)}
ZS = [-4, -3.5, -3, -2, -1, 0, 1, 2, 3, 3.5, 4]
# off-grid z (3 decimals) for part B, so pygrowup's 0.01 rounding does not mask differences
ZS_B = [-3.873, -3.214, -2.461, -1.337, -0.522, 0.174, 0.886, 1.643, 2.297, 3.131, 3.796]


def col_index(ref):
    n = 0
    for ch in ref:
        if not ch.isalpha():
            break
        n = n * 26 + ord(ch) - 64
    return n - 1


def read_daily(path):
    with zipfile.ZipFile(path) as z:
        shared = []
        if 'xl/sharedStrings.xml' in z.namelist():
            for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS):
                shared.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])))
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    rows = []
    for r in sheet.find('m:sheetData', NS).findall('m:row', NS):
        cells = {}
        for c in r.findall('m:c', NS):
            v = c.find('m:v', NS)
            if v is None:
                continue
            cells[col_index(c.get('r'))] = shared[int(v.text)] if c.get('t') == 's' else float(v.text)
        rows.append(cells)
    header = [rows[0][i] for i in sorted(rows[0])]
    idx = {h: i for i, h in enumerate(header)}
    day_col = idx.get('Day', idx.get('Age'))
    out = []
    for cells in rows[1:]:
        out.append({'day': int(cells[day_col]), 'L': cells[idx['L']], 'M': cells[idx['M']], 'S': cells[idx['S']]})
    out.sort(key=lambda r: r['day'])
    assert [r['day'] for r in out] == list(range(len(out))), path
    return out


def lms_value(lms, z):
    L, M, S = lms['L'], lms['M'], lms['S']
    return M * math.exp(S * z) if abs(L) < 1e-12 else M * (1 + L * S * z) ** (1 / L)


def lms_z(x, lms):
    L, M, S = lms['L'], lms['M'], lms['S']
    return math.log(x / M) / S if abs(L) < 1e-12 else ((x / M) ** L - 1) / (L * S)


def restricted_z(x, lms):
    z = lms_z(x, lms)
    if z > 3:
        sd3, sd2 = lms_value(lms, 3), lms_value(lms, 2)
        return 3 + (x - sd3) / (sd3 - sd2)
    if z < -3:
        sd3n, sd2n = lms_value(lms, -3), lms_value(lms, -2)
        return -3 + (x - sd3n) / (sd2n - sd3n)
    return z


def restricted_value(lms, z):
    if z > 3:
        sd3, sd2 = lms_value(lms, 3), lms_value(lms, 2)
        return sd3 + (z - 3) * (sd3 - sd2)
    if z < -3:
        sd3n, sd2n = lms_value(lms, -3), lms_value(lms, -2)
        return sd3n + (z + 3) * (sd2n - sd3n)
    return lms_value(lms, z)


def lms_at(rows, day, lo, hi):
    """Linear interpolation between whole days, staying on one side of the length/height split."""
    d0 = max(lo, min(hi - 1, math.floor(day)))
    t = day - d0
    a, b = rows[d0], rows[d0 + 1]
    return {k: a[k] + (b[k] - a[k]) * t for k in ('L', 'M', 'S')}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ref-dir', default=os.path.join(tempfile.gettempdir(), 'raffy-who-ref'))
    ap.add_argument('--audit-json', help='JSON written by audit.mjs --json (enables part A)')
    a = ap.parse_args()

    daily = {}
    for key, name in FILES.items():
        p = os.path.join(a.ref_dir, name)
        if not os.path.exists(p):
            sys.exit(f'missing {p}: run node scripts/growth/audit.mjs first (it downloads the WHO files)')
        daily[key] = read_daily(p)
    print(f'parsed {len(daily)} WHO daily tables, rows: ' + ', '.join(f'{k[0]}/{k[1]}={len(v)}' for k, v in daily.items()))

    # ---- Part A ----
    if a.audit_json:
        with open(a.audit_json) as f:
            audit = json.load(f)
        worst, n = (0.0, None), 0
        for cid in ('1', '1b', '2'):
            for c in audit['cases'][cid]:
                who, lo, hi, restricted = AUDIT_METRICS[c['metric']]
                lms = daily[(who, c['sex'])][c['age']]
                zr = restricted_z(c['value'], lms) if restricted else lms_z(c['value'], lms)
                d = abs(zr - c['zRef'])
                n += 1
                if d > worst[0]:
                    worst = (d, f"{c['sex']} {c['metric']} {c['age']}d z={c['zTarget']}")
        print(f'Part A (Python stdlib parse vs audit.mjs reference z): {n} cases, max |dz| = {worst[0]:.2e}'
              + (f' at {worst[1]}' if worst[1] else ''))

    # ---- Part B ----
    try:
        from pygrowup import Calculator
        from pygrowup.pygrowup import Observation
    except Exception as e:  # noqa: BLE001
        print(f'Part B skipped: pygrowup not importable ({e})')
        return 1
    calc = Calculator(adjust_height_data=False, adjust_weight_scores=True, include_cdc=False)
    probes = [(w * 7 + 3.5) / 30.4375 for w in range(0, 13)] + [m + 0.5 for m in range(3, 60)] + [60]
    stats = {}
    worst_round, worst_lms, n, skipped = (0.0, ''), (0.0, ''), 0, 0
    for sex in ('male', 'female'):
        for metric, (who, lo, hi, restricted) in AUDIT_METRICS.items():
            ind = {'wfa': 'wfa', 'lfa': 'lhfa', 'hfa': 'lhfa', 'hcfa': 'hcfa'}[metric]
            for age_m in probes:
                age_m = Decimal(repr(age_m))
                obs = Observation(ind, '1', age_m, sex[0].upper(), None, False, 'pygrowup')
                row = obs.get_zscores(calc)
                if 'Week' in row:
                    day = 7 * int(row['Week'])
                else:
                    day = int(row['Month']) * 30.4375
                if not (lo <= day <= hi) or (who == 'lhfa' and 730 < day < 731):
                    skipped += 1  # outside this audit metric, or the 24-month length/height row (see note)
                    continue
                ref = lms_at(daily[(who, sex)], day, lo, hi)
                pg = {k: float(row[k]) for k in ('L', 'M', 'S')}
                for z in ZS_B:
                    x = restricted_value(ref, z) if restricted else lms_value(ref, z)
                    zr = restricted_z(x, ref) if restricted else lms_z(x, ref)
                    zp = float(calc.zscore_for_measurement(ind, repr(x), age_m, sex[0].upper()))
                    zp_raw = restricted_z(x, pg) if restricted else lms_z(x, pg)  # pygrowup LMS, unrounded z
                    n += 1
                    s = stats.setdefault(metric, [0, 0.0, 0.0])
                    s[0] += 1
                    s[1] = max(s[1], abs(zp - zr))
                    s[2] = max(s[2], abs(zp_raw - zr))
                    tag = f"{sex} {metric} {row.get('Week') and 'week ' + row['Week'] or 'month ' + row['Month']} z={z}"
                    if abs(zp - zr) > worst_round[0]:
                        worst_round = (abs(zp - zr), tag)
                    if abs(zp_raw - zr) > worst_lms[0]:
                        worst_lms = (abs(zp_raw - zr), tag)
    print(f'Part B (pygrowup vs WHO daily reference): {n} cases ({skipped} probe/metric combos skipped)')
    print('  metric | cases | max |dz| pygrowup z (rounded 0.01) | max |dz| pygrowup LMS, unrounded z')
    for m, (c, d1, d2) in stats.items():
        print(f'  {m:6} | {c:5} | {d1:.4f} | {d2:.2e}')
    print(f'  worst rounded: {worst_round[0]:.4f} at {worst_round[1]}')
    print(f'  worst unrounded (table LMS agreement): {worst_lms[0]:.2e} at {worst_lms[1]}')
    ok = worst_round[0] <= 0.005 + 2e-3 and worst_lms[0] <= 2e-3
    print('  tolerance: 0.005 (pygrowup rounds z to 0.01) + 0.002 (WHO monthly/weekly tables publish L/M/S rounded to 4-5 decimals;'
          ' the daily reference is linearly interpolated to fractional month ages)')
    print('RESULT: ' + ('PASS' if ok else 'CHECK DIFFERENCES'))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
