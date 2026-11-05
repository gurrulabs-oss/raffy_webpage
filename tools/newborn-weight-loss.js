// Newborn weight-loss check (calculator widget). One script for the tool page and the in-article widget:
// every [data-wl-root] on the page is initialised. All calculation happens in the browser; the only thing
// sent anywhere is the anonymous Mixpanel events (band, day, pct), never the weights.
// Node-importable: the DOM is only touched inside the `typeof document` guard at the bottom.

const NEAR = 8; // % lost from which the verdict is "near the limit"
const LIMIT = 10; // % lost above which the verdict is "call"
const OLD_BELOW_BIRTH_DAY = 15; // from this day on, still below birth weight means "call"
// Day ranges of the day-by-day table; LOCALES[x].rows has one [when, text] per entry, same order.
const RANGES = [[0, 0], [1, 1], [2, 2], [3, 4], [5, 5], [6, 7], [8, 9], [10, 14], [15, 28]];
const NBSP = " ";

const LOCALES = {
  es: {
    tag: "es-ES", pct: " %",
    levels: { ok: "Esperable", near: "Cerca del límite", call: "Llama al pediatra" },
    titles: { recovered: "Ya ha recuperado su peso al nacer", ok: "Dentro de lo esperable", callToday: "Llama a tu pediatra hoy", call: "Llama a tu pediatra", near: "Todavía puede ser normal, pero está cerca del 10 %" },
    lost: "perdido", gained: "ganado", same: "sin cambios",
    less: "{g} g menos que al nacer", more: "{g} g más que al nacer",
    expected: "Lo esperable {when}:",
    rows: [
      ["el día 0 (nacimiento)", "se anota el peso al nacer. Es el número con el que se comparan todos los pesos que anotes después."],
      ["el día 1", "a menudo, hacia un 4-5 % por debajo del peso al nacer al terminar el primer día."],
      ["el día 2", "sigue bajando, normalmente hacia un 6-8 % por debajo del peso al nacer."],
      ["el día 3-4", "punto más bajo, normalmente hacia un 5-9 % por debajo del peso al nacer. Hasta un 10 % aproximadamente todavía puede ser normal."],
      ["el día 5", "la bajada suele detenerse y el peso debería empezar a subir."],
      ["el día 6-7", "gana peso de forma constante. Muchos bebés siguen un poco por debajo del peso al nacer, y no pasa nada."],
      ["el día 8-10", "muchos bebés están cerca de su peso al nacer o ya lo han recuperado."],
      ["el día 10-14", "la mayoría de los bebés ha recuperado el peso al nacer; los alimentados con fórmula, a menudo un poco antes."],
      ["después del día 14", "si tu bebé sigue por debajo de su peso al nacer, díselo a tu pediatra."]
    ],
    tipLimit: "Para tu bebé, el 10 % son {ten} g: por debajo de {limit} g, llama a tu pediatra.",
    tipRise: "A partir del día 5 el peso debería subir: si hoy pesa menos que en la medida anterior, llama a tu pediatra.",
    tipDiapers: "Fíjate también en los pañales y en cómo come: menos de 6 pañales mojados al día a partir del día 5 merece una llamada.",
    alert: "Llama a tu pediatra para que revise cómo come tu bebé. Si está flácido, muy dormido, no se despierta para comer o lleva muchas horas sin mojar el pañal, acude a urgencias ahora mismo.",
    errBirth: "Introduce el peso al nacer en gramos (1.500-6.000 g) o en kilos (p. ej. 3,4).",
    errNow: "Introduce el peso de hoy en gramos o en kilos.",
    errNowFar: "Hay más de un 30 % de diferencia con el peso al nacer. Revisa las dos cifras.",
    errDay: "Introduce un número entero de días entre 0 y 28.",
    errDayOld: 'Para bebés de más de 4 semanas usa la <a href="/es/herramientas/calculadora-percentiles-bebe-oms.html">calculadora de percentiles OMS</a>.'
  },
  en: {
    tag: "en-US", pct: "%",
    levels: { ok: "Expected", near: "Close to the limit", call: "Call the pediatrician" },
    titles: { recovered: "Already back to birth weight", ok: "Within the expected range", callToday: "Call your pediatrician today", call: "Call your pediatrician", near: "Can still be normal, but close to the 10% limit" },
    lost: "lost", gained: "gained", same: "no change",
    less: "{g} g below birth weight", more: "{g} g above birth weight",
    expected: "What to expect {when}:",
    rows: [
      ["on day 0 (birth)", "the birth weight is written down. Every weight you record later is compared with this number."],
      ["on day 1", "often around 4-5% below birth weight by the end of the first day."],
      ["on day 2", "still dropping, usually to about 6-8% below birth weight."],
      ["on days 3-4", "the lowest point, usually about 5-9% below birth weight. Up to roughly 10% can still be normal."],
      ["on day 5", "the drop usually stops and weight should start to rise."],
      ["on days 6-7", "steady weight gain. Many babies are still a little below birth weight, and that is fine."],
      ["on days 8-10", "many babies are close to their birth weight or have already regained it."],
      ["on days 10-14", "most babies have regained their birth weight; formula-fed babies often a little sooner."],
      ["after day 14", "if your baby is still below birth weight, tell your pediatrician."]
    ],
    tipLimit: "For your baby, 10% is {ten} g: below {limit} g, call your pediatrician.",
    tipRise: "From day 5 on, weight should be going up: if it is lower today than the last weight you noted, call your pediatrician.",
    tipDiapers: "Also watch the diapers and how feeding is going: fewer than 6 wet diapers a day from day 5 on is worth a call.",
    alert: "Call your pediatrician to check how your baby is feeding. If your baby is floppy, very sleepy, won't wake up to feed or has gone many hours without a wet diaper, go to the emergency room right now.",
    errBirth: "Enter the birth weight in grams (1,500-6,000 g) or in kilograms (e.g. 3.4).",
    errNow: "Enter today's weight in grams or kilograms.",
    errNowFar: "That is more than 30% away from the birth weight. Check both numbers.",
    errDay: "Enter a whole number of days between 0 and 28.",
    errDayOld: 'For babies older than 4 weeks, use the <a href="/en/tools/baby-growth-percentile-calculator-who.html">WHO growth percentile calculator</a>.'
  },
  pt: {
    tag: "pt-BR", pct: "%",
    levels: { ok: "Esperado", near: "Perto do limite", call: "Ligue para o pediatra" },
    titles: { recovered: "Já recuperou o peso do nascimento", ok: "Dentro do esperado", callToday: "Ligue para o pediatra hoje", call: "Ligue para o pediatra", near: "Ainda pode ser normal, mas está perto de 10%" },
    lost: "perdido", gained: "ganho", same: "sem mudança",
    less: "{g} g a menos que ao nascer", more: "{g} g a mais que ao nascer",
    expected: "O esperado {when}:",
    rows: [
      ["no dia 0 (nascimento)", "anota-se o peso ao nascer. É o número com o qual todos os pesos seguintes são comparados."],
      ["no dia 1", "muitas vezes por volta de 4-5% abaixo do peso ao nascer no fim do primeiro dia."],
      ["no dia 2", "continua caindo, normalmente até 6-8% abaixo do peso ao nascer."],
      ["nos dias 3-4", "ponto mais baixo, normalmente cerca de 5-9% abaixo do peso ao nascer. Até uns 10% ainda pode ser normal."],
      ["no dia 5", "a queda costuma parar e o peso deve começar a subir."],
      ["nos dias 6-7", "ganho de peso constante. Muitos bebês ainda ficam um pouco abaixo do peso ao nascer, e tudo bem."],
      ["nos dias 8-10", "muitos bebês estão perto do peso ao nascer ou já o recuperaram."],
      ["nos dias 10-14", "a maioria dos bebês já recuperou o peso ao nascer; os alimentados com fórmula, muitas vezes um pouco antes."],
      ["depois do dia 14", "se o seu bebê ainda estiver abaixo do peso ao nascer, avise o pediatra."]
    ],
    tipLimit: "Para o seu bebê, 10% são {ten} g: abaixo de {limit} g, ligue para o pediatra.",
    tipRise: "A partir do dia 5 o peso deve subir: se hoje ele pesa menos que no último peso anotado, ligue para o pediatra.",
    tipDiapers: "Observe também as fraldas e como ele mama: menos de 6 fraldas molhadas por dia a partir do dia 5 merece uma ligação.",
    alert: "Ligue para o pediatra para avaliar como o seu bebê está mamando. Se ele estiver molinho, muito sonolento, não acordar para mamar ou passar muitas horas sem molhar a fralda, vá ao pronto-socorro agora mesmo.",
    errBirth: "Digite o peso ao nascer em gramas (1.500-6.000 g) ou em quilos (ex.: 3,4).",
    errNow: "Digite o peso de hoje em gramas ou em quilos.",
    errNowFar: "A diferença para o peso ao nascer passa de 30%. Confira os dois valores.",
    errDay: "Digite um número inteiro de dias entre 0 e 28.",
    errDayOld: 'Para bebês com mais de 4 semanas, use a <a href="/pt/ferramentas/calculadora-percentis-bebe-oms.html">calculadora de percentis da OMS</a>.'
  },
  fr: {
    tag: "fr-FR", pct: NBSP + "%",
    levels: { ok: "Attendu", near: "Proche de la limite", call: "Appelez le pédiatre" },
    titles: { recovered: "Votre bébé a déjà retrouvé son poids de naissance", ok: "Dans la fourchette attendue", callToday: "Appelez votre pédiatre aujourd'hui", call: "Appelez votre pédiatre", near: "Cela peut rester normal, mais on approche de la limite de 10" + NBSP + "%" },
    lost: "perdu", gained: "pris", same: "inchangé",
    less: "{g}" + NBSP + "g de moins qu'à la naissance", more: "{g}" + NBSP + "g de plus qu'à la naissance",
    expected: "Ce qu'on observe en général {when}" + NBSP + ":",
    rows: [
      ["le jour 0 (naissance)", "on note le poids de naissance. C'est la valeur à laquelle on compare chaque poids que vous noterez ensuite."],
      ["le jour 1", "souvent environ 4-5" + NBSP + "% en dessous du poids de naissance à la fin du premier jour."],
      ["le jour 2", "le poids continue de baisser, en général jusqu'à 6-8" + NBSP + "% sous le poids de naissance."],
      ["les jours 3-4", "point le plus bas, en général environ 5-9" + NBSP + "% sous le poids de naissance. Jusqu'à 10" + NBSP + "% environ, cela peut encore être normal."],
      ["le jour 5", "la baisse s'arrête le plus souvent et le poids devrait commencer à remonter."],
      ["les jours 6-7", "prise de poids régulière. Beaucoup de bébés restent un peu sous leur poids de naissance, et ce n'est pas un problème."],
      ["les jours 8-10", "beaucoup de bébés sont proches de leur poids de naissance ou l'ont déjà retrouvé."],
      ["les jours 10-14", "la plupart des bébés ont retrouvé leur poids de naissance ; ceux nourris au lait infantile, souvent un peu plus tôt."],
      ["après le jour 14", "si votre bébé reste sous son poids de naissance, parlez-en à votre pédiatre."]
    ],
    tipLimit: "Pour votre bébé, 10" + NBSP + "% représentent {ten}" + NBSP + "g" + NBSP + ": en dessous de {limit}" + NBSP + "g, appelez votre pédiatre.",
    tipRise: "À partir du jour 5, le poids devrait augmenter" + NBSP + ": s'il est plus bas que le dernier poids noté, appelez votre pédiatre.",
    tipDiapers: "Surveillez aussi les couches et la façon dont il mange" + NBSP + ": moins de 6 couches mouillées par jour à partir du jour 5 justifie un appel.",
    alert: "Appelez votre pédiatre pour qu'il vérifie comment mange votre bébé. S'il est mou, très endormi, ne se réveille pas pour manger ou reste de nombreuses heures sans mouiller sa couche, rendez-vous aux urgences tout de suite.",
    errBirth: "Saisissez le poids de naissance en grammes (1" + NBSP + "500-6" + NBSP + "000" + NBSP + "g) ou en kilos (par ex. 3,4).",
    errNow: "Saisissez le poids d'aujourd'hui en grammes ou en kilos.",
    errNowFar: "L'écart avec le poids de naissance dépasse 30" + NBSP + "%. Vérifiez les deux valeurs.",
    errDay: "Saisissez un nombre entier de jours entre 0 et 28.",
    errDayOld: 'Pour un bébé de plus de 4 semaines, utilisez le <a href="/fr/outils/calculateur-percentiles-bebe-oms.html">calculateur de percentiles OMS</a>.'
  },
  it: {
    tag: "it-IT", pct: "%",
    levels: { ok: "Nella norma", near: "Vicino al limite", call: "Chiama il pediatra" },
    titles: { recovered: "Ha già recuperato il peso della nascita", ok: "Entro i valori attesi", callToday: "Chiama oggi il pediatra", call: "Chiama il pediatra", near: "Può ancora essere normale, ma è vicino al 10%" },
    lost: "perso", gained: "preso", same: "invariato",
    less: "{g} g in meno rispetto alla nascita", more: "{g} g in più rispetto alla nascita",
    expected: "Cosa ci si aspetta {when}:",
    rows: [
      ["il giorno 0 (nascita)", "si annota il peso alla nascita. È il numero con cui si confrontano tutti i pesi successivi."],
      ["il giorno 1", "spesso circa il 4-5% in meno rispetto al peso alla nascita al termine del primo giorno."],
      ["il giorno 2", "continua a scendere, di solito fino al 6-8% sotto il peso alla nascita."],
      ["i giorni 3-4", "punto più basso, di solito circa il 5-9% sotto il peso alla nascita. Fino al 10% circa può ancora essere normale."],
      ["il giorno 5", "il calo di solito si ferma e il peso dovrebbe cominciare a risalire."],
      ["i giorni 6-7", "aumento di peso costante. Molti neonati sono ancora un po' sotto il peso alla nascita, ed è normale."],
      ["i giorni 8-10", "molti neonati sono vicini al peso alla nascita o l'hanno già recuperato."],
      ["i giorni 10-14", "la maggior parte dei neonati ha recuperato il peso alla nascita; quelli allattati con latte artificiale spesso un po' prima."],
      ["dopo il giorno 14", "se il tuo bambino è ancora sotto il peso alla nascita, parlane con il pediatra."]
    ],
    tipLimit: "Per il tuo bambino il 10% sono {ten} g: sotto i {limit} g, chiama il pediatra.",
    tipRise: "Dal giorno 5 il peso dovrebbe salire: se oggi pesa meno dell'ultimo peso annotato, chiama il pediatra.",
    tipDiapers: "Guarda anche i pannolini e come mangia: meno di 6 pannolini bagnati al giorno dal giorno 5 merita una telefonata.",
    alert: "Chiama il pediatra perché controlli come mangia il tuo bambino. Se è molle, molto assonnato, non si sveglia per mangiare o resta molte ore senza bagnare il pannolino, vai subito al pronto soccorso.",
    errBirth: "Inserisci il peso alla nascita in grammi (1.500-6.000 g) o in chili (es. 3,4).",
    errNow: "Inserisci il peso di oggi in grammi o in chili.",
    errNowFar: "La differenza rispetto al peso alla nascita supera il 30%. Controlla i due valori.",
    errDay: "Inserisci un numero intero di giorni tra 0 e 28.",
    errDayOld: 'Per i neonati con più di 4 settimane usa il <a href="/it/strumenti/calcolatore-percentili-oms.html">calcolatore di percentili OMS</a>.'
  },
  de: {
    tag: "de-DE", pct: NBSP + "%",
    levels: { ok: "Zu erwarten", near: "Nahe am Grenzwert", call: "Kinderarztpraxis anrufen" },
    titles: { recovered: "Das Geburtsgewicht ist schon wieder erreicht", ok: "Im erwarteten Bereich", callToday: "Ruf heute noch in der Kinderarztpraxis an", call: "Ruf in der Kinderarztpraxis an", near: "Kann noch normal sein, liegt aber nahe an der Grenze von 10" + NBSP + "%" },
    lost: "verloren", gained: "zugenommen", same: "unverändert",
    less: "{g}" + NBSP + "g weniger als bei der Geburt", more: "{g}" + NBSP + "g mehr als bei der Geburt",
    expected: "{when}:",
    rows: [
      ["Tag 0 (Geburt)", "Das Geburtsgewicht wird notiert. Mit dieser Zahl wird jedes Gewicht verglichen, das du später notierst."],
      ["Tag 1", "Oft etwa 4-5" + NBSP + "% unter dem Geburtsgewicht am Ende des ersten Tages."],
      ["Tag 2", "Das Gewicht sinkt weiter, meist auf etwa 6-8" + NBSP + "% unter das Geburtsgewicht."],
      ["Tag 3-4", "Tiefster Punkt, meist etwa 5-9" + NBSP + "% unter dem Geburtsgewicht. Bis etwa 10" + NBSP + "% kann das noch normal sein."],
      ["Tag 5", "Die Abnahme hört meist auf und das Gewicht sollte wieder steigen."],
      ["Tag 6-7", "Stetige Zunahme. Viele Babys liegen noch etwas unter dem Geburtsgewicht, und das ist in Ordnung."],
      ["Tag 8-10", "Viele Babys sind nahe am Geburtsgewicht oder haben es schon wieder erreicht."],
      ["Tag 10-14", "Die meisten Babys haben ihr Geburtsgewicht wieder erreicht; Babys mit Flaschennahrung oft etwas früher."],
      ["Nach Tag 14", "Wenn dein Baby noch unter dem Geburtsgewicht liegt, sprich mit deiner Kinderarztpraxis."]
    ],
    tipLimit: "Für dein Baby sind 10" + NBSP + "% genau {ten}" + NBSP + "g: Liegt das Gewicht unter {limit}" + NBSP + "g, ruf in der Kinderarztpraxis an.",
    tipRise: "Ab Tag 5 sollte das Gewicht steigen: Wiegt dein Baby heute weniger als beim zuletzt notierten Gewicht, ruf in der Kinderarztpraxis an.",
    tipDiapers: "Achte auch auf die Windeln und das Trinkverhalten: Weniger als 6 nasse Windeln pro Tag ab Tag 5 sind einen Anruf wert.",
    alert: "Ruf in der Kinderarztpraxis an, damit beurteilt wird, wie dein Baby trinkt. Ist es schlaff, sehr schläfrig, wacht es zum Trinken nicht auf oder hatte es viele Stunden keine nasse Windel, fahre sofort in die Notaufnahme.",
    errBirth: "Gib das Geburtsgewicht in Gramm (1.500-6.000" + NBSP + "g) oder in Kilogramm (z." + NBSP + "B. 3,4) ein.",
    errNow: "Gib das heutige Gewicht in Gramm oder Kilogramm ein.",
    errNowFar: "Der Unterschied zum Geburtsgewicht beträgt mehr als 30" + NBSP + "%. Prüfe beide Werte.",
    errDay: "Gib eine ganze Zahl an Tagen zwischen 0 und 28 ein.",
    errDayOld: 'Für Babys, die älter als 4 Wochen sind, nutze den <a href="/de/tools/perzentilenrechner-baby-who.html">WHO-Perzentilrechner</a>.'
  }
};

// "3400", "3.400", "3,4" and "3.4" all mean 3400 g: under 20 it is read as kilos.
function grams(raw) {
  const v = Number(String(raw ?? "").trim().replace(/\s/g, "").replace(",", "."));
  if (!raw || !Number.isFinite(v) || v <= 0) return NaN;
  return v < 20 ? v * 1000 : v;
}

// Bands. Integer-safe: loss% > 10 is compared as (birth-now)*100 > 10*birth, so exactly 10.0 % is "near", not "call",
// and exactly 8.0 % is "near", not "ok". From day 15, still below birth weight is "call"; day 14 is not.
function check(birth, now, day) {
  const lostG = birth - now;
  const lost = lostG / birth * 100;
  const row = RANGES.findIndex(([from, to]) => day >= from && day <= to);
  let level = "ok";
  let title = now >= birth ? "recovered" : "ok";
  if (lostG * 100 > LIMIT * birth) { level = "call"; title = "callToday"; }
  else if (day >= OLD_BELOW_BIRTH_DAY && now < birth) { level = "call"; title = "call"; }
  else if (lostG * 100 >= NEAR * birth) { level = "near"; title = "near"; }
  return { lost, diff: Math.round(lostG), level, title, row, limitG: Math.round(birth * (1 - LIMIT / 100)) };
}

// Parses and validates the raw field values. bad.* are true when the field needs an error message.
function parseInputs(rawBirth, rawNow, rawDay) {
  const b = grams(rawBirth);
  const c = grams(rawNow);
  const dRaw = String(rawDay ?? "").trim();
  const d = Number(dRaw);
  const nowInRange = c >= 1000 && c <= 7800; // 6000 g birth + 30 %
  return {
    b, c, d,
    nowInRange,
    bad: {
      birth: !(b >= 1500 && b <= 6000),
      now: !nowInRange || Boolean(b && Math.abs(c - b) / b > 0.3),
      day: dRaw === "" || !Number.isInteger(d) || d < 0 || d > 28
    }
  };
}

// Self-check of the bands (runs on load, logs only on failure).
function selfCheck() {
  [
    [3400, 3170, 3, "ok"], [3400, 3100, 3, "near"], [3400, 3050, 3, "call"],
    [3400, 3400 - 272, 2, "near"], // exactly 8.0 % -> near
    [3400, 3060, 3, "near"], [3400, 3059, 3, "call"], // exactly 10.0 % -> near; just over -> call
    [3400, 3350, 14, "ok"], [3400, 3350, 15, "call"], [3400, 3450, 15, "ok"], [3400, 3400, 15, "ok"]
  ].forEach(([b, c, d, want]) => {
    const got = check(b, c, d).level;
    if (got !== want) console.error("band check", b, c, d, got, "!=", want);
  });
}

function init(root) {
  const lang = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  const L = LOCALES[lang] || LOCALES.en;
  const trackLang = LOCALES[lang] ? lang : "en";
  const fmt = (n, dec) => n.toLocaleString(L.tag, { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: "always" });
  const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
  // tool-cluster.js is loaded lazily so this module also works where it is not needed (and in Node).
  const tracker = import("./tool-cluster.js").then((m) => m.trackToolEvent).catch(() => () => {});
  const track = (suffix, props) => tracker.then((t) => t("weightloss", suffix, { language: trackLang, ...props }));

  const form = root.querySelector("form");
  const res = root.querySelector(".pane.res");
  const q = (sel) => res.querySelector(sel);
  const field = (n) => form.elements[n].closest(".field");
  const setView = (view, initial) => {
    root.dataset.view = view;
    // Tool pages hide the sticky app bar through body.state-* (same as the other tools); the article has no such class.
    if (/\bstate-/.test(document.body.className)) {
      document.body.classList.remove("state-empty", "state-result", "state-error");
      document.body.classList.add("state-" + view);
    }
    if (view === "result") window.RaffyStickyCta?.show();
    else if (!initial) window.RaffyStickyCta?.hide(); // not on load: hide() would block the article's scroll-triggered bar
  };

  function run() {
    const { b, c, d, nowInRange, bad } = parseInputs(form.elements.birth.value, form.elements.now.value, form.elements.day.value);
    track("Submit Clicked", Number.isInteger(d) && d >= 0 && d <= 28 && String(form.elements.day.value).trim() !== "" ? { day: d } : {});
    const msg = { birth: L.errBirth, now: nowInRange ? L.errNowFar : L.errNow, day: d > 28 ? L.errDayOld : L.errDay };
    Object.keys(bad).forEach((k) => {
      field(k).classList.toggle("has-error", !!bad[k]);
      form.elements[k].toggleAttribute("aria-invalid", !!bad[k]);
      field(k).querySelector(".err span:last-child").innerHTML = msg[k];
    });
    if (bad.birth || bad.now || bad.day) { setView("error"); return; }

    const r = check(b, c, d);
    const gained = r.lost < 0;
    const level = q("[data-r-level]");
    level.textContent = L.levels[r.level];
    level.className = "wl-level " + r.level;
    q("[data-r-pct]").textContent = (gained ? "+" : "") + fmt(Math.abs(r.lost), 1) + L.pct;
    q("[data-r-pct-label]").textContent = gained ? L.gained : (r.lost === 0 ? L.same : L.lost);
    q("[data-r-grams]").textContent = fill(gained ? L.more : L.less, { g: fmt(Math.abs(r.diff), 0) });
    q("[data-r-title]").textContent = L.titles[r.title];
    // Marker on the 0-12 % scale; gains sit at the left edge.
    q(".wl-marker").style.left = Math.min(Math.max(r.lost, 0), 12) / 12 * 100 + "%";
    const [when, text] = L.rows[r.row];
    q("[data-r-day]").innerHTML = "<b>" + fill(L.expected, { when }) + "</b> " + text;
    q("[data-r-alert] > span:last-child").textContent = L.alert;

    const tips = [];
    if (!gained) tips.push(fill(L.tipLimit, { ten: fmt(Math.round(b / 10), 0), limit: fmt(r.limitG, 0) }));
    if (d >= 5 && !gained) tips.push(L.tipRise);
    tips.push(L.tipDiapers);
    q("[data-r-tips]").innerHTML = tips.map((t) => '<li><span class="dot" aria-hidden="true"></span><span>' + t + "</span></li>").join("");
    q("[data-r-alert]").hidden = r.level !== "call";
    setView("result");
    track("Results Shown", { band: r.level, day: d, pct: Math.round(r.lost * 10) / 10 });
    if (window.matchMedia("(max-width: 980px)").matches) res.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); run(); });
  form.addEventListener("reset", () => setTimeout(() => {
    form.querySelectorAll(".has-error").forEach((f) => f.classList.remove("has-error"));
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    setView("empty");
  }));
  setView("empty", true);
}

selfCheck();
if (typeof document !== "undefined") document.querySelectorAll("[data-wl-root]").forEach(init);

export { LOCALES, grams, check, parseInputs, selfCheck };
