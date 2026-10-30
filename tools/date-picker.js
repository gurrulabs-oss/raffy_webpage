/* Raffy date picker (growth percentile calculator).
   Progressive enhancement of <input type="date" data-datepicker>: without JS the native date input works.
   With JS the input becomes a text field (DD/MM/YYYY or MM/DD/YYYY) with a calendar popover (desktop) or
   bottom sheet (<=640px). The ISO value (YYYY-MM-DD) lives in a hidden input that takes over the original
   `name`, so tools/percentile-calculator.js keeps reading exactly the same strings via form.elements.
   Set the hidden input's value from script + dispatch a `change` event to update the visible field. */
(function () {
  'use strict';

  var natives = document.querySelectorAll('input[type="date"][data-datepicker]');
  if (!natives.length || typeof Intl === 'undefined' || !Intl.DateTimeFormat) return;

  /* ---------- Copy ---------- */
  var plural = function (n, one, many) { return n === 1 ? one : many; };
  var STR = {
    en: {
      today: 'Today', clear: 'Clear', done: 'Done', open: 'Open calendar', hint: 'Type it or pick it',
      chooseYear: 'Choose a year', chooseMonth: 'Choose a month', prev: 'Previous month', next: 'Next month',
      born: 'Born', old: function (m, d) { return m + ' ' + plural(m, 'month', 'months') + ', ' + d + ' ' + plural(d, 'day', 'days') + ' old'; },
      eFormat: 'Enter a full date, like {ex}.', eFuture: "This date can't be in the future."
    },
    es: {
      today: 'Hoy', clear: 'Borrar', done: 'Listo', open: 'Abrir calendario', hint: 'Escríbela o elígela',
      chooseYear: 'Elige un año', chooseMonth: 'Elige un mes', prev: 'Mes anterior', next: 'Mes siguiente',
      born: 'Nació el', old: function (m, d) { return m + ' ' + plural(m, 'mes', 'meses') + ' y ' + d + ' ' + plural(d, 'día', 'días'); },
      eFormat: 'Escribe la fecha completa, por ejemplo {ex}.', eFuture: 'La fecha no puede ser futura.'
    },
    fr: {
      today: "Aujourd'hui", clear: 'Effacer', done: 'OK', open: 'Ouvrir le calendrier', hint: 'Saisissez ou choisissez',
      chooseYear: 'Choisir une année', chooseMonth: 'Choisir un mois', prev: 'Mois précédent', next: 'Mois suivant',
      born: 'Né(e) le', old: function (m, d) { return m + ' mois et ' + d + ' ' + plural(d, 'jour', 'jours'); },
      eFormat: 'Saisissez une date complète, par ex. {ex}.', eFuture: 'La date ne peut pas être dans le futur.'
    },
    pt: {
      today: 'Hoje', clear: 'Limpar', done: 'Pronto', open: 'Abrir calendário', hint: 'Digite ou escolha',
      chooseYear: 'Escolha um ano', chooseMonth: 'Escolha um mês', prev: 'Mês anterior', next: 'Próximo mês',
      born: 'Nasceu em', old: function (m, d) { return m + ' ' + plural(m, 'mês', 'meses') + ' e ' + d + ' ' + plural(d, 'dia', 'dias'); },
      eFormat: 'Digite a data completa, por exemplo {ex}.', eFuture: 'A data não pode ser no futuro.'
    }
  };
  STR.it = {
    today: 'Oggi', clear: 'Cancella', done: 'Fatto', open: 'Apri il calendario', hint: 'Scrivila o sceglila',
    chooseYear: "Scegli l'anno", chooseMonth: 'Scegli il mese', prev: 'Mese precedente', next: 'Mese successivo',
    born: 'Nato/a il', old: function (m, d) { return m + ' ' + plural(m, 'mese', 'mesi') + ' e ' + d + ' ' + plural(d, 'giorno', 'giorni'); },
    eFormat: 'Inserisci la data completa, ad esempio {ex}.', eFuture: 'La data non può essere nel futuro.'
  };
  STR.de = {
    today: 'Heute', clear: 'Löschen', done: 'Fertig', open: 'Kalender öffnen', hint: 'Eintippen oder auswählen',
    chooseYear: 'Jahr wählen', chooseMonth: 'Monat wählen', prev: 'Vorheriger Monat', next: 'Nächster Monat',
    born: 'Geboren am', old: function (m, d) { return m + ' ' + plural(m, 'Monat', 'Monate') + ' und ' + d + ' ' + plural(d, 'Tag', 'Tage'); },
    eFormat: 'Gib das vollständige Datum ein, zum Beispiel {ex}.', eFuture: 'Das Datum darf nicht in der Zukunft liegen.'
  };
  var PH = { en: { DMY: 'DD/MM/YYYY', MDY: 'MM/DD/YYYY' }, es: { DMY: 'DD/MM/AAAA' }, fr: { DMY: 'JJ/MM/AAAA' }, pt: { DMY: 'DD/MM/AAAA' }, it: { DMY: 'GG/MM/AAAA' }, de: { DMY: 'TT.MM.JJJJ' } };

  var pageLang = String((document.body && document.body.dataset.locale) || document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  var lang = STR[pageLang] ? pageLang : 'en';
  var t = STR[lang];
  var LOC = resolveLocale(lang);

  // es/fr/it/de: Monday first; pt-BR: Sunday first; en: by the visitor's region (en-US Sunday, others Monday).
  function resolveLocale(l) {
    if (l === 'es') return { tag: 'es', order: 'DMY', first: 1 };
    if (l === 'fr') return { tag: 'fr', order: 'DMY', first: 1 };
    if (l === 'pt') return { tag: 'pt-BR', order: 'DMY', first: 0 };
    if (l === 'it') return { tag: 'it', order: 'DMY', first: 1 };
    if (l === 'de') return { tag: 'de', order: 'DMY', first: 1 };
    var nav = navigator.language || 'en-US';
    var region = '';
    try { region = (new Intl.Locale(nav).maximize().region || '').toUpperCase(); } catch (e) { region = (nav.split('-')[1] || '').toUpperCase(); }
    var us = region === 'US';
    var tag = /^en(-|$)/i.test(nav) ? nav : (us ? 'en-US' : 'en-GB');
    try { new Intl.DateTimeFormat(tag); } catch (e) { tag = us ? 'en-US' : 'en-GB'; }
    var first = us ? 0 : 1;
    try {
      var il = new Intl.Locale(tag);
      var wi = typeof il.getWeekInfo === 'function' ? il.getWeekInfo() : il.weekInfo;
      if (wi && wi.firstDay) first = wi.firstDay % 7;
    } catch (e) { /* keep fallback */ }
    return { tag: tag, order: us ? 'MDY' : 'DMY', first: first };
  }

  var F = function (o) { return new Intl.DateTimeFormat(LOC.tag, o); };
  var fMonthYear = F({ month: 'long', year: 'numeric' });
  var fMonthShort = F({ month: 'short' });
  var fMonthLong = F({ month: 'long', year: 'numeric' });
  var fWdNarrow = F({ weekday: 'narrow' });
  var fWdLong = F({ weekday: 'long' });
  var fEcho = F({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  var fLabel = F({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /* ---------- Date helpers (local noon avoids DST edge cases) ---------- */
  var mk = function (y, m, d) { return new Date(y, m, d, 12); };
  var today = function () { var n = new Date(); return mk(n.getFullYear(), n.getMonth(), n.getDate()); };
  var minAllowed = function () { var n = today(); return mk(n.getFullYear() - 5, n.getMonth(), n.getDate()); }; // WHO charts: 0-5 y
  var same = function (a, b) { return !!(a && b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
  var addDays = function (d, n) { return mk(d.getFullYear(), d.getMonth(), d.getDate() + n); };
  var addMonths = function (d, n) {
    var f = mk(d.getFullYear(), d.getMonth() + n, 1);
    var last = mk(f.getFullYear(), f.getMonth() + 1, 0).getDate();
    return mk(f.getFullYear(), f.getMonth(), Math.min(d.getDate(), last));
  };
  var clamp = function (d, lo, hi) { return d < lo ? lo : (d > hi ? hi : d); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var toISO = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var d = mk(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
  }
  var SEP = lang === 'de' ? '.' : '/'; // German dates are DD.MM.YYYY
  function fmt(d) {
    var dd = pad(d.getDate()), mm = pad(d.getMonth() + 1);
    return LOC.order === 'MDY' ? mm + SEP + dd + SEP + d.getFullYear() : dd + SEP + mm + SEP + d.getFullYear();
  }
  function mask(dg) { return dg.length > 4 ? dg.slice(0, 2) + SEP + dg.slice(2, 4) + SEP + dg.slice(4) : (dg.length > 2 ? dg.slice(0, 2) + SEP + dg.slice(2) : dg); }
  // null = incomplete, 'bad' = impossible date, Date = valid
  function parseTyped(s) {
    var dg = s.replace(/\D/g, '');
    if (dg.length !== 8) return null;
    var a = +dg.slice(0, 2), b = +dg.slice(2, 4), y = +dg.slice(4);
    var d = LOC.order === 'MDY' ? b : a, m = LOC.order === 'MDY' ? a : b;
    if (y < 1000) return 'bad';
    var r = mk(y, m - 1, d);
    return r.getMonth() === m - 1 && r.getDate() === d ? r : 'bad';
  }
  // Same method as the calculator's "Chronological age" (percentile-calculator.js dateDiffDays + formatAge,
  // WHO daysPerMonth = 30.4375) so the line under the field always matches the result.
  var DAYS_PER_MONTH = 30.4375;
  function ageParts(b, to) {
    var days = Math.floor((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
    var months = Math.floor(days / DAYS_PER_MONTH);
    return [months, Math.max(0, Math.round(days - months * DAYS_PER_MONTH))];
  }
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var EXAMPLE = fmt(mk(2026, 2, 12));

  var SVG = function (p, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>'; };
  var ICON_CAL = SVG('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/>', 1.8);
  var ICON_L = SVG('<path d="m15 5-7 7 7 7"/>');
  var ICON_R = SVG('<path d="m9 5 7 7-7 7"/>');
  var ICON_OK = SVG('<path d="m5 12 4.5 4.5L19 7"/>', 2.2);
  var CHEV = '<svg viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="M1 1.5l5 5 5-5"/></svg>';

  var sheetMQ = window.matchMedia('(max-width: 640px)');
  var reg = {};

  function enhance(native) {
    var name = native.name;
    var form = native.form;
    var box = native.closest('.field') || native.parentNode;
    var minFrom = native.dataset.datepickerMin || '';
    var isBirth = native.dataset.datepicker === 'birth';
    var label = native.id ? document.querySelector('label[for="' + native.id + '"]') : null;
    var labelText = label ? label.textContent.trim() : '';
    var errBox = box.querySelector('[data-field-error]');
    var errText = errBox ? (errBox.querySelector('[data-err-text]') || errBox) : null;

    // Hidden ISO input takes over the name; the visible input gets a new id so form.elements[name] stays unique.
    var hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = name;
    var initial = parseISO(native.value);
    hidden.value = initial ? toISO(initial) : '';
    var input = native;
    var displayId = (native.id || name) + '-text';
    hidden.dataset.dateDisplay = displayId;
    input.removeAttribute('name');
    input.type = 'text';
    input.id = displayId;
    if (label) label.htmlFor = displayId;
    input.value = initial ? fmt(initial) : '';
    input.placeholder = (PH[lang][LOC.order] || PH[lang].DMY);
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('maxlength', '10');

    var wrap = document.createElement('div');
    wrap.className = 'dfield';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    box.insertBefore(hidden, wrap);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cal-btn';
    btn.setAttribute('aria-label', t.open + (labelText ? ': ' + labelText : ''));
    btn.innerHTML = ICON_CAL;
    wrap.appendChild(btn);

    var echo = document.createElement('p');
    echo.className = 'd-echo';
    echo.id = displayId + '-echo';
    echo.hidden = true;
    echo.setAttribute('aria-live', 'polite');
    echo.innerHTML = ICON_OK + '<span></span>';
    wrap.parentNode.insertBefore(echo, wrap.nextSibling);
    input.setAttribute('aria-describedby', ((input.getAttribute('aria-describedby') || '') + ' ' + echo.id).trim());

    var popId = displayId + '-dialog';
    [input, btn].forEach(function (el) {
      el.setAttribute('aria-haspopup', 'dialog');
      el.setAttribute('aria-expanded', 'false');
      el.setAttribute('aria-controls', popId);
    });

    var st = { sel: initial, focus: initial || today(), view: 'days', err: '', sheet: false };
    var pop = null, scrim = null;

    var isOpen = function () { return !!pop && !pop.hidden; };
    // Earliest day the calendar offers. Measurement: the birth date (or 5 years back if unset). Birth: 5 years back
    // (WHO 0-5 y), extended to an older date already in the field so it still opens on that month. Typed dates are
    // never rejected for age: the calculator's own WHO range check decides.
    var lower = function () {
      var lo = minAllowed();
      var other = minFrom && reg[minFrom] && reg[minFrom].sel;
      if (other) return other; // days before birth stay disabled (the calculator also rejects them)
      return st.sel && st.sel < lo ? st.sel : lo;
    };
    var ageTarget = function () {
      for (var k in reg) if (reg[k].minFrom === name && reg[k].sel) return reg[k].sel;
      return null;
    };

    /* ----- value + error plumbing ----- */
    function setHidden(iso) {
      hidden.value = iso;
      // Lets the calculator clear its inline error for this field (same as typing into the native input did).
      hidden.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function setError(msg) {
      st.err = msg;
      if (msg) {
        box.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
        if (errText) errText.textContent = msg;
      } else if (box.classList.contains('has-error')) {
        box.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        if (errText) errText.textContent = '';
      }
      updateEcho();
    }
    function updateEcho() {
      if (!st.sel || st.err) { echo.hidden = true; return; }
      var txt = fEcho.format(st.sel);
      if (isBirth) {
        var to = ageTarget() || today();
        txt = t.born + ' ' + txt + (to >= st.sel ? ' · ' + t.old.apply(null, ageParts(st.sel, to)) : '');
      }
      echo.querySelector('span').textContent = txt;
      echo.hidden = false;
    }
    function syncAll() {
      for (var k in reg) { reg[k].updateEcho(); reg[k].refresh(); }
    }
    function choose(d, keepOpen) {
      st.sel = d;
      if (d) st.focus = d;
      input.value = d ? fmt(d) : '';
      setHidden(d ? toISO(d) : '');
      setError('');
      syncAll();
      if (keepOpen) render(true); else close(true);
    }

    /* ----- popover / sheet ----- */
    function build() {
      pop = document.createElement('div');
      pop.id = popId;
      pop.className = 'dp';
      pop.hidden = true;
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-label', labelText || name);
      pop.addEventListener('click', onClick);
      pop.addEventListener('keydown', onKey);
    }

    function render(keepFocus) {
      if (!pop) return;
      var active = document.activeElement;
      var hadFocus = keepFocus || pop.contains(active);
      var refocusAct = hadFocus && active && active.dataset ? active.dataset.act : null;

      var now = today(), lo = lower();
      st.focus = clamp(st.focus, lo, now);
      var f = st.focus, y = f.getFullYear(), m = f.getMonth();
      var h = '';
      if (st.sheet) {
        h += '<div class="grab" aria-hidden="true"></div><div class="sheet-t"><b>' + esc(labelText) + '</b><span>' +
          esc(st.sel ? fEcho.format(st.sel) : t.hint) + '</span></div>';
      }
      var title = st.view === 'years' ? lo.getFullYear() + ' – ' + now.getFullYear() : (st.view === 'months' ? String(y) : cap(fMonthYear.format(f)));
      var titleLabel = st.view === 'days' ? title + ', ' + t.chooseYear : title;
      h += '<div class="dp-head"><button type="button" class="dp-title" data-act="view" aria-expanded="' + (st.view !== 'days') +
        '" aria-label="' + esc(titleLabel) + '">' + esc(title) + ' ' + CHEV + '</button>';
      if (st.view === 'days') {
        var prevOk = mk(y, m, 0) >= mk(lo.getFullYear(), lo.getMonth(), 1);
        var nextOk = mk(y, m + 1, 1) <= now;
        h += '<button type="button" class="dp-nav" data-act="prev" aria-label="' + esc(t.prev) + '"' + (prevOk ? '' : ' disabled') + '>' + ICON_L + '</button>' +
             '<button type="button" class="dp-nav" data-act="next" aria-label="' + esc(t.next) + '"' + (nextOk ? '' : ' disabled') + '>' + ICON_R + '</button>';
      }
      h += '</div>';

      if (st.view === 'days') {
        h += '<div class="dp-grid" role="grid" aria-label="' + esc(cap(fMonthYear.format(f))) + '"><div class="dp-wd" role="row">';
        for (var i = 0; i < 7; i++) {
          var wd = mk(2024, 0, 7 + ((LOC.first + i) % 7)); // 2024-01-07 is a Sunday
          h += '<span role="columnheader" aria-label="' + esc(fWdLong.format(wd)) + '">' + esc(fWdNarrow.format(wd)) + '</span>';
        }
        h += '</div>';
        var first = mk(y, m, 1);
        var start = addDays(first, -((first.getDay() - LOC.first + 7) % 7));
        var other = minFrom && reg[minFrom] && reg[minFrom].sel;
        for (var r = 0; r < 6; r++) {
          h += '<div class="dp-row" role="row">';
          for (var c = 0; c < 7; c++) {
            var d = addDays(start, r * 7 + c);
            var dis = d > now || d < lo;
            var isSel = same(d, st.sel);
            var cls = 'dp-day' + (d.getMonth() !== m ? ' out' : '') + (same(d, now) ? ' today' : '') + (isSel ? ' sel' : '') +
              ((other && st.sel && d > other && d < st.sel) || same(d, other) ? ' range' : '');
            h += '<button type="button" role="gridcell" class="' + cls + '" data-iso="' + toISO(d) + '" tabindex="' + (same(d, f) ? 0 : -1) +
              '" aria-selected="' + isSel + '"' + (dis ? ' aria-disabled="true"' : '') + (same(d, now) ? ' aria-current="date"' : '') +
              ' aria-label="' + esc(fLabel.format(d)) + '">' + d.getDate() + '</button>';
          }
          h += '</div>';
        }
        h += '</div>';
      } else if (st.view === 'years') {
        var selY = (st.sel || f).getFullYear();
        h += '<div class="dp-big" role="group" aria-label="' + esc(t.chooseYear) + '">';
        for (var yy = lo.getFullYear(); yy <= now.getFullYear(); yy++) {
          h += '<button type="button" data-y="' + yy + '" class="' + (yy === selY ? 'sel' : '') + (yy === now.getFullYear() ? ' cur' : '') +
            '" tabindex="' + (yy === y ? 0 : -1) + '" aria-pressed="' + (yy === selY) + '">' + yy + '</button>';
        }
        h += '</div>';
      } else {
        h += '<div class="dp-big" role="group" aria-label="' + esc(t.chooseMonth) + '">';
        for (var mm = 0; mm < 12; mm++) {
          var mDis = mk(y, mm, 1) > now || mk(y, mm + 1, 0) < lo;
          var mSel = !!st.sel && st.sel.getFullYear() === y && st.sel.getMonth() === mm;
          var nm = cap(fMonthShort.format(mk(y, mm, 1)).replace('.', ''));
          h += '<button type="button" data-m="' + mm + '" class="' + (mSel ? 'sel' : '') + (y === now.getFullYear() && mm === now.getMonth() ? ' cur' : '') +
            '" tabindex="' + (mm === m ? 0 : -1) + '" aria-pressed="' + mSel + '" aria-label="' + esc(cap(fMonthLong.format(mk(y, mm, 1)))) + '"' +
            (mDis ? ' disabled' : '') + '>' + esc(nm) + '</button>';
        }
        h += '</div>';
      }

      if (st.sheet) {
        h += '<div class="dp-foot"><button type="button" class="btn btn-secondary" data-act="today">' + esc(t.today) +
          '</button><button type="button" class="btn" data-act="close">' + esc(t.done) + '</button></div>';
      } else {
        h += '<div class="dp-foot"><span class="dp-hint">' + esc(t.hint) + '</span><button type="button" class="dp-chip ghost" data-act="clear">' +
          esc(t.clear) + '</button><button type="button" class="dp-chip" data-act="today">' + esc(t.today) + '</button></div>';
      }
      pop.innerHTML = h;
      if (hadFocus) {
        var again = refocusAct && pop.querySelector('[data-act="' + refocusAct + '"]:not(:disabled)');
        (again || focusTarget()).focus({ preventScroll: true });
      }
    }
    function focusTarget() {
      return pop.querySelector('.dp-grid [tabindex="0"], .dp-big [tabindex="0"]:not(:disabled)') ||
        pop.querySelector('.dp-big button:not(:disabled)') || pop.querySelector('.dp-title');
    }
    function place() {
      pop.classList.remove('dp-end', 'dp-up');
      if (st.sheet) return;
      // Measure with offset sizes: the opening animation scales the popover, so its rect is briefly smaller.
      var bound = (wrap.closest('.gtool') || document.documentElement).getBoundingClientRect();
      var right = Math.min(bound.right, document.documentElement.clientWidth);
      var wr = wrap.getBoundingClientRect();
      var w = pop.offsetWidth, h = pop.offsetHeight, gap = 8;
      if (wr.left + w > right - 4) pop.classList.add('dp-end');
      var up = wr.bottom + gap + h > bound.bottom - 4 && wr.top - bound.top > h + gap + 4;
      if (up) pop.classList.add('dp-up');
      // Bring a popover that opened below the fold into view
      var top = up ? wr.top - gap - h : wr.bottom + gap;
      if (top + h > window.innerHeight || top < 0) {
        pop.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
    function open(view, moveFocus) {
      if (!pop) build();
      st.sheet = sheetMQ.matches;
      st.view = view || 'days';
      st.focus = st.sel || st.focus || today();
      pop.classList.toggle('sheet', st.sheet);
      pop.setAttribute('aria-modal', String(st.sheet));
      if (st.sheet) {
        if (!scrim) { scrim = document.createElement('div'); scrim.className = 'dp-scrim'; scrim.addEventListener('click', function () { close(true); }); }
        document.body.appendChild(scrim);
        document.body.appendChild(pop);
        scrim.hidden = false;
        document.documentElement.classList.add('dp-lock');
      } else {
        wrap.appendChild(pop);
      }
      for (var k in reg) if (reg[k] !== api) reg[k].close(false);
      pop.hidden = false;
      wrap.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-expanded', 'true');
      render(false);
      place();
      if (moveFocus) focusTarget().focus({ preventScroll: true });
    }
    function close(returnFocus) {
      if (!isOpen()) return;
      var wasSheet = st.sheet;
      pop.hidden = true;
      if (scrim) scrim.hidden = true;
      document.documentElement.classList.remove('dp-lock');
      wrap.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-expanded', 'false');
      // On phones return focus to the calendar button so the on-screen keyboard does not pop up.
      if (returnFocus) (wasSheet ? btn : input).focus({ preventScroll: true });
    }

    function onClick(e) {
      var b = e.target.closest('button');
      if (!b || !pop.contains(b) || b.disabled) return;
      var act = b.dataset.act;
      if (act === 'view') { st.view = st.view === 'days' ? 'years' : 'days'; render(true); focusTarget().focus({ preventScroll: true }); return; }
      if (act === 'prev' || act === 'next') { st.focus = addMonths(st.focus, act === 'prev' ? -1 : 1); render(true); return; }
      if (act === 'today') { choose(today(), st.sheet); return; }
      if (act === 'clear') { choose(null, false); return; }
      if (act === 'close') { close(true); return; }
      if (b.dataset.y) { st.focus = clamp(mk(+b.dataset.y, st.focus.getMonth(), 1), lower(), today()); st.view = 'months'; render(true); focusTarget().focus({ preventScroll: true }); return; }
      if (b.dataset.m) { st.focus = clamp(mk(st.focus.getFullYear(), +b.dataset.m, 1), lower(), today()); st.view = 'days'; render(true); focusTarget().focus({ preventScroll: true }); return; }
      if (b.dataset.iso) {
        if (b.getAttribute('aria-disabled') === 'true') return;
        choose(parseISO(b.dataset.iso), st.sheet);
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return; }
      if (e.key === 'Tab' && st.sheet) { // modal sheet: keep focus inside
        var items = Array.prototype.filter.call(pop.querySelectorAll('button'), function (x) { return !x.disabled && x.tabIndex >= 0; });
        if (!items.length) return;
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); } else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
        return;
      }
      var tgt = e.target;
      if (tgt.parentNode && tgt.parentNode.classList && tgt.parentNode.classList.contains('dp-big')) { bigKey(e, tgt); return; }
      if (!tgt.classList || !tgt.classList.contains('dp-day')) return;
      var f = st.focus, n = null;
      var dow = (f.getDay() - LOC.first + 7) % 7;
      switch (e.key) {
        case 'ArrowLeft': n = addDays(f, -1); break;
        case 'ArrowRight': n = addDays(f, 1); break;
        case 'ArrowUp': n = addDays(f, -7); break;
        case 'ArrowDown': n = addDays(f, 7); break;
        case 'PageUp': n = addMonths(f, e.shiftKey ? -12 : -1); break;
        case 'PageDown': n = addMonths(f, e.shiftKey ? 12 : 1); break;
        case 'Home': n = addDays(f, -dow); break;
        case 'End': n = addDays(f, 6 - dow); break;
        case 'Enter': case ' ':
          e.preventDefault();
          if (tgt.getAttribute('aria-disabled') !== 'true') choose(parseISO(tgt.dataset.iso), st.sheet);
          return;
        default: return;
      }
      e.preventDefault();
      st.focus = clamp(n, lower(), today());
      render(true);
      focusTarget().focus({ preventScroll: true });
    }
    function bigKey(e, tgt) {
      var items = Array.prototype.filter.call(tgt.parentNode.children, function (x) { return !x.disabled; });
      var i = items.indexOf(tgt), j = i;
      if (e.key === 'ArrowLeft') j = i - 1;
      else if (e.key === 'ArrowRight') j = i + 1;
      else if (e.key === 'ArrowUp') j = i - 3;
      else if (e.key === 'ArrowDown') j = i + 3;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = items.length - 1;
      else return;
      e.preventDefault();
      j = Math.max(0, Math.min(items.length - 1, j));
      items.forEach(function (x, k) { x.tabIndex = k === j ? 0 : -1; });
      items[j].focus();
    }

    /* ----- typing ----- */
    input.addEventListener('input', function (e) {
      var raw = input.value;
      var iso = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(raw); // pasted ISO date
      var caret = input.selectionStart == null ? raw.length : input.selectionStart;
      var before = raw.slice(0, caret).replace(/\D/g, '').length;
      var dg = iso ? (LOC.order === 'MDY' ? iso[2] + iso[3] + iso[1] : iso[3] + iso[2] + iso[1]) : raw.replace(/\D/g, '').slice(0, 8);
      var out = mask(dg);
      if (out !== raw) {
        input.value = out;
        if (document.activeElement === input && !iso) {
          var pos = 0, seen = 0;
          while (pos < out.length && seen < before) { if (/\d/.test(out[pos])) seen++; pos++; }
          if (e.inputType && e.inputType.indexOf('insert') === 0 && out[pos] === SEP) pos++;
          input.setSelectionRange(pos, pos);
        }
      }
      var r = parseTyped(out), msg = '', d = null;
      if (r === 'bad') msg = t.eFormat.replace('{ex}', EXAMPLE);
      else if (r && r > today()) msg = t.eFuture;
      else d = r;
      st.sel = d;
      if (d) st.focus = d;
      setHidden(d ? toISO(d) : '');
      setError(msg);
      syncAll();
    });
    input.addEventListener('blur', function () {
      var n = input.value.replace(/\D/g, '').length;
      if (n && n < 8) setError(t.eFormat.replace('{ex}', EXAMPLE));
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && (e.altKey || isOpen())) { e.preventDefault(); if (isOpen()) focusTarget().focus({ preventScroll: true }); else open('days', true); }
      else if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(false); }
    });
    // Desktop: clicking the field opens the calendar and keeps the caret for typing.
    // Phones: the field stays a numeric text box; the calendar button opens the sheet.
    input.addEventListener('click', function () { if (!sheetMQ.matches && !isOpen()) open('days', false); });
    btn.addEventListener('click', function () { if (isOpen()) close(true); else open('days', true); });
    // Desktop popover is non-modal: tabbing out of the field (input, button or popover) closes it.
    wrap.addEventListener('focusout', function (e) {
      if (isOpen() && !st.sheet && e.relatedTarget && !wrap.contains(e.relatedTarget)) close(false);
    });
    document.addEventListener('pointerdown', function (e) {
      if (isOpen() && !st.sheet && !wrap.contains(e.target)) close(false);
    });
    if (sheetMQ.addEventListener) sheetMQ.addEventListener('change', function () { if (isOpen() && st.sheet !== sheetMQ.matches) close(false); });

    // Value set from script (e.g. the calculator's default measurement date) + `change` event.
    hidden.addEventListener('change', function () {
      var d = parseISO(hidden.value);
      if (same(d, st.sel) && input.value === (d ? fmt(d) : '')) return;
      st.sel = d;
      if (d) st.focus = d;
      input.value = d ? fmt(d) : '';
      setError('');
      syncAll();
    });
    if (form) {
      form.addEventListener('reset', function () {
        close(false);
        st.sel = null;
        hidden.value = ''; // hidden inputs reset to their value attribute, so clear it before the reset runs
        st.err = '';
        input.removeAttribute('aria-invalid');
        window.setTimeout(syncAll, 0);
      });
      // The calculator replaces field errors on submit; keep the more precise typing message on this field.
      form.addEventListener('submit', function () {
        if (!st.err) return;
        window.setTimeout(function () {
          if (st.err && box.classList.contains('has-error') && errText) { errText.textContent = st.err; input.setAttribute('aria-invalid', 'true'); }
        }, 0);
      });
    }

    var api = {
      minFrom: minFrom,
      get sel() { return st.sel; },
      refresh: function () { if (isOpen()) render(false); },
      updateEcho: updateEcho,
      close: close
    };
    reg[name] = api;
  }

  Array.prototype.forEach.call(natives, enhance);
  for (var k in reg) reg[k].updateEcho();
})();
