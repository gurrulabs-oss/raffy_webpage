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
  it: {
    pageTitle: 'Calcolatore dei percentili OMS per bambini',
    toolSubMulti: 'Calcola i percentili OMS con una o più misure: peso, lunghezza/altezza e circonferenza cranica.',
    measurementLegend: 'Misure (inseriscine una o più)',
    measurementHelp: 'Puoi inserire una, due o tutte e tre le misure.',
    unitsLabel: 'Unità',
    unitsMetric: 'SI (kg, cm)',
    unitsImperial: 'Imperiali (lb, in)',
    weightInputMetric: 'Peso (kg)',
    weightInputImperial: 'Peso (lb)',
    lengthInputMetric: 'Lunghezza/Altezza (cm)',
    lengthInputImperial: 'Lunghezza/Altezza (in)',
    headInputMetric: 'Circonferenza cranica (cm)',
    headInputImperial: 'Circonferenza cranica (in)',
    metricWeight: 'Peso per età (OMS)',
    metricLength: 'Lunghezza per età (OMS)',
    metricHeight: 'Altezza per età (OMS)',
    metricHead: 'Circonferenza cranica per età (OMS)',
    unitKg: 'kg',
    unitCm: 'cm',
    unitLb: 'lb',
    unitIn: 'in',
    ageChronological: 'Età cronologica',
    ageCorrected: 'Età corretta',
    percentileLabel: 'Percentile',
    multipleSummary: '{count} misure calcolate',
    rangeError: "L'età è fuori dall'intervallo OMS per questa misura (da 0 a 60 mesi).",
    missingRequiredError: 'Completa sesso, data di nascita, data della misurazione e almeno una misura.',
    dateError: 'La data della misurazione deve essere successiva alla data di nascita.',
    correctedAgeError: "L'età corretta non può essere negativa. Controlla l'età gestazionale alla nascita.",
    gestationalError: "L'età gestazionale alla nascita deve essere tra 22 e 40 settimane.",
    invalidValueError: 'Una o più misure sono fuori dai valori accettati da questo calcolatore.',
    emptyExplanation: 'Compila il modulo per vedere le misure del tuo bambino sulle curve di crescita OMS.',
    resultExplain: 'Questa misura è intorno a P{percentile}. Continua a seguire l’andamento nel tempo.',
    lowP10Warning: 'Questo risultato è sotto P10 (P{percentile}). Ripeti la misurazione con calma tra qualche giorno e parlane con il pediatra se resta basso.',
    chartXAxis: 'Età (mesi)',
    chartYAxisWeightMetric: 'Peso (kg)',
    chartYAxisWeightImperial: 'Peso (lb)',
    chartYAxisLengthMetric: 'Lunghezza/Altezza (cm)',
    chartYAxisLengthImperial: 'Lunghezza/Altezza (in)',
    chartYAxisHeadMetric: 'Circonferenza cranica (cm)',
    chartYAxisHeadImperial: 'Circonferenza cranica (in)',
    carouselPrev: 'Grafico precedente',
    carouselNext: 'Grafico successivo',
    weeksSuffix: 'settimane',
    tabsLabel: 'Misura',
    tabWeight: 'Peso',
    tabLength: 'Lunghezza',
    tabHeight: 'Altezza',
    tabHead: 'Testa',
    tabAdd: '+ Aggiungi',
    groupFemale: 'bambine',
    groupMale: 'bambini',
    lessWeight: 'pesano meno',
    moreWeight: 'pesano di più',
    lessLength: 'sono più corti',
    moreLength: 'sono più lunghi',
    lessHeight: 'sono più bassi',
    moreHeight: 'sono più alti',
    lessHead: 'hanno la testa più piccola',
    moreHead: 'hanno la testa più grande',
    sentenceTemplate: 'circa {lower} {group} su 100 della stessa età {less} e {higher} {more}.',
    sentenceMiddlePrefix: 'Proprio a metà: ',
    sentenceBelow: 'meno di 3 {group} su 100 della stessa età {less}.',
    sentenceAbove: 'meno di 3 {group} su 100 della stessa età {more}.',
    rangeNote: 'Anche alcuni bambini sani si trovano qui, e una sola misura è solo una fotografia. Mostrala al pediatra, che può valutare con te l’andamento.',
    percentileAria: '{ordinal} percentile',
    chartAria: 'Grafico di crescita: {metric}',
    chartRange: 'OMS, {from}–{to} mesi',
    legendBaby: 'Il tuo bambino',
    legendMedian: 'Mediana (P50)',
    legendBand: 'P15–P85',
    legendOuter: 'P3 / P97'
  },
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
    weeksSuffix: 'weeks',
    tabsLabel: 'Measurement',
    tabWeight: 'Weight',
    tabLength: 'Length',
    tabHeight: 'Height',
    tabHead: 'Head',
    tabAdd: '+ Add',
    groupFemale: 'girls',
    groupMale: 'boys',
    lessWeight: 'weigh less',
    moreWeight: 'weigh more',
    lessLength: 'are shorter',
    moreLength: 'are longer',
    lessHeight: 'are shorter',
    moreHeight: 'are taller',
    lessHead: 'have a smaller head',
    moreHead: 'have a larger head',
    sentenceTemplate: 'about {lower} in 100 {group} the same age {less}, and {higher} {more}.',
    sentenceMiddlePrefix: 'Right in the middle: ',
    sentenceBelow: 'fewer than 3 in 100 {group} the same age {less}.',
    sentenceAbove: 'fewer than 3 in 100 {group} the same age {more}.',
    rangeNote: 'Some healthy babies sit here, and one measurement is only a snapshot. Share it with your pediatrician, who can look at the trend with you.',
    percentileAria: '{ordinal} percentile',
    chartAria: 'Growth chart: {metric}',
    chartRange: 'WHO, {from}–{to} months',
    legendBaby: 'Your baby',
    legendMedian: 'Median (P50)',
    legendBand: 'P15–P85',
    legendOuter: 'P3 / P97'
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
    weeksSuffix: 'semanas',
    tabsLabel: 'Medida',
    tabWeight: 'Peso',
    tabLength: 'Longitud',
    tabHeight: 'Talla',
    tabHead: 'Cabeza',
    tabAdd: '+ Añadir',
    groupFemale: 'niñas',
    groupMale: 'niños',
    lessWeight: 'pesan menos',
    moreWeight: 'pesan más',
    lessLength: 'miden menos',
    moreLength: 'miden más',
    lessHeight: 'miden menos',
    moreHeight: 'miden más',
    lessHead: 'tienen la cabeza más pequeña',
    moreHead: 'tienen la cabeza más grande',
    sentenceTemplate: 'aproximadamente {lower} de cada 100 {group} de la misma edad {less} y {higher} {more}.',
    sentenceMiddlePrefix: 'Justo en el medio: ',
    sentenceBelow: 'menos de 3 de cada 100 {group} de la misma edad {less}.',
    sentenceAbove: 'menos de 3 de cada 100 {group} de la misma edad {more}.',
    rangeNote: 'Algunos bebés sanos están en esta zona y una sola medición es solo una foto del momento. Coméntalo con tu pediatra, que puede revisar la evolución contigo.',
    percentileAria: 'percentil {n}',
    chartAria: 'Gráfica de crecimiento: {metric}',
    chartRange: 'OMS, {from}–{to} meses',
    legendBaby: 'Tu bebé',
    legendMedian: 'Mediana (P50)',
    legendBand: 'P15–P85',
    legendOuter: 'P3 / P97'
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
    weeksSuffix: 'semaines',
    tabsLabel: 'Mesure',
    tabWeight: 'Poids',
    tabLength: 'Longueur',
    tabHeight: 'Taille',
    tabHead: 'Tête',
    tabAdd: '+ Ajouter',
    groupFemale: 'filles',
    groupMale: 'garçons',
    lessWeight: 'pèsent moins',
    moreWeight: 'pèsent plus',
    lessLength: 'mesurent moins',
    moreLength: 'mesurent plus',
    lessHeight: 'mesurent moins',
    moreHeight: 'mesurent plus',
    lessHead: 'ont un périmètre crânien plus petit',
    moreHead: 'ont un périmètre crânien plus grand',
    sentenceTemplate: 'environ {lower} {group} sur 100 du même âge {less}, et {higher} {more}.',
    sentenceMiddlePrefix: 'Pile au milieu : ',
    sentenceBelow: 'moins de 3 {group} sur 100 du même âge {less}.',
    sentenceAbove: 'moins de 3 {group} sur 100 du même âge {more}.',
    rangeNote: 'Certains bébés en bonne santé se situent ici, et une seule mesure n’est qu’un instantané. Parlez-en à votre pédiatre, qui pourra suivre l’évolution avec vous.',
    percentileAria: '{ordinal} percentile',
    chartAria: 'Courbe de croissance : {metric}',
    chartRange: 'OMS, {from}–{to} mois',
    legendBaby: 'Votre bébé',
    legendMedian: 'Médiane (P50)',
    legendBand: 'P15–P85',
    legendOuter: 'P3 / P97'
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
    weeksSuffix: 'semanas',
    tabsLabel: 'Medida',
    tabWeight: 'Peso',
    tabLength: 'Comprimento',
    tabHeight: 'Altura',
    tabHead: 'Cabeça',
    tabAdd: '+ Incluir',
    groupFemale: 'meninas',
    groupMale: 'meninos',
    lessWeight: 'pesam menos',
    moreWeight: 'pesam mais',
    lessLength: 'medem menos',
    moreLength: 'medem mais',
    lessHeight: 'medem menos',
    moreHeight: 'medem mais',
    lessHead: 'têm a cabeça menor',
    moreHead: 'têm a cabeça maior',
    sentenceTemplate: 'cerca de {lower} em cada 100 {group} da mesma idade {less}, e {higher} {more}.',
    sentenceMiddlePrefix: 'Bem no meio: ',
    sentenceBelow: 'menos de 3 em cada 100 {group} da mesma idade {less}.',
    sentenceAbove: 'menos de 3 em cada 100 {group} da mesma idade {more}.',
    rangeNote: 'Alguns bebês saudáveis ficam nessa faixa, e uma única medição é só um retrato do momento. Converse com o pediatra, que pode acompanhar a evolução com você.',
    percentileAria: 'percentil {n}',
    chartAria: 'Gráfico de crescimento: {metric}',
    chartRange: 'OMS, {from}–{to} meses',
    legendBaby: 'Seu bebê',
    legendMedian: 'Mediana (P50)',
    legendBand: 'P15–P85',
    legendOuter: 'P3 / P97'
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
// B v2 layout hooks (only on pages with the new markup; older markup keeps the legacy rendering)
const tabsOut = document.querySelector('[data-result-tabs]');
const isNewLayout = Boolean(tabsOut);
const sentenceOut = document.querySelector('[data-result-sentence]');
const rangeOut = document.querySelector('[data-result-range]');
const resultExtra = document.querySelector('[data-result-extra]');
const stateEmpty = document.querySelector('[data-state-empty]');
const stateError = document.querySelector('[data-state-error]');
const stateResult = document.querySelector('[data-state-result]');
const MEASUREMENT_FIELDS = {
  weight: 'weight_kg',
  lengthHeight: 'length_height_cm',
  headCircumference: 'head_circumference_cm'
};
const MEASUREMENT_ORDER = ['weight', 'lengthHeight', 'headCircumference'];

let datasetByMetric = null;
let selectedResultType = null;
let chartRenderWidth = 0;
let daysPerMonth = 30.4375;
let unitSystem = 'metric';
let lastRenderPayload = null;
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'pt', 'it'];

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
    const dataUrl = new URL('./who-lms-data.json?v=2', import.meta.url);
    const response = await fetch(dataUrl, { cache: 'force-cache' });
    const payload = await response.json();
    daysPerMonth = Number(payload?.meta?.daysPerMonth || 30.4375);
    datasetByMetric = indexRows(payload.rows || []);
  } catch (error) {
    showError(locale === 'it' ? 'Non è stato possibile caricare i dati OMS. Ricarica la pagina.' : 'WHO data could not be loaded.');
    return;
  }

  setDefaultMeasurementDate();
  syncUnitSystemFromInputs();
  applyUnitSystemUI();

  resultsCard?.classList.remove('is-hidden');
  renderEmptyChart();
  renderEmptyNotes();
  setResultState('empty');

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

  // Editing a highlighted field clears its inline error
  form?.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const isMeasurement = Object.values(MEASUREMENT_FIELDS).includes(target.name);
    clearFieldError(target.name);
    if (isMeasurement) clearFieldError('measurements');
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
      selectedResultType = null;
      setResultState('empty');
      if (window.RaffyStickyCta) window.RaffyStickyCta.hide();
      setDefaultMeasurementDate();
    }, 0);
  });

  tabsOut?.addEventListener('click', onTabClick);
  tabsOut?.addEventListener('keydown', onTabKeydown);
  watchChartWidth();
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

function detectAiReferrer() {
  const referrer = (document.referrer || '').toLowerCase();
  if (!referrer) return { ai_referral: false, ai_referrer_source: 'unknown' };
  const knownSources = [
    { source: 'chatgpt', patterns: ['chatgpt.com', 'chat.openai.com'] },
    { source: 'perplexity', patterns: ['perplexity.ai'] },
    { source: 'gemini', patterns: ['gemini.google.com'] },
    { source: 'copilot', patterns: ['copilot.microsoft.com', 'bing.com/chat'] },
    { source: 'claude', patterns: ['claude.ai'] }
  ];
  for (const known of knownSources) {
    if (known.patterns.some((pattern) => referrer.includes(pattern))) {
      return { ai_referral: true, ai_referrer_source: known.source };
    }
  }
  const otherAiPatterns = ['you.com', 'phind.com', 'poe.com', 'meta.ai', 'mistral.ai', 'grok.com'];
  if (otherAiPatterns.some((pattern) => referrer.includes(pattern))) {
    return { ai_referral: true, ai_referrer_source: 'other' };
  }
  return { ai_referral: false, ai_referrer_source: 'unknown' };
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
    ...getUtmParams(),
    ...detectAiReferrer()
  };
}

function hasInputValue(fieldName) {
  const field = form?.elements?.namedItem(fieldName);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) return false;
  return field.value.trim().length > 0;
}

function trackMixpanelEvent(eventName, payload) {
  try {
    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track(eventName, payload);
    }
  } catch (error) {
    // Tracking must never break the tool.
  }
}

const AVG_DAYS_PER_MONTH = 30.4375;
const TRACK_KEYS = {
  weight: { value: 'weight_kg', percentile: 'weight_percentile', z: 'weight_z_score' },
  lengthHeight: { value: 'length_height_cm', percentile: 'length_height_percentile', z: 'length_height_z_score' },
  headCircumference: { value: 'head_circumference_cm', percentile: 'head_circumference_percentile', z: 'head_circumference_z_score' }
};

function roundTo(value, decimals) {
  return Number(Number(value).toFixed(decimals));
}

// Raw inputs in SI units (kg/cm) whatever unit system the user typed in; birth dates become an age.
function growthInputProps() {
  const props = {};
  const sex = valueOf('sex');
  if (sex === 'male' || sex === 'female') props.sex = sex;

  for (const type of MEASUREMENT_ORDER) {
    const raw = valueNumber(MEASUREMENT_FIELDS[type]);
    if (Number.isFinite(raw)) props[TRACK_KEYS[type].value] = roundTo(toSi(type, raw, unitSystem), 2);
  }

  const birth = parseDateUTC(valueOf('birth_date'));
  const meas = parseDateUTC(valueOf('measurement_date'));
  const ageDays = dateDiffDays(birth, meas);
  if (Number.isFinite(ageDays) && ageDays >= 0) {
    props.age_days = Math.round(ageDays);
    props.age_months = roundTo(ageDays / AVG_DAYS_PER_MONTH, 1);
  }

  if (correctedToggle?.checked) {
    const gestationalWeeks = valueNumber('gestational_weeks');
    if (Number.isFinite(gestationalWeeks)) props.gestational_weeks = gestationalWeeks;
  }
  return props;
}

function trackGrowthToolSubmitClick() {
  try {
  trackMixpanelEvent('Raffy Webpage - Growth Tool Submit Clicked', {
    ...baseTrackingPayload(),
    ...growthInputProps(),
    unit_system: unitSystem,
    corrected_age_enabled: Boolean(correctedToggle?.checked),
    has_weight_input: hasInputValue('weight_kg'),
    has_length_height_input: hasInputValue('length_height_cm'),
    has_head_circumference_input: hasInputValue('head_circumference_cm')
  });
  } catch (error) {
    // Tracking must never break the tool.
  }
}

function trackGrowthToolResults(payload) {
  try {
  const percentiles = payload.results.map((result) => result.percentile);
  const minPercentile = Math.min(...percentiles);
  const maxPercentile = Math.max(...percentiles);
  const avgPercentile = percentiles.reduce((sum, value) => sum + value, 0) / percentiles.length;

  const measurementResultProps = {};
  for (const result of payload.results) {
    const keys = TRACK_KEYS[result.measurement.type];
    measurementResultProps[keys.value] = roundTo(result.measurement.valueSi, 2);
    measurementResultProps[keys.percentile] = roundTo(result.percentile, 1);
    measurementResultProps[keys.z] = roundTo(result.zScore, 2);
  }

  trackMixpanelEvent('Raffy Webpage - Growth Tool Results Shown', {
    ...baseTrackingPayload(),
    unit_system: unitSystem,
    corrected_age_enabled: Boolean(payload.correctedAgeMeta),
    measurement_count: payload.results.length,
    measurement_types: payload.results.map((result) => result.measurement.type).join(','),
    age_days: Math.round(payload.ageDaysForEvaluation),
    min_percentile: Number(minPercentile.toFixed(1)),
    max_percentile: Number(maxPercentile.toFixed(1)),
    avg_percentile: Number(avgPercentile.toFixed(1)),
    sex: payload.sex,
    age_months: roundTo(payload.ageDaysForEvaluation / AVG_DAYS_PER_MONTH, 1),
    chronological_age_days: Math.round(payload.chronologicalAgeDays),
    chronological_age_months: roundTo(payload.chronologicalAgeDays / AVG_DAYS_PER_MONTH, 1),
    ...measurementResultProps
  });
  } catch (error) {
    // Tracking must never break the tool.
  }
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
    let labelText;
    if (measurementType === 'weight') {
      labelText = unitSystem === 'metric' ? copy.weightInputMetric : copy.weightInputImperial;
    } else if (measurementType === 'lengthHeight') {
      labelText = unitSystem === 'metric' ? copy.lengthInputMetric : copy.lengthInputImperial;
    } else {
      labelText = unitSystem === 'metric' ? copy.headInputMetric : copy.headInputImperial;
    }

    // New markup: visible name + screen-reader unit "(kg)"; the unit is also shown inside the input
    const nameEl = label.querySelector('[data-label-name]');
    const unitEl = label.querySelector('[data-label-unit]');
    if (nameEl) {
      const unitMatch = /\s*(\([^)]*\))\s*$/.exec(labelText);
      nameEl.textContent = unitMatch ? labelText.slice(0, unitMatch.index) : labelText;
      if (unitEl) unitEl.textContent = unitMatch ? ` ${unitMatch[1]}` : '';
    } else {
      label.textContent = labelText;
    }
  }

  const unitBadge = form?.querySelector(`[data-unit-for="${fieldName}"]`);
  if (unitBadge) unitBadge.textContent = unitFor(measurementType);

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
    showError(copy.missingRequiredError, firstMissingField(sex, birthDate, measurementDate, measurementEntries.length));
    return;
  }

  const birth = parseDateUTC(birthDate);
  const meas = parseDateUTC(measurementDate);
  const chronologicalAgeDays = dateDiffDays(birth, meas);

  if (!Number.isFinite(chronologicalAgeDays) || chronologicalAgeDays < 0) {
    showError(copy.dateError, 'measurement_date');
    return;
  }

  let ageDaysForEvaluation = chronologicalAgeDays;
  let correctedAgeMeta = null;

  if (correctedToggle?.checked) {
    const gestationalWeeks = valueNumber('gestational_weeks');
    if (!Number.isFinite(gestationalWeeks) || gestationalWeeks < 22 || gestationalWeeks > 40) {
      showError(copy.gestationalError, 'gestational_weeks');
      return;
    }

    const correctionDays = Math.max(0, (40 - gestationalWeeks) * 7);
    ageDaysForEvaluation = evaluationAgeDays(chronologicalAgeDays - correctionDays);

    if (ageDaysForEvaluation < 0) {
      showError(copy.correctedAgeError, 'gestational_weeks');
      return;
    }

    correctedAgeMeta = {
      gestationalWeeks,
      correctionDays
    };
  }

  const results = [];

  for (const measurement of measurementEntries) {
    const evaluation = evaluateMeasurement(datasetByMetric, sex, measurement.type, measurement.valueSi, ageDaysForEvaluation);

    if (!evaluation.ok) {
      showError(evaluation.error === 'range' ? copy.rangeError : copy.invalidValueError,
        evaluation.error === 'range' ? 'birth_date' : MEASUREMENT_FIELDS[measurement.type]);
      return;
    }

    const { metricSelection, rows, zScore } = evaluation;
    const percentile = Math.max(0.1, Math.min(99.9, normalCdf(zScore) * 100));
    results.push({
      metricSelection,
      measurement,
      percentile,
      zScore,
      rows,
      ageDays: evaluation.ageDays
    });
  }

  const payload = {
    results,
    sex,
    chronologicalAgeDays,
    correctedAgeMeta,
    ageDaysForEvaluation
  };

  lastRenderPayload = payload;
  selectedResultType = null;
  trackGrowthToolResults(payload);
  renderResults(payload);
  revealResult();
}

// After a successful Calculate: show the sticky app bar and, when the result sits under the
// form (stacked layout), scroll it into view and move focus to it.
function revealResult() {
  if (window.RaffyStickyCta) window.RaffyStickyCta.show();
  if (!isNewLayout || !stateResult) return;
  const stacked = window.matchMedia('(max-width: 980px)').matches;
  if (!stacked) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  stateResult.focus({ preventScroll: true });
  (resultsCard || stateResult).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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

  if (isNewLayout) {
    renderResultsV2(payload);
    return;
  }

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

function buildChartSvg({ rows, metricSelection, measurementType, ageDays, valueSi, showPoint, width, ariaExtra }) {
  const minX = rows[0].ageMonths;
  const maxX = rows[rows.length - 1].ageMonths;

  const curveRows = chartSampleRows(rows);
  const curves = Z_POINTS.map((pt) => {
    const points = curveRows.map((row) => ({
      x: row.ageMonths,
      y: fromSi(measurementType, valueAtZ(row, pt.z), unitSystem)
    }));
    return { label: pt.label, points };
  });

  const pointY = fromSi(measurementType, valueSi, unitSystem);
  const allY = curves.flatMap((curve) => curve.points.map((p) => p.y));
  if (showPoint) allY.push(pointY);

  const yMinRaw = Math.min(...allY);
  const yMax0 = Math.max(...allY);
  const yPad = (yMax0 - yMinRaw || 1) * 0.08;
  const yMin = yMinRaw - yPad;
  const yMax = yMax0 + yPad;

  // The SVG is drawn at its real on-screen width (measured), so 1 unit = 1px and labels keep a fixed size.
  const vbW = Math.round(Math.max(280, Math.min(760, width || chartRenderWidth || 460)));
  const vbH = Math.round(Math.max(220, Math.min(380, vbW / 1.6)));
  const pad = { left: 42, right: 40, top: 26, bottom: 46 };
  const plotW = vbW - pad.left - pad.right;
  const plotH = vbH - pad.top - pad.bottom;

  const xScale = (x) => pad.left + ((x - minX) / (maxX - minX || 1)) * plotW;
  const yScale = (y) => pad.top + (1 - (y - yMin) / (yMax - yMin || 1)) * plotH;
  const r1 = (n) => Math.round(n * 10) / 10;

  const gridX = buildXTicks(minX, maxX).map((tick) => {
    const x = r1(xScale(tick));
    return `<text x="${x}" y="${pad.top + plotH + 20}" text-anchor="middle" class="axis-text">${tick}</text>`;
  }).join('');

  const gridY = buildYTicks(yMin, yMax).filter((tick) => tick >= yMin && tick <= yMax).map((tick) => {
    const y = r1(yScale(tick));
    return `<line x1="${pad.left}" y1="${y}" x2="${pad.left + plotW}" y2="${y}" class="grid-line" /><text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" class="axis-text">${Number.isInteger(tick) ? String(tick) : formatValue(tick, 1)}</text>`;
  }).join('');

  const byLabel = Object.fromEntries(curves.map((curve) => [curve.label, curve]));
  const toPoints = (curve) => curve.points.map((p) => `${r1(xScale(p.x))},${r1(yScale(p.y))}`);
  const band = byLabel.P15 && byLabel.P85
    ? `<polygon class="band-fill" points="${[...toPoints(byLabel.P15), ...toPoints(byLabel.P85).reverse()].join(' ')}" />`
    : '';

  const curveLines = curves.map((curve) => {
    const styleClass = curve.label === 'P50' ? 'p50' : (curve.label === 'P15' || curve.label === 'P85' ? 'p-mid' : 'p-out');
    return `<polyline points="${toPoints(curve).join(' ')}" class="curve-line ${styleClass}" fill="none" />`;
  }).join('');

  const curveLabels = curves.filter((curve) => ['P3', 'P50', 'P97'].includes(curve.label)).map((curve) => {
    const last = curve.points[curve.points.length - 1];
    return `<text x="${r1(xScale(last.x) + 6)}" y="${r1(yScale(last.y) + 4)}" class="plabels">${curve.label}</text>`;
  }).join('');

  let pointMarkup = '';
  if (showPoint) {
    const px = r1(xScale(ageDays / daysPerMonth));
    const py = r1(yScale(pointY));
    const valueLabel = `${formatMeasurementValue(pointY, measurementType, unitSystem)} ${unitFor(measurementType)}`;
    const toLeft = px > pad.left + plotW * 0.72;
    const lx = toLeft ? px - 14 : px + 14;
    const ly = py < pad.top + 18 ? py + 24 : py - 12;
    pointMarkup = `<circle class="dot-halo" cx="${px}" cy="${py}" r="12" /><circle class="dot" cx="${px}" cy="${py}" r="7" /><text x="${lx}" y="${ly}" text-anchor="${toLeft ? 'end' : 'start'}" class="dot-label">${valueLabel}</text>`;
  }

  const yAxisLabel = yAxisLabelFor(metricSelection);
  const yUnit = unitFor(measurementType);
  const aria = `${(copy.chartAria || '{metric}').replace('{metric}', metricName(metricSelection, measurementType))}. ${yAxisLabel}, ${copy.chartXAxis}${ariaExtra ? `. ${ariaExtra}` : ''}`;

  return `
    <svg class="growth-chart" viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}" role="img" aria-label="${aria}">
      ${gridY}
      <line x1="${pad.left}" y1="${pad.top + plotH}" x2="${pad.left + plotW}" y2="${pad.top + plotH}" class="axis-line" />
      ${band}
      ${curveLines}
      ${curveLabels}
      ${gridX}
      <text x="${pad.left - 8}" y="${pad.top - 12}" text-anchor="end" class="axis-unit">${yUnit}</text>
      <text x="${pad.left + plotW / 2}" y="${vbH - 6}" text-anchor="middle" class="axis-title">${copy.chartXAxis}</text>
      ${pointMarkup}
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

// New layout: show a window around the baby's age (0-12, 0-24, 0-36 or 0-60 months: the first end
// that is at least 3 months past the age), within the metric's own data range. Display only.
const CHART_WINDOW_ENDS = [12, 24, 36, 60];

function chartWindowRows(rows, ageDays) {
  if (!isNewLayout || !rows || rows.length < 2) return rows;
  const ageMonths = ageDays / daysPerMonth;
  const dataMin = rows[0].ageMonths;
  const dataMax = rows[rows.length - 1].ageMonths;
  const target = CHART_WINDOW_ENDS.find((end) => end >= ageMonths + 3) ?? dataMax;
  const end = Math.min(target, dataMax);
  const windowed = rows.filter((row) => row.ageMonths >= dataMin && row.ageMonths <= end + 1e-9);
  return windowed.length >= 2 ? windowed : rows;
}

function renderEmptyChart() {
  if (!datasetByMetric || !chartOut) return;
  const allRows = datasetByMetric.wfa?.female || datasetByMetric.wfa?.male;
  if (!allRows || allRows.length === 0) return;
  const rows = chartWindowRows(allRows, 0);

  const svg = buildChartSvg({
    rows,
    metricSelection: { metric: 'wfa' },
    measurementType: 'weight',
    ageDays: rows[0].ageDays,
    valueSi: rows[0].M,
    showPoint: false
  });

  if (isNewLayout) {
    chartOut.removeAttribute('role');
    chartOut.removeAttribute('aria-labelledby');
    chartOut.innerHTML = chartCardMarkup({
      title: chartTitle({ metric: 'wfa' }, 'weight', null),
      range: chartRangeText(rows),
      svg,
      withBaby: false,
      placeholder: true
    });
    return;
  }

  chartOut.innerHTML = `<div class="chart-shell">${svg}</div>`;
}

// ---------- B v2 result panel (new markup only) ----------

function fill(template, values) {
  return String(template || '').replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}

function capitalizeFirst(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function ordinalSuffix(n) {
  if (locale === 'fr') return n === 1 ? 'er' : 'e';
  if (locale === 'es' || locale === 'pt') return 'º';
  if (locale === 'it') return '°';
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

// The displayed whole-number percentile; the sentence and the out-of-range note use the same value.
function displayedPercentile(percentile) {
  return Math.round(percentile);
}

function percentileParts(percentile) {
  const n = Math.min(99, Math.max(1, displayedPercentile(percentile)));
  const prefix = percentile < 0.5 ? '<' : (percentile >= 99.5 ? '>' : '');
  const suffix = ordinalSuffix(n);
  const number = `${prefix}${n}`;
  const aria = fill(copy.percentileAria || '{ordinal}', { ordinal: `${number}${suffix}`, n: number });
  return { number, suffix, aria };
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function measurementKey(type, metricSelection) {
  if (type === 'weight') return 'Weight';
  if (type === 'headCircumference') return 'Head';
  return metricSelection?.mode === 'length' ? 'Length' : 'Height';
}

function groupLabel(sex) {
  return sex === 'male' ? copy.groupMale : copy.groupFemale;
}

function stripMetricSource(name) {
  return String(name || '').replace(/\s*\([^)]*\)\s*$/, '');
}

function chartTitle(metricSelection, measurementType, sex) {
  const base = stripMetricSource(metricName(metricSelection, measurementType));
  return sex ? `${base} · ${groupLabel(sex)}` : base;
}

function chartRangeText(rows) {
  return fill(copy.chartRange || '{from}–{to}', {
    from: formatValue(rows[0].ageMonths, 0),
    to: formatValue(rows[rows.length - 1].ageMonths, 0)
  });
}

function chartCardMarkup({ title, range, svg, withBaby, placeholder }) {
  const legend = [
    withBaby ? `<span><i class="lg-dot"></i>${copy.legendBaby}</span>` : '',
    `<span><i class="lg-median"></i>${copy.legendMedian}</span>`,
    `<span><i class="lg-band"></i>${copy.legendBand}</span>`,
    `<span><i class="lg-outer"></i>${copy.legendOuter}</span>`
  ].join('');

  return `
    <div class="chart-card${placeholder ? ' is-placeholder' : ''}"${placeholder ? ' aria-hidden="true"' : ''}>
      <div class="chart-head">${escapeHtml(title)}<span>${escapeHtml(range)}</span></div>
      ${svg}
      <div class="legend">${legend}</div>
    </div>
  `;
}

function resultSentence(result, sex) {
  const key = measurementKey(result.measurement.type, result.metricSelection);
  const values = {
    group: groupLabel(sex),
    less: copy[`less${key}`],
    more: copy[`more${key}`]
  };

  const lower = displayedPercentile(result.percentile);
  if (lower < 3) return capitalizeFirst(fill(copy.sentenceBelow, values));
  if (lower > 97) return capitalizeFirst(fill(copy.sentenceAbove, values));

  const text = fill(copy.sentenceTemplate, { ...values, lower, higher: 100 - lower });
  return lower === 50 ? `${copy.sentenceMiddlePrefix}${text}` : capitalizeFirst(text);
}

function isOutsideTypicalRange(percentile) {
  const shown = displayedPercentile(percentile);
  return shown < 3 || shown > 97;
}

function setResultState(state) {
  if (!isNewLayout) return;
  if (stateEmpty) stateEmpty.hidden = state !== 'empty';
  if (stateError) stateError.hidden = state !== 'error';
  if (stateResult) stateResult.hidden = state !== 'result';
  if (tabsOut) tabsOut.hidden = state !== 'result';
  if (resultExtra) resultExtra.hidden = state !== 'result';
  document.body.classList.remove('state-empty', 'state-result', 'state-error');
  document.body.classList.add(`state-${state}`);
}

function renderResultsV2(payload) {
  if (!payload.results.some((result) => result.measurement.type === selectedResultType)) {
    selectedResultType = payload.results[0].measurement.type;
  }

  const ageParts = [`${copy.ageChronological}: ${formatAge(payload.chronologicalAgeDays)}`];
  if (payload.correctedAgeMeta) {
    ageParts.push(`${copy.ageCorrected}: ${formatAge(payload.ageDaysForEvaluation)} (${payload.correctedAgeMeta.gestationalWeeks} ${copy.weeksSuffix})`);
  }
  if (ageOut) ageOut.textContent = ageParts.join(' · ');

  renderTabs(payload);
  renderSelectedResult(payload);
  setResultState('result');
}

function renderSelectedResult(payload) {
  const result = payload.results.find((item) => item.measurement.type === selectedResultType) || payload.results[0];
  const type = result.measurement.type;
  const displayValue = fromSi(type, result.measurement.valueSi, unitSystem);
  const valueText = `${formatMeasurementValue(displayValue, type, unitSystem)} ${unitFor(type)}`;
  const parts = percentileParts(result.percentile);

  if (metricOut) {
    metricOut.textContent = `${metricName(result.metricSelection, type)}: ${valueText} · ${copy.percentileLabel} P${formatValue(result.percentile, 1)}`;
  }

  if (percentileOut) {
    percentileOut.innerHTML = `<span class="sr-only">${escapeHtml(parts.aria)}</span><b aria-hidden="true">${escapeHtml(parts.number)}</b><sup aria-hidden="true">${escapeHtml(parts.suffix)}</sup>`;
  }

  if (sentenceOut) sentenceOut.textContent = resultSentence(result, payload.sex);

  if (rangeOut) {
    const outside = isOutsideTypicalRange(result.percentile);
    rangeOut.textContent = outside ? copy.rangeNote : '';
    rangeOut.hidden = !outside;
  }

  if (!chartOut) return;
  const chartRows = chartWindowRows(result.rows, result.ageDays);
  const svg = buildChartSvg({
    rows: chartRows,
    metricSelection: result.metricSelection,
    measurementType: type,
    ageDays: result.ageDays,
    valueSi: result.measurement.valueSi,
    showPoint: true,
    ariaExtra: `${copy.legendBaby}: ${valueText}, ${parts.aria}`
  });

  chartOut.innerHTML = chartCardMarkup({
    title: chartTitle(result.metricSelection, type, payload.sex),
    range: chartRangeText(chartRows),
    svg,
    withBaby: true,
    placeholder: false
  });
  chartOut.setAttribute('role', 'tabpanel');
  chartOut.setAttribute('aria-labelledby', `growth-tab-${type}`);
}

function renderTabs(payload) {
  if (!tabsOut) return;

  // Tabs sit in an inner role="tablist" (display: contents); "+ Add" chips are plain buttons next to it.
  // CSS order keeps the weight / length / head positions.
  const tabs = [];
  const adds = [];
  MEASUREMENT_ORDER.forEach((type, index) => {
    const result = payload.results.find((item) => item.measurement.type === type);
    const selection = result ? result.metricSelection : selectMetric(type, payload.ageDaysForEvaluation);
    const label = copy[`tab${measurementKey(type, selection)}`];

    if (!result) {
      adds.push(`<button type="button" class="is-add" style="order:${index}" data-tab-add="${type}"><small>${label}</small><b>${copy.tabAdd}</b></button>`);
      return;
    }

    const parts = percentileParts(result.percentile);
    const selected = type === selectedResultType;
    tabs.push(`<button type="button" role="tab" id="growth-tab-${type}" style="order:${index}" aria-selected="${selected}" aria-controls="growth-chart-panel" tabindex="${selected ? 0 : -1}" data-tab-type="${type}"><small>${label}</small><b>${escapeHtml(parts.number)}${escapeHtml(parts.suffix)}</b></button>`);
  });

  tabsOut.innerHTML = `<div class="mtabs-list" role="tablist" aria-label="${escapeHtml(copy.tabsLabel)}">${tabs.join('')}</div>${adds.join('')}`;
}

function selectResultTab(type) {
  if (!lastRenderPayload) return;
  selectedResultType = type;
  renderTabs(lastRenderPayload);
  renderSelectedResult(lastRenderPayload);
  tabsOut?.querySelector(`[data-tab-type="${type}"]`)?.focus();
}

function focusMeasurementInput(type) {
  const input = form?.elements?.namedItem(MEASUREMENT_FIELDS[type]);
  if (input instanceof HTMLInputElement) input.focus();
}

function onTabClick(event) {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  if (!button) return;
  if (button.dataset.tabAdd) {
    focusMeasurementInput(button.dataset.tabAdd);
    return;
  }
  if (button.dataset.tabType) selectResultTab(button.dataset.tabType);
}

function onTabKeydown(event) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!keys.includes(event.key) || !tabsOut) return;
  const tabs = [...tabsOut.querySelectorAll('[role="tab"]')];
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  event.preventDefault();

  let next = current;
  if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
  if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;

  const target = tabs[next];
  if (target.dataset.tabType) selectResultTab(target.dataset.tabType);
  else target.focus();
}

// Re-draw the chart when its on-screen width changes, so text in the SVG stays at its intended size.
function measureChartWidth() {
  if (!chartOut) return 0;
  const svg = chartOut.querySelector('svg');
  const width = svg ? svg.getBoundingClientRect().width : 0;
  return width || Math.max(0, chartOut.clientWidth - 32);
}

function repaintChart() {
  if (lastRenderPayload) {
    if (isNewLayout) renderSelectedResult(lastRenderPayload);
    else renderCharts(lastRenderPayload.results);
  } else {
    renderEmptyChart();
  }
}

function watchChartWidth() {
  if (!chartOut) return;
  const check = () => {
    const width = Math.round(measureChartWidth());
    if (!width || Math.abs(width - chartRenderWidth) <= 4) return;
    chartRenderWidth = width;
    repaintChart();
  };

  if (typeof ResizeObserver === 'function') {
    let frame = 0;
    new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(check);
    }).observe(chartOut);
  } else {
    window.addEventListener('resize', check);
  }
  check();
}

// ---------- Inline form errors (new markup) ----------

function firstMissingField(sex, birthDate, measurementDate, measurementCount) {
  if (!sex) return 'sex';
  if (!birthDate) return 'birth_date';
  if (!measurementDate) return 'measurement_date';
  if (!measurementCount) return 'measurements';
  return null;
}

function fieldInputs(fieldName) {
  if (!form) return [];
  if (fieldName === 'measurements') {
    return Object.values(MEASUREMENT_FIELDS).map((name) => form.elements.namedItem(name)).filter(Boolean);
  }
  if (fieldName === 'sex') return [...form.querySelectorAll('input[name="sex"]')];
  const el = form.elements.namedItem(fieldName);
  // Date fields enhanced by tools/date-picker.js: the ISO value is a hidden input; errors go on the visible text field
  const display = el instanceof HTMLElement && el.dataset.dateDisplay ? document.getElementById(el.dataset.dateDisplay) : null;
  if (display) return [display];
  return el instanceof Element ? [el] : [];
}

function clearFieldError(fieldName) {
  if (!isNewLayout || !form || !fieldName) return;
  const box = form.querySelector(`[data-field="${fieldName}"]`);
  if (!box || !box.classList.contains('has-error')) return;
  box.classList.remove('has-error');
  fieldInputs(fieldName).forEach((input) => input.removeAttribute('aria-invalid'));
  const errEl = form.querySelector(`[data-field-error="${fieldName}"]`);
  const textEl = errEl?.querySelector('[data-err-text]') || errEl;
  if (textEl) textEl.textContent = '';
}

function clearFieldErrors() {
  if (!isNewLayout || !form) return;
  form.querySelectorAll('[data-field].has-error').forEach((box) => clearFieldError(box.dataset.field));
}

function valueAtZ(lms, z) {
  const base = 1 + (lms.L * lms.S * z);
  if (Math.abs(lms.L) < 1e-8) {
    return lms.M * Math.exp(lms.S * z);
  }
  if (base <= 0) return Number.NaN;
  return lms.M * Math.pow(base, 1 / lms.L);
}

// WHO restricted application of the LMS method (used by WHO for weight-for-age): beyond |z| = 3 the
// distance from the +-3 SD value is measured in units of the 2-to-3 SD interval, so extreme weights do
// not get absurd z-scores. Plain LMS for everything else (length/height/head circumference use plain LMS).
function zFromMeasurement(value, lms, restricted = false) {
  if (value <= 0 || lms.M <= 0 || lms.S <= 0) return Number.NaN;
  const z = Math.abs(lms.L) < 1e-8
    ? Math.log(value / lms.M) / lms.S
    : (Math.pow(value / lms.M, lms.L) - 1) / (lms.L * lms.S);
  if (!restricted || !(Math.abs(z) > 3)) return z;

  const sd3 = valueAtZ(lms, Math.sign(z) * 3);
  const sd2 = valueAtZ(lms, Math.sign(z) * 2);
  if (!Number.isFinite(sd3) || !Number.isFinite(sd2)) return z;
  return Math.sign(z) * 3 + (value - sd3) / Math.abs(sd3 - sd2);
}

function zForMeasurement(measurementType, value, lms) {
  return zFromMeasurement(value, lms, measurementType === 'weight');
}

// WHO Anthro rounds the age to whole days (half up) before the table lookup.
function evaluationAgeDays(ageDays) {
  return Math.floor(ageDays + 0.5 + 1e-9);
}

// Full lookup for one measurement: age -> whole days -> table (length/height) -> LMS -> z.
// Returns { ok: false, error: 'value' | 'range' } or { ok: true, ageDays, metricSelection, rows, lms, zScore }.
function evaluateMeasurement(index, sex, measurementType, valueSi, rawAgeDays) {
  const ageDays = evaluationAgeDays(rawAgeDays);
  if (!isMeasurementInRange(measurementType, valueSi)) return { ok: false, error: 'value' };

  const metricSelection = selectMetric(measurementType, ageDays);
  const rows = index[metricSelection.metric]?.[sex];
  if (!rows || rows.length === 0) return { ok: false, error: 'range' };
  if (ageDays < rows[0].ageDays || ageDays > rows[rows.length - 1].ageDays) return { ok: false, error: 'range' };

  const lms = interpolateLms(rows, ageDays);
  const zScore = zForMeasurement(measurementType, valueSi, lms);
  if (!Number.isFinite(zScore)) return { ok: false, error: 'value' };
  return { ok: true, ageDays, metricSelection, rows, lms, zScore };
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

  // binary search: first row with row.ageDays >= ageDays (rows are sorted by ageDays)
  let lo = 0;
  let hi = rows.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].ageDays >= ageDays) hi = mid;
    else lo = mid + 1;
  }
  if (lo <= 0) lo = 1;
  hi = lo;
  lo = hi - 1;

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

// Rows to draw the percentile curves from. The data has one row per day up to 1 year and monthly rows
// after that; drawing every daily row would bloat the SVG, so keep every day for the first weeks and
// thin the daily rows out as the curves flatten. The steps are chosen so the polyline stays within
// 0.01 z of WHO's daily curves (checked by scripts/growth/audit.mjs, check 7b).
const CHART_SAMPLE_STEPS = [[28, 1], [56, 2], [112, 4], [365, 7]]; // [up to day, keep every n-th day]

function chartSampleRows(rows) {
  const last = rows.length - 1;
  return rows.filter((row, i) => {
    if (i === 0 || i === last) return true;
    const prev = rows[i - 1];
    const next = rows[i + 1];
    // the monthly part of the data (gap > 1 day on either side) is already sparse: keep it all
    if (row.ageDays - prev.ageDays > 1 || next.ageDays - row.ageDays > 1) return true;
    const step = CHART_SAMPLE_STEPS.find(([until]) => row.ageDays <= until)?.[1] ?? 1;
    return row.ageDays % step === 0;
  });
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
  clearFieldErrors();
}

function showError(message, fieldName) {
  const box = isNewLayout && fieldName ? form?.querySelector(`[data-field="${fieldName}"]`) : null;
  if (!box) {
    if (errorBox) errorBox.textContent = message;
    return;
  }

  // Inline error on the field, focus it, and switch the result panel to its error state
  if (errorBox) errorBox.textContent = '';
  clearFieldErrors();
  box.classList.add('has-error');
  const errEl = form.querySelector(`[data-field-error="${fieldName}"]`);
  const textEl = errEl?.querySelector('[data-err-text]') || errEl;
  if (textEl) textEl.textContent = message;

  const inputs = fieldInputs(fieldName);
  inputs.forEach((input) => input.setAttribute('aria-invalid', 'true'));
  const focusTarget = fieldName === 'sex'
    ? (inputs.find((input) => input.checked) || inputs[0])
    : inputs[0];
  if (focusTarget instanceof HTMLElement) focusTarget.focus();

  lastRenderPayload = null;
  selectedResultType = null;
  renderEmptyChart();
  setResultState('error');
}

function setDefaultMeasurementDate() {
  const measurementDateField = form?.elements?.namedItem('measurement_date');
  if (!(measurementDateField instanceof HTMLInputElement) || measurementDateField.value) return;
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  measurementDateField.value = local.toISOString().slice(0, 10);
  // Lets tools/date-picker.js show the new value in its visible field
  measurementDateField.dispatchEvent(new Event('change', { bubbles: true }));
}
