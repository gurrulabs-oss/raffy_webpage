const Z_POINTS = [
  { label: 'P3', z: -1.8807936081512509 },
  { label: 'P15', z: -1.0364333894937896 },
  { label: 'P50', z: 0 },
  { label: 'P85', z: 1.0364333894937896 },
  { label: 'P97', z: 1.8807936081512509 }
];

const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 0.3937007874;

const LOCALES = {
  en: {
    pageTitle: 'WHO Baby Growth Percentile Calculator',
    toolSubMulti: 'Calculate WHO percentiles with one or more measurements: weight, length/height, and head circumference.',
    measurementLegend: 'Measurement (fill one or more)',
    measurementHelp: 'You can enter one, two, or all three measurements.',
    unitsLabel: 'Units',
    unitsMetric: 'SI (kg, cm)',
    unitsImperial: 'Imperial (lb, in)',
    weightInputMetric: 'Weight (kg)',
    weightInputImperial: 'Weight (lb)',
    lengthInputMetric: 'Length/Height (cm)',
    lengthInputImperial: 'Length/Height (in)',
    headInputMetric: 'Head circumference (cm)',
    headInputImperial: 'Head circumference (in)',
    metricWeight: 'Weight-for-age (WHO)',
    metricLength: 'Length-for-age (WHO)',
    metricHeight: 'Height-for-age (WHO)',
    metricHead: 'Head circumference-for-age (WHO)',
    unitKg: 'kg',
    unitCm: 'cm',
    unitLb: 'lb',
    unitIn: 'in',
    ageChronological: 'Chronological age',
    ageCorrected: 'Corrected age',
    percentileLabel: 'Percentile',
    multipleSummary: '{count} measurements calculated',
    rangeError: 'Age is outside the WHO range for this metric (0 to 60 months).',
    missingRequiredError: 'Complete sex, date of birth, date of measurement, and at least one measurement.',
    dateError: 'Date of measurement must be after date of birth.',
    correctedAgeError: 'Corrected age cannot be negative. Check gestational age at birth.',
    gestationalError: 'Gestational age at birth must be between 22 and 40 weeks.',
    invalidValueError: 'One or more measurements are outside a valid range for this calculator.',
    emptyExplanation: 'Complete the form to plot your baby measurements on WHO growth curves.',
    resultExplain: 'This measurement is around P{percentile}. Keep tracking trends over time.',
    lowP10Warning: 'This result is below P10 (P{percentile}). Repeat the measurement calmly in a few days and discuss it with your pediatrician if it stays low.',
    chartXAxis: 'Age (months)',
    chartYAxisWeightMetric: 'Weight (kg)',
    chartYAxisWeightImperial: 'Weight (lb)',
    chartYAxisLengthMetric: 'Length/Height (cm)',
    chartYAxisLengthImperial: 'Length/Height (in)',
    chartYAxisHeadMetric: 'Head circumference (cm)',
    chartYAxisHeadImperial: 'Head circumference (in)',
    carouselPrev: 'Previous chart',
    carouselNext: 'Next chart',
    weeksSuffix: 'weeks'
  },
  es: {
    pageTitle: 'Calculadora OMS de percentiles del bebe',
    toolSubMulti: 'Calcula percentiles OMS con una o varias medidas: peso, talla/longitud y perimetro craneal.',
    measurementLegend: 'Medicion (rellena una o mas)',
    measurementHelp: 'Puedes introducir una, dos o las tres medidas.',
    unitsLabel: 'Unidades',
    unitsMetric: 'SI (kg, cm)',
    unitsImperial: 'Imperial (lb, in)',
    weightInputMetric: 'Peso (kg)',
    weightInputImperial: 'Peso (lb)',
    lengthInputMetric: 'Longitud/Talla (cm)',
    lengthInputImperial: 'Longitud/Talla (in)',
    headInputMetric: 'Perimetro craneal (cm)',
    headInputImperial: 'Perimetro craneal (in)',
    metricWeight: 'Peso para la edad (OMS)',
    metricLength: 'Longitud para la edad (OMS)',
    metricHeight: 'Talla para la edad (OMS)',
    metricHead: 'Perimetro craneal para la edad (OMS)',
    unitKg: 'kg',
    unitCm: 'cm',
    unitLb: 'lb',
    unitIn: 'in',
    ageChronological: 'Edad cronologica',
    ageCorrected: 'Edad corregida',
    percentileLabel: 'Percentil',
    multipleSummary: '{count} mediciones calculadas',
    rangeError: 'La edad queda fuera del rango OMS para esta metrica (0 a 60 meses).',
    missingRequiredError: 'Completa sexo, fecha de nacimiento, fecha de medicion y al menos una medida.',
    dateError: 'La fecha de medicion debe ser posterior a la fecha de nacimiento.',
    correctedAgeError: 'La edad corregida no puede ser negativa. Revisa la edad gestacional al nacer.',
    gestationalError: 'La edad gestacional al nacer debe estar entre 22 y 40 semanas.',
    invalidValueError: 'Una o mas medidas estan fuera de un rango valido para esta calculadora.',
    emptyExplanation: 'Completa el formulario para ubicar las medidas en las curvas OMS.',
    resultExplain: 'Esta medicion se situa alrededor de P{percentile}. Lo importante es seguir la tendencia en el tiempo.',
    lowP10Warning: 'Sabemos que este resultado puede preocupar. Esta por debajo de P10 (P{percentile}). Repite la medicion con calma en unos dias y, si se mantiene, comentalo con tu pediatra para revisarlo juntos.',
    chartXAxis: 'Edad (meses)',
    chartYAxisWeightMetric: 'Peso (kg)',
    chartYAxisWeightImperial: 'Peso (lb)',
    chartYAxisLengthMetric: 'Longitud/Talla (cm)',
    chartYAxisLengthImperial: 'Longitud/Talla (in)',
    chartYAxisHeadMetric: 'Perimetro craneal (cm)',
    chartYAxisHeadImperial: 'Perimetro craneal (in)',
    carouselPrev: 'Grafica anterior',
    carouselNext: 'Grafica siguiente',
    weeksSuffix: 'semanas'
  },
  fr: {
    pageTitle: 'Calculateur OMS de percentiles bebe',
    toolSubMulti: 'Calculez les percentiles OMS avec une ou plusieurs mesures: poids, longueur/taille, perimetre cranien.',
    measurementLegend: 'Mesure (remplir une ou plusieurs)',
    measurementHelp: 'Vous pouvez saisir une, deux, ou les trois mesures.',
    unitsLabel: 'Unites',
    unitsMetric: 'SI (kg, cm)',
    unitsImperial: 'Imperial (lb, in)',
    weightInputMetric: 'Poids (kg)',
    weightInputImperial: 'Poids (lb)',
    lengthInputMetric: 'Longueur/Taille (cm)',
    lengthInputImperial: 'Longueur/Taille (in)',
    headInputMetric: 'Perimetre cranien (cm)',
    headInputImperial: 'Perimetre cranien (in)',
    metricWeight: 'Poids pour l age (OMS)',
    metricLength: 'Longueur pour l age (OMS)',
    metricHeight: 'Taille pour l age (OMS)',
    metricHead: 'Perimetre cranien pour l age (OMS)',
    unitKg: 'kg',
    unitCm: 'cm',
    unitLb: 'lb',
    unitIn: 'in',
    ageChronological: 'Age chronologique',
    ageCorrected: 'Age corrige',
    percentileLabel: 'Percentile',
    multipleSummary: '{count} mesures calculees',
    rangeError: 'L age est hors plage OMS pour cette metrique (0 a 60 mois).',
    missingRequiredError: 'Renseignez sexe, date de naissance, date de mesure et au moins une mesure.',
    dateError: 'La date de mesure doit etre apres la date de naissance.',
    correctedAgeError: 'L age corrige ne peut pas etre negatif. Verifiez l age gestationnel a la naissance.',
    gestationalError: 'L age gestationnel a la naissance doit etre compris entre 22 et 40 semaines.',
    invalidValueError: 'Une ou plusieurs mesures sont hors plage valide pour ce calculateur.',
    emptyExplanation: 'Completez le formulaire pour positionner les mesures sur les courbes OMS.',
    resultExplain: 'Cette mesure se situe autour de P{percentile}. Suivez surtout la tendance dans le temps.',
    lowP10Warning: 'Ce resultat est sous P10 (P{percentile}). Reprenez la mesure calmement dans quelques jours et parlez-en avec votre pediatre si cela persiste.',
    chartXAxis: 'Age (mois)',
    chartYAxisWeightMetric: 'Poids (kg)',
    chartYAxisWeightImperial: 'Poids (lb)',
    chartYAxisLengthMetric: 'Longueur/Taille (cm)',
    chartYAxisLengthImperial: 'Longueur/Taille (in)',
    chartYAxisHeadMetric: 'Perimetre cranien (cm)',
    chartYAxisHeadImperial: 'Perimetre cranien (in)',
    carouselPrev: 'Graphique precedent',
    carouselNext: 'Graphique suivant',
    weeksSuffix: 'semaines'
  },
  pt: {
    pageTitle: 'Calculadora OMS de percentis do bebe',
    toolSubMulti: 'Calcule percentis OMS com uma ou mais medidas: peso, comprimento/altura e perimetro cefalico.',
    measurementLegend: 'Medicao (preencha uma ou mais)',
    measurementHelp: 'Voce pode informar uma, duas ou as tres medidas.',
    unitsLabel: 'Unidades',
    unitsMetric: 'SI (kg, cm)',
    unitsImperial: 'Imperial (lb, in)',
    weightInputMetric: 'Peso (kg)',
    weightInputImperial: 'Peso (lb)',
    lengthInputMetric: 'Comprimento/Altura (cm)',
    lengthInputImperial: 'Comprimento/Altura (in)',
    headInputMetric: 'Perimetro cefalico (cm)',
    headInputImperial: 'Perimetro cefalico (in)',
    metricWeight: 'Peso para idade (OMS)',
    metricLength: 'Comprimento para idade (OMS)',
    metricHeight: 'Altura para idade (OMS)',
    metricHead: 'Perimetro cefalico para idade (OMS)',
    unitKg: 'kg',
    unitCm: 'cm',
    unitLb: 'lb',
    unitIn: 'in',
    ageChronological: 'Idade cronologica',
    ageCorrected: 'Idade corrigida',
    percentileLabel: 'Percentil',
    multipleSummary: '{count} medicoes calculadas',
    rangeError: 'A idade esta fora da faixa OMS para esta metrica (0 a 60 meses).',
    missingRequiredError: 'Preencha sexo, data de nascimento, data da medicao e pelo menos uma medida.',
    dateError: 'A data da medicao deve ser posterior a data de nascimento.',
    correctedAgeError: 'A idade corrigida nao pode ser negativa. Revise a idade gestacional ao nascer.',
    gestationalError: 'A idade gestacional ao nascer deve ficar entre 22 e 40 semanas.',
    invalidValueError: 'Uma ou mais medidas estao fora da faixa valida para esta calculadora.',
    emptyExplanation: 'Preencha o formulario para posicionar as medicoes nas curvas OMS.',
    resultExplain: 'Esta medicao fica em torno de P{percentile}. O principal e acompanhar a tendencia ao longo do tempo.',
    lowP10Warning: 'Este resultado esta abaixo de P10 (P{percentile}). Refaca a medicao com calma em alguns dias e converse com o pediatra se continuar baixo.',
    chartXAxis: 'Idade (meses)',
    chartYAxisWeightMetric: 'Peso (kg)',
    chartYAxisWeightImperial: 'Peso (lb)',
    chartYAxisLengthMetric: 'Comprimento/Altura (cm)',
    chartYAxisLengthImperial: 'Comprimento/Altura (in)',
    chartYAxisHeadMetric: 'Perimetro cefalico (cm)',
    chartYAxisHeadImperial: 'Perimetro cefalico (in)',
    carouselPrev: 'Grafico anterior',
    carouselNext: 'Grafico seguinte',
    weeksSuffix: 'semanas'
  }
};

const form = document.querySelector('[data-percentile-form]');
const errorBox = document.querySelector('[data-form-error]');
const resultsCard = document.querySelector('[data-results-card]');
const metricOut = document.querySelector('[data-result-metric]');
const ageOut = document.querySelector('[data-result-age]');
const percentileOut = document.querySelector('[data-result-percentile]');
const resultsKpi = document.querySelector('.results-kpi');
const noteOut = document.querySelector('[data-result-note]');
const chartOut = document.querySelector('[data-chart-wrap]');
const correctedToggle = document.querySelector('[data-corrected-toggle]');
const correctedGroup = document.querySelector('[data-corrected-group]');

let datasetByMetric = null;
let daysPerMonth = 30.4375;
let unitSystem = 'metric';
let lastRenderPayload = null;
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'pt'];

const locale = document.body.dataset.locale || 'en';
const copy = LOCALES[locale] || LOCALES.en;

document.querySelectorAll('[data-copy-key]').forEach((node) => {
  const key = node.dataset.copyKey;
  if (copy[key]) node.textContent = copy[key];
});

init();

async function init() {
  applyStaticCopy();
  ensureUnitSwitcher();

  try {
    const dataUrl = new URL('./who-lms-data.json', import.meta.url);
    const response = await fetch(dataUrl, { cache: 'force-cache' });
    const payload = await response.json();
    daysPerMonth = Number(payload?.meta?.daysPerMonth || 30.4375);
    datasetByMetric = indexRows(payload.rows || []);
  } catch (error) {
    showError('WHO data could not be loaded.');
    return;
  }

  setDefaultMeasurementDate();
  syncUnitSystemFromInputs();
  applyUnitSystemUI();

  resultsCard?.classList.remove('is-hidden');
  renderEmptyChart();
  renderEmptyNotes();

  correctedToggle?.addEventListener('change', () => {
    const isChecked = correctedToggle.checked;
    correctedGroup?.classList.toggle('is-hidden', !isChecked);
    correctedGroup?.setAttribute('aria-hidden', String(!isChecked));
  });

  form?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name !== 'unit_system') return;
    onUnitSystemChange(target.value === 'imperial' ? 'imperial' : 'metric');
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    trackGrowthToolSubmitClick();
    runCalculation();
  });

  form?.addEventListener('reset', () => {
    window.setTimeout(() => {
      if (correctedToggle) correctedToggle.checked = false;
      correctedGroup?.classList.add('is-hidden');
      correctedGroup?.setAttribute('aria-hidden', 'true');

      setUnitRadio('metric');
      syncUnitSystemFromInputs();
      applyUnitSystemUI();

      renderEmptyChart();
      renderEmptyNotes();
      if (metricOut) metricOut.textContent = '';
      if (ageOut) ageOut.textContent = '';
      if (percentileOut) percentileOut.textContent = '';
      resultsKpi?.classList.remove('is-hidden');

      clearMessages();
      lastRenderPayload = null;
      setDefaultMeasurementDate();
    }, 0);
  });
}

function applyStaticCopy() {
  const sub = document.querySelector('.tool-sub');
  if (sub) sub.textContent = copy.toolSubMulti;

  const legend = form?.querySelector('.fieldset legend');
  if (legend) legend.textContent = copy.measurementLegend;

  const help = form?.querySelector('.fieldset .help-text');
  if (help) help.textContent = copy.measurementHelp;
}

function ensureUnitSwitcher() {
  if (!form) return;
  if (form.querySelector('[data-unit-switcher]')) return;

  const fieldset = form.querySelector('.fieldset');
  if (!fieldset) return;

  const wrap = document.createElement('div');
  wrap.className = 'field';
  wrap.setAttribute('data-unit-switcher', 'true');
  wrap.innerHTML = `
    <label>${copy.unitsLabel}</label>
    <div class="unit-switch" role="radiogroup" aria-label="${copy.unitsLabel}">
      <label><input type="radio" name="unit_system" value="metric" checked> ${copy.unitsMetric}</label>
      <label><input type="radio" name="unit_system" value="imperial"> ${copy.unitsImperial}</label>
    </div>
  `;

  form.insertBefore(wrap, fieldset);
}

function syncUnitSystemFromInputs() {
  const checked = form?.querySelector('input[name="unit_system"]:checked');
  unitSystem = checked?.value === 'imperial' ? 'imperial' : 'metric';
}

function setUnitRadio(nextUnit) {
  const target = form?.querySelector(`input[name="unit_system"][value="${nextUnit}"]`);
  if (target) target.checked = true;
}

function onUnitSystemChange(nextUnit) {
  if (nextUnit === unitSystem) return;

  convertCurrentInputs(unitSystem, nextUnit);
  unitSystem = nextUnit;
  applyUnitSystemUI();

  if (lastRenderPayload) {
    renderResults(lastRenderPayload);
  } else {
    renderEmptyChart();
    renderEmptyNotes();
  }
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || ''
  };
}

function baseTrackingPayload() {
  const language = SUPPORTED_LANGUAGES.includes(document.body?.dataset?.locale)
    ? document.body.dataset.locale
    : 'en';

  return {
    language,
    page: 'Growth Tool',
    page_key: document.body?.dataset?.pageKey || 'tool_growth_percentiles',
    path: window.location.pathname,
    url: window.location.href,
    ...getUtmParams()
  };
}

function hasInputValue(fieldName) {
  const field = form?.elements?.namedItem(fieldName);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) return false;
  return field.value.trim().length > 0;
}

function trackMixpanelEvent(eventName, payload) {
  if (window.mixpanel && typeof window.mixpanel.track === 'function') {
    window.mixpanel.track(eventName, payload);
  }
}

function trackGrowthToolSubmitClick() {
  trackMixpanelEvent('Raffy Webpage - Growth Tool Submit Clicked', {
    ...baseTrackingPayload(),
    unit_system: unitSystem,
    corrected_age_enabled: Boolean(correctedToggle?.checked),
    has_weight_input: hasInputValue('weight_kg'),
    has_length_height_input: hasInputValue('length_height_cm'),
    has_head_circumference_input: hasInputValue('head_circumference_cm')
  });
}

function trackGrowthToolResults(payload) {
  const percentiles = payload.results.map((result) => result.percentile);
  const minPercentile = Math.min(...percentiles);
  const maxPercentile = Math.max(...percentiles);
  const avgPercentile = percentiles.reduce((sum, value) => sum + value, 0) / percentiles.length;

  trackMixpanelEvent('Raffy Webpage - Growth Tool Results Shown', {
    ...baseTrackingPayload(),
    unit_system: unitSystem,
    corrected_age_enabled: Boolean(payload.correctedAgeMeta),
    measurement_count: payload.results.length,
    measurement_types: payload.results.map((result) => result.measurement.type).join(','),
    age_days: Math.round(payload.ageDaysForEvaluation),
    min_percentile: Number(minPercentile.toFixed(1)),
    max_percentile: Number(maxPercentile.toFixed(1)),
    avg_percentile: Number(avgPercentile.toFixed(1))
  });
}

function convertCurrentInputs(fromUnit, toUnit) {
  const fields = [
    { name: 'weight_kg', type: 'weight' },
    { name: 'length_height_cm', type: 'lengthHeight' },
    { name: 'head_circumference_cm', type: 'headCircumference' }
  ];

  for (const field of fields) {
    const el = form?.elements?.namedItem(field.name);
    if (!(el instanceof HTMLInputElement) || !el.value) continue;

    const raw = Number(el.value);
    if (!Number.isFinite(raw)) continue;

    const siValue = toSi(field.type, raw, fromUnit);
    const converted = fromSi(field.type, siValue, toUnit);
    el.value = formatMeasurementValue(converted, field.type, toUnit);
  }
}

function applyUnitSystemUI() {
  setMeasurementInputUI('weight_kg', 'weight');
  setMeasurementInputUI('length_height_cm', 'lengthHeight');
  setMeasurementInputUI('head_circumference_cm', 'headCircumference');
}

function setMeasurementInputUI(fieldName, measurementType) {
  const input = form?.elements?.namedItem(fieldName);
  if (!(input instanceof HTMLInputElement)) return;

  const label = form?.querySelector(`label[for="${fieldName}"]`);
  if (label) {
    if (measurementType === 'weight') {
      label.textContent = unitSystem === 'metric' ? copy.weightInputMetric : copy.weightInputImperial;
    } else if (measurementType === 'lengthHeight') {
      label.textContent = unitSystem === 'metric' ? copy.lengthInputMetric : copy.lengthInputImperial;
    } else {
      label.textContent = unitSystem === 'metric' ? copy.headInputMetric : copy.headInputImperial;
    }
  }

  const config = measurementConfig(measurementType, unitSystem);
  input.min = String(config.min);
  input.max = String(config.max);
  input.step = String(config.step);
}

function runCalculation() {
  clearMessages();
  if (!datasetByMetric) return;

  const sex = valueOf('sex');
  const birthDate = valueOf('birth_date');
  const measurementDate = valueOf('measurement_date');

  const measurementEntries = [
    readMeasurement('weight_kg', 'weight'),
    readMeasurement('length_height_cm', 'lengthHeight'),
    readMeasurement('head_circumference_cm', 'headCircumference')
  ].filter(Boolean);

  if (!sex || !birthDate || !measurementDate || measurementEntries.length === 0) {
    showError(copy.missingRequiredError);
    return;
  }

  const birth = parseDateUTC(birthDate);
  const meas = parseDateUTC(measurementDate);
  const chronologicalAgeDays = dateDiffDays(birth, meas);

  if (!Number.isFinite(chronologicalAgeDays) || chronologicalAgeDays < 0) {
    showError(copy.dateError);
    return;
  }

  let ageDaysForEvaluation = chronologicalAgeDays;
  let correctedAgeMeta = null;

  if (correctedToggle?.checked) {
    const gestationalWeeks = valueNumber('gestational_weeks');
    if (!Number.isFinite(gestationalWeeks) || gestationalWeeks < 22 || gestationalWeeks > 40) {
      showError(copy.gestationalError);
      return;
    }

    const correctionDays = Math.max(0, (40 - gestationalWeeks) * 7);
    ageDaysForEvaluation = chronologicalAgeDays - correctionDays;

    if (ageDaysForEvaluation < 0) {
      showError(copy.correctedAgeError);
      return;
    }

    correctedAgeMeta = {
      gestationalWeeks,
      correctionDays
    };
  }

  const results = [];

  for (const measurement of measurementEntries) {
    if (!isMeasurementInRange(measurement.type, measurement.valueSi)) {
      showError(copy.invalidValueError);
      return;
    }

    const metricSelection = selectMetric(measurement.type, ageDaysForEvaluation);
    const rows = datasetByMetric[metricSelection.metric]?.[sex];

    if (!rows || rows.length === 0) {
      showError(copy.rangeError);
      return;
    }

    const minAge = rows[0].ageDays;
    const maxAge = rows[rows.length - 1].ageDays;

    if (ageDaysForEvaluation < minAge || ageDaysForEvaluation > maxAge) {
      showError(copy.rangeError);
      return;
    }

    const lms = interpolateLms(rows, ageDaysForEvaluation);
    const zScore = zFromMeasurement(measurement.valueSi, lms);

    if (!Number.isFinite(zScore)) {
      showError(copy.invalidValueError);
      return;
    }

    const percentile = Math.max(0.1, Math.min(99.9, normalCdf(zScore) * 100));
    results.push({
      metricSelection,
      measurement,
      percentile,
      rows,
      ageDays: ageDaysForEvaluation
    });
  }

  const payload = {
    results,
    chronologicalAgeDays,
    correctedAgeMeta,
    ageDaysForEvaluation
  };

  lastRenderPayload = payload;
  trackGrowthToolResults(payload);
  renderResults(payload);
}

function readMeasurement(fieldName, type) {
  const rawDisplay = valueNumber(fieldName);
  if (!Number.isFinite(rawDisplay)) return null;

  return {
    type,
    valueDisplay: rawDisplay,
    valueSi: toSi(type, rawDisplay, unitSystem)
  };
}

function renderResults(payload) {
  resultsCard?.classList.remove('is-hidden');

  const ageParts = [`${copy.ageChronological}: ${formatAge(payload.chronologicalAgeDays)}`];
  if (payload.correctedAgeMeta) {
    ageParts.push(`${copy.ageCorrected}: ${formatAge(payload.ageDaysForEvaluation)} (${payload.correctedAgeMeta.gestationalWeeks} ${copy.weeksSuffix})`);
  }

  if (ageOut) ageOut.textContent = ageParts.join(' | ');

  if (payload.results.length === 1) {
    const single = payload.results[0];
    const metricLabel = metricName(single.metricSelection, single.measurement.type);
    const displayValue = fromSi(single.measurement.type, single.measurement.valueSi, unitSystem);
    if (metricOut) {
      metricOut.textContent = `${metricLabel}: ${formatMeasurementValue(displayValue, single.measurement.type, unitSystem)} ${unitFor(single.measurement.type)}`;
    }

    if (percentileOut) {
      percentileOut.textContent = `${copy.percentileLabel}: P${formatValue(single.percentile, 1)}`;
    }

    resultsKpi?.classList.remove('is-hidden');
  } else {
    if (metricOut) {
      metricOut.textContent = copy.multipleSummary.replace('{count}', String(payload.results.length));
    }

    if (percentileOut) percentileOut.textContent = '';
    resultsKpi?.classList.add('is-hidden');
  }

  renderCharts(payload.results);
  renderNotes(payload.results);
}

function renderNotes(results) {
  if (!noteOut) return;

  noteOut.innerHTML = results.map((result) => {
    const percentileText = formatValue(result.percentile, 1);
    const warning = result.percentile < 10;
    const description = (warning ? copy.lowP10Warning : copy.resultExplain).replace('{percentile}', percentileText);
    const title = `${metricName(result.metricSelection, result.measurement.type)} - ${copy.percentileLabel}: P${percentileText}`;

    return `
      <article class="result-note-item${warning ? ' warning' : ''}">
        <p class="result-note-title">${title}</p>
        <p class="result-note-text">${description}</p>
      </article>
    `;
  }).join('');
}

function renderEmptyNotes() {
  if (!noteOut) return;
  noteOut.innerHTML = `
    <article class="result-note-item">
      <p class="result-note-text">${copy.emptyExplanation}</p>
    </article>
  `;
}

function renderCharts(results) {
  if (!chartOut) return;

  if (results.length <= 1) {
    const single = results[0];
    const svg = buildChartSvg({
      rows: single.rows,
      metricSelection: single.metricSelection,
      measurementType: single.measurement.type,
      ageDays: single.ageDays,
      valueSi: single.measurement.valueSi,
      showPoint: true
    });

    chartOut.innerHTML = `<div class="chart-shell">${svg}</div>`;
    return;
  }

  const slidesMarkup = results.map((result) => {
    const title = metricName(result.metricSelection, result.measurement.type);
    const svg = buildChartSvg({
      rows: result.rows,
      metricSelection: result.metricSelection,
      measurementType: result.measurement.type,
      ageDays: result.ageDays,
      valueSi: result.measurement.valueSi,
      showPoint: true
    });

    return `
      <section class="chart-slide" role="group" aria-label="${title}">
        <p class="chart-slide-title">${title}</p>
        <div class="chart-shell">${svg}</div>
      </section>
    `;
  }).join('');

  chartOut.innerHTML = `
    <div class="chart-carousel" data-carousel>
      <div class="carousel-controls">
        <button class="carousel-btn" type="button" data-carousel-prev aria-label="${copy.carouselPrev}">‹</button>
        <p class="carousel-status" data-carousel-status></p>
        <button class="carousel-btn" type="button" data-carousel-next aria-label="${copy.carouselNext}">›</button>
      </div>
      <div class="chart-viewport">
        <div class="chart-track" data-carousel-track>
          ${slidesMarkup}
        </div>
      </div>
    </div>
  `;

  setupCarousel(chartOut.querySelector('[data-carousel]'), results.length);
}

function setupCarousel(root, totalSlides) {
  if (!root || totalSlides < 2) return;

  let index = 0;
  const track = root.querySelector('[data-carousel-track]');
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const status = root.querySelector('[data-carousel-status]');

  const update = () => {
    if (track) track.style.transform = `translateX(-${index * 100}%)`;
    if (status) status.textContent = `${index + 1}/${totalSlides}`;
  };

  prev?.addEventListener('click', () => {
    index = (index - 1 + totalSlides) % totalSlides;
    update();
  });

  next?.addEventListener('click', () => {
    index = (index + 1) % totalSlides;
    update();
  });

  update();
}

function buildChartSvg({ rows, metricSelection, measurementType, ageDays, valueSi, showPoint }) {
  const minX = rows[0].ageMonths;
  const maxX = rows[rows.length - 1].ageMonths;

  const curves = Z_POINTS.map((pt) => {
    const points = rows.map((row) => ({
      x: row.ageMonths,
      y: fromSi(measurementType, valueAtZ(row, pt.z), unitSystem)
    }));
    return { label: pt.label, points };
  });

  const pointY = fromSi(measurementType, valueSi, unitSystem);
  const allY = curves.flatMap((curve) => curve.points.map((p) => p.y));
  if (showPoint) allY.push(pointY);

  const yMinRaw = Math.min(...allY);
  const yMaxRaw = Math.max(...allY);
  const yPad = (yMaxRaw - yMinRaw || 1) * 0.08;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const vbW = 760;
  const vbH = 460;
  const pad = { left: 72, right: 94, top: 28, bottom: 58 };
  const plotW = vbW - pad.left - pad.right;
  const plotH = vbH - pad.top - pad.bottom;

  const xScale = (x) => pad.left + ((x - minX) / (maxX - minX || 1)) * plotW;
  const yScale = (y) => pad.top + (1 - (y - yMin) / (yMax - yMin || 1)) * plotH;

  const gridX = buildXTicks(minX, maxX).map((tick) => {
    const x = xScale(tick);
    return `<g><line x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + plotH}" class="grid-line" /><text x="${x}" y="${pad.top + plotH + 26}" text-anchor="middle" class="axis-text">${tick}</text></g>`;
  }).join('');

  const gridY = buildYTicks(yMin, yMax).map((tick) => {
    const y = yScale(tick);
    return `<g><line x1="${pad.left}" y1="${y}" x2="${pad.left + plotW}" y2="${y}" class="grid-line" /><text x="${pad.left - 12}" y="${y + 4}" text-anchor="end" class="axis-text">${formatValue(tick, 1)}</text></g>`;
  }).join('');

  const curveLines = curves.map((curve, idx) => {
    const points = curve.points.map((p) => `${xScale(p.x)},${yScale(p.y)}`).join(' ');
    const styleClass = curve.label === 'P50' ? 'curve-line curve-main' : `curve-line curve-${idx}`;
    return `<polyline points="${points}" class="${styleClass}" fill="none" />`;
  }).join('');

  const curveLabels = curves.map((curve) => {
    const last = curve.points[curve.points.length - 1];
    return `<text x="${xScale(last.x) + 10}" y="${yScale(last.y) + 4}" class="percentile-label">${curve.label}</text>`;
  }).join('');

  const pointX = xScale(ageDays / daysPerMonth);
  const pointMarkup = showPoint
    ? `<circle cx="${pointX}" cy="${yScale(pointY)}" r="6" class="baby-point" />`
    : '';

  const yAxisLabel = yAxisLabelFor(metricSelection);

  return `
    <svg viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="${metricName(metricSelection, measurementType)} chart">
      <rect x="0" y="0" width="${vbW}" height="${vbH}" rx="24" class="chart-bg" />
      ${gridX}
      ${gridY}
      <line x1="${pad.left}" y1="${pad.top + plotH}" x2="${pad.left + plotW}" y2="${pad.top + plotH}" class="axis-line" />
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + plotH}" class="axis-line" />
      ${curveLines}
      ${curveLabels}
      ${pointMarkup}
      <text x="${pad.left + plotW / 2}" y="${vbH - 14}" text-anchor="middle" class="axis-title">${copy.chartXAxis}</text>
      <text x="18" y="${pad.top + plotH / 2}" text-anchor="middle" transform="rotate(-90 18 ${pad.top + plotH / 2})" class="axis-title">${yAxisLabel}</text>
    </svg>
  `;
}

function yAxisLabelFor(metricSelection) {
  if (metricSelection.metric === 'wfa') {
    return unitSystem === 'metric' ? copy.chartYAxisWeightMetric : copy.chartYAxisWeightImperial;
  }

  if (metricSelection.metric === 'hcfa') {
    return unitSystem === 'metric' ? copy.chartYAxisHeadMetric : copy.chartYAxisHeadImperial;
  }

  return unitSystem === 'metric' ? copy.chartYAxisLengthMetric : copy.chartYAxisLengthImperial;
}

function renderEmptyChart() {
  if (!datasetByMetric || !chartOut) return;
  const rows = datasetByMetric.wfa?.female || datasetByMetric.wfa?.male;
  if (!rows || rows.length === 0) return;

  const svg = buildChartSvg({
    rows,
    metricSelection: { metric: 'wfa' },
    measurementType: 'weight',
    ageDays: rows[0].ageDays,
    valueSi: rows[0].M,
    showPoint: false
  });

  chartOut.innerHTML = `<div class="chart-shell">${svg}</div>`;
}

function valueAtZ(lms, z) {
  const base = 1 + (lms.L * lms.S * z);
  if (Math.abs(lms.L) < 1e-8) {
    return lms.M * Math.exp(lms.S * z);
  }
  if (base <= 0) return Number.NaN;
  return lms.M * Math.pow(base, 1 / lms.L);
}

function zFromMeasurement(value, lms) {
  if (value <= 0 || lms.M <= 0 || lms.S <= 0) return Number.NaN;
  if (Math.abs(lms.L) < 1e-8) {
    return Math.log(value / lms.M) / lms.S;
  }
  return (Math.pow(value / lms.M, lms.L) - 1) / (lms.L * lms.S);
}

function indexRows(rows) {
  const index = {};
  for (const row of rows) {
    if (!index[row.metric]) index[row.metric] = {};
    if (!index[row.metric][row.sex]) index[row.metric][row.sex] = [];
    index[row.metric][row.sex].push(row);
  }
  for (const metric of Object.keys(index)) {
    for (const sex of Object.keys(index[metric])) {
      index[metric][sex].sort((a, b) => a.ageDays - b.ageDays);
    }
  }
  return index;
}

function interpolateLms(rows, ageDays) {
  if (ageDays <= rows[0].ageDays) return rows[0];
  if (ageDays >= rows[rows.length - 1].ageDays) return rows[rows.length - 1];

  let hi = rows.findIndex((row) => row.ageDays >= ageDays);
  if (hi <= 0) hi = 1;
  const lo = hi - 1;

  const r0 = rows[lo];
  const r1 = rows[hi];
  const span = r1.ageDays - r0.ageDays || 1;
  const t = (ageDays - r0.ageDays) / span;

  return {
    ageDays,
    ageMonths: r0.ageMonths + (r1.ageMonths - r0.ageMonths) * t,
    L: r0.L + (r1.L - r0.L) * t,
    M: r0.M + (r1.M - r0.M) * t,
    S: r0.S + (r1.S - r0.S) * t
  };
}

function selectMetric(measurementType, ageDays) {
  if (measurementType === 'weight') return { metric: 'wfa' };
  if (measurementType === 'headCircumference') return { metric: 'hcfa' };

  const thresholdDays = Math.round(24 * daysPerMonth);
  if (ageDays < thresholdDays) return { metric: 'lhfa_0_2', mode: 'length' };
  return { metric: 'lhfa_2_5', mode: 'height' };
}

function metricName(metricSelection, measurementType) {
  if (measurementType === 'weight') return copy.metricWeight;
  if (measurementType === 'headCircumference') return copy.metricHead;
  if (metricSelection.mode === 'length') return copy.metricLength;
  return copy.metricHeight;
}

function buildXTicks(minX, maxX) {
  const range = maxX - minX;
  const step = range <= 24 ? 3 : (range <= 36 ? 6 : 12);
  const ticks = [];
  const start = Math.ceil(minX / step) * step;
  for (let x = start; x <= maxX + 0.0001; x += step) {
    ticks.push(Number(x.toFixed(2)));
  }
  if (ticks.length === 0 || ticks[0] !== minX) ticks.unshift(minX);
  if (ticks[ticks.length - 1] !== maxX) ticks.push(maxX);
  return ticks;
}

function buildYTicks(minY, maxY) {
  const rough = 6;
  const span = maxY - minY;
  const step = niceStep(span / rough);
  const first = Math.ceil(minY / step) * step;
  const ticks = [];
  for (let y = first; y <= maxY + step * 0.5; y += step) {
    ticks.push(Number(y.toFixed(2)));
  }
  return ticks;
}

function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / p;
  if (n <= 1) return 1 * p;
  if (n <= 2) return 2 * p;
  if (n <= 5) return 5 * p;
  return 10 * p;
}

function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax));
  return sign * y;
}

function measurementConfig(type, system = unitSystem) {
  const base = {
    weight: { min: 0.5, max: 35, step: 0.01, metricUnit: 'kg', imperialUnit: 'lb' },
    lengthHeight: { min: 30, max: 130, step: 0.1, metricUnit: 'cm', imperialUnit: 'in' },
    headCircumference: { min: 20, max: 65, step: 0.1, metricUnit: 'cm', imperialUnit: 'in' }
  }[type];

  if (!base) return { min: 0, max: 0, step: 0.1, unit: '' };

  if (system === 'metric') {
    return {
      min: base.min,
      max: base.max,
      step: base.step,
      unit: base.metricUnit
    };
  }

  const min = fromSi(type, base.min, 'imperial');
  const max = fromSi(type, base.max, 'imperial');

  return {
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1)),
    step: 0.1,
    unit: base.imperialUnit
  };
}

function isMeasurementInRange(type, valueSi) {
  const metricRange = measurementConfig(type, 'metric');
  return valueSi >= metricRange.min && valueSi <= metricRange.max;
}

function toSi(type, value, system = unitSystem) {
  if (!Number.isFinite(value)) return Number.NaN;
  if (system === 'metric') return value;
  if (type === 'weight') return value / KG_TO_LB;
  return value / CM_TO_IN;
}

function fromSi(type, value, system = unitSystem) {
  if (!Number.isFinite(value)) return Number.NaN;
  if (system === 'metric') return value;
  if (type === 'weight') return value * KG_TO_LB;
  return value * CM_TO_IN;
}

function unitFor(type) {
  if (unitSystem === 'metric') {
    return type === 'weight' ? copy.unitKg : copy.unitCm;
  }
  return type === 'weight' ? copy.unitLb : copy.unitIn;
}

function parseDateUTC(value) {
  return new Date(`${value}T00:00:00Z`);
}

function dateDiffDays(a, b) {
  return Math.floor((b - a) / 86400000);
}

function formatAge(days) {
  const months = Math.floor(days / daysPerMonth);
  const remDays = Math.round(days - months * daysPerMonth);
  return `${months}m ${Math.max(0, remDays)}d`;
}

function formatValue(value, digits = 2) {
  return Number(value).toFixed(digits).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

function formatMeasurementValue(value, type, system = unitSystem) {
  const config = measurementConfig(type, system);
  const digits = config.step < 0.1 ? 2 : 1;
  return formatValue(value, digits);
}

function valueOf(name) {
  const el = form?.elements?.namedItem(name);
  return el ? String(el.value || '').trim() : '';
}

function valueNumber(name) {
  const raw = valueOf(name);
  if (!raw) return Number.NaN;
  const num = Number(raw);
  return Number.isFinite(num) ? num : Number.NaN;
}

function clearMessages() {
  if (errorBox) errorBox.textContent = '';
}

function showError(message) {
  if (errorBox) errorBox.textContent = message;
}

function setDefaultMeasurementDate() {
  const measurementDateField = form?.elements?.namedItem('measurement_date');
  if (!(measurementDateField instanceof HTMLInputElement) || measurementDateField.value) return;
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  measurementDateField.value = local.toISOString().slice(0, 10);
}
