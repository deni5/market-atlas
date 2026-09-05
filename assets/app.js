// Market·Atlas — client-side render, bilingual (uk/en), no build step required.
// All content lives in /data/topics.json — edit that file to add items,
// descriptions or reference links; this script never needs to change for that.

const REF_LABELS = {
  paper: "📄 paper",
  hf: "🤗 HF",
  kaggle: "🔗 kaggle",
  wiki: "📚 wiki",
  more: "🌐 link",
};

const UI_STRINGS = {
  uk: {
    htmlLang: "uk",
    heroEyebrow: "АТЛАС — МОДЕЛІ ДЛЯ ЦІН, РИЗИКУ Й АНОМАЛІЙ НА РИНКАХ",
    heroTitle: "Атлас моделей ринкового прогнозування",
    heroP1: "Польовий довідник методів — від класичної статистики до автоенкодерів, трансформерів і нечіткої логіки — які застосовуються для прогнозування цін, оцінки ризику та виявлення аномалій і маніпуляцій на фінансових ринках.",
    heroP2: "Кожен запис має рівень складності (I — базовий, II — середній, III — просунутий) і коротку категорію моделі. Пошук і фільтри працюють одразу по всьому каталогу.",
    heroCredit: 'Структура натхненна проєктом <a href="https://volodymyr-sokolov.github.io/atlases/crypto/" target="_blank" rel="noopener">Crypto·Atlas</a> Володимира Соколова, адаптована для тематики ринкових моделей.',
    filtersLabel: "Фільтруйте каталог — клацніть на рівень, щоб увімкнути/вимкнути:",
    levelI: "Базовий",
    levelII: "Середній",
    levelIII: "Просунутий",
    searchPlaceholder: "Пошук моделей…",
    emptyState: "Нічого не знайдено. Спробуйте інший запит або увімкніть усі рівні.",
    footer: "Довідковий каталог, зібраний на основі академічної та галузевої літератури про кількісні фінанси й машинне навчання. Не є інвестиційною порадою.",
    metaTemplate: (n, t) => `${n} моделей · ${t} тем`,
  },
  en: {
    htmlLang: "en",
    heroEyebrow: "ATLAS — MODELS FOR PRICES, RISK & ANOMALIES IN MARKETS",
    heroTitle: "An Atlas of Market Forecasting Models",
    heroP1: "A field index of methods — from classical statistics to autoencoders, transformers and fuzzy logic — used to forecast prices, estimate risk and detect anomalies and manipulation in financial markets.",
    heroP2: "Every entry carries a difficulty level (I — foundational, II — intermediate, III — advanced) and a short model category. Search and filters apply across the whole catalogue at once.",
    heroCredit: 'Structure inspired by the <a href="https://volodymyr-sokolov.github.io/atlases/crypto/" target="_blank" rel="noopener">Crypto·Atlas</a> by Volodymyr Sokolov, adapted for market-model topics.',
    filtersLabel: "Filter the catalogue — click a level to toggle it on/off:",
    levelI: "Foundational",
    levelII: "Intermediate",
    levelIII: "Advanced",
    searchPlaceholder: "Search models…",
    emptyState: "Nothing found. Try a different query or enable all levels.",
    footer: "A reference catalogue compiled from academic and industry literature on quantitative finance and machine learning. Not investment advice.",
    metaTemplate: (n, t) => `${n} models · ${t} topics`,
  },
};

let TOPICS = [];
let activeLevels = new Set(["I", "II", "III"]);
let LANG = localStorage.getItem("market-atlas-lang") || "uk";

async function loadData() {
  const res = await fetch("data/topics.json", { cache: "no-store" });
  TOPICS = await res.json();
}

function t(field) {
  // field is a {uk, en} object (or undefined)
  if (!field) return "";
  return field[LANG] || field.uk || field.en || "";
}

function applyUIStrings() {
  const s = UI_STRINGS[LANG];
  document.documentElement.lang = s.htmlLang;

  document.getElementById("heroEyebrow").textContent = s.heroEyebrow;
  document.getElementById("heroTitle").textContent = s.heroTitle;
  document.getElementById("heroP1").textContent = s.heroP1;
  document.getElementById("heroP2").textContent = s.heroP2;
  document.getElementById("heroCredit").innerHTML = s.heroCredit;
  document.getElementById("filtersLabel").textContent = s.filtersLabel;
  document.getElementById("levelILabel").textContent = s.levelI;
  document.getElementById("levelIILabel").textContent = s.levelII;
  document.getElementById("levelIIILabel").textContent = s.levelIII;
  document.getElementById("searchBox").placeholder = s.searchPlaceholder;
  document.getElementById("emptyState").textContent = s.emptyState;
  document.getElementById("footerText").textContent = s.footer;

  document.getElementById("langUk").classList.toggle("active", LANG === "uk");
  document.getElementById("langEn").classList.toggle("active", LANG === "en");
}

function renderNav() {
  const topNav = document.getElementById("topNav");
  topNav.innerHTML = TOPICS.map(
    (topic) => `<a href="#${topic.id}" data-target="${topic.id}">${t(topic.title)}</a>`
  ).join("");
}

function renderRefLinks(links) {
  if (!links) return "";
  const entries = Object.entries(links).filter(([, url]) => url && url.trim());
  if (entries.length === 0) return "";
  const html = entries
    .map(([key, url]) => `<a href="${url}" target="_blank" rel="noopener">${REF_LABELS[key] || key}</a>`)
    .join("");
  return `<div class="ref-links">${html}</div>`;
}

function renderTopics() {
  const container = document.getElementById("topicsContainer");
  container.innerHTML = TOPICS.map(
    (topic) => `
    <section class="topic" id="${topic.id}" data-topic>
      <p class="topic-num">${topic.num}</p>
      <h2>${t(topic.title)}</h2>
      <p class="topic-desc">${t(topic.desc)}</p>
      <div class="card-grid">
        ${topic.items
          .map((it) => {
            const searchBlob = [t(it.name), t(it.tag), t(it.desc)].join(" ").toLowerCase();
            const demoKey = `${topic.id}::${it.name.en}`;
            const hasDemo = Boolean(DEMOS[demoKey]);
            return `
          <article class="card" data-lvl="${it.lvl}" data-search="${searchBlob}">
            <div class="card-top">
              <span class="badge ${it.lvl}">${it.lvl}</span>
              <span class="tag">${t(it.tag)}</span>
            </div>
            <h3>${t(it.name)}</h3>
            <p class="desc">${t(it.desc)}</p>
            ${it.used_by ? `<div class="used-by">${t(it.used_by)}</div>` : ""}
            ${renderRefLinks(it.links)}
            ${hasDemo ? `<div class="demo-btn"><button type="button" data-demo-key="${demoKey}">▸ ${LANG === "uk" ? "Демо" : "Demo"}</button></div>` : ""}
          </article>
          ${hasDemo ? `<div class="demo-panel hidden" data-demo-panel="${demoKey}" data-lvl="${it.lvl}"></div>` : ""}
        `;
          })
          .join("")}
      </div>
    </section>
  `
  ).join("");
  setupDemoButtons();
}

function setupDemoButtons() {
  document.querySelectorAll(".demo-btn button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-demo-key");
      const panel = document.querySelector(`[data-demo-panel="${key}"]`);
      if (!panel) return;
      const willOpen = panel.classList.contains("hidden");
      panel.classList.toggle("hidden");
      btn.textContent = `${willOpen ? "▾" : "▸"} ${LANG === "uk" ? "Демо" : "Demo"}`;
      if (willOpen && !panel.dataset.mounted) {
        DEMOS[key].mount(panel);
        panel.dataset.mounted = "1";
      }
    });
  });
}

function closeAllDemoPanels() {
  document.querySelectorAll(".demo-panel:not(.hidden)").forEach((panel) => {
    panel.classList.add("hidden");
    const key = panel.getAttribute("data-demo-panel");
    const btn = document.querySelector(`.demo-btn button[data-demo-key="${key}"]`);
    if (btn) btn.textContent = `▸ ${LANG === "uk" ? "Демо" : "Demo"}`;
  });
}

// ---------------------------------------------------------------------------
// Interactive demos. Keyed by "<topicId>::<item name.en>". Each demo owns its
// own self-contained render logic (SVG chart drawn by hand, no chart library
// dependency) so the data file stays purely descriptive.
// ---------------------------------------------------------------------------

const DEMO_STRINGS = {
  uk: {
    steps: "кроки:",
    inFinance: "У ФІНАНСАХ",
    garchNote: "Стаціонарність вимагає α + β < 1. Поточне α + β =",
    garchCallout:
      "GARCH(1,1) — стандартна модель для щоденного розрахунку VaR: ω, α і β оцінюються методом максимальної правдоподібності на історичних дохідностях, а прогнозована σₜ підставляється напряму у формулу VaR = z·σₜ·√1 (для одноденного горизонту).",
    garchChartCaption: "σₜ (річна волатильність, %) на синтетичному ряді шоків з кластером волатильності",
    isoTrees: "кількість дерев",
    isoContam: "поріг аномальності (частка з найвищим score)",
    isoLegendNormal: "нормальна",
    isoLegendAnomaly: "аномалія",
    isoCallout:
      "Isolation Forest працює за O(n·log n) і не потребує навчання на самих аномаліях — тому це стандартний перший фільтр для real-time скринінгу транзакцій і торгової активності перед тим, як передати підозрілі випадки складнішій (і повільнішій) моделі.",
    isoAvgPath: "середня довжина шляху E(h(x))",
    isoScore: "score s(x) = 2^(-E(h)/c(n))",
    isoNormalPt: "нормальна точка",
    isoAnomalyPt: "явна аномалія",
    bsCallout:
      "Формула Блека-Шоулза — основа маркет-мейкінгу опціонів: N(d₁) є дельтою хеджу, а розв'язання формули відносно σ при заданій ринковій ціні дає implied volatility — саме те число, яким торгують на практиці, а не саму ціну.",
    bsCall: "Колл",
    bsPut: "Пут",
    bsChartCaption: "Ціна опціону як функція спотової ціни S (крапка — поточні параметри)",
    capmChartCaption: "Лінія ринку цінних паперів (SML): очікувана дохідність як функція β",
    capmCallout: "CAPM — стандартна ставка дисконтування у DCF-оцінці (вартість власного капіталу) і базовий бенчмарк для виміру альфи менеджера: дохідність понад те, що дає сам ринковий ризик.",
    kellyChartCaption: "Темп зростання капіталу g(f) залежно від частки ставки f; крапка — оптимум f*",
    kellyCallout: "Full Kelly дає теоретично оптимальний темп зростання, але дуже волатильний на практиці — тому трейдери зазвичай використовують half-Kelly (f*/2) як компроміс між зростанням і просадками.",
    kellyFstar: "f* = p - (1-p)/b",
    markoChartCaption: "Ефективна межа: волатильність (X) проти дохідності (Y) для двох активів при різних вагах",
    markoCallout: "Це геометрична суть диверсифікації: якщо кореляція активів менша за 1, комбінований портфель може мати нижчу волатильність, ніж будь-який актив окремо — саме це видно на вигині кривої вліво від прямої лінії.",
    markoMinVar: "мінімальна дисперсія при w =",
    varChartCaption: "Розподіл P&L портфеля; червона зона — втрати за межею VaR",
    varCallout: "VaR — регуляторний стандарт (Basel), але не каже нічого про розмір втрати ЗА межею порогу. Саме тому Expected Shortfall (CVaR) вважається кращою мірою для екстремальних сценаріїв.",
    varResult: "VaR =",
    kalmanChartCaption: "Сірий пунктир — справжній сигнал, крапки — зашумлені виміри, зелена лінія — оцінка фільтра Калмана",
    kalmanCallout: "Фільтр Калмана — основа динамічних бета-моделей і сплайн-згладжування кривої дохідності в реальному часі: він оптимально зважує нову зашумлену інформацію проти попереднього прогнозу, а не просто усереднює.",
    kalmanRmse: "RMSE фільтра проти сирих вимірів",
    hmmCallout: "HMM лежить в основі детекторів зміни ринкового режиму: коли P(стрес) різко зростає, портфельні системи автоматично знижують плече чи перемикають модель ризику — раніше, ніж це видно на голому графіку ціни.",
    vasCallout: "Модель Васічека — основа побудови кривої дохідності облігацій і ціноутворення процентних деривативів; параметр κ визначає, наскільки швидко ринок 'забуває' шок і повертається до довгострокової норми θ.",
    hkCallout: "Процес Хоукса моделює кластеризацію угод у книзі заявок: одна велика угода підвищує ймовірність наступної — саме ця самозбуджувальна динаміка лежить в основі сучасних моделей мікроструктурного ризику виконання.",
    fcmCallout: "На відміну від жорсткої кластеризації (K-means), нечітка кластеризація дає кожному активу чи клієнту частку належності до кількох сегментів ризику одночасно — природніше для прикордонних випадків, які на практиці трапляються постійно.",
    knnCallout: "kNN — швидкий базовий класифікатор для скорингу нових позик чи транзакцій за подібністю до вже класифікованих історичних випадків, без потреби навчати окрему модель заздалегідь.",
    rfCallout: "Ансамбль дерев усереднює шум окремих слабких моделей: жодне дерево не бачить усіх даних (bootstrap) і не бачить усіх ознак на кожному розбитті — тому колективний прогноз набагато стабільніший за одне дерево рішень.",
    shCallout: "Коефіцієнт Шарпа дуже чутливий до обраного часового вікна — стратегія, 'блискуча' за один період, може виглядати посередньо за інший. Саме тому серйозний бектест завжди перевіряє стабільність метрики на кількох підвіконах, а не одне число за весь період.",
    aucCallout: "На розбалансованих даних (мало шахрайства серед мільйонів транзакцій) ROC-крива може виглядати оманливо оптимістично, тоді як PR-крива чесно показує, що точність падає при спробі зловити більше позитивних випадків — саме тому AUPRC є надійнішою метрикою для детекції аномалій.",
    hestCallout: "На відміну від GARCH, де волатильність — детермінована функція минулих шоків, у моделі Хестона волатильність сама є випадковим процесом — це дає точнішу калібровку 'усмішки волатильності' опціонів на практиці.",
    merCallout: "Модель Мертона напряму зв'язує кредитний ризик із ринком акцій: якщо волатильність акцій компанії різко зростає, це сигналізує про зростання ймовірності дефолту ще до будь-якої зміни кредитного рейтингу.",
    ganCallout: "Дивіться, як середнє генератора сходиться до цільового значення, а дисперсія натомість колапсує до майже нуля — це справжній mode collapse, добре задокументована патологія навчання GAN, а не помилка в цьому демо. Саме тому production-моделі на кшталт TimeGAN додають додаткові штрафи (supervised loss), щоб стабілізувати навчання.",
    ganStepsLbl: "крок навчання",
    ganMeanStd: "середнє / σ генератора",
    timeganCallout: "TimeGAN додає до звичайної adversarial-втрати ще й supervised loss на збереження автокореляційної структури — без цього генератор може ідеально відтворити розподіл значень, але зруйнувати часову послідовність (як шафл праворуч при λ=0), що робить синтетичні дані непридатними для бектестингу стратегій.",
    timeganLambda: "λ (вага збереження часової структури)",
    timeganAcfOrig: "ACF оригіналу",
    timeganAcfGen: "ACF згенерованого",
    tanoganCallout: "На відміну від звичайного автоенкодера, TAnoGAN оптимізує не ваги мережі, а сам латентний вектор z для кожного тестового вікна окремо — якщо навіть найкращий можливий z не може відтворити вікно, воно виходить за межі 'многовиду нормальності', вивченого генератором.",
    tanoganWindow: "тестове вікно (індекс початку)",
    tanoganSteps: "кроки градієнтного спуску",
    tanoganLoss: "похибка реконструкції",
    tanoganRegime: "режим",
    ganlstmCallout: "Одновузловий LSTM тут реально натренований через backpropagation-through-time і вдвічі точніший за 'статичний' (без пам'яті) предиктор саме на ряді з дволаговою залежністю — це і є механічна причина, чому GAN з LSTM-генератором/дискримінатором перевершує звичайні feedforward-GAN на послідовних фінансових даних.",
    ganlstmSteps: "кроки навчання",
    ganlstmLoss: "похибка передбачення (MSE)",
    diffusionCallout: "Прямий дифузійний процес — точна, аналітична формула (без навчання): будь-яка складна структура даних, включно з мультимодальним розподілом дохідностей у різних ринкових режимах, поступово перетворюється на чистий гаусів шум. Модель навчається лише зворотному кроку — прибирати цей шум крок за кроком — саме тому дифузійні моделі можуть генерувати реалістичні синтетичні ринкові сценарії з нуля.",
    diffusionStep: "крок дифузії t",
    egarchCallout: "На відміну від симетричного GARCH, EGARCH явно моделює 'ефект левериджу': падіння ціни на 2% зазвичай підвищує майбутню волатильність сильніше, ніж зростання на ті самі 2%. Ігнорування цієї асиметрії систематично недооцінює хвостовий ризик саме тоді, коли він найдорожчий — під час обвалів ринку.",
    egarchAsym: "асиметрія: реакція на +2% проти −2% шок",
    binomialCallout: "На відміну від закритої формули Блека-Шоулза, дерево природно підтримує дострокове виконання — тому це стандартний метод оцінки американських опціонів на акції та ETF, де можливість виконати опціон у будь-який момент має реальну вартість.",
    binomialAmerican: "американський пут",
    binomialEuropean: "європейський пут",
    binomialPremium: "премія за дострокове виконання",
    mcCallout: "Монте-Карло — єдиний практичний метод для екзотичних деривативів (азійські опціони на середню ціну, кошикові опціони на кілька корельованих активів), де ні закрита формула, ні дерево не справляються з розмірністю задачі. Точність зростає повільно — як 1/√N, тому подвоєння точності вимагає вчетверо більше симуляцій.",
    mcConverge: "збіжність до теоретичної ціни Блека-Шоулза",
    dbscanCallout: "На відміну від k-means, DBSCAN не вимагає заздалегідь знати кількість кластерів і природно виявляє кластери довільної форми — а точки, що не потрапляють у жодну щільну область, автоматично класифікуються як шум. Це робить його зручним для сегментації клієнтів за патернами активності, де кластери рідко бувають опуклими.",
    dbscanNoise: "шум",
    dbscanCluster: "кластер",
    svmCallout: "SVM шукає межу з максимальним відступом (margin) між класами — лише точки на самій межі (опорні вектори) впливають на розв'язок. Класичний вибір для прогнозу напрямку ціни на невеликих табличних наборах ознак, надійніший за логістичну регресію при нелінійних межах.",
    svmSupportVec: "опорний вектор",
    cartCallout: "Кожен прогноз дерева пояснюється ланцюжком умов 'якщо ознака > поріг' — повна інтерпретованість, недоступна нейромережам. Окреме дерево рідко використовується як фінальна модель через схильність до перенавчання, але саме воно лежить в основі Random Forest і градієнтного бустингу.",
    cusumCallout: "CUSUM оптимальний за швидкістю виявлення зсуву заданого розміру при фіксованому рівні хибних тривог. У фінансах використовується для виявлення зламу режиму волатильності чи кореляції в реальному часі — коли модель ризику, відкалібрована на 'старому' режимі, раптово перестає бути валідною.",
    cusumDetected: "виявлено зсув на кроці",
    cusumNotDetected: "зсув ще не виявлено",
    boCallout: "Баєсівська оптимізація будує сурогатну модель (гауссів процес) невідомої функції 'гіперпараметри → якість' і обирає наступну точку тестування, максимізуючи очікуване покращення — на порядок ефективніше за grid search, коли кожна оцінка (тренування моделі) коштує годин обчислень на GPU.",
    boIteration: "ітерація",
    boBestFound: "найкраще знайдене значення",
    boTrueUnknown: "справжня функція (невідома оптимізатору)",
    boGpMean: "середнє гауссового процесу",
    centralityCallout: "Регулятори (ФРС, ЄЦБ) використовують мережеву центральність міжбанківських зв'язків для виявлення системно важливих інститутів (SIFI). Банк може мати мало прямих зв'язків, але критичну важливість через з'єднання з іншими хабами — власновекторна центральність вловлює це, а проста ступенева — ні.",
    centralityDegree: "ступенева центральність",
    centralityEigen: "власновекторна центральність",
    calmarCallout: "Хедж-фонди й CTA-стратегії (trend-following) часто звітують саме Calmar, а не Sharpe — інвесторів у ці стратегії найбільше цікавить психологічна витривалість до просадки капіталу, а не статистична волатильність по днях.",
    calmarDD: "просадка від піку",
    lstmCallout: "На відміну від статичного предиктора з фіксованим вікном, LSTM накопичує інформацію в прихованому стані невизначено довго — саме тому LSTM-генератори й дискримінатори в GAN-LSTM Hybrid перевершують feedforward-архітектури на послідовних фінансових даних із довготривалою залежністю.",
    lstmLossLbl: "похибка передбачення (MSE)",
    transformerCallout: "Кожен рядок матриці уваги — це розподіл 'куди дивиться' токен серед усіх інших, включно з собою. У фінансових трансформерах (FEDformer, Informer) саме такий механізм дозволяє моделі динамічно зважувати, які історичні періоди найрелевантніші для поточного прогнозу — без фіксованого вікна, як у GARCH чи ARIMA.",
    transformerScale: "температура (1/√d)",
    vaeCallout: "β-VAE ілюструє фундаментальний компроміс: сильніша вага KL-члена (β) змушує латентний простір точніше відповідати N(0,1) — зручно для генерації нових зразків — але за рахунок гіршої реконструкції. Автоенкодери для ціноутворення активів (Gu-Kelly-Xiu) стикаються з тим самим trade-off між регуляризацією латентного простору й точністю відтворення факторів.",
    vaeBeta: "β (вага KL-члена)",
    vaeRecon: "похибка реконструкції",
    vaeLatentStats: "статистика латентного простору z",
    gnnCallout: "Кожен шар message passing 'розмиває' ознаки вузла з його сусідами — рівно так само, як GNN у моніторингу транзакцій поширює 'підозрілість' від відомого шахрайського рахунку до пов'язаних з ним рахунків через кілька кроків мережі, навіть якщо вони самі виглядають цілком нормально.",
    gnnLayers: "кількість шарів message passing",
    qlearningCallout: "Q-навчання не потребує моделі середовища — воно вчиться напряму з досвіду методом проб і помилок. У фінансах це основа алгоритмічних торгових агентів і систем оптимального виконання великих ордерів, де явна модель динаміки ринку невідома чи занадто складна для формалізації.",
    qlearningEpisodes: "епізоди навчання",
    qlearningPolicy: "вивчена політика (найкраща дія на стан)",
    sentimentCallout: "Лексиконний підхід швидкий і повністю прозорий (на відміну від FinBERT), але вразливий до заперечень і сарказму ('не зростання, а падіння' — обидва слова зі списку скасовують одне одного неправильно). Це причина, чому на практиці лексикони часто використовують як baseline, а не фінальну модель.",
    sentimentScore: "оцінка настрою",
    sentimentHits: "знайдено слів зі словника",
    shapCallout: "Ключова властивість Shapley-values — ефективність: сума внесків усіх ознак точно дорівнює різниці між прогнозом і базовим значенням, без залишку. Це єдиний метод атрибуції ознак з математично гарантованою узгодженістю — тому регулятори дедалі частіше вимагають саме SHAP для пояснення відмов у кредиті.",
    shapSum: "сума SHAP-значень",
    shapCheck: "має точно дорівнювати f(x) − f(baseline)",
    wfCallout: "На відміну від звичайної k-fold крос-валідації, яка перемішує дані випадково, walk-forward завжди тренується лише на минулому й тестується на майбутньому — це єдиний коректний спосіб оцінити стратегію без витоку інформації з майбутнього (look-ahead bias), фатальної помилки бектестингу.",
    wfFold: "фолд",
    wfTrain: "тренування",
    wfTest: "тест",
    benfordCallout: "Реальні фінансові дані (суми транзакцій, бухгалтерські записи) природно слідують закону Бенфорда через мультиплікативну природу економічних процесів. Сфабриковані числа, які людина вигадує 'на око', зазвичай мають набагато рівномірніший розподіл перших цифр — саме на цьому відхиленні базуються алгоритми виявлення бухгалтерського шахрайства (forensic accounting).",
    benfordReal: "реальні дані",
    benfordFake: "сфабриковані дані",
    benfordExpected: "закон Бенфорда (теорія)",
    techCallout: "Хоча це найпростіші індикатори у весь список моделей цього атласу, RSI і смуги Боллінджера досі становлять левову частку сигналів у роздрібній алгоритмічній торгівлі — не через теоретичну перевагу, а через простоту імплементації й повну прозорість логіки для нетехнічних трейдерів.",
    techRsiLbl: "RSI (14)",
    techBollLbl: "смуги Боллінджера",
    arimaCallout: "AR(p) — статистичний фундамент прогнозування: модель припускає, що майбутнє значення є лінійною комбінацією кількох останніх спостережень. Це базовий рівень порівняння (baseline) для будь-якої складнішої моделі — якщо LSTM чи трансформер не перевершують просту AR-модель на конкретному ряді, їхня додаткова складність не виправдана.",
    arimaForecast: "прогноз на 5 кроків вперед",
    esCallout: "На відміну від VaR, який лише фіксує поріг втрат, Expected Shortfall відповідає на питання «а скільки саме ми втратимо в найгіршому сценарії?» — усереднюючи всі втрати за межею порогу. Базельський комітет (Basel III/IV) перейшов саме на ES як основну регуляторну міру ринкового ризику для банків.",
    esVar: "VaR",
    esValue: "Expected Shortfall (ES)",
    scorecardCallout: "Логістична регресія залишається галузевим стандартом кредитного скорингу не через найвищу точність (градієнтний бустинг зазвичай точніший), а через повну прозорість: кожен ваговий коефіцієнт має пряму інтерпретацію 'на скільки одиниць лог-шансів дефолту впливає ця ознака' — вимога, яку регулятори ставлять для пояснення відмов у кредиті.",
    scorecardProb: "ймовірність дефолту P(default)",
    lofCallout: "На відміну від Isolation Forest, який дивиться на глобальну структуру даних, LOF порівнює густину точки лише з густиною її найближчих сусідів — тому він добре виявляє локальні аномалії навіть у даних із кількома кластерами різної щільності, де глобальний поріг густини був би або занадто строгим, або занадто м'яким одночасно для різних регіонів.",
    lofScore: "LOF score",
    lofNormal: "нормальна точка",
    lofOutlier: "аномалія",
    kyleCallout: "Лямбда Кайла кількісно визначає, наскільки складно виконати велике замовлення непомітно: висока лямбда означає, що навіть невеликий ордер суттєво рухає ціну — ринок 'тонкий'. Маркет-мейкери й алгоритми оптимального виконання постійно оцінюють λ у реальному часі, щоб вирішити, чи дробити велике замовлення на дрібніші частини.",
    kyleLambda: "оцінена лямбда Кайла",
    nsCallout: "Модель Нельсона-Сігела параметризує всю криву дохідності лише 4 числами (β₀, β₁, β₂, λ) замість десятків окремих точок — центральні банки (включно з ФРС) використовують саме цю параметризацію для згладженого представлення кривої дохідності казначейських облігацій у щоденній звітності.",
    nsShort: "короткий кінець (β₀+β₁)",
    nsLong: "довгий кінець (β₀)",
    debtrankCallout: "DebtRank моделює не просто 'хто кому винен', а те, як дистрес поширюється мережею: банк, що на перший погляд здається ізольованим, може отримати суттєвий удар через ланцюжок посередників. Європейський центробанк використовує подібні моделі для стрес-тестування системного ризику всієї банківської мережі, а не окремих банків ізольовано.",
    debtrankBank: "банк",
    debtrankLevel: "рівень дистресу",
    dsrCallout: "Ключовий урок DSR: та сама виміряна дохідність (SR=0.3) виглядає статистично значущою при одному випробуванні, але стає повністю неправдоподібною після тестування сотень варіацій стратегії — це і є 'data-snooping bias', головна причина, чому бектести настільки часто не працюють наживо.",
    dsrTrials: "кількість протестованих варіацій стратегії",
    dsrValue: "Deflated Sharpe Ratio",
    gaCallout: "На відміну від градієнтних методів, генетичні алгоритми не потребують обчислення похідної цільової функції — тому вони застосовні там, де функція недиференційовна чи навіть невідома аналітично (наприклад, оптимізація правил торгової стратегії з дискретними параметрами чи фітнес-функція типу 'прибуток після симуляції на історичних даних').",
    gaGeneration: "покоління",
    gaBestFitness: "найкраща знайдена придатність",
    pgCallout: "На відміну від Q-навчання, яке оцінює цінність кожної дії, Policy Gradient напряму навчає розподіл ймовірностей дій — це природніше підходить для неперервних просторів дій (наприклад, точний розмір позиції, а не лише 'купити/продати/тримати') і краще масштабується на складні стратегії управління портфелем.",
    pgProbs: "ймовірності дій [продати, тримати, купити]",
  },
  en: {
    steps: "steps:",
    inFinance: "IN FINANCE",
    garchNote: "Stationarity requires α + β < 1. Current α + β =",
    garchCallout:
      "GARCH(1,1) is the standard model behind daily VaR: ω, α and β are fit by maximum likelihood on historical returns, and the resulting forecast σₜ plugs directly into VaR = z·σₜ·√1 for a one-day horizon.",
    garchChartCaption: "σₜ (annualised volatility, %) over a synthetic shock series with a volatility cluster",
    isoTrees: "number of trees",
    isoContam: "anomaly threshold (top-score fraction)",
    isoLegendNormal: "normal",
    isoLegendAnomaly: "anomaly",
    isoCallout:
      "Isolation Forest runs in O(n·log n) and needs no training examples of anomalies — which makes it the standard first-pass filter for real-time transaction and trading-activity screening, before flagged cases get handed to a heavier, slower model.",
    isoAvgPath: "average path length E(h(x))",
    isoScore: "score s(x) = 2^(-E(h)/c(n))",
    isoNormalPt: "normal point",
    isoAnomalyPt: "explicit outlier",
    bsCallout:
      "The Black-Scholes formula underpins options market-making: N(d₁) is the hedge delta, and inverting the formula for σ given the market price yields implied volatility — the number actually traded, not the price itself.",
    bsCall: "Call",
    bsPut: "Put",
    bsChartCaption: "Option price as a function of spot price S (dot marks the current parameters)",
    capmChartCaption: "Security Market Line (SML): expected return as a function of β",
    capmCallout: "CAPM is the standard discount rate in DCF valuation (cost of equity) and the baseline benchmark for measuring a manager's alpha: return earned above and beyond what market risk alone would justify.",
    kellyChartCaption: "Capital growth rate g(f) as a function of bet fraction f; dot marks the optimum f*",
    kellyCallout: "Full Kelly gives the theoretically optimal growth rate but is very volatile in practice — traders typically use half-Kelly (f*/2) as a trade-off between growth and drawdowns.",
    kellyFstar: "f* = p - (1-p)/b",
    markoChartCaption: "Efficient frontier: volatility (X) vs return (Y) for two assets at varying weights",
    markoCallout: "This is the geometry of diversification: whenever asset correlation is below 1, a combined portfolio can have lower volatility than either asset alone — that's exactly the leftward bulge visible in the curve.",
    markoMinVar: "minimum variance at w =",
    varChartCaption: "Portfolio P&L distribution; the red zone is losses beyond the VaR threshold",
    varCallout: "VaR is the regulatory standard (Basel), but says nothing about the size of a loss BEYOND the threshold. That's exactly why Expected Shortfall (CVaR) is considered the better measure for extreme scenarios.",
    varResult: "VaR =",
    kalmanChartCaption: "Grey dashed — true signal, dots — noisy measurements, green line — Kalman filter estimate",
    kalmanCallout: "The Kalman filter underlies real-time dynamic-beta models and yield-curve smoothing: it optimally weighs new noisy information against the prior forecast, rather than simply averaging.",
    kalmanRmse: "filter RMSE vs raw measurements",
    hmmCallout: "HMMs underpin regime-change detectors: when P(stress) spikes, portfolio systems automatically cut leverage or switch risk models — earlier than a raw price chart alone would reveal.",
    vasCallout: "The Vasicek model underlies bond yield-curve construction and interest-rate derivative pricing; κ determines how fast the market 'forgets' a shock and reverts to the long-run level θ.",
    hkCallout: "The Hawkes process models order-book clustering: one large trade raises the likelihood of the next — this self-exciting dynamic is exactly what modern microstructure execution-risk models are built on.",
    fcmCallout: "Unlike hard clustering (K-means), fuzzy clustering gives each asset or client partial membership across several risk segments at once — a more natural fit for borderline cases, which in practice are constant.",
    knnCallout: "kNN is a fast baseline classifier for scoring new loans or transactions by similarity to already-classified historical cases, with no need to train a separate model upfront.",
    rfCallout: "An ensemble of trees averages out the noise of individual weak models: no single tree sees all the data (bootstrap) or all the features at every split — so the collective prediction is far more stable than any one decision tree.",
    shCallout: "The Sharpe ratio is highly sensitive to the chosen time window — a strategy that looks 'brilliant' over one period can look mediocre over another. That's exactly why a serious backtest always checks the metric's stability across several sub-windows, not a single number for the whole period.",
    aucCallout: "On imbalanced data (little fraud among millions of transactions), the ROC curve can look deceptively optimistic, while the PR curve honestly shows precision collapsing as you try to catch more positives — which is exactly why AUPRC is the more reliable metric for anomaly detection.",
    hestCallout: "Unlike GARCH, where volatility is a deterministic function of past shocks, in the Heston model volatility is itself a random process — giving a materially better fit to the observed options volatility smile in practice.",
    merCallout: "The Merton model directly links credit risk to the equity market: if a company's stock volatility spikes sharply, that signals rising default probability before any credit-rating change catches up.",
    ganCallout: "Watch the generator's mean converge to the target while its variance collapses toward zero instead — this is real mode collapse, a well-documented GAN training pathology, not a bug in this demo. It's exactly why production models like TimeGAN add extra losses (a supervised loss) to stabilise training.",
    ganStepsLbl: "training step",
    ganMeanStd: "generator mean / σ",
    timeganCallout: "TimeGAN adds a supervised loss on top of the usual adversarial loss to preserve autocorrelation structure — without it, a generator can perfectly match the value distribution while destroying the temporal sequence (like the shuffle at λ=0 on the right), which makes synthetic data useless for backtesting strategies.",
    timeganLambda: "λ (temporal-structure preservation weight)",
    timeganAcfOrig: "original ACF",
    timeganAcfGen: "generated ACF",
    tanoganCallout: "Unlike a plain autoencoder, TAnoGAN doesn't optimise network weights — it optimises the latent vector z itself for each test window separately. If even the best possible z can't reconstruct the window, that window falls outside the 'manifold of normal' the generator learned.",
    tanoganWindow: "test window (start index)",
    tanoganSteps: "gradient-descent steps",
    tanoganLoss: "reconstruction loss",
    tanoganRegime: "regime",
    ganlstmCallout: "The single-unit LSTM here is genuinely trained via backpropagation-through-time, and it's twice as accurate as a 'static' memoryless predictor precisely on a series with two-lag dependency — that's the mechanistic reason a GAN with an LSTM generator/discriminator beats a plain feedforward GAN on sequential financial data.",
    ganlstmSteps: "training steps",
    ganlstmLoss: "prediction loss (MSE)",
    diffusionCallout: "The forward diffusion process is an exact, analytical formula — no training involved: any complex data structure, including a multi-modal return distribution across different market regimes, gradually turns into pure Gaussian noise. The model only ever learns the reverse step — removing that noise one step at a time — which is exactly why diffusion models can generate realistic synthetic market scenarios from scratch.",
    diffusionStep: "diffusion step t",
    egarchCallout: "Unlike symmetric GARCH, EGARCH explicitly models the 'leverage effect': a 2% price drop typically raises future volatility more than a 2% rise does. Ignoring this asymmetry systematically underestimates tail risk exactly when it's most expensive — during market crashes.",
    egarchAsym: "asymmetry: response to +2% vs −2% shock",
    binomialCallout: "Unlike the closed-form Black-Scholes formula, the tree naturally supports early exercise — making it the standard method for pricing American equity and ETF options, where the ability to exercise at any point has real value.",
    binomialAmerican: "American put",
    binomialEuropean: "European put",
    binomialPremium: "early-exercise premium",
    mcCallout: "Monte Carlo is the only practical method for exotic derivatives (Asian options on an average price, basket options on several correlated assets) where neither a closed form nor a tree can handle the dimensionality. Accuracy improves slowly — as 1/√N — so doubling precision requires four times as many simulations.",
    mcConverge: "convergence to the theoretical Black-Scholes price",
    dbscanCallout: "Unlike k-means, DBSCAN doesn't need to know the number of clusters in advance and naturally finds clusters of arbitrary shape — points that fall outside any dense region are automatically labelled noise. That makes it well suited to segmenting clients by activity pattern, where clusters are rarely convex.",
    dbscanNoise: "noise",
    dbscanCluster: "cluster",
    svmCallout: "SVM looks for the boundary with the maximum margin between classes — only points right on that boundary (support vectors) affect the solution. A classic choice for price-direction prediction on small tabular feature sets, more robust than logistic regression when boundaries are non-linear.",
    svmSupportVec: "support vector",
    cartCallout: "Every prediction the tree makes is explained by a chain of 'if feature > threshold' conditions — full interpretability that neural networks don't offer. A single tree is rarely used as a final model, being prone to overfitting, but it's exactly what Random Forest and gradient boosting are built from.",
    cusumCallout: "CUSUM is optimal for detecting a shift of a given size at the fastest possible speed for a fixed false-alarm rate. In finance it's used to detect a break in the volatility or correlation regime in real time — the moment a risk model calibrated on the 'old' regime suddenly stops being valid.",
    cusumDetected: "shift detected at step",
    cusumNotDetected: "no shift detected yet",
    boCallout: "Bayesian optimization builds a surrogate model (a Gaussian process) of the unknown 'hyperparameters → quality' function and picks the next point to test by maximising expected improvement — an order of magnitude more efficient than grid search when every evaluation (training a model) costs hours of GPU time.",
    boIteration: "iteration",
    boBestFound: "best value found",
    boTrueUnknown: "true function (unknown to the optimizer)",
    boGpMean: "Gaussian process mean",
    centralityCallout: "Regulators (the Fed, the ECB) use interbank-network centrality to identify systemically important institutions (SIFIs). A bank can have few direct links yet be critically important through its connections to other hubs — eigenvector centrality captures this; plain degree centrality does not.",
    centralityDegree: "degree centrality",
    centralityEigen: "eigenvector centrality",
    calmarCallout: "Hedge funds and CTA (trend-following) strategies often report Calmar rather than Sharpe — investors in these strategies care most about psychological tolerance for a drawdown, not day-to-day statistical volatility.",
    calmarDD: "drawdown from peak",
    lstmCallout: "Unlike a static predictor with a fixed window, an LSTM accumulates information in its hidden state indefinitely — which is exactly why LSTM generators and discriminators in a GAN-LSTM Hybrid outperform feedforward architectures on sequential financial data with long-range dependency.",
    lstmLossLbl: "prediction loss (MSE)",
    transformerCallout: "Each row of the attention matrix is a distribution over 'where this token looks' among all others, including itself. In financial transformers (FEDformer, Informer) this exact mechanism lets the model dynamically weigh which historical periods are most relevant to the current forecast — with no fixed window, unlike GARCH or ARIMA.",
    transformerScale: "temperature (1/√d)",
    vaeCallout: "The β-VAE illustrates a fundamental trade-off: a stronger KL-term weight (β) forces the latent space to match N(0,1) more closely — convenient for generating new samples — at the cost of reconstruction quality. Autoencoder asset-pricing models (Gu-Kelly-Xiu) face the exact same trade-off between latent-space regularisation and factor-reconstruction accuracy.",
    vaeBeta: "β (KL-term weight)",
    vaeRecon: "reconstruction error",
    vaeLatentStats: "latent-space z statistics",
    gnnCallout: "Each message-passing layer 'blurs' a node's features with its neighbours' — exactly how a GNN in transaction monitoring propagates 'suspiciousness' from a known fraudulent account to connected accounts over several network hops, even when those accounts look entirely normal on their own.",
    gnnLayers: "number of message-passing layers",
    qlearningCallout: "Q-learning needs no model of the environment — it learns directly from trial-and-error experience. In finance this underlies algorithmic trading agents and optimal-execution systems for large orders, where an explicit model of market dynamics is unknown or too complex to formalise.",
    qlearningEpisodes: "training episodes",
    qlearningPolicy: "learned policy (best action per state)",
    sentimentCallout: "The lexicon approach is fast and fully transparent (unlike FinBERT), but vulnerable to negation and sarcasm ('not growth, but a decline' — both listed words cancel each other incorrectly). That's why in practice lexicons are often used as a baseline, not the final model.",
    sentimentScore: "sentiment score",
    sentimentHits: "dictionary words matched",
    shapCallout: "The key property of Shapley values is efficiency: the sum of every feature's contribution exactly equals the gap between the prediction and the baseline, with no leftover. It's the only feature-attribution method with a mathematically guaranteed consistency — which is why regulators increasingly require SHAP specifically to explain credit denials.",
    shapSum: "sum of SHAP values",
    shapCheck: "must exactly equal f(x) − f(baseline)",
    wfCallout: "Unlike ordinary k-fold cross-validation, which shuffles data randomly, walk-forward always trains only on the past and tests on the future — the only correct way to evaluate a strategy without look-ahead bias, a fatal backtesting mistake.",
    wfFold: "fold",
    wfTrain: "train",
    wfTest: "test",
    benfordCallout: "Real financial data (transaction amounts, accounting records) naturally follows Benford's Law because of the multiplicative nature of economic processes. Fabricated numbers a person makes up 'by eye' typically have a far more uniform distribution of leading digits — that exact deviation is what forensic-accounting fraud detection is built on.",
    benfordReal: "real data",
    benfordFake: "fabricated data",
    benfordExpected: "Benford's Law (theory)",
    techCallout: "Even though these are the simplest indicators in this entire atlas, RSI and Bollinger Bands still account for the lion's share of signals in retail algorithmic trading — not from theoretical superiority, but from ease of implementation and complete transparency of logic for non-technical traders.",
    techRsiLbl: "RSI (14)",
    techBollLbl: "Bollinger Bands",
    arimaCallout: "AR(p) is the statistical bedrock of forecasting: the model assumes the future value is a linear combination of a handful of recent observations. It's the baseline every fancier model must beat — if an LSTM or transformer can't outperform a simple AR model on a given series, their extra complexity isn't earning its keep.",
    arimaForecast: "5-step-ahead forecast",
    esCallout: "Unlike VaR, which only marks a loss threshold, Expected Shortfall answers 'how much will we actually lose in the worst case?' by averaging every loss beyond that threshold. The Basel Committee (Basel III/IV) switched to ES as the primary regulatory market-risk measure for banks precisely for this reason.",
    esVar: "VaR",
    esValue: "Expected Shortfall (ES)",
    scorecardCallout: "Logistic regression remains the industry standard for credit scoring not because it's the most accurate (gradient boosting usually is), but because of full transparency: every weight has a direct interpretation as 'how many log-odds-of-default units this feature contributes' — exactly what regulators require to explain a credit denial.",
    scorecardProb: "probability of default P(default)",
    lofCallout: "Unlike Isolation Forest, which looks at the global structure of the data, LOF compares a point's density only to its nearest neighbours' — so it catches local anomalies well even in data with several clusters of different density, where a single global density threshold would be either too strict or too lax for different regions at once.",
    lofScore: "LOF score",
    lofNormal: "normal point",
    lofOutlier: "anomaly",
    kyleCallout: "Kyle's Lambda quantifies exactly how hard it is to execute a large order unnoticed: a high lambda means even a small order moves the price significantly — the market is 'thin'. Market makers and optimal-execution algorithms estimate λ continuously in real time to decide whether to slice a large order into smaller pieces.",
    kyleLambda: "estimated Kyle's lambda",
    nsCallout: "The Nelson-Siegel model parameterises the entire yield curve with just 4 numbers (β₀, β₁, β₂, λ) instead of dozens of individual points — central banks (including the Fed) use exactly this parameterisation to give a smoothed representation of the Treasury yield curve in daily reporting.",
    nsShort: "short end (β₀+β₁)",
    nsLong: "long end (β₀)",
    debtrankCallout: "DebtRank models not just 'who owes whom', but how distress propagates through the network: a bank that looks isolated at first glance can still take a serious hit through a chain of intermediaries. The ECB uses models like this to stress-test systemic risk across the whole banking network, not banks in isolation.",
    debtrankBank: "bank",
    debtrankLevel: "distress level",
    dsrCallout: "The key lesson of DSR: the same measured return (SR=0.3) looks statistically significant after a single trial, but becomes entirely implausible once you've tested hundreds of strategy variations — this is exactly the data-snooping bias that explains why backtests so often fail to work live.",
    dsrTrials: "number of strategy variations tested",
    dsrValue: "Deflated Sharpe Ratio",
    gaCallout: "Unlike gradient-based methods, genetic algorithms need no derivative of the objective function — so they work where the function is non-differentiable or not even known analytically (e.g. optimising discrete trading-rule parameters, or a fitness function like 'profit after a historical backtest').",
    gaGeneration: "generation",
    gaBestFitness: "best fitness found",
    pgCallout: "Unlike Q-learning, which estimates the value of each action, Policy Gradient learns the action-probability distribution directly — a more natural fit for continuous action spaces (e.g. an exact position size, not just 'buy/sell/hold') and scales better to complex portfolio-management strategies.",
    pgProbs: "action probabilities [sell, hold, buy]",
  },
};

// deterministic illustrative daily-return shocks: a calm regime followed by
// a volatility cluster, so the GARCH recursion has something to react to.
const GARCH_EPS = [
  -0.00086, -0.00104, -0.00067, 0.00421, -0.00077, -0.00898, 0.00199, -0.00160, -0.00130, 0.00070,
  0.00139, 0.00698, 0.00394, 0.00066, -0.00443, -0.00609, 0.00148, 0.00787, 0.00025, -0.00064,
  0.01276, -0.03489, -0.00749, 0.01177, 0.02096, -0.00578, 0.00904, 0.00596, 0.01878, -0.02672,
  0.01364, -0.03635, -0.06288, -0.01457, -0.02198, 0.02102, 0.01594, -0.02926, 0.02034, -0.02405,
];

function garchSeries(omega, alpha, beta) {
  const persistence = alpha + beta;
  const longRun = persistence < 0.999 ? omega / (1 - persistence) : omega / 0.001;
  let sigma2 = longRun;
  const out = [];
  for (let i = 0; i < GARCH_EPS.length; i++) {
    sigma2 = omega + alpha * GARCH_EPS[i] * GARCH_EPS[i] + beta * sigma2;
    out.push(sigma2);
  }
  return out;
}

function svgLinePath(values, w, h, padding) {
  const max = Math.max(...values);
  const min = 0;
  const n = values.length;
  const x = (i) => padding + (i / (n - 1)) * (w - 2 * padding);
  const y = (v) => h - padding - ((v - min) / (max - min || 1)) * (h - 2 * padding);
  return values.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
}

function mountGarchDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 28;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="garchSvg">
          <path id="garchPath" fill="none" stroke="var(--mint)" stroke-width="2" />
        </svg>
        <p class="demo-note" style="margin-top:8px">${S.garchChartCaption}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>ω (omega) <span class="val" id="omegaVal">0.00003</span></label>
            <input type="range" id="omegaSlider" min="0.000005" max="0.0005" step="0.000005" value="0.00003">
          </div>
          <div class="demo-slider-row">
            <label>α (alpha) <span class="val" id="alphaVal">0.10</span></label>
            <input type="range" id="alphaSlider" min="0" max="0.4" step="0.01" value="0.10">
          </div>
          <div class="demo-slider-row">
            <label>β (beta) <span class="val" id="betaVal">0.85</span></label>
            <input type="range" id="betaSlider" min="0" max="0.97" step="0.01" value="0.85">
          </div>
          <p class="demo-note" id="stationarityNote"></p>
        </div>
        <div class="demo-steps" id="garchSteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.garchCallout}</p>
    </div>
  `;

  const omegaSlider = panel.querySelector("#omegaSlider");
  const alphaSlider = panel.querySelector("#alphaSlider");
  const betaSlider = panel.querySelector("#betaSlider");

  function render() {
    const omega = parseFloat(omegaSlider.value);
    const alpha = parseFloat(alphaSlider.value);
    const beta = parseFloat(betaSlider.value);

    panel.querySelector("#omegaVal").textContent = omega.toFixed(6);
    panel.querySelector("#alphaVal").textContent = alpha.toFixed(2);
    panel.querySelector("#betaVal").textContent = beta.toFixed(2);

    const persistence = alpha + beta;
    panel.querySelector("#stationarityNote").innerHTML =
      `${S.garchNote} <span class="${persistence < 1 ? "hl" : ""}" style="${persistence >= 1 ? "color:var(--level-3)" : ""}">${persistence.toFixed(2)}</span>`;

    const sigma2 = garchSeries(omega, alpha, beta);
    const annualPct = sigma2.map((v) => Math.sqrt(v * 252) * 100);
    panel.querySelector("#garchPath").setAttribute("d", svgLinePath(annualPct, W, H, PAD));

    const persistLabel = LANG === "uk" ? "стійкість" : "persistence";
    const lines = [`${S.steps}`];
    let sigma2prev = persistence < 0.999 ? omega / (1 - persistence) : omega / 0.001;
    for (let i = 0; i < 4; i++) {
      const eps = GARCH_EPS[i];
      const next = omega + alpha * eps * eps + beta * sigma2prev;
      lines.push(
        `  σ²${sub(i + 1)} = ω + α·ε²${sub(i)} + β·σ²${sub(i)} = ${omega.toFixed(6)} + ${alpha.toFixed(2)}·(${eps.toFixed(4)})² + ${beta.toFixed(2)}·${sigma2prev.toFixed(6)} = ${next.toFixed(6)}`
      );
      sigma2prev = next;
    }
    lines.push(`  ... (${GARCH_EPS.length - 4} ${LANG === "uk" ? "кроків далі" : "steps further"})`);
    lines.push(`  ${persistLabel} α+β = ${persistence.toFixed(2)}`);
    panel.querySelector("#garchSteps").textContent = lines.join("\n");
  }

  function sub(n) {
    const map = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄" };
    return map[n] || n;
  }

  [omegaSlider, alphaSlider, betaSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// Isolation Forest demo — real isolation-tree ensemble (not a simulation):
// random feature + random split recursively partitions a fixed 2-D point
// set; anomalies need far fewer splits to isolate, giving a shorter average
// path length and a higher anomaly score s(x) = 2^(-E(h(x))/c(n)).
// ---------------------------------------------------------------------------

const ISO_POINTS = [
  [-0.256, 0.511], [-0.226, -0.315], [-0.93, -0.213], [1.112, 0.424], [1.037, 0.249],
  [0.395, 0.185], [-1.666, 0.855], [0.506, 0.499], [-1.691, -1.744], [-0.89, -0.468],
  [0.305, -0.046], [0.521, -0.642], [0.309, 0.394], [-0.661, 1.718], [0.557, 1.197],
  [-0.62, -0.74], [-0.344, -0.106], [0.632, 0.248], [-0.447, -0.957], [-0.521, 1.221],
  [-0.808, 0.245], [0.427, -1.49], [0.048, 1.306], [-2.014, -0.322], [-0.106, -0.817],
  [0.497, -0.062], [-1.465, 0.828], [0.669, 0.946], [1.441, 0.362], [0.119, -1.299],
  [0.615, -0.612], [-0.453, -1.265], [-0.968, -0.531], [1.289, -2.032], [-1.458, 0.239],
  [1.443, 0.578], [-1.9, -2.518], [0.357, -0.736], [-1.12, 0.977], [1.102, 0.157],
  [0.246, 0.434], [1.594, 0.619], [0.519, 0.548], [-1.568, 1.282], [0.955, 0.53],
  [-1.974, -0.634], [4.2, 3.8], [-4.5, 2.1], [3.6, -4.4], [-3.9, -3.6], [5.1, 0.3], [0.2, 5.3],
];
const ISO_ANOMALY_IDX = [46, 47, 48, 49, 50, 51]; // the 6 explicit outliers, for reference

function cFactor(n) {
  if (n <= 1) return 0;
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
}

// simple deterministic PRNG so trees are reproducible across renders unless
// the person explicitly asks for a new random ensemble (not exposed here —
// re-mounting always regrows a fresh forest, which is part of the point).
function buildIsoTree(indices, depth, heightLimit, rnd) {
  if (indices.length <= 1 || depth >= heightLimit) {
    return { leaf: true, size: indices.length };
  }
  const feature = rnd() < 0.5 ? 0 : 1;
  let min = Infinity, max = -Infinity;
  for (const i of indices) {
    const v = ISO_POINTS[i][feature];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === max) return { leaf: true, size: indices.length };
  const split = min + rnd() * (max - min);
  const left = indices.filter((i) => ISO_POINTS[i][feature] < split);
  const right = indices.filter((i) => ISO_POINTS[i][feature] >= split);
  return {
    leaf: false,
    feature,
    split,
    left: buildIsoTree(left, depth + 1, heightLimit, rnd),
    right: buildIsoTree(right, depth + 1, heightLimit, rnd),
  };
}

function pathLength(point, node, depth) {
  if (node.leaf) return depth + cFactor(node.size);
  const branch = point[node.feature] < node.split ? node.left : node.right;
  return pathLength(point, branch, depth + 1);
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mountIsoForestDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const n = ISO_POINTS.length;
  const W = 340, H = 340, PAD = 20;
  const xs = ISO_POINTS.map((p) => p[0]), ys = ISO_POINTS.map((p) => p[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const px = (x) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const py = (y) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="isoSvg"></svg>
        <p class="demo-note" style="margin-top:8px">
          <span style="color:var(--mint)">●</span> ${S.isoLegendNormal} &nbsp;
          <span style="color:var(--level-3)">●</span> ${S.isoLegendAnomaly}
        </p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>${S.isoTrees} <span class="val" id="nTreesVal">60</span></label>
            <input type="range" id="nTreesSlider" min="5" max="150" step="5" value="60">
          </div>
          <div class="demo-slider-row">
            <label>${S.isoContam} <span class="val" id="contamVal">12%</span></label>
            <input type="range" id="contamSlider" min="4" max="40" step="1" value="12">
          </div>
        </div>
        <div class="demo-steps" id="isoSteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.isoCallout}</p>
    </div>
  `;

  const svg = panel.querySelector("#isoSvg");
  const nTreesSlider = panel.querySelector("#nTreesSlider");
  const contamSlider = panel.querySelector("#contamSlider");

  function render() {
    const nTrees = parseInt(nTreesSlider.value, 10);
    const contamPct = parseInt(contamSlider.value, 10);
    panel.querySelector("#nTreesVal").textContent = nTrees;
    panel.querySelector("#contamVal").textContent = contamPct + "%";

    const rnd = mulberry32(1234567);
    const heightLimit = Math.ceil(Math.log2(Math.max(n, 2)));
    const allIdx = ISO_POINTS.map((_, i) => i);
    const trees = [];
    for (let k = 0; k < nTrees; k++) trees.push(buildIsoTree(allIdx, 0, heightLimit, rnd));

    const avgPath = ISO_POINTS.map((p) => {
      let sum = 0;
      for (const tree of trees) sum += pathLength(p, tree, 0);
      return sum / nTrees;
    });
    const c = cFactor(n);
    const scores = avgPath.map((h) => Math.pow(2, -h / c));

    const nFlag = Math.max(1, Math.round((contamPct / 100) * n));
    const sortedIdx = allIdx.slice().sort((a, b) => scores[b] - scores[a]);
    const flagged = new Set(sortedIdx.slice(0, nFlag));

    svg.innerHTML = ISO_POINTS.map((p, i) => {
      const isFlagged = flagged.has(i);
      return `<circle cx="${px(p[0]).toFixed(1)}" cy="${py(p[1]).toFixed(1)}" r="4.5" fill="${isFlagged ? "var(--level-3)" : "var(--mint)"}" opacity="${isFlagged ? "0.95" : "0.65"}" />`;
    }).join("");

    const exampleAnomaly = 47; // (-4.5, 2.1)
    const exampleNormal = 4;   // near-center point
    const lines = [
      `${S.isoNormalPt} (${ISO_POINTS[exampleNormal][0]}, ${ISO_POINTS[exampleNormal][1]}):`,
      `  ${S.isoAvgPath} = ${avgPath[exampleNormal].toFixed(2)}`,
      `  ${S.isoScore} = ${scores[exampleNormal].toFixed(3)}`,
      ``,
      `${S.isoAnomalyPt} (${ISO_POINTS[exampleAnomaly][0]}, ${ISO_POINTS[exampleAnomaly][1]}):`,
      `  ${S.isoAvgPath} = ${avgPath[exampleAnomaly].toFixed(2)}`,
      `  ${S.isoScore} = ${scores[exampleAnomaly].toFixed(3)}`,
    ];
    panel.querySelector("#isoSteps").textContent = lines.join("\n");
  }

  [nTreesSlider, contamSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// Black-Scholes-Merton demo
// ---------------------------------------------------------------------------

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const tt = 1 / (1 + p * x);
  const y = 1 - (((((a5 * tt + a4) * tt) + a3) * tt + a2) * tt + a1) * tt * Math.exp(-x * x);
  return sign * y;
}
function normCDF(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}
function bsPrice(S, K, T, r, sigma) {
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const call = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  const put = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
  return { d1, d2, call, put };
}

function mountBlackScholesDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 34;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="bsSvg">
          <path id="bsCallPath" fill="none" stroke="var(--mint)" stroke-width="2" />
          <path id="bsPutPath" fill="none" stroke="var(--level-2)" stroke-width="2" />
          <circle id="bsDotCall" r="4" fill="var(--mint)" />
          <circle id="bsDotPut" r="4" fill="var(--level-2)" />
        </svg>
        <p class="demo-note" style="margin-top:8px">
          <span style="color:var(--mint)">●</span> ${S.bsCall} &nbsp;
          <span style="color:var(--level-2)">●</span> ${S.bsPut} — ${S.bsChartCaption}
        </p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>S (spot) <span class="val" id="sVal">100</span></label>
            <input type="range" id="sSlider" min="20" max="200" step="1" value="100">
          </div>
          <div class="demo-slider-row">
            <label>K (strike) <span class="val" id="kVal">100</span></label>
            <input type="range" id="kSlider" min="20" max="200" step="1" value="100">
          </div>
          <div class="demo-slider-row">
            <label>σ (volatility) <span class="val" id="sigVal">0.20</span></label>
            <input type="range" id="sigSlider" min="0.05" max="0.8" step="0.01" value="0.20">
          </div>
          <div class="demo-slider-row">
            <label>T (years) <span class="val" id="tVal">1.00</span></label>
            <input type="range" id="tSlider" min="0.05" max="2" step="0.05" value="1.00">
          </div>
          <div class="demo-slider-row">
            <label>r (risk-free) <span class="val" id="rVal">0.03</span></label>
            <input type="range" id="rSlider" min="0" max="0.1" step="0.005" value="0.03">
          </div>
        </div>
        <div class="demo-steps" id="bsSteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.bsCallout}</p>
    </div>
  `;

  const els = ["sSlider", "kSlider", "sigSlider", "tSlider", "rSlider"].map((id) => panel.querySelector("#" + id));
  const [sSlider, kSlider, sigSlider, tSlider, rSlider] = els;

  function render() {
    const Sv = parseFloat(sSlider.value);
    const K = parseFloat(kSlider.value);
    const sigma = parseFloat(sigSlider.value);
    const T = parseFloat(tSlider.value);
    const r = parseFloat(rSlider.value);

    panel.querySelector("#sVal").textContent = Sv.toFixed(0);
    panel.querySelector("#kVal").textContent = K.toFixed(0);
    panel.querySelector("#sigVal").textContent = sigma.toFixed(2);
    panel.querySelector("#tVal").textContent = T.toFixed(2);
    panel.querySelector("#rVal").textContent = r.toFixed(3);

    const nPts = 60;
    const sMin = 1, sMax = 200;
    const callCurve = [], putCurve = [];
    for (let i = 0; i < nPts; i++) {
      const s = sMin + (i / (nPts - 1)) * (sMax - sMin);
      const { call, put } = bsPrice(s, K, T, r, sigma);
      callCurve.push(call);
      putCurve.push(put);
    }
    const maxY = Math.max(...callCurve, ...putCurve, 1);
    const x = (i) => PAD + (i / (nPts - 1)) * (W - 2 * PAD);
    const y = (v) => H - PAD - (v / maxY) * (H - 2 * PAD);
    const pathOf = (arr) => arr.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

    panel.querySelector("#bsCallPath").setAttribute("d", pathOf(callCurve));
    panel.querySelector("#bsPutPath").setAttribute("d", pathOf(putCurve));

    const { d1, d2, call, put } = bsPrice(Sv, K, T, r, sigma);
    const curX = PAD + ((Sv - sMin) / (sMax - sMin)) * (W - 2 * PAD);
    panel.querySelector("#bsDotCall").setAttribute("cx", curX.toFixed(1));
    panel.querySelector("#bsDotCall").setAttribute("cy", y(call).toFixed(1));
    panel.querySelector("#bsDotPut").setAttribute("cx", curX.toFixed(1));
    panel.querySelector("#bsDotPut").setAttribute("cy", y(put).toFixed(1));

    const lines = [
      `${S.steps}`,
      `  d1 = (ln(S/K) + (r + σ²/2)T) / (σ√T) = ${d1.toFixed(4)}`,
      `  d2 = d1 - σ√T = ${d2.toFixed(4)}`,
      `  N(d1) = ${normCDF(d1).toFixed(4)}`,
      `  N(d2) = ${normCDF(d2).toFixed(4)}`,
      ``,
      `  ${S.bsCall} = S·N(d1) - K·e^(-rT)·N(d2) = ${call.toFixed(2)}`,
      `  ${S.bsPut}  = K·e^(-rT)·N(-d2) - S·N(-d1) = ${put.toFixed(2)}`,
    ];
    panel.querySelector("#bsSteps").textContent = lines.join("\n");
  }

  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// CAPM demo
// ---------------------------------------------------------------------------

function mountCapmDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="capmSvg">
          <path id="capmLine" fill="none" stroke="var(--mint)" stroke-width="2" />
          <circle id="capmDot" r="5" fill="var(--level-3)" />
        </svg>
        <p class="demo-note" style="margin-top:8px">${S.capmChartCaption}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>β (beta) <span class="val" id="capmBetaVal">1.20</span></label>
            <input type="range" id="capmBeta" min="0" max="2.5" step="0.05" value="1.20">
          </div>
          <div class="demo-slider-row">
            <label>Rf (risk-free) <span class="val" id="capmRfVal">3.0%</span></label>
            <input type="range" id="capmRf" min="0" max="8" step="0.1" value="3.0">
          </div>
          <div class="demo-slider-row">
            <label>E(Rm) (market return) <span class="val" id="capmRmVal">8.0%</span></label>
            <input type="range" id="capmRm" min="2" max="15" step="0.1" value="8.0">
          </div>
        </div>
        <div class="demo-steps" id="capmSteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.capmCallout}</p>
    </div>
  `;

  const betaSlider = panel.querySelector("#capmBeta");
  const rfSlider = panel.querySelector("#capmRf");
  const rmSlider = panel.querySelector("#capmRm");
  const betaMax = 2.5;

  function render() {
    const beta = parseFloat(betaSlider.value);
    const rf = parseFloat(rfSlider.value) / 100;
    const rm = parseFloat(rmSlider.value) / 100;
    panel.querySelector("#capmBetaVal").textContent = beta.toFixed(2);
    panel.querySelector("#capmRfVal").textContent = (rf * 100).toFixed(1) + "%";
    panel.querySelector("#capmRmVal").textContent = (rm * 100).toFixed(1) + "%";

    const expReturn = rf + beta * (rm - rf);
    const yAtZero = rf, yAtMax = rf + betaMax * (rm - rf);
    const maxY = Math.max(yAtMax, expReturn, rm) * 1.15;
    const minY = Math.min(0, yAtZero) - 0.01;
    const x = (b) => PAD + (b / betaMax) * (W - 2 * PAD);
    const y = (v) => H - PAD - ((v - minY) / (maxY - minY)) * (H - 2 * PAD);

    panel.querySelector("#capmLine").setAttribute("d", `M ${x(0)} ${y(yAtZero)} L ${x(betaMax)} ${y(yAtMax)}`);
    panel.querySelector("#capmDot").setAttribute("cx", x(beta));
    panel.querySelector("#capmDot").setAttribute("cy", y(expReturn));

    const lines = [
      `${S.steps}`,
      `  E(R) = Rf + β·(E(Rm) - Rf)`,
      `  E(R) = ${(rf*100).toFixed(2)}% + ${beta.toFixed(2)}·(${(rm*100).toFixed(2)}% - ${(rf*100).toFixed(2)}%)`,
      `  E(R) = ${(expReturn*100).toFixed(2)}%`,
    ];
    panel.querySelector("#capmSteps").textContent = lines.join("\n");
  }

  [betaSlider, rfSlider, rmSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// Kelly Criterion demo
// ---------------------------------------------------------------------------

function mountKellyDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 34;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="kellySvg">
          <path id="kellyLine" fill="none" stroke="var(--mint)" stroke-width="2" />
          <circle id="kellyDot" r="5" fill="var(--level-3)" />
        </svg>
        <p class="demo-note" style="margin-top:8px">${S.kellyChartCaption}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>p (win probability) <span class="val" id="kellyPVal">0.55</span></label>
            <input type="range" id="kellyP" min="0.30" max="0.90" step="0.01" value="0.55">
          </div>
          <div class="demo-slider-row">
            <label>b (win/loss ratio) <span class="val" id="kellyBVal">1.20</span></label>
            <input type="range" id="kellyB" min="0.3" max="3" step="0.05" value="1.20">
          </div>
        </div>
        <div class="demo-steps" id="kellySteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.kellyCallout}</p>
    </div>
  `;

  const pSlider = panel.querySelector("#kellyP");
  const bSlider = panel.querySelector("#kellyB");

  function render() {
    const p = parseFloat(pSlider.value);
    const b = parseFloat(bSlider.value);
    panel.querySelector("#kellyPVal").textContent = p.toFixed(2);
    panel.querySelector("#kellyBVal").textContent = b.toFixed(2);

    const fstar = Math.max(0, Math.min(0.98, p - (1 - p) / b));

    const nPts = 60;
    const fMax = 0.98;
    const curve = [];
    for (let i = 0; i < nPts; i++) {
      const f = (i / (nPts - 1)) * fMax;
      const g = p * Math.log(1 + f * b) + (1 - p) * Math.log(Math.max(1 - f, 1e-6));
      curve.push(g);
    }
    const maxG = Math.max(...curve), minG = Math.min(...curve);
    const x = (i) => PAD + (i / (nPts - 1)) * (W - 2 * PAD);
    const y = (v) => H - PAD - ((v - minG) / (maxG - minG || 1)) * (H - 2 * PAD);
    panel.querySelector("#kellyLine").setAttribute("d", curve.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" "));

    const dotIdx = (fstar / fMax) * (nPts - 1);
    const gStar = p * Math.log(1 + fstar * b) + (1 - p) * Math.log(Math.max(1 - fstar, 1e-6));
    panel.querySelector("#kellyDot").setAttribute("cx", x(dotIdx));
    panel.querySelector("#kellyDot").setAttribute("cy", y(gStar));

    const lines = [
      `${S.steps}`,
      `  ${S.kellyFstar}`,
      `  f* = ${p.toFixed(2)} - (1-${p.toFixed(2)})/${b.toFixed(2)} = ${fstar.toFixed(4)}`,
      `  g(f*) = ${gStar.toFixed(5)}`,
    ];
    panel.querySelector("#kellySteps").textContent = lines.join("\n");
  }

  [pSlider, bSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// Markowitz two-asset efficient frontier demo
// ---------------------------------------------------------------------------

function mountMarkowitzDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 280, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="markoSvg">
          <path id="markoCurve" fill="none" stroke="var(--mint)" stroke-width="2" />
          <circle id="markoDot1" r="4.5" fill="var(--level-2)" />
          <circle id="markoDot2" r="4.5" fill="var(--level-2)" />
          <circle id="markoDotMin" r="5" fill="var(--level-3)" />
        </svg>
        <p class="demo-note" style="margin-top:8px">${S.markoChartCaption}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>R1 <span class="val" id="markoR1Val">10%</span></label>
            <input type="range" id="markoR1" min="0" max="25" step="0.5" value="10">
          </div>
          <div class="demo-slider-row">
            <label>R2 <span class="val" id="markoR2Val">6%</span></label>
            <input type="range" id="markoR2" min="0" max="25" step="0.5" value="6">
          </div>
          <div class="demo-slider-row">
            <label>σ1 <span class="val" id="markoS1Val">15%</span></label>
            <input type="range" id="markoS1" min="2" max="45" step="0.5" value="15">
          </div>
          <div class="demo-slider-row">
            <label>σ2 <span class="val" id="markoS2Val">25%</span></label>
            <input type="range" id="markoS2" min="2" max="45" step="0.5" value="25">
          </div>
          <div class="demo-slider-row">
            <label>ρ (correlation) <span class="val" id="markoRhoVal">0.30</span></label>
            <input type="range" id="markoRho" min="-1" max="1" step="0.05" value="0.30">
          </div>
        </div>
        <div class="demo-steps" id="markoSteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.markoCallout}</p>
    </div>
  `;

  const ids = ["markoR1", "markoR2", "markoS1", "markoS2", "markoRho"];
  const els = ids.map((id) => panel.querySelector("#" + id));

  function render() {
    const r1 = parseFloat(els[0].value) / 100, r2 = parseFloat(els[1].value) / 100;
    const s1 = parseFloat(els[2].value) / 100, s2 = parseFloat(els[3].value) / 100;
    const rho = parseFloat(els[4].value);
    panel.querySelector("#markoR1Val").textContent = (r1*100).toFixed(1) + "%";
    panel.querySelector("#markoR2Val").textContent = (r2*100).toFixed(1) + "%";
    panel.querySelector("#markoS1Val").textContent = (s1*100).toFixed(1) + "%";
    panel.querySelector("#markoS2Val").textContent = (s2*100).toFixed(1) + "%";
    panel.querySelector("#markoRhoVal").textContent = rho.toFixed(2);

    const nPts = 80;
    const pts = [];
    for (let i = 0; i < nPts; i++) {
      const w = -0.4 + (i / (nPts - 1)) * 1.8; // allow slight short-selling to reveal full curve
      const ret = w * r1 + (1 - w) * r2;
      const vol = Math.sqrt(w*w*s1*s1 + (1-w)*(1-w)*s2*s2 + 2*w*(1-w)*rho*s1*s2);
      pts.push([vol, ret]);
    }
    const volMax = Math.max(...pts.map((p) => p[0]), s1, s2) * 1.1;
    const retVals = pts.map((p) => p[1]);
    const retMax = Math.max(...retVals, r1, r2) * 1.15;
    const retMin = Math.min(...retVals, r1, r2, 0) - 0.01;
    const x = (v) => PAD + (v / volMax) * (W - 2 * PAD);
    const y = (v) => H - PAD - ((v - retMin) / (retMax - retMin)) * (H - 2 * PAD);

    panel.querySelector("#markoCurve").setAttribute("d", pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(" "));
    panel.querySelector("#markoDot1").setAttribute("cx", x(s1)); panel.querySelector("#markoDot1").setAttribute("cy", y(r1));
    panel.querySelector("#markoDot2").setAttribute("cx", x(s2)); panel.querySelector("#markoDot2").setAttribute("cy", y(r2));

    const denom = s1*s1 + s2*s2 - 2*rho*s1*s2;
    const wmv = denom !== 0 ? (s2*s2 - rho*s1*s2) / denom : 0.5;
    const volMin = Math.sqrt(wmv*wmv*s1*s1 + (1-wmv)*(1-wmv)*s2*s2 + 2*wmv*(1-wmv)*rho*s1*s2);
    const retMin_ = wmv * r1 + (1 - wmv) * r2;
    panel.querySelector("#markoDotMin").setAttribute("cx", x(volMin)); panel.querySelector("#markoDotMin").setAttribute("cy", y(retMin_));

    const lines = [
      `${S.steps}`,
      `  σp(w) = √(w²σ1² + (1-w)²σ2² + 2w(1-w)ρσ1σ2)`,
      `  ${S.markoMinVar} ${wmv.toFixed(3)}`,
      `  σp(wmv) = ${(volMin*100).toFixed(2)}%,  Rp(wmv) = ${(retMin_*100).toFixed(2)}%`,
    ];
    panel.querySelector("#markoSteps").textContent = lines.join("\n");
  }

  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// Parametric (Variance-Covariance) VaR demo
// ---------------------------------------------------------------------------

function invNormCDF(p) {
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const plow = 0.02425, phigh = 1 - plow;
  let q, r;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= phigh) {
    q = p - 0.5; r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5]) * q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}
function normPDF(x) { return Math.exp(-x*x/2) / Math.sqrt(2*Math.PI); }

function mountVarDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 30;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="varSvg">
          <path id="varArea" fill="var(--level-3)" opacity="0.35" stroke="none" />
          <path id="varCurve" fill="none" stroke="var(--mint)" stroke-width="2" />
        </svg>
        <p class="demo-note" style="margin-top:8px">${S.varChartCaption}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>${LANG === "uk" ? "довірчий рівень" : "confidence level"} <span class="val" id="varConfVal">95%</span></label>
            <input type="range" id="varConf" min="90" max="99.9" step="0.1" value="95">
          </div>
          <div class="demo-slider-row">
            <label>σ (${LANG === "uk" ? "річна волатильність" : "annual volatility"}) <span class="val" id="varSigVal">20%</span></label>
            <input type="range" id="varSig" min="5" max="60" step="1" value="20">
          </div>
          <div class="demo-slider-row">
            <label>${LANG === "uk" ? "горизонт (днів)" : "horizon (days)"} <span class="val" id="varHVal">1</span></label>
            <input type="range" id="varH" min="1" max="20" step="1" value="1">
          </div>
        </div>
        <div class="demo-steps" id="varSteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.varCallout}</p>
    </div>
  `;

  const confSlider = panel.querySelector("#varConf");
  const sigSlider = panel.querySelector("#varSig");
  const hSlider = panel.querySelector("#varH");
  const PV = 1000000;

  function render() {
    const conf = parseFloat(confSlider.value) / 100;
    const sigmaAnnual = parseFloat(sigSlider.value) / 100;
    const h = parseInt(hSlider.value, 10);
    panel.querySelector("#varConfVal").textContent = (conf*100).toFixed(1) + "%";
    panel.querySelector("#varSigVal").textContent = (sigmaAnnual*100).toFixed(0) + "%";
    panel.querySelector("#varHVal").textContent = h;

    const z = invNormCDF(conf);
    const sigmaH = sigmaAnnual * Math.sqrt(h / 252);
    const varAmount = PV * z * sigmaH;
    const sigmaDollar = PV * sigmaH;

    // fixed dollar-P&L domain so the curve visibly narrows/widens with σ and
    // horizon, instead of always being redrawn in the same normalized shape
    const nPts = 120;
    const domain = 100000; // ± $100k window
    const xMin = -domain, xMax = domain;
    const x = (i) => PAD + (i / (nPts - 1)) * (W - 2 * PAD);
    const xVal = (i) => xMin + (i / (nPts - 1)) * (xMax - xMin);
    const pdfVals = [];
    for (let i = 0; i < nPts; i++) pdfVals.push(normPDF(xVal(i) / sigmaDollar) / sigmaDollar);
    const maxPdf = Math.max(...pdfVals);
    const y = (v) => H - PAD - (v / maxPdf) * (H - 2 * PAD);

    panel.querySelector("#varCurve").setAttribute("d", pdfVals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" "));

    const cutoffDollar = -varAmount;
    let areaPts = `M ${x(0).toFixed(1)} ${y(0).toFixed(1)} `;
    for (let i = 0; i < nPts; i++) {
      if (xVal(i) <= cutoffDollar) areaPts += `L ${x(i).toFixed(1)} ${y(pdfVals[i]).toFixed(1)} `;
    }
    const cutoffX = PAD + ((Math.max(cutoffDollar, xMin) - xMin) / (xMax - xMin)) * (W - 2 * PAD);
    areaPts += `L ${cutoffX.toFixed(1)} ${y(0).toFixed(1)} Z`;
    panel.querySelector("#varArea").setAttribute("d", areaPts);

    const lines = [
      `${S.steps}`,
      `  z(${(conf*100).toFixed(1)}%) = ${z.toFixed(4)}`,
      `  σ_h = σ·√(h/252) = ${sigmaAnnual.toFixed(2)}·√(${h}/252) = ${sigmaH.toFixed(4)}`,
      `  ${S.varResult} PV·z·σ_h = ${PV.toLocaleString()}·${z.toFixed(3)}·${sigmaH.toFixed(4)}`,
      `  ${S.varResult} $${Math.round(varAmount).toLocaleString()}`,
    ];
    panel.querySelector("#varSteps").textContent = lines.join("\n");
  }

  [confSlider, sigSlider, hSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// Kalman Filter (1-D local-level model) demo
// ---------------------------------------------------------------------------

const KALMAN_TRUE = [50.15, 50.4, 50.746, 51.184, 51.705, 52.299, 52.954, 53.655, 54.388, 55.137, 55.884, 56.614, 57.309, 57.956, 58.54, 59.049, 59.473, 59.805, 60.04, 60.175, 60.21, 60.15, 59.999, 59.766, 59.462, 59.099, 58.692, 58.256, 57.806, 57.361, 56.935, 56.546, 56.208, 55.935, 55.738, 55.627, 55.609, 55.689, 55.87, 56.149];
const KALMAN_MEAS = [47.09, 51.344, 53.233, 49.901, 48.383, 52.135, 54.149, 56.4, 51.348, 51.905, 57.649, 57.799, 61.143, 60.412, 58.286, 58.363, 65.899, 59.083, 58.078, 57.329, 60.449, 60.513, 59.137, 59.611, 60.145, 60.83, 61.434, 58.781, 53.332, 59.115, 53.386, 56.117, 52.524, 55.94, 53.792, 56.162, 63.86, 55.567, 57.976, 52.841];

function kalmanRun(Q, R) {
  let x = KALMAN_MEAS[0], P = 4;
  const est = [x];
  for (let i = 1; i < KALMAN_MEAS.length; i++) {
    const xPred = x, PPred = P + Q;
    const K = PPred / (PPred + R);
    x = xPred + K * (KALMAN_MEAS[i] - xPred);
    P = (1 - K) * PPred;
    est.push(x);
  }
  return est;
}

function mountKalmanDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 28;
  const n = KALMAN_TRUE.length;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="kalmanSvg">
          <path id="kalmanTruePath" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />
          <path id="kalmanEstPath" fill="none" stroke="var(--mint)" stroke-width="2" />
          <g id="kalmanDots"></g>
        </svg>
        <p class="demo-note" style="margin-top:8px">${S.kalmanChartCaption}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>Q (process noise) <span class="val" id="kalmanQVal">0.50</span></label>
            <input type="range" id="kalmanQ" min="0.01" max="5" step="0.01" value="0.50">
          </div>
          <div class="demo-slider-row">
            <label>R (measurement noise) <span class="val" id="kalmanRVal">6.0</span></label>
            <input type="range" id="kalmanR" min="0.5" max="15" step="0.1" value="6.0">
          </div>
        </div>
        <div class="demo-steps" id="kalmanSteps"></div>
      </div>
    </div>
    <div class="demo-callout">
      <p class="eyebrow2">${S.inFinance}</p>
      <p>${S.kalmanCallout}</p>
    </div>
  `;

  const qSlider = panel.querySelector("#kalmanQ");
  const rSlider = panel.querySelector("#kalmanR");

  const allVals = KALMAN_TRUE.concat(KALMAN_MEAS);
  const vMin = Math.min(...allVals) - 2, vMax = Math.max(...allVals) + 2;
  const x = (i) => PAD + (i / (n - 1)) * (W - 2 * PAD);
  const y = (v) => H - PAD - ((v - vMin) / (vMax - vMin)) * (H - 2 * PAD);

  panel.querySelector("#kalmanTruePath").setAttribute(
    "d", KALMAN_TRUE.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")
  );
  panel.querySelector("#kalmanDots").innerHTML = KALMAN_MEAS.map(
    (v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.5" fill="var(--level-2)" opacity="0.6" />`
  ).join("");

  function render() {
    const Q = parseFloat(qSlider.value);
    const R = parseFloat(rSlider.value);
    panel.querySelector("#kalmanQVal").textContent = Q.toFixed(2);
    panel.querySelector("#kalmanRVal").textContent = R.toFixed(1);

    const est = kalmanRun(Q, R);
    panel.querySelector("#kalmanEstPath").setAttribute("d", est.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" "));

    function rmse(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i]-b[i])**2; return Math.sqrt(s/a.length); }
    const rmseFilter = rmse(est, KALMAN_TRUE);
    const rmseRaw = rmse(KALMAN_MEAS, KALMAN_TRUE);

    const K1 = (4 + Q) / (4 + Q + R);
    const x1 = KALMAN_MEAS[0] + K1 * (KALMAN_MEAS[1] - KALMAN_MEAS[0]);

    const lines = [
      `${S.steps}`,
      `  K1 = P_pred/(P_pred+R) = ${K1.toFixed(4)}`,
      `  x1 = x0 + K1·(y1 - x0) = ${x1.toFixed(3)}`,
      ``,
      `  ${S.kalmanRmse}:`,
      `  RMSE(filter) = ${rmseFilter.toFixed(3)}   RMSE(raw) = ${rmseRaw.toFixed(3)}`,
    ];
    panel.querySelector("#kalmanSteps").textContent = lines.join("\n");
  }

  [qSlider, rSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// Shared axis-rendering helper for all charts from here on: draws a light
// grid, tick labels and axis titles so numbers on screen mean something.
// ---------------------------------------------------------------------------
function axesSVG(opts) {
  const {
    W, H, pad, xMin, xMax, yMin, yMax,
    xTicks = 4, yTicks = 4,
    xFmt = (v) => v.toFixed(1), yFmt = (v) => v.toFixed(1),
    xLabel = "", yLabel = "",
  } = opts;
  const x = (v) => pad + ((v - xMin) / (xMax - xMin)) * (W - 2 * pad);
  const y = (v) => H - pad - ((v - yMin) / (yMax - yMin)) * (H - 2 * pad);
  let svg = "";
  for (let i = 0; i <= xTicks; i++) {
    const v = xMin + (i / xTicks) * (xMax - xMin);
    const xx = x(v);
    svg += `<line class="axis-grid" x1="${xx.toFixed(1)}" y1="${pad}" x2="${xx.toFixed(1)}" y2="${H - pad}" />`;
    svg += `<text class="axis-tick" x="${xx.toFixed(1)}" y="${H - pad + 13}" text-anchor="middle">${xFmt(v)}</text>`;
  }
  for (let i = 0; i <= yTicks; i++) {
    const v = yMin + (i / yTicks) * (yMax - yMin);
    const yy = y(v);
    svg += `<line class="axis-grid" x1="${pad}" y1="${yy.toFixed(1)}" x2="${W - pad}" y2="${yy.toFixed(1)}" />`;
    svg += `<text class="axis-tick" x="${pad - 5}" y="${(yy + 3).toFixed(1)}" text-anchor="end">${yFmt(v)}</text>`;
  }
  svg += `<line class="axis-line" x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" />`;
  svg += `<line class="axis-line" x1="${pad}" y1="${pad}" x2="${pad}" y2="${H - pad}" />`;
  if (xLabel) svg += `<text class="axis-label" x="${W - pad}" y="${H - 3}" text-anchor="end">${xLabel}</text>`;
  if (yLabel) svg += `<text class="axis-label" x="${pad}" y="11" text-anchor="start">${yLabel}</text>`;
  return { x, y, svg };
}

// ---------------------------------------------------------------------------
// 1. Hidden Markov Model — forward-algorithm regime filter
// ---------------------------------------------------------------------------
function hmmForward(obs, pStay, mean0, std0, mean1, std1) {
  const A = [[pStay, 1 - pStay], [1 - pStay, pStay]];
  let alpha = [0.5, 0.5];
  const probState1 = [];
  for (let tI = 0; tI < obs.length; tI++) {
    const e0 = normPDF((obs[tI] - mean0) / std0) / std0;
    const e1 = normPDF((obs[tI] - mean1) / std1) / std1;
    let a0, a1;
    if (tI === 0) { a0 = alpha[0] * e0; a1 = alpha[1] * e1; }
    else {
      const pred0 = alpha[0] * A[0][0] + alpha[1] * A[1][0];
      const pred1 = alpha[0] * A[0][1] + alpha[1] * A[1][1];
      a0 = pred0 * e0; a1 = pred1 * e1;
    }
    const norm = a0 + a1 || 1;
    alpha = [a0 / norm, a1 / norm];
    probState1.push(alpha[1]);
  }
  return probState1;
}

function mountHmmDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;
  const obs = GARCH_EPS;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="hmmSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label>${LANG === "uk" ? "стійкість режиму (P стати)" : "regime persistence (P stay)"} <span class="val" id="hmmPVal">0.90</span></label>
            <input type="range" id="hmmP" min="0.5" max="0.99" step="0.01" value="0.90">
          </div>
          <div class="demo-slider-row">
            <label>${LANG === "uk" ? "σ стрес-режиму" : "stress-regime σ"} <span class="val" id="hmmStdVal">2.50%</span></label>
            <input type="range" id="hmmStd" min="1" max="5" step="0.1" value="2.5">
          </div>
        </div>
        <div class="demo-steps" id="hmmSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.hmmCallout}</p></div>
  `;

  const svg = panel.querySelector("#hmmSvg");
  const pSlider = panel.querySelector("#hmmP");
  const stdSlider = panel.querySelector("#hmmStd");

  function render() {
    const pStay = parseFloat(pSlider.value);
    const std1 = parseFloat(stdSlider.value) / 100;
    panel.querySelector("#hmmPVal").textContent = pStay.toFixed(2);
    panel.querySelector("#hmmStdVal").textContent = (std1 * 100).toFixed(2) + "%";

    const probs = hmmForward(obs, pStay, 0, 0.006, 0, std1);
    const { x, y, svg: axesSvg } = axesSVG({
      W, H, pad: PAD, xMin: 0, xMax: obs.length - 1, yMin: 0, yMax: 1,
      xTicks: 4, yTicks: 4, xFmt: (v) => Math.round(v), yFmt: (v) => v.toFixed(1),
      xLabel: LANG === "uk" ? "t (день)" : "t (day)", yLabel: "P(стрес)",
    });
    const path = probs.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    svg.innerHTML = axesSvg + `<path d="${path}" fill="none" stroke="var(--level-3)" stroke-width="2" />`;

    const lines = [
      `${S.steps}`,
      `  α_t(1) ∝ Σ_j α_{t-1}(j)·A(j,1) · e_1(y_t)`,
      `  P(стрес | t=${obs.length-1}) = ${probs[probs.length-1].toFixed(3)}`,
    ];
    panel.querySelector("#hmmSteps").textContent = lines.join("\n");
  }
  [pSlider, stdSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 2. Vasicek short-rate model
// ---------------------------------------------------------------------------
function vasicekPath(r0, kappa, theta, sigma, n, dt, rnd) {
  let r = r0; const path = [r];
  for (let i = 0; i < n; i++) {
    const dW = (rnd() - 0.5) * Math.sqrt(12 * dt);
    r = r + kappa * (theta - r) * dt + sigma * dW;
    path.push(r);
  }
  return path;
}

function mountVasicekDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="vasSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>κ (mean-reversion speed) <span class="val" id="vasKVal">1.50</span></label><input type="range" id="vasK" min="0.1" max="4" step="0.1" value="1.5"></div>
          <div class="demo-slider-row"><label>θ (long-run rate) <span class="val" id="vasThVal">4.0%</span></label><input type="range" id="vasTh" min="0" max="10" step="0.1" value="4.0"></div>
          <div class="demo-slider-row"><label>σ (rate volatility) <span class="val" id="vasSigVal">2.0%</span></label><input type="range" id="vasSig" min="0.2" max="6" step="0.1" value="2.0"></div>
        </div>
        <div class="demo-steps" id="vasSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.vasCallout}</p></div>
  `;

  const kSlider = panel.querySelector("#vasK"), thSlider = panel.querySelector("#vasTh"), sigSlider = panel.querySelector("#vasSig");
  const svg = panel.querySelector("#vasSvg");
  const n = 100, dt = 0.05;

  function render() {
    const kappa = parseFloat(kSlider.value), theta = parseFloat(thSlider.value) / 100, sigma = parseFloat(sigSlider.value) / 100;
    panel.querySelector("#vasKVal").textContent = kappa.toFixed(2);
    panel.querySelector("#vasThVal").textContent = (theta * 100).toFixed(1) + "%";
    panel.querySelector("#vasSigVal").textContent = (sigma * 100).toFixed(1) + "%";

    const rnd = mulberry32(99);
    const path = vasicekPath(0.01, kappa, theta, sigma, n, dt, rnd);
    const yMin = Math.min(...path, 0) - 0.01, yMax = Math.max(...path, theta) + 0.01;
    const { x, y, svg: axesSvg } = axesSVG({
      W, H, pad: PAD, xMin: 0, xMax: n, yMin, yMax, xTicks: 4, yTicks: 4,
      xFmt: (v) => (v * dt).toFixed(1), yFmt: (v) => (v * 100).toFixed(1) + "%",
      xLabel: "t (years)", yLabel: "r",
    });
    const pathD = path.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const thetaLine = `M ${x(0)} ${y(theta).toFixed(1)} L ${x(n)} ${y(theta).toFixed(1)}`;
    svg.innerHTML = axesSvg
      + `<path d="${thetaLine}" fill="none" stroke="var(--level-2)" stroke-width="1.5" stroke-dasharray="3 3" />`
      + `<path d="${pathD}" fill="none" stroke="var(--mint)" stroke-width="2" />`;

    const lines = [`${S.steps}`, `  dr = κ(θ - r)dt + σ·dW`, `  r(0)=1.00%,  r(T)=${(path[path.length-1]*100).toFixed(2)}%,  θ=${(theta*100).toFixed(2)}%`];
    panel.querySelector("#vasSteps").textContent = lines.join("\n");
  }
  [kSlider, thSlider, sigSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 3. Hawkes process — self-exciting event simulation (thinning algorithm)
// ---------------------------------------------------------------------------
function simulateHawkes(mu, alpha, beta, Tmax, rnd) {
  const events = [];
  let t = 0;
  while (t < Tmax) {
    let lam = mu;
    for (const te of events) lam += alpha * Math.exp(-beta * (t - te));
    const lambdaBar = lam + alpha;
    const w = -Math.log(rnd()) / lambdaBar;
    t += w;
    if (t >= Tmax) break;
    let lamT = mu;
    for (const te of events) lamT += alpha * Math.exp(-beta * (t - te));
    if (rnd() <= lamT / lambdaBar) events.push(t);
  }
  return events;
}

function mountHawkesDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;
  const Tmax = 20;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="hawkesSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>μ (baseline rate) <span class="val" id="hkMuVal">0.50</span></label><input type="range" id="hkMu" min="0.05" max="2" step="0.05" value="0.50"></div>
          <div class="demo-slider-row"><label>α (excitation) <span class="val" id="hkAlphaVal">1.20</span></label><input type="range" id="hkAlpha" min="0" max="3" step="0.05" value="1.20"></div>
          <div class="demo-slider-row"><label>β (decay) <span class="val" id="hkBetaVal">2.00</span></label><input type="range" id="hkBeta" min="0.2" max="5" step="0.1" value="2.00"></div>
        </div>
        <div class="demo-steps" id="hkSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.hkCallout}</p></div>
  `;

  const muSlider = panel.querySelector("#hkMu"), aSlider = panel.querySelector("#hkAlpha"), bSlider = panel.querySelector("#hkBeta");
  const svg = panel.querySelector("#hawkesSvg");

  function render() {
    const mu = parseFloat(muSlider.value), alpha = parseFloat(aSlider.value), beta = parseFloat(bSlider.value);
    panel.querySelector("#hkMuVal").textContent = mu.toFixed(2);
    panel.querySelector("#hkAlphaVal").textContent = alpha.toFixed(2);
    panel.querySelector("#hkBetaVal").textContent = beta.toFixed(2);
    const stable = alpha < beta;

    const rnd = mulberry32(42);
    const events = simulateHawkes(mu, alpha, Math.max(beta, 0.01), Tmax, rnd);

    const nPts = 200;
    const intensity = [];
    for (let i = 0; i < nPts; i++) {
      const t = (i / (nPts - 1)) * Tmax;
      let lam = mu;
      for (const te of events) if (te <= t) lam += alpha * Math.exp(-beta * (t - te));
      intensity.push(lam);
    }
    const maxLam = Math.max(...intensity, mu * 1.2);
    const { x, y, svg: axesSvg } = axesSVG({
      W, H, pad: PAD, xMin: 0, xMax: Tmax, yMin: 0, yMax: maxLam, xTicks: 4, yTicks: 4,
      xFmt: (v) => v.toFixed(0), yFmt: (v) => v.toFixed(1),
      xLabel: "t", yLabel: "λ(t)",
    });
    const lamPath = intensity.map((v, i) => `${i === 0 ? "M" : "L"} ${x((i/(nPts-1))*Tmax).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const ticks = events.map((te) => `<line x1="${x(te).toFixed(1)}" y1="${H-PAD}" x2="${x(te).toFixed(1)}" y2="${H-PAD+6}" stroke="var(--level-3)" stroke-width="1.5" />`).join("");
    svg.innerHTML = axesSvg + `<path d="${lamPath}" fill="none" stroke="var(--mint)" stroke-width="2" />` + ticks;

    const lines = [
      `${S.steps}`,
      `  λ(t) = μ + Σ α·e^(-β(t-tᵢ))`,
      `  ${LANG === "uk" ? "кількість подій за" : "events over"} T=${Tmax}: ${events.length}`,
      `  ${LANG === "uk" ? "стаціонарність (α<β)" : "stationarity (α<β)"}: ${stable ? (LANG==="uk"?"так":"yes") : (LANG==="uk"?"НІ — вибухає":"NO — explosive")}`,
    ];
    panel.querySelector("#hkSteps").textContent = lines.join("\n");
  }
  [muSlider, aSlider, bSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 4. Fuzzy C-Means clustering
// ---------------------------------------------------------------------------
const FCM_POINTS = [[-2,-2],[-2.2,-1.8],[-1.8,-2.1],[-2.1,-2.3],[-1.9,-1.7],[-2.3,-2.0],
  [2,2],[2.2,1.8],[1.8,2.1],[2.1,2.3],[1.9,1.7],[2.3,2.0],[0,0.2],[-0.3,0.1],[0.2,-0.2]];

function fcmRun(points, c, m, iterations) {
  const n = points.length;
  let centers = [points[0].slice(), points[6].slice()];
  let U;
  function updateU() {
    U = points.map((p) => {
      const d = centers.map((cc) => Math.hypot(p[0]-cc[0], p[1]-cc[1]) + 1e-6);
      return d.map((dj) => {
        let sum = 0;
        for (let k = 0; k < c; k++) sum += Math.pow(dj / d[k], 2 / (m - 1));
        return 1 / sum;
      });
    });
  }
  updateU();
  for (let it = 0; it < iterations; it++) {
    for (let j = 0; j < c; j++) {
      let sw = 0, sx = 0, sy = 0;
      for (let i = 0; i < n; i++) { const w = Math.pow(U[i][j], m); sw += w; sx += w*points[i][0]; sy += w*points[i][1]; }
      centers[j] = [sx/sw, sy/sw];
    }
    updateU();
  }
  return { centers, U };
}

function mountFcmDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 30;
  const xs = FCM_POINTS.map(p=>p[0]), ys = FCM_POINTS.map(p=>p[1]);
  const xMin = Math.min(...xs)-0.5, xMax = Math.max(...xs)+0.5;
  const yMin = Math.min(...ys)-0.5, yMax = Math.max(...ys)+0.5;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="fcmSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>m (${LANG==="uk"?"нечіткість":"fuzziness"}) <span class="val" id="fcmMVal">2.00</span></label><input type="range" id="fcmM" min="1.1" max="4" step="0.1" value="2.00"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"ітерації":"iterations"} <span class="val" id="fcmIterVal">15</span></label><input type="range" id="fcmIter" min="1" max="30" step="1" value="15"></div>
        </div>
        <div class="demo-steps" id="fcmSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.fcmCallout}</p></div>
  `;

  const mSlider = panel.querySelector("#fcmM"), iterSlider = panel.querySelector("#fcmIter");
  const svg = panel.querySelector("#fcmSvg");

  function render() {
    const m = parseFloat(mSlider.value), iterations = parseInt(iterSlider.value, 10);
    panel.querySelector("#fcmMVal").textContent = m.toFixed(2);
    panel.querySelector("#fcmIterVal").textContent = iterations;

    const { centers, U } = fcmRun(FCM_POINTS, 2, m, iterations);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>v.toFixed(1), yFmt: (v)=>v.toFixed(1) });

    const dots = FCM_POINTS.map((p,i) => {
      const w1 = U[i][0];
      // blend mint (cluster0) and amber (cluster1) by membership weight
      const col = w1 > 0.5 ? `color-mix(in srgb, var(--mint) ${Math.round(w1*100)}%, var(--level-2))` : `color-mix(in srgb, var(--level-2) ${Math.round((1-w1)*100)}%, var(--mint))`;
      return `<circle cx="${x(p[0]).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="5" fill="${col}" opacity="0.85" />`;
    }).join("");
    const centerMarks = centers.map((c,ci) => `<circle cx="${x(c[0]).toFixed(1)}" cy="${y(c[1]).toFixed(1)}" r="7" fill="none" stroke="${ci===0?"var(--mint)":"var(--level-2)"}" stroke-width="2.5" />`).join("");
    svg.innerHTML = axesSvg + dots + centerMarks;

    const lines = [`${S.steps}`, `  c1=(${centers[0][0].toFixed(2)}, ${centers[0][1].toFixed(2)})  c2=(${centers[1][0].toFixed(2)}, ${centers[1][1].toFixed(2)})`, `  U((0,0.2)) = [${U[12][0].toFixed(2)}, ${U[12][1].toFixed(2)}]`];
    panel.querySelector("#fcmSteps").textContent = lines.join("\n");
  }
  [mSlider, iterSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 5. k-Nearest Neighbours
// ---------------------------------------------------------------------------
const KNN_DATA = [[-2,-2,'A'],[-1.8,-2.2,'A'],[-2.1,-1.9,'A'],[-1.9,-2.4,'A'],[-2.3,-1.7,'A'],
  [2,2,'B'],[1.8,2.1,'B'],[2.2,1.9,'B'],[2.1,1.7,'B'],[1.7,2.3,'B'],
  [0.3,-1.5,'A'],[-1.5,0.4,'B'],[0.5,1.6,'B'],[-0.6,-1.4,'A']];

function knnPredict(dataset, query, k) {
  const withDist = dataset.map(([xx,yy,label]) => ({dist: Math.hypot(xx-query[0], yy-query[1]), label}));
  withDist.sort((a,b)=>a.dist-b.dist);
  const top = withDist.slice(0,k);
  const votes = {};
  for (const t of top) votes[t.label] = (votes[t.label]||0)+1;
  const winner = Object.entries(votes).sort((a,b)=>b[1]-a[1])[0][0];
  return { winner, top };
}

function mountKnnDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 30;
  const xMin=-3.2, xMax=3.2, yMin=-3.2, yMax=3.2;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="knnSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>k <span class="val" id="knnKVal">3</span></label><input type="range" id="knnK" min="1" max="9" step="1" value="3"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"запит X":"query X"} <span class="val" id="knnQxVal">0.00</span></label><input type="range" id="knnQx" min="-3" max="3" step="0.1" value="0"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"запит Y":"query Y"} <span class="val" id="knnQyVal">0.00</span></label><input type="range" id="knnQy" min="-3" max="3" step="0.1" value="0"></div>
        </div>
        <div class="demo-steps" id="knnSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.knnCallout}</p></div>
  `;

  const kSlider = panel.querySelector("#knnK"), qxSlider = panel.querySelector("#knnQx"), qySlider = panel.querySelector("#knnQy");
  const svg = panel.querySelector("#knnSvg");

  function render() {
    const k = parseInt(kSlider.value, 10), qx = parseFloat(qxSlider.value), qy = parseFloat(qySlider.value);
    panel.querySelector("#knnKVal").textContent = k;
    panel.querySelector("#knnQxVal").textContent = qx.toFixed(2);
    panel.querySelector("#knnQyVal").textContent = qy.toFixed(2);

    const { winner, top } = knnPredict(KNN_DATA, [qx,qy], k);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks:4, yTicks:4, xFmt:(v)=>v.toFixed(0), yFmt:(v)=>v.toFixed(0) });

    const topSet = new Set(top.map(t=>t.dist));
    const dots = KNN_DATA.map(([xx,yy,label]) => {
      const isTop = top.some(t => Math.abs(t.dist - Math.hypot(xx-qx,yy-qy)) < 1e-9);
      const col = label === 'A' ? 'var(--mint)' : 'var(--level-2)';
      return `<circle cx="${x(xx).toFixed(1)}" cy="${y(yy).toFixed(1)}" r="${isTop?6:4.5}" fill="${col}" stroke="${isTop?'var(--ink)':'none'}" stroke-width="${isTop?1.5:0}" opacity="0.9" />`;
    }).join("");
    const queryDot = `<circle cx="${x(qx).toFixed(1)}" cy="${y(qy).toFixed(1)}" r="6" fill="${winner==='A'?'var(--mint)':'var(--level-2)'}" stroke="var(--level-3)" stroke-width="2.5" />`;
    svg.innerHTML = axesSvg + dots + queryDot;

    const lines = [`${S.steps}`, `  ${LANG==="uk"?"найближчі":"nearest"} ${k}: ` + top.map(t=>t.label).join(", "), `  ${LANG==="uk"?"прогноз":"prediction"} = ${winner}`];
    panel.querySelector("#knnSteps").textContent = lines.join("\n");
  }
  [kSlider, qxSlider, qySlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 6. Random Forest — small CART ensemble, majority-vote decision region
// ---------------------------------------------------------------------------
const RF_DATA = [[-2,-2,'A'],[-1.8,-2.2,'A'],[-2.1,-1.9,'A'],[-1.9,-2.4,'A'],[-2.3,-1.7,'A'],[-1.6,-1.8,'A'],
  [2,2,'B'],[1.8,2.1,'B'],[2.2,1.9,'B'],[2.1,1.7,'B'],[1.7,2.3,'B'],[1.9,1.6,'B']];

function giniImpurity(labels) {
  const counts = {}; for (const l of labels) counts[l] = (counts[l]||0)+1;
  let g = 1; for (const kk in counts) { const p = counts[kk]/labels.length; g -= p*p; }
  return g;
}
function rfBuildStump(data, rnd) {
  let best = null;
  for (let trial = 0; trial < 6; trial++) {
    const feat = rnd() < 0.5 ? 0 : 1;
    const vals = data.map((d) => d[feat]);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    if (lo === hi) continue;
    const thresh = lo + rnd() * (hi - lo);
    const left = data.filter((d) => d[feat] < thresh);
    const right = data.filter((d) => d[feat] >= thresh);
    if (left.length === 0 || right.length === 0) continue;
    const g = (left.length*giniImpurity(left.map(d=>d[2])) + right.length*giniImpurity(right.map(d=>d[2])))/data.length;
    if (!best || g < best.g) best = { feat, thresh, g, left, right };
  }
  return best;
}
function rfMajority(rows) {
  const counts = {}; for (const r of rows) counts[r[2]] = (counts[r[2]]||0)+1;
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
}
function rfBuildTree(data, depth, maxDepth, rnd) {
  if (depth >= maxDepth || new Set(data.map(d=>d[2])).size === 1 || data.length < 2) return { leaf: true, label: rfMajority(data) };
  const split = rfBuildStump(data, rnd);
  if (!split) return { leaf: true, label: rfMajority(data) };
  return { leaf: false, feat: split.feat, thresh: split.thresh, left: rfBuildTree(split.left, depth+1, maxDepth, rnd), right: rfBuildTree(split.right, depth+1, maxDepth, rnd) };
}
function rfPredictTree(tree, point) {
  if (tree.leaf) return tree.label;
  return point[tree.feat] < tree.thresh ? rfPredictTree(tree.left, point) : rfPredictTree(tree.right, point);
}
function rfBootstrap(data, rnd) {
  const out = []; for (let i = 0; i < data.length; i++) out.push(data[Math.floor(rnd()*data.length)]);
  return out;
}
function rfPredict(data, point, nTrees, maxDepth, rnd) {
  let votesA = 0, votesB = 0;
  for (let t = 0; t < nTrees; t++) {
    const sample = rfBootstrap(data, rnd);
    const tree = rfBuildTree(sample, 0, maxDepth, rnd);
    if (rfPredictTree(tree, point) === 'A') votesA++; else votesB++;
  }
  return votesA >= votesB ? 'A' : 'B';
}

function mountRfDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 30;
  const xMin=-3.2, xMax=3.2, yMin=-3.2, yMax=3.2;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="rfSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"кількість дерев":"number of trees"} <span class="val" id="rfNVal">25</span></label><input type="range" id="rfN" min="1" max="60" step="1" value="25"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"макс. глибина":"max depth"} <span class="val" id="rfDVal">3</span></label><input type="range" id="rfD" min="1" max="5" step="1" value="3"></div>
        </div>
        <div class="demo-steps" id="rfSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.rfCallout}</p></div>
  `;

  const nSlider = panel.querySelector("#rfN"), dSlider = panel.querySelector("#rfD");
  const svg = panel.querySelector("#rfSvg");

  function render() {
    const nTrees = parseInt(nSlider.value, 10), maxDepth = parseInt(dSlider.value, 10);
    panel.querySelector("#rfNVal").textContent = nTrees;
    panel.querySelector("#rfDVal").textContent = maxDepth;

    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks:4, yTicks:4, xFmt:(v)=>v.toFixed(0), yFmt:(v)=>v.toFixed(0) });

    const rnd = mulberry32(7);
    const grid = [];
    const gridN = 22;
    for (let gi = 0; gi < gridN; gi++) {
      for (let gj = 0; gj < gridN; gj++) {
        const gx = xMin + (gi/(gridN-1))*(xMax-xMin);
        const gy = yMin + (gj/(gridN-1))*(yMax-yMin);
        const pred = rfPredict(RF_DATA, [gx,gy], nTrees, maxDepth, rnd);
        grid.push(`<rect x="${(x(gx)-6).toFixed(1)}" y="${(y(gy)-6).toFixed(1)}" width="12" height="12" fill="${pred==='A'?'var(--mint)':'var(--level-2)'}" opacity="0.18" />`);
      }
    }
    const dots = RF_DATA.map(([xx,yy,label]) => `<circle cx="${x(xx).toFixed(1)}" cy="${y(yy).toFixed(1)}" r="5" fill="${label==='A'?'var(--mint)':'var(--level-2)'}" stroke="var(--ink)" stroke-width="0.5" />`).join("");
    svg.innerHTML = axesSvg + grid.join("") + dots;

    const lines = [`${S.steps}`, `  ${LANG==="uk"?"кожне дерево навчається на bootstrap-вибірці":"each tree trains on a bootstrap sample"}`, `  ${LANG==="uk"?"прогноз = голосування більшості з":"prediction = majority vote of"} ${nTrees} ${LANG==="uk"?"дерев":"trees"}`];
    panel.querySelector("#rfSteps").textContent = lines.join("\n");
  }
  [nSlider, dSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 7. Sharpe / Sortino Ratio — window sensitivity
// ---------------------------------------------------------------------------
function sharpeSortino(returns, rfDaily) {
  const excess = returns.map((r) => r - rfDaily);
  const mean = excess.reduce((a,b)=>a+b,0) / excess.length;
  const std = Math.sqrt(excess.reduce((a,b)=>a+(b-mean)**2,0) / excess.length);
  const downside = excess.filter((r) => r < 0);
  const dstd = Math.sqrt(downside.reduce((a,b)=>a+b*b,0) / excess.length);
  return { sharpe: (mean/std)*Math.sqrt(252), sortino: (mean/dstd)*Math.sqrt(252) };
}

function mountSharpeDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;
  const returns = GARCH_EPS;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="shSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"вікно, початок":"window start"} <span class="val" id="shStartVal">0</span></label><input type="range" id="shStart" min="0" max="25" step="1" value="0"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"вікно, довжина":"window length"} <span class="val" id="shLenVal">40</span></label><input type="range" id="shLen" min="10" max="40" step="1" value="40"></div>
          <div class="demo-slider-row"><label>rf (${LANG==="uk"?"річна":"annual"}) <span class="val" id="shRfVal">3.0%</span></label><input type="range" id="shRf" min="0" max="8" step="0.5" value="3.0"></div>
        </div>
        <div class="demo-steps" id="shSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.shCallout}</p></div>
  `;

  const startSlider = panel.querySelector("#shStart"), lenSlider = panel.querySelector("#shLen"), rfSlider = panel.querySelector("#shRf");
  const svg = panel.querySelector("#shSvg");

  function render() {
    let start = parseInt(startSlider.value, 10);
    let len = parseInt(lenSlider.value, 10);
    if (start + len > returns.length) start = returns.length - len;
    panel.querySelector("#shStartVal").textContent = start;
    panel.querySelector("#shLenVal").textContent = len;
    const rfAnnual = parseFloat(rfSlider.value) / 100;
    panel.querySelector("#shRfVal").textContent = (rfAnnual*100).toFixed(1) + "%";

    const window_ = returns.slice(start, start+len);
    const { sharpe, sortino } = sharpeSortino(window_, rfAnnual/252);

    const equity = [1];
    for (const r of window_) equity.push(equity[equity.length-1]*(1+r));
    const yMin = Math.min(...equity)*0.98, yMax = Math.max(...equity)*1.02;
    const { x, y, svg: axesSvg } = axesSVG({
      W, H, pad: PAD, xMin: 0, xMax: equity.length-1, yMin, yMax, xTicks:4, yTicks:4,
      xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(2), xLabel: "t", yLabel: LANG==="uk"?"капітал":"equity",
    });
    const path = equity.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    svg.innerHTML = axesSvg + `<path d="${path}" fill="none" stroke="var(--mint)" stroke-width="2" />`;

    const lines = [`${S.steps}`, `  Sharpe = (mean(excess)/std(excess))·√252 = ${sharpe.toFixed(3)}`, `  Sortino = (mean(excess)/downside_std)·√252 = ${sortino.toFixed(3)}`];
    panel.querySelector("#shSteps").textContent = lines.join("\n");
  }
  [startSlider, lenSlider, rfSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 8. AUROC vs AUPRC on a fixed imbalanced score set
// ---------------------------------------------------------------------------
const AUC_SCORES = [];
const AUC_LABELS = [];
(function seedAucData() {
  const rnd = mulberry32(555);
  for (let i = 0; i < 90; i++) { AUC_SCORES.push(rnd()*0.6); AUC_LABELS.push(0); }
  for (let i = 0; i < 10; i++) { AUC_SCORES.push(0.25 + rnd()*0.75); AUC_LABELS.push(1); }
})();

function mountAucDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="aucSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"поріг класифікації":"classification threshold"} <span class="val" id="aucThVal">0.50</span></label><input type="range" id="aucTh" min="0" max="1" step="0.01" value="0.50"></div>
          <div class="demo-slider-row">
            <label style="justify-content:flex-start;gap:14px">
              <span><span style="color:var(--mint)">●</span> ROC</span>
              <span><span style="color:var(--level-2)">●</span> PR</span>
            </label>
          </div>
        </div>
        <div class="demo-steps" id="aucSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.aucCallout}</p></div>
  `;

  const thSlider = panel.querySelector("#aucTh");
  const svg = panel.querySelector("#aucSvg");
  const P = AUC_LABELS.filter((l)=>l===1).length, N = AUC_LABELS.filter((l)=>l===0).length;

  function metricsAt(th) {
    let tp=0, fp=0;
    for (let i=0;i<AUC_SCORES.length;i++) {
      const pred = AUC_SCORES[i] >= th ? 1 : 0;
      if (pred===1 && AUC_LABELS[i]===1) tp++;
      else if (pred===1 && AUC_LABELS[i]===0) fp++;
    }
    return { tpr: tp/(P||1), fpr: fp/(N||1), precision: (tp+fp)>0 ? tp/(tp+fp) : 1 };
  }

  function render() {
    const th = parseFloat(thSlider.value);
    panel.querySelector("#aucThVal").textContent = th.toFixed(2);

    const nPts = 41;
    const roc = [], pr = [];
    for (let i = 0; i < nPts; i++) {
      const t = i/(nPts-1);
      const m = metricsAt(t);
      roc.push([m.fpr, m.tpr]);
      pr.push([m.tpr, m.precision]);
    }
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin:0, xMax:1, yMin:0, yMax:1, xTicks:4, yTicks:4, xFmt:(v)=>v.toFixed(1), yFmt:(v)=>v.toFixed(1), xLabel: LANG==="uk"?"FPR / Recall":"FPR / Recall", yLabel: "TPR / Precision" });

    const rocPath = roc.map((p,i)=>`${i===0?"M":"L"} ${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(" ");
    const prPath = pr.map((p,i)=>`${i===0?"M":"L"} ${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(" ");
    const diag = `M ${x(0)} ${y(0)} L ${x(1)} ${y(1)}`;

    const cur = metricsAt(th);
    svg.innerHTML = axesSvg
      + `<path d="${diag}" fill="none" stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="3 3" />`
      + `<path d="${rocPath}" fill="none" stroke="var(--mint)" stroke-width="2" />`
      + `<path d="${prPath}" fill="none" stroke="var(--level-2)" stroke-width="2" />`
      + `<circle cx="${x(cur.fpr).toFixed(1)}" cy="${y(cur.tpr).toFixed(1)}" r="5" fill="var(--mint)" stroke="var(--level-3)" stroke-width="2" />`
      + `<circle cx="${x(cur.tpr).toFixed(1)}" cy="${y(cur.precision).toFixed(1)}" r="5" fill="var(--level-2)" stroke="var(--level-3)" stroke-width="2" />`;

    let aucRoc = 0; for (let i=1;i<roc.length;i++) aucRoc += Math.abs(roc[i-1][0]-roc[i][0]) * (roc[i-1][1]+roc[i][1])/2;
    const lines = [`${S.steps}`, `  ${LANG==="uk"?"дані":"data"}: ${P} ${LANG==="uk"?"позитивних":"positives"} / ${N} ${LANG==="uk"?"негативних":"negatives"} (${LANG==="uk"?"дисбаланс":"imbalanced"})`, `  TPR=${cur.tpr.toFixed(2)}  FPR=${cur.fpr.toFixed(2)}  Precision=${cur.precision.toFixed(2)}`, `  AUROC ≈ ${aucRoc.toFixed(3)}`];
    panel.querySelector("#aucSteps").textContent = lines.join("\n");
  }
  thSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 9. Heston-style CIR variance path (stochastic volatility)
// ---------------------------------------------------------------------------
function cirPath(v0, kappa, theta, xi, n, dt, rnd) {
  let v = v0; const path = [v];
  for (let i = 0; i < n; i++) {
    const dW = (rnd() - 0.5) * Math.sqrt(12 * dt);
    v = Math.max(0, v + kappa*(theta-v)*dt + xi*Math.sqrt(Math.max(v,0))*dW);
    path.push(v);
  }
  return path;
}

function mountHestonDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;
  const n = 150, dt = 0.02;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="hestSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>κ (${LANG==="uk"?"швидкість повернення":"reversion speed"}) <span class="val" id="hestKVal">2.00</span></label><input type="range" id="hestK" min="0.1" max="6" step="0.1" value="2.00"></div>
          <div class="demo-slider-row"><label>θ (long-run var) <span class="val" id="hestThVal">4.0%</span></label><input type="range" id="hestTh" min="1" max="12" step="0.5" value="4.0"></div>
          <div class="demo-slider-row"><label>ξ (vol-of-vol) <span class="val" id="hestXiVal">0.30</span></label><input type="range" id="hestXi" min="0.05" max="1" step="0.05" value="0.30"></div>
        </div>
        <div class="demo-steps" id="hestSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.hestCallout}</p></div>
  `;

  const kSlider = panel.querySelector("#hestK"), thSlider = panel.querySelector("#hestTh"), xiSlider = panel.querySelector("#hestXi");
  const svg = panel.querySelector("#hestSvg");

  function render() {
    const kappa = parseFloat(kSlider.value);
    const theta = parseFloat(thSlider.value) / 100;
    const xi = parseFloat(xiSlider.value);
    panel.querySelector("#hestKVal").textContent = kappa.toFixed(2);
    panel.querySelector("#hestThVal").textContent = (theta*100).toFixed(1) + "%";
    panel.querySelector("#hestXiVal").textContent = xi.toFixed(2);

    const rnd = mulberry32(321);
    const vPath = cirPath(theta, kappa, theta, xi, n, dt, rnd);
    const volPath = vPath.map((v) => Math.sqrt(v));
    const yMax = Math.max(...volPath) * 1.15;
    const { x, y, svg: axesSvg } = axesSVG({
      W, H, pad: PAD, xMin: 0, xMax: n, yMin: 0, yMax, xTicks: 4, yTicks: 4,
      xFmt: (v)=>(v*dt).toFixed(1), yFmt: (v)=>(v*100).toFixed(0)+"%", xLabel: "t (years)", yLabel: "σ",
    });
    const path = volPath.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const thetaLine = `M ${x(0)} ${y(Math.sqrt(theta)).toFixed(1)} L ${x(n)} ${y(Math.sqrt(theta)).toFixed(1)}`;
    svg.innerHTML = axesSvg
      + `<path d="${thetaLine}" fill="none" stroke="var(--level-2)" stroke-width="1.5" stroke-dasharray="3 3" />`
      + `<path d="${path}" fill="none" stroke="var(--mint)" stroke-width="2" />`;

    const lines = [`${S.steps}`, `  dv = κ(θ - v)dt + ξ√v·dW`, `  min σ = ${(Math.min(...volPath)*100).toFixed(2)}%,  max σ = ${(Math.max(...volPath)*100).toFixed(2)}%`];
    panel.querySelector("#hestSteps").textContent = lines.join("\n");
  }
  [kSlider, thSlider, xiSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 10. Merton structural credit model
// ---------------------------------------------------------------------------
function mertonModel(V, D, sigmaV, T, r) {
  const d1 = (Math.log(V/D) + (r + sigmaV*sigmaV/2)*T) / (sigmaV*Math.sqrt(T));
  const d2 = d1 - sigmaV*Math.sqrt(T);
  const pd = normCDF(-d2);
  const equity = V*normCDF(d1) - D*Math.exp(-r*T)*normCDF(d2);
  return { d1, d2, pd, equity };
}

function mountMertonDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 30;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="mertonSvg"></svg>
        <p class="demo-note" style="margin-top:8px">${LANG==="uk"?"Розподіл вартості активів на момент T; червона зона — дефолт (V < D)":"Distribution of asset value at T; red zone is default (V < D)"}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>V (${LANG==="uk"?"вартість активів":"asset value"}) <span class="val" id="merVVal">120</span></label><input type="range" id="merV" min="80" max="200" step="1" value="120"></div>
          <div class="demo-slider-row"><label>D (face value of debt) <span class="val" id="merDVal">100</span></label><input type="range" id="merD" min="50" max="150" step="1" value="100"></div>
          <div class="demo-slider-row"><label>σV (asset volatility) <span class="val" id="merSigVal">30%</span></label><input type="range" id="merSig" min="5" max="80" step="1" value="30"></div>
          <div class="demo-slider-row"><label>T (years) <span class="val" id="merTVal">1.0</span></label><input type="range" id="merT" min="0.25" max="5" step="0.25" value="1.0"></div>
        </div>
        <div class="demo-steps" id="merSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.merCallout}</p></div>
  `;

  const ids = ["merV","merD","merSig","merT"];
  const els = ids.map((id) => panel.querySelector("#"+id));
  const svg = panel.querySelector("#mertonSvg");
  const r = 0.03;

  function render() {
    const V = parseFloat(els[0].value), D = parseFloat(els[1].value), sigmaV = parseFloat(els[2].value)/100, T = parseFloat(els[3].value);
    panel.querySelector("#merVVal").textContent = V.toFixed(0);
    panel.querySelector("#merDVal").textContent = D.toFixed(0);
    panel.querySelector("#merSigVal").textContent = (sigmaV*100).toFixed(0)+"%";
    panel.querySelector("#merTVal").textContent = T.toFixed(2);

    const { d1, d2, pd, equity } = mertonModel(V, D, sigmaV, T, r);

    // lognormal terminal asset-value distribution
    const nPts = 100;
    const mu = Math.log(V) + (r - sigmaV*sigmaV/2)*T;
    const sd = sigmaV*Math.sqrt(T);
    const vMin = Math.exp(mu - 4*sd), vMax = Math.exp(mu + 4*sd);
    const { x, y, svg: axesSvg } = axesSVG({
      W, H, pad: PAD, xMin: vMin, xMax: vMax, yMin: 0, yMax: 1, xTicks: 4, yTicks: 0,
      xFmt: (v) => v.toFixed(0), yFmt: () => "", xLabel: "V(T)", yLabel: "",
    });
    const pdfVals = [];
    for (let i = 0; i < nPts; i++) {
      const v = vMin + (i/(nPts-1))*(vMax-vMin);
      const pdf = v > 0 ? normPDF((Math.log(v)-mu)/sd) / (v*sd) : 0;
      pdfVals.push(pdf);
    }
    const maxPdf = Math.max(...pdfVals);
    const yScaled = (p) => H - PAD - (p/maxPdf)*(H-2*PAD);
    const curve = pdfVals.map((p,i)=>`${i===0?"M":"L"} ${x(vMin+(i/(nPts-1))*(vMax-vMin)).toFixed(1)} ${yScaled(p).toFixed(1)}`).join(" ");

    let areaD = `M ${x(vMin).toFixed(1)} ${yScaled(0).toFixed(1)} `;
    for (let i = 0; i < nPts; i++) {
      const v = vMin + (i/(nPts-1))*(vMax-vMin);
      if (v <= D) areaD += `L ${x(v).toFixed(1)} ${yScaled(pdfVals[i]).toFixed(1)} `;
    }
    const cutoffX = x(Math.min(D, vMax));
    areaD += `L ${cutoffX.toFixed(1)} ${yScaled(0).toFixed(1)} Z`;

    const dLineX = x(D);
    svg.innerHTML = axesSvg
      + `<path d="${areaD}" fill="var(--level-3)" opacity="0.35" stroke="none" />`
      + `<path d="${curve}" fill="none" stroke="var(--mint)" stroke-width="2" />`
      + `<line x1="${dLineX.toFixed(1)}" y1="${PAD}" x2="${dLineX.toFixed(1)}" y2="${H-PAD}" stroke="var(--level-2)" stroke-width="1.5" stroke-dasharray="3 3" />`;

    const lines = [`${S.steps}`, `  d2 = ${d2.toFixed(4)}`, `  PD = N(-d2) = ${(pd*100).toFixed(2)}%`, `  ${LANG==="uk"?"вартість акціонерного капіталу":"equity value"} = ${equity.toFixed(2)}`];
    panel.querySelector("#merSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}


// ---------------------------------------------------------------------------
// 11. GAN — a real 1-D Gaussian-matching GAN trained via gradient descent
// (linear generator G(z)=a·z+b, logistic discriminator D(x)=sigmoid(w·x+c)).
// Deliberately left un-stabilised so mode collapse is visible and honestly
// explained, rather than hidden behind extra tricks.
// ---------------------------------------------------------------------------
function gaussFrom(rnd) {
  const u1 = Math.max(rnd(), 1e-9), u2 = rnd();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function sigmoidFn(v) { return 1 / (1 + Math.exp(-v)); }

function trainGan(steps, lr, seed) {
  const rnd = mulberry32(seed);
  const targetMean = 3, targetStd = 1.2;
  let a = 0.5, b = 0, w = 0.05, c = 0;
  const batch = 16;
  for (let s = 0; s < steps; s++) {
    let gw = 0, gc = 0;
    for (let i = 0; i < batch; i++) {
      const real = targetMean + targetStd * gaussFrom(rnd);
      const z = gaussFrom(rnd);
      const fake = a * z + b;
      const Dreal = sigmoidFn(w * real + c), Dfake = sigmoidFn(w * fake + c);
      gw += -((1 - Dreal) * real - Dfake * fake);
      gc += -((1 - Dreal) - Dfake);
    }
    w -= lr * gw / batch; c -= lr * gc / batch;
    let ga = 0, gb = 0;
    for (let i = 0; i < batch; i++) {
      const z = gaussFrom(rnd);
      const fake = a * z + b;
      const Dfake = sigmoidFn(w * fake + c);
      const dLdfake = -(1 - Dfake) * w;
      ga += dLdfake * z; gb += dLdfake;
    }
    a -= lr * ga / batch; b -= lr * gb / batch;
  }
  return { a, b, w, c, rnd };
}

function mountGanDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="ganSvg"></svg>
        <p class="demo-note" style="margin-top:8px">
          <span style="color:var(--ink-faint)">●</span> ${LANG==="uk"?"справжній розподіл":"real distribution"} &nbsp;
          <span style="color:var(--mint)">●</span> ${LANG==="uk"?"розподіл генератора":"generator distribution"}
        </p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.ganStepsLbl} <span class="val" id="ganStepsVal">100</span></label><input type="range" id="ganSteps" min="0" max="500" step="10" value="100"></div>
          <div class="demo-slider-row"><label>learning rate <span class="val" id="ganLrVal">0.020</span></label><input type="range" id="ganLr" min="0.005" max="0.06" step="0.005" value="0.020"></div>
        </div>
        <div class="demo-steps" id="ganSteps2"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.ganCallout}</p></div>
  `;

  const stepsSlider = panel.querySelector("#ganSteps");
  const lrSlider = panel.querySelector("#ganLr");
  const svg = panel.querySelector("#ganSvg");
  const targetMean = 3, targetStd = 1.2;

  function render() {
    const steps = parseInt(stepsSlider.value, 10);
    const lr = parseFloat(lrSlider.value);
    panel.querySelector("#ganStepsVal").textContent = steps;
    panel.querySelector("#ganLrVal").textContent = lr.toFixed(3);

    const { a, b, w, c, rnd } = trainGan(steps, lr, 1);
    const genSamples = [];
    for (let i = 0; i < 600; i++) genSamples.push(a * gaussFrom(rnd) + b);
    const genMean = genSamples.reduce((x,y)=>x+y,0)/genSamples.length;
    const genStd = Math.sqrt(genSamples.reduce((s,v)=>s+(v-genMean)**2,0)/genSamples.length);

    const xMin = -2, xMax = 8;
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin: 0, yMax: 1, xTicks: 5, yTicks: 0, xFmt: (v)=>v.toFixed(0), yFmt: ()=>"", xLabel: "x" });

    const nPts = 100;
    function densityCurve(mean, std) {
      const vals = [];
      for (let i = 0; i < nPts; i++) {
        const xv = xMin + (i/(nPts-1))*(xMax-xMin);
        vals.push(normPDF((xv-mean)/std)/std);
      }
      return vals;
    }
    const realCurve = densityCurve(targetMean, targetStd);
    const genCurve = densityCurve(genMean, Math.max(genStd, 0.02));
    const maxD = Math.max(...realCurve, ...genCurve);
    const ys = (v) => H - PAD - (v/maxD)*(H-2*PAD);
    const toPath = (curve) => curve.map((v,i) => `${i===0?"M":"L"} ${x(xMin+(i/(nPts-1))*(xMax-xMin)).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");

    svg.innerHTML = axesSvg
      + `<path d="${toPath(realCurve)}" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />`
      + `<path d="${toPath(genCurve)}" fill="none" stroke="var(--mint)" stroke-width="2.5" />`;

    const lines = [`${S.steps}`, `  target: mean=${targetMean.toFixed(2)}, σ=${targetStd.toFixed(2)}`, `  ${S.ganMeanStd}: mean=${genMean.toFixed(2)}, σ=${genStd.toFixed(3)}`, `  G(z)=${a.toFixed(3)}·z+${b.toFixed(3)}   D(x)=sigmoid(${w.toFixed(3)}·x+${c.toFixed(3)})`];
    panel.querySelector("#ganSteps2").textContent = lines.join("\n");
  }
  [stepsSlider, lrSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 12. TimeGAN concept — real ACF preservation vs naive resampling
// ---------------------------------------------------------------------------
function genAR1(n, phi, sigma, rnd) {
  let xv = 0; const out = [xv];
  for (let i = 1; i < n; i++) { xv = phi * xv + sigma * gaussFrom(rnd); out.push(xv); }
  return out;
}
function acfCalc(series, lag) {
  const n = series.length;
  const mean = series.reduce((a,b)=>a+b,0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) den += (series[i]-mean) ** 2;
  for (let i = 0; i < n - lag; i++) num += (series[i]-mean) * (series[i+lag]-mean);
  return num / den;
}
function estimatePhi(series) {
  let num = 0, den = 0;
  for (let i = 1; i < series.length; i++) { num += series[i]*series[i-1]; den += series[i-1]**2; }
  return num / den;
}

const TIMEGAN_ORIGINAL = (function () {
  const rnd = mulberry32(3);
  return genAR1(60, 0.7, 1, rnd);
})();
const TIMEGAN_PHI_HAT = estimatePhi(TIMEGAN_ORIGINAL);

function mountTimeganDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="tganSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.timeganLambda} <span class="val" id="tganLamVal">0.00</span></label><input type="range" id="tganLam" min="0" max="1" step="0.05" value="0"></div>
        </div>
        <div class="demo-steps" id="tganSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.timeganCallout}</p></div>
  `;

  const lamSlider = panel.querySelector("#tganLam");
  const svg = panel.querySelector("#tganSvg");

  function render() {
    const lambda = parseFloat(lamSlider.value);
    panel.querySelector("#tganLamVal").textContent = lambda.toFixed(2);

    const rnd = mulberry32(22);
    const phiUsed = lambda * TIMEGAN_PHI_HAT;
    let xv = 0; const gen = [xv];
    for (let i = 1; i < TIMEGAN_ORIGINAL.length; i++) { xv = phiUsed*xv + 1*gaussFrom(rnd); gen.push(xv); }

    const lags = [1,2,3,4,5];
    const acfOrig = lags.map((l) => acfCalc(TIMEGAN_ORIGINAL, l));
    const acfGen = lags.map((l) => acfCalc(gen, l));

    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0.5, xMax: 5.5, yMin: -0.3, yMax: 1, xTicks: 5, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(1), xLabel: "lag", yLabel: "ACF" });

    let bars = "";
    lags.forEach((l, i) => {
      const bw = 0.15;
      const xo = l - 0.12, xg = l + 0.12;
      const yo0 = y(0), yoV = y(acfOrig[i]);
      const ygV = y(acfGen[i]);
      bars += `<rect x="${(x(xo)-8).toFixed(1)}" y="${Math.min(yo0,yoV).toFixed(1)}" width="16" height="${Math.abs(yoV-yo0).toFixed(1)}" fill="var(--ink-faint)" opacity="0.6" />`;
      bars += `<rect x="${(x(xg)-8).toFixed(1)}" y="${Math.min(yo0,ygV).toFixed(1)}" width="16" height="${Math.abs(ygV-yo0).toFixed(1)}" fill="var(--mint)" opacity="0.85" />`;
    });
    svg.innerHTML = axesSvg + bars;

    const lines = [`${S.steps}`, `  φ̂ (${LANG==="uk"?"оцінено з даних":"estimated from data"}) = ${TIMEGAN_PHI_HAT.toFixed(3)}`, `  ${S.timeganAcfOrig} lag1 = ${acfOrig[0].toFixed(3)}`, `  ${S.timeganAcfGen} lag1 = ${acfGen[0].toFixed(3)}`];
    panel.querySelector("#tganSteps").textContent = lines.join("\n");
  }
  lamSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 13. TAnoGAN concept — latent-space gradient descent for anomaly scoring
// ---------------------------------------------------------------------------
const TANOGAN_W = 5;
const TANOGAN_MANIFOLD = (function () {
  const calmWindows = [];
  for (let i = 0; i <= 15 - TANOGAN_W; i++) calmWindows.push(GARCH_EPS.slice(i, i + TANOGAN_W));
  function meanVec(mat) { const w = mat[0].length; const m = new Array(w).fill(0); for (const row of mat) for (let j=0;j<w;j++) m[j]+=row[j]; return m.map((v)=>v/mat.length); }
  function subMat(mat, m) { return mat.map((row) => row.map((v,j)=>v-m[j])); }
  function matVec(mat, vec) { return mat.map((row) => row.reduce((s,v,j)=>s+v*vec[j],0)); }
  function vecMatT(mat, vec) { const w = mat[0].length; const out = new Array(w).fill(0); for (let i=0;i<mat.length;i++) for (let j=0;j<w;j++) out[j]+=mat[i][j]*vec[i]; return out; }
  function normV(v) { return Math.sqrt(v.reduce((s,x2)=>s+x2*x2,0)); }
  function powerIter(mat, iters) {
    let v = mat[0].map((_,j) => Math.sin(j+1));
    for (let it=0; it<iters; it++) { const Xv = matVec(mat,v); const XtXv = vecMatT(mat,Xv); const n = normV(XtXv); v = XtXv.map((val)=>val/n); }
    return v;
  }
  const mean0 = meanVec(calmWindows);
  const centered = subMat(calmWindows, mean0);
  const pc1 = powerIter(centered, 50);
  const proj1 = matVec(centered, pc1);
  const centered2 = centered.map((row,i) => row.map((v,j)=>v - proj1[i]*pc1[j]));
  const pc2 = powerIter(centered2, 50);
  return { mean0, pc1, pc2 };
})();

function tanoganG(z1, z2) {
  const { mean0, pc1, pc2 } = TANOGAN_MANIFOLD;
  return mean0.map((m,j) => m + z1*pc1[j] + z2*pc2[j]);
}
function tanoganLoss(window_, z1, z2) {
  const g = tanoganG(z1, z2);
  let s = 0; for (let j = 0; j < TANOGAN_W; j++) s += (g[j]-window_[j]) ** 2;
  return s;
}
function tanoganGD(window_, steps, lr) {
  let z1 = 0, z2 = 0;
  const epsD = 1e-5;
  const trace = [];
  for (let s = 0; s < steps; s++) {
    let g1 = (tanoganLoss(window_,z1+epsD,z2)-tanoganLoss(window_,z1-epsD,z2))/(2*epsD);
    let g2 = (tanoganLoss(window_,z1,z2+epsD)-tanoganLoss(window_,z1,z2-epsD))/(2*epsD);
    const gn = Math.sqrt(g1*g1+g2*g2);
    if (gn > 1) { g1/=gn; g2/=gn; }
    z1 -= lr*g1; z2 -= lr*g2;
    if (s % Math.max(1,Math.floor(steps/40)) === 0) trace.push(tanoganLoss(window_,z1,z2));
  }
  trace.push(tanoganLoss(window_,z1,z2));
  return { z1, z2, loss: tanoganLoss(window_,z1,z2), trace };
}

function mountTanoganDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;
  const maxStart = GARCH_EPS.length - TANOGAN_W;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="tanoSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.tanoganWindow} <span class="val" id="tanoWinVal">2</span></label><input type="range" id="tanoWin" min="0" max="${maxStart}" step="1" value="2"></div>
          <div class="demo-slider-row"><label>${S.tanoganSteps} <span class="val" id="tanoStepsVal">300</span></label><input type="range" id="tanoSteps" min="20" max="500" step="20" value="300"></div>
        </div>
        <div class="demo-steps" id="tanoStepsPanel"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.tanoganCallout}</p></div>
  `;

  const winSlider = panel.querySelector("#tanoWin");
  const stepsSlider = panel.querySelector("#tanoSteps");
  const svg = panel.querySelector("#tanoSvg");

  function render() {
    const start = parseInt(winSlider.value, 10);
    const steps = parseInt(stepsSlider.value, 10);
    panel.querySelector("#tanoWinVal").textContent = start;
    panel.querySelector("#tanoStepsVal").textContent = steps;

    const window_ = GARCH_EPS.slice(start, start+TANOGAN_W);
    const { z1, z2, loss, trace } = tanoganGD(window_, steps, 0.05);
    const regime = start < 16 ? (LANG==="uk"?"спокійний":"calm") : (LANG==="uk"?"стресовий":"stress");

    const maxLoss = Math.max(...trace, 1e-6);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: trace.length-1, yMin: 0, yMax: maxLoss, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toExponential(1), xLabel: LANG==="uk"?"крок (масштаб.)":"step (scaled)", yLabel: LANG==="uk"?"похибка":"loss" });
    const path = trace.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    svg.innerHTML = axesSvg + `<path d="${path}" fill="none" stroke="var(--level-3)" stroke-width="2" />`;

    const lines = [`${S.steps}`, `  ${S.tanoganRegime}: ${regime}`, `  window = [${window_.map(v=>v.toFixed(4)).join(", ")}]`, `  z* = (${z1.toFixed(3)}, ${z2.toFixed(3)})`, `  ${S.tanoganLoss} = ${loss.toExponential(3)}`];
    panel.querySelector("#tanoStepsPanel").textContent = lines.join("\n");
  }
  [winSlider, stepsSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 14. GAN-LSTM Hybrid concept — real BPTT-trained single-unit LSTM cell
// vs a memoryless one-lag dense predictor, on a series with 2-lag memory.
// ---------------------------------------------------------------------------
function tanhFn(v) { return Math.tanh(v); }
function lstmForward(params, seq) {
  let h = 0, cState = 0;
  const preds = [];
  for (let tt = 0; tt < seq.length - 1; tt++) {
    const xv = seq[tt];
    const f = sigmoidFn(params.Wf*xv + params.Uf*h + params.bf);
    const ii = sigmoidFn(params.Wi*xv + params.Ui*h + params.bi);
    const o = sigmoidFn(params.Wo*xv + params.Uo*h + params.bo);
    const cHat = tanhFn(params.Wc*xv + params.Uc*h + params.bc);
    cState = f*cState + ii*cHat;
    h = o*tanhFn(cState);
    preds.push(params.Wy*h + params.by);
  }
  return preds;
}
function lstmLossFn(params, seq) {
  const preds = lstmForward(params, seq);
  let s = 0; for (let tt = 0; tt < preds.length; tt++) s += (preds[tt]-seq[tt+1]) ** 2;
  return s / preds.length;
}
function trainLstmCell(seq, steps, lr) {
  let params = { Wf:0.1,Uf:0.1,bf:0, Wi:0.1,Ui:0.1,bi:0, Wo:0.1,Uo:0.1,bo:0, Wc:0.1,Uc:0.1,bc:0, Wy:0.5,by:0 };
  const keys = Object.keys(params);
  const epsD = 1e-4;
  const lossTrace = [];
  const sampleEvery = Math.max(1, Math.floor(steps/30));
  for (let s = 0; s < steps; s++) {
    const grads = {};
    for (const k of keys) {
      const p1 = { ...params }; p1[k] += epsD;
      const p2 = { ...params }; p2[k] -= epsD;
      grads[k] = (lstmLossFn(p1,seq)-lstmLossFn(p2,seq)) / (2*epsD);
    }
    for (const k of keys) params[k] -= lr*grads[k];
    if (s % sampleEvery === 0) lossTrace.push(lstmLossFn(params, seq));
  }
  lossTrace.push(lstmLossFn(params, seq));
  return { params, loss: lstmLossFn(params, seq), lossTrace };
}
function trainDensePredictor(seq, steps, lr) {
  let w = 0.1, b = 0;
  const lossTrace = [];
  const sampleEvery = Math.max(1, Math.floor(steps/30));
  function loss(ww,bb) { let s=0; for (let tt=0;tt<seq.length-1;tt++) s += (ww*seq[tt]+bb-seq[tt+1])**2; return s/(seq.length-1); }
  for (let s = 0; s < steps; s++) {
    let gw = 0, gb = 0;
    for (let tt = 0; tt < seq.length - 1; tt++) { const pred = w*seq[tt]+b; const err = pred-seq[tt+1]; gw += 2*err*seq[tt]; gb += 2*err; }
    gw /= seq.length-1; gb /= seq.length-1;
    w -= lr*gw; b -= lr*gb;
    if (s % sampleEvery === 0) lossTrace.push(loss(w,b));
  }
  lossTrace.push(loss(w,b));
  return { w, b, loss: loss(w,b), lossTrace };
}
const GANLSTM_SEQ = (function () {
  const rnd = mulberry32(5);
  let x1 = 0, x2 = 0; const out = [x2, x1];
  for (let i = 2; i < 40; i++) { const xv = 0.5*x1 + 0.4*x2 + 0.3*gaussFrom(rnd); out.push(xv); x2 = x1; x1 = xv; }
  return out;
})();

function mountGanLstmDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="glSvg"></svg>
        <p class="demo-note" style="margin-top:8px"><span style="color:var(--mint)">●</span> LSTM &nbsp; <span style="color:var(--level-2)">●</span> ${LANG==="uk"?"статичний (1 лаг)":"static (1-lag)"}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.ganlstmSteps} <span class="val" id="glStepsVal">300</span></label><input type="range" id="glSteps" min="20" max="600" step="20" value="300"></div>
        </div>
        <div class="demo-steps" id="glStepsPanel"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.ganlstmCallout}</p></div>
  `;

  const stepsSlider = panel.querySelector("#glSteps");
  const svg = panel.querySelector("#glSvg");

  function render() {
    const steps = parseInt(stepsSlider.value, 10);
    panel.querySelector("#glStepsVal").textContent = steps;

    const lstmResult = trainLstmCell(GANLSTM_SEQ, steps, 0.3);
    const denseResult = trainDensePredictor(GANLSTM_SEQ, steps, 0.3);

    const maxLoss = Math.max(...lstmResult.lossTrace, ...denseResult.lossTrace);
    const nT = Math.max(lstmResult.lossTrace.length, denseResult.lossTrace.length);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: nT-1, yMin: 0, yMax: maxLoss, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(3), xLabel: LANG==="uk"?"крок (масштаб.)":"step (scaled)", yLabel: "MSE" });
    const lstmPath = lstmResult.lossTrace.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const densePath = denseResult.lossTrace.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    svg.innerHTML = axesSvg
      + `<path d="${densePath}" fill="none" stroke="var(--level-2)" stroke-width="2" />`
      + `<path d="${lstmPath}" fill="none" stroke="var(--mint)" stroke-width="2" />`;

    const ratio = denseResult.loss / lstmResult.loss;
    const lines = [`${S.steps}`, `  ${LANG==="uk"?"дані: AR(2)-ряд, справжня залежність від 2 лагів":"data: an AR(2) series, genuine 2-lag dependency"}`, `  LSTM ${S.ganlstmLoss} = ${lstmResult.loss.toExponential(3)}`, `  ${LANG==="uk"?"статичний":"static"} ${S.ganlstmLoss} = ${denseResult.loss.toExponential(3)}`, `  ${LANG==="uk"?"відношення":"ratio"} = ${ratio.toFixed(2)}×`];
    panel.querySelector("#glStepsPanel").textContent = lines.join("\n");
  }
  stepsSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 15. Diffusion Models — real forward variance-preserving diffusion process
// ---------------------------------------------------------------------------
function betaSchedule(T, betaStart, betaEnd) {
  const betas = [];
  for (let tt = 0; tt < T; tt++) betas.push(betaStart + (betaEnd-betaStart)*tt/(T-1));
  return betas;
}
function alphaBarsCalc(betas) {
  const alphas = betas.map((bv) => 1-bv);
  const bars = []; let prod = 1;
  for (const av of alphas) { prod *= av; bars.push(prod); }
  return bars;
}
const DIFFUSION_T = 60;
const DIFFUSION_BARS = alphaBarsCalc(betaSchedule(DIFFUSION_T, 0.0001, 0.1));
const DIFFUSION_X0 = (function () {
  const rnd = mulberry32(9);
  const out = [];
  for (let i = 0; i < 400; i++) { const comp = rnd() < 0.5 ? -2 : 2; out.push(comp + 0.5*gaussFrom(rnd)); }
  return out;
})();

function mountDiffusionDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="diffSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.diffusionStep} <span class="val" id="diffTVal">0</span></label><input type="range" id="diffT" min="0" max="${DIFFUSION_T-1}" step="1" value="0"></div>
        </div>
        <div class="demo-steps" id="diffSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.diffusionCallout}</p></div>
  `;

  const tSlider = panel.querySelector("#diffT");
  const svg = panel.querySelector("#diffSvg");

  function render() {
    const tIdx = parseInt(tSlider.value, 10);
    panel.querySelector("#diffTVal").textContent = tIdx;

    const alphaBar = DIFFUSION_BARS[tIdx];
    const rnd = mulberry32(100+tIdx);
    const xt = DIFFUSION_X0.map((x0) => Math.sqrt(alphaBar)*x0 + Math.sqrt(1-alphaBar)*gaussFrom(rnd));

    const xMin = -6, xMax = 6;
    const nBins = 40;
    const counts = new Array(nBins).fill(0);
    for (const v of xt) { const bi = Math.min(nBins-1, Math.max(0, Math.floor((v-xMin)/(xMax-xMin)*nBins))); counts[bi]++; }
    const maxCount = Math.max(...counts, 1);

    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin: 0, yMax: maxCount, xTicks: 6, yTicks: 0, xFmt: (v)=>v.toFixed(0), yFmt: ()=>"", xLabel: "x", yLabel: "" });
    let bars = "";
    for (let i = 0; i < nBins; i++) {
      const bx = xMin + (i/nBins)*(xMax-xMin);
      const bw = (xMax-xMin)/nBins;
      const h = (counts[i]/maxCount) * (H-2*PAD);
      bars += `<rect x="${x(bx).toFixed(1)}" y="${(H-PAD-h).toFixed(1)}" width="${(x(bx+bw)-x(bx)-1).toFixed(1)}" height="${h.toFixed(1)}" fill="var(--mint)" opacity="0.8" />`;
    }
    svg.innerHTML = axesSvg + bars;

    const mean = xt.reduce((a,b)=>a+b,0)/xt.length;
    const varr = xt.reduce((s,v)=>s+(v-mean)**2,0)/xt.length;
    const lines = [`${S.steps}`, `  x_t = √ᾱ_t·x₀ + √(1-ᾱ_t)·ε`, `  ᾱ_${tIdx} = ${alphaBar.toFixed(4)}`, `  mean(x_t)=${mean.toFixed(3)}  var(x_t)=${varr.toFixed(3)}  ${LANG==="uk"?"(при t→T: mean→0, var→1)":"(as t→T: mean→0, var→1)"}`];
    panel.querySelector("#diffSteps").textContent = lines.join("\n");
  }
  tSlider.addEventListener("input", render);
  render();
}


// ---------------------------------------------------------------------------
// 16. EGARCH
// ---------------------------------------------------------------------------
function egarchSeries(omega, alpha, beta, gamma) {
  const EAbsZ = Math.sqrt(2/Math.PI);
  let logSigma2 = omega / (1 - beta);
  const out = [];
  for (let i = 0; i < GARCH_EPS.length; i++) {
    const sigma = Math.sqrt(Math.exp(logSigma2));
    const z = GARCH_EPS[i] / Math.max(sigma, 1e-8);
    logSigma2 = omega + beta*logSigma2 + alpha*(Math.abs(z)-EAbsZ) + gamma*z;
    out.push(Math.exp(logSigma2));
  }
  return out;
}

function mountEgarchDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="egarchSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>ω <span class="val" id="egOmegaVal">-0.10</span></label><input type="range" id="egOmega" min="-0.5" max="0" step="0.01" value="-0.10"></div>
          <div class="demo-slider-row"><label>α <span class="val" id="egAlphaVal">0.15</span></label><input type="range" id="egAlpha" min="0" max="0.4" step="0.01" value="0.15"></div>
          <div class="demo-slider-row"><label>β <span class="val" id="egBetaVal">0.90</span></label><input type="range" id="egBeta" min="0.5" max="0.98" step="0.01" value="0.90"></div>
          <div class="demo-slider-row"><label>γ (${LANG==="uk"?"асиметрія":"asymmetry"}) <span class="val" id="egGammaVal">-0.15</span></label><input type="range" id="egGamma" min="-0.4" max="0.1" step="0.01" value="-0.15"></div>
        </div>
        <div class="demo-steps" id="egSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.egarchCallout}</p></div>
  `;

  const els = ["egOmega","egAlpha","egBeta","egGamma"].map((id) => panel.querySelector("#"+id));
  const svg = panel.querySelector("#egarchSvg");

  function render() {
    const [omega, alpha, beta, gamma] = els.map((el) => parseFloat(el.value));
    panel.querySelector("#egOmegaVal").textContent = omega.toFixed(2);
    panel.querySelector("#egAlphaVal").textContent = alpha.toFixed(2);
    panel.querySelector("#egBetaVal").textContent = beta.toFixed(2);
    panel.querySelector("#egGammaVal").textContent = gamma.toFixed(2);

    const sigma2 = egarchSeries(omega, alpha, beta, gamma);
    const annualPct = sigma2.map((v) => Math.sqrt(v*252)*100);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: annualPct.length-1, yMin: 0, yMax: Math.max(...annualPct)*1.15, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(0)+"%", xLabel: "t", yLabel: "σₜ" });
    const path = annualPct.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    svg.innerHTML = axesSvg + `<path d="${path}" fill="none" stroke="var(--mint)" stroke-width="2" />`;

    // one-step asymmetry check from a shared starting sigma2
    const sigma0 = Math.sqrt(Math.exp(omega/(1-beta)));
    const EAbsZ = Math.sqrt(2/Math.PI);
    function step(shock) {
      const z = shock/sigma0;
      return Math.sqrt(Math.exp(omega + beta*(omega/(1-beta)) + alpha*(Math.abs(z)-EAbsZ) + gamma*z))*Math.sqrt(252)*100;
    }
    const posResp = step(0.02), negResp = step(-0.02);
    const lines = [`${S.steps}`, `  log(σₜ²) = ω + β·log(σₜ₋₁²) + α·(|z|-E|z|) + γ·z`, `  ${S.egarchAsym}:`, `  +2% -> σ=${posResp.toFixed(1)}%   −2% -> σ=${negResp.toFixed(1)}%`];
    panel.querySelector("#egSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 17. Binomial / Trinomial option pricing tree (CRR)
// ---------------------------------------------------------------------------
function binomialPrice(S, K, T, r, sigma, n, isPut, american) {
  const dt = T/n, u = Math.exp(sigma*Math.sqrt(dt)), d = 1/u;
  const p = (Math.exp(r*dt)-d)/(u-d);
  const disc = Math.exp(-r*dt);
  let values = [];
  for (let i = 0; i <= n; i++) {
    const ST = S*Math.pow(u,n-i)*Math.pow(d,i);
    values.push(isPut ? Math.max(K-ST,0) : Math.max(ST-K,0));
  }
  for (let stp = n-1; stp >= 0; stp--) {
    const newValues = [];
    for (let i = 0; i <= stp; i++) {
      let val = disc*(p*values[i]+(1-p)*values[i+1]);
      if (american) {
        const ST = S*Math.pow(u,stp-i)*Math.pow(d,i);
        const exercise = isPut ? Math.max(K-ST,0) : Math.max(ST-K,0);
        val = Math.max(val, exercise);
      }
      newValues.push(val);
    }
    values = newValues;
  }
  return values[0];
}

function mountBinomialDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 20;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="binSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>S <span class="val" id="binSVal">100</span></label><input type="range" id="binS" min="60" max="140" step="1" value="100"></div>
          <div class="demo-slider-row"><label>K <span class="val" id="binKVal">100</span></label><input type="range" id="binK" min="60" max="140" step="1" value="100"></div>
          <div class="demo-slider-row"><label>σ <span class="val" id="binSigVal">20%</span></label><input type="range" id="binSig" min="5" max="60" step="1" value="20"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"кроки дерева (для ціни)":"tree steps (pricing)"} <span class="val" id="binNVal">100</span></label><input type="range" id="binN" min="10" max="300" step="10" value="100"></div>
        </div>
        <div class="demo-steps" id="binSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.binomialCallout}</p></div>
  `;

  const els = ["binS","binK","binSig","binN"].map((id) => panel.querySelector("#"+id));
  const svg = panel.querySelector("#binSvg");
  const T = 1, r = 0.03;
  const visualSteps = 5;

  function render() {
    const [Sv, K, sigPct, n] = els.map((el) => parseFloat(el.value));
    const sigma = sigPct/100;
    panel.querySelector("#binSVal").textContent = Sv.toFixed(0);
    panel.querySelector("#binKVal").textContent = K.toFixed(0);
    panel.querySelector("#binSigVal").textContent = sigPct.toFixed(0)+"%";
    panel.querySelector("#binNVal").textContent = n;

    // small visual tree (fixed 5 steps) regardless of pricing-n
    const dt = T/visualSteps, u = Math.exp(sigma*Math.sqrt(dt)), d = 1/u;
    const xStep = (W-2*PAD-40)/visualSteps;
    const logMinPrice = Math.log(Sv*Math.pow(d,visualSteps));
    const logMaxPrice = Math.log(Sv*Math.pow(u,visualSteps));
    function priceY(price) {
      const t = (Math.log(price)-logMinPrice)/(logMaxPrice-logMinPrice || 1);
      return (H-PAD) - t*(H-2*PAD);
    }
    let nodes = "", lines2 = "";
    const positions = [];
    for (let stp = 0; stp <= visualSteps; stp++) {
      positions.push([]);
      for (let i = 0; i <= stp; i++) {
        const price = Sv*Math.pow(u,stp-i)*Math.pow(d,i);
        const px = PAD+20 + stp*xStep;
        const py = priceY(price);
        positions[stp].push([px,py,price]);
        const inMoney = price >= K;
        nodes += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="${inMoney?"var(--mint)":"var(--level-2)"}" />`;
        nodes += `<text x="${px.toFixed(1)}" y="${(py-8).toFixed(1)}" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="var(--ink-soft)">${price.toFixed(0)}</text>`;
      }
    }
    for (let stp=1; stp<=visualSteps; stp++) {
      for (let i=0;i<stp;i++) {
        const [px0,py0] = positions[stp-1][i];
        const [pxU,pyU] = positions[stp][i];
        const [pxD,pyD] = positions[stp][i+1];
        lines2 += `<line x1="${px0.toFixed(1)}" y1="${py0.toFixed(1)}" x2="${pxU.toFixed(1)}" y2="${pyU.toFixed(1)}" stroke="var(--rule)" stroke-width="1" />`;
        lines2 += `<line x1="${px0.toFixed(1)}" y1="${py0.toFixed(1)}" x2="${pxD.toFixed(1)}" y2="${pyD.toFixed(1)}" stroke="var(--rule)" stroke-width="1" />`;
      }
    }
    const kY = priceY(K);
    lines2 += `<line x1="${PAD}" y1="${kY.toFixed(1)}" x2="${W-PAD+20}" y2="${kY.toFixed(1)}" stroke="var(--level-3)" stroke-width="1" stroke-dasharray="3 3" />`;
    lines2 += `<text x="${PAD}" y="${(kY-4).toFixed(1)}" font-family="var(--mono)" font-size="8" fill="var(--level-3)">K=${K.toFixed(0)}</text>`;
    svg.innerHTML = lines2 + nodes;

    const amPut = binomialPrice(Sv,K,T,r,sigma,n,true,true);
    const euPut = binomialPrice(Sv,K,T,r,sigma,n,true,false);
    const euCall = binomialPrice(Sv,K,T,r,sigma,n,false,false);
    const bsRef = bsPrice(Sv,K,T,r,sigma).call;

    const lines = [`${S.steps}`, `  u=e^(σ√Δt)=${u.toFixed(4)}  d=1/u=${d.toFixed(4)}`, `  ${LANG==="uk"?"європ. колл (дерево)":"Eur call (tree)"} = ${euCall.toFixed(3)}   BS = ${bsRef.toFixed(3)}`, `  ${S.binomialAmerican} = ${amPut.toFixed(3)}   ${S.binomialEuropean} = ${euPut.toFixed(3)}`, `  ${S.binomialPremium} = ${(amPut-euPut).toFixed(3)}`];
    panel.querySelector("#binSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 18. Monte Carlo option pricing
// ---------------------------------------------------------------------------
function mcCallPrice(S, K, T, r, sigma, N, rnd) {
  let sum = 0;
  const paths = [];
  for (let i = 0; i < N; i++) {
    const ST = S*Math.exp((r-sigma*sigma/2)*T + sigma*Math.sqrt(T)*gaussFrom(rnd));
    sum += Math.max(ST-K, 0);
    paths.push(ST);
  }
  return { price: Math.exp(-r*T)*sum/N, paths };
}

function mountMcDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="mcSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>N (${LANG==="uk"?"кількість шляхів":"number of paths"}) <span class="val" id="mcNVal">500</span></label><input type="range" id="mcN" min="50" max="5000" step="50" value="500"></div>
        </div>
        <div class="demo-steps" id="mcSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.mcCallout}</p></div>
  `;

  const nSlider = panel.querySelector("#mcN");
  const svg = panel.querySelector("#mcSvg");
  const Sv = 100, K = 100, T = 1, r = 0.05, sigma = 0.2;
  const bsRef = bsPrice(Sv,K,T,r,sigma).call;

  function render() {
    const N = parseInt(nSlider.value, 10);
    panel.querySelector("#mcNVal").textContent = N;

    const rnd = mulberry32(1);
    const { price, paths } = mcCallPrice(Sv, K, T, r, sigma, N, rnd);

    const nBins = 30;
    const xMin = 40, xMax = 200;
    const counts = new Array(nBins).fill(0);
    for (const v of paths) { const bi = Math.min(nBins-1, Math.max(0, Math.floor((v-xMin)/(xMax-xMin)*nBins))); counts[bi]++; }
    const maxCount = Math.max(...counts, 1);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin: 0, yMax: maxCount, xTicks: 5, yTicks: 0, xFmt: (v)=>v.toFixed(0), yFmt: ()=>"", xLabel: "S_T", yLabel: "" });
    let bars = "";
    for (let i = 0; i < nBins; i++) {
      const bx = xMin + (i/nBins)*(xMax-xMin);
      const h = (counts[i]/maxCount)*(H-2*PAD);
      const inMoney = bx >= K;
      bars += `<rect x="${x(bx).toFixed(1)}" y="${(H-PAD-h).toFixed(1)}" width="${((x(bx+(xMax-xMin)/nBins)-x(bx))-1).toFixed(1)}" height="${h.toFixed(1)}" fill="${inMoney?"var(--mint)":"var(--ink-faint)"}" opacity="0.75" />`;
    }
    const kX = x(K);
    svg.innerHTML = axesSvg + bars + `<line x1="${kX.toFixed(1)}" y1="${PAD}" x2="${kX.toFixed(1)}" y2="${H-PAD}" stroke="var(--level-2)" stroke-width="1.5" stroke-dasharray="3 3" />`;

    const lines = [`${S.steps}`, `  MC ${LANG==="uk"?"ціна":"price"} = ${price.toFixed(3)}`, `  Black-Scholes ${LANG==="uk"?"еталон":"reference"} = ${bsRef.toFixed(3)}`, `  ${S.mcConverge}: |${LANG==="uk"?"похибка":"error"}| = ${Math.abs(price-bsRef).toFixed(3)}`];
    panel.querySelector("#mcSteps").textContent = lines.join("\n");
  }
  nSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 19. DBSCAN
// ---------------------------------------------------------------------------
const DBSCAN_POINTS = (function () {
  const rnd = mulberry32(4);
  const pts = [];
  for (let i = 0; i < 25; i++) pts.push([-2+gaussFrom(rnd)*0.4, -2+gaussFrom(rnd)*0.4]);
  for (let i = 0; i < 25; i++) pts.push([2+gaussFrom(rnd)*0.4, 2+gaussFrom(rnd)*0.4]);
  for (let i = 0; i < 6; i++) pts.push([rnd()*8-4, rnd()*8-4]);
  return pts;
})();

function dbscanRun(points, eps, minPts) {
  const n = points.length;
  const labels = new Array(n).fill(undefined);
  function regionQuery(i) {
    const neigh = [];
    for (let j = 0; j < n; j++) if (Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1]) <= eps) neigh.push(j);
    return neigh;
  }
  let clusterId = 0;
  for (let i = 0; i < n; i++) {
    if (labels[i] !== undefined) continue;
    const neighbors = regionQuery(i);
    if (neighbors.length < minPts) { labels[i] = -1; continue; }
    labels[i] = clusterId;
    const seeds = neighbors.slice();
    for (let k = 0; k < seeds.length; k++) {
      const j = seeds[k];
      if (labels[j] === -1) labels[j] = clusterId;
      if (labels[j] !== undefined) continue;
      labels[j] = clusterId;
      const jNeighbors = regionQuery(j);
      if (jNeighbors.length >= minPts) seeds.push(...jNeighbors);
    }
    clusterId++;
  }
  return { labels, nClusters: clusterId };
}

function mountDbscanDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 20;
  const palette = ["var(--mint)", "var(--level-2)", "var(--level-1)", "#7aa2e8"];

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="dbSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>ε (${LANG==="uk"?"радіус":"radius"}) <span class="val" id="dbEpsVal">0.80</span></label><input type="range" id="dbEps" min="0.2" max="2.5" step="0.05" value="0.80"></div>
          <div class="demo-slider-row"><label>minPts <span class="val" id="dbMinVal">4</span></label><input type="range" id="dbMin" min="2" max="10" step="1" value="4"></div>
        </div>
        <div class="demo-steps" id="dbSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.dbscanCallout}</p></div>
  `;

  const epsSlider = panel.querySelector("#dbEps"), minSlider = panel.querySelector("#dbMin");
  const svg = panel.querySelector("#dbSvg");
  const xs = DBSCAN_POINTS.map((p)=>p[0]), ys = DBSCAN_POINTS.map((p)=>p[1]);
  const xMin = Math.min(...xs)-0.5, xMax = Math.max(...xs)+0.5, yMin = Math.min(...ys)-0.5, yMax = Math.max(...ys)+0.5;

  function render() {
    const eps = parseFloat(epsSlider.value), minPts = parseInt(minSlider.value, 10);
    panel.querySelector("#dbEpsVal").textContent = eps.toFixed(2);
    panel.querySelector("#dbMinVal").textContent = minPts;

    const { labels, nClusters } = dbscanRun(DBSCAN_POINTS, eps, minPts);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>v.toFixed(1), yFmt: (v)=>v.toFixed(1) });
    const dots = DBSCAN_POINTS.map((p,i) => {
      const lbl = labels[i];
      const col = lbl === -1 ? "var(--ink-faint)" : palette[lbl % palette.length];
      return `<circle cx="${x(p[0]).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="${lbl===-1?3:5}" fill="${col}" opacity="${lbl===-1?0.5:0.9}" />`;
    }).join("");
    svg.innerHTML = axesSvg + dots;

    const nNoise = labels.filter((l)=>l===-1).length;
    const lines = [`${S.steps}`, `  ${nClusters} ${S.dbscanCluster}${nClusters===1?"":LANG==="uk"?"и":"s"}, ${nNoise} ${S.dbscanNoise}`];
    panel.querySelector("#dbSteps").textContent = lines.join("\n");
  }
  [epsSlider, minSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 20. Support Vector Machine (soft-margin, gradient descent on hinge loss)
// ---------------------------------------------------------------------------
const SVM_DATA = [[-2,-2,-1],[-1.8,-2.2,-1],[-2.1,-1.9,-1],[-1.6,-1.7,-1],[-1.9,-2.4,-1],
  [2,2,1],[1.8,2.1,1],[2.2,1.9,1],[1.7,1.6,1],[2.1,2.3,1]];

function trainSvm(data, steps, lr, C) {
  let w1 = 0.1, w2 = 0.1, b = 0;
  for (let s = 0; s < steps; s++) {
    let gw1 = 0, gw2 = 0, gb = 0;
    for (const [x1,x2,yv] of data) {
      const margin = yv*(w1*x1+w2*x2+b);
      if (margin < 1) { gw1 += -C*yv*x1; gw2 += -C*yv*x2; gb += -C*yv; }
    }
    gw1 = w1 + gw1/data.length; gw2 = w2 + gw2/data.length; gb = gb/data.length;
    w1 -= lr*gw1; w2 -= lr*gw2; b -= lr*gb;
  }
  return { w1, w2, b };
}

function mountSvmDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 20;
  const xMin=-3.2, xMax=3.2, yMin=-3.2, yMax=3.2;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="svmSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>C (${LANG==="uk"?"регуляризація":"regularization"}) <span class="val" id="svmCVal">1.0</span></label><input type="range" id="svmC" min="0.1" max="5" step="0.1" value="1.0"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"кроки навчання":"training steps"} <span class="val" id="svmStepsVal">300</span></label><input type="range" id="svmSteps" min="10" max="500" step="10" value="300"></div>
        </div>
        <div class="demo-steps" id="svmStepsPanel"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.svmCallout}</p></div>
  `;

  const cSlider = panel.querySelector("#svmC"), stepsSlider = panel.querySelector("#svmSteps");
  const svg = panel.querySelector("#svmSvg");

  function render() {
    const C = parseFloat(cSlider.value), steps = parseInt(stepsSlider.value, 10);
    panel.querySelector("#svmCVal").textContent = C.toFixed(1);
    panel.querySelector("#svmStepsVal").textContent = steps;

    const { w1, w2, b } = trainSvm(SVM_DATA, steps, 0.02, C);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>v.toFixed(0), yFmt: (v)=>v.toFixed(0) });

    // decision boundary line: w1*x1+w2*x2+b=0  =>  x2 = -(w1*x1+b)/w2
    function boundaryY(x1v) { return -(w1*x1v+b)/w2; }
    const lineD = `M ${x(xMin).toFixed(1)} ${y(boundaryY(xMin)).toFixed(1)} L ${x(xMax).toFixed(1)} ${y(boundaryY(xMax)).toFixed(1)}`;
    function marginY(x1v, side) { return -(w1*x1v+b-side)/w2; }
    const marginPlus = `M ${x(xMin).toFixed(1)} ${y(marginY(xMin,1)).toFixed(1)} L ${x(xMax).toFixed(1)} ${y(marginY(xMax,1)).toFixed(1)}`;
    const marginMinus = `M ${x(xMin).toFixed(1)} ${y(marginY(xMin,-1)).toFixed(1)} L ${x(xMax).toFixed(1)} ${y(marginY(xMax,-1)).toFixed(1)}`;

    const dots = SVM_DATA.map(([x1v,x2v,yv]) => {
      const margin = Math.abs(yv*(w1*x1v+w2*x2v+b) - 1) < 0.3;
      return `<circle cx="${x(x1v).toFixed(1)}" cy="${y(x2v).toFixed(1)}" r="${margin?6:4.5}" fill="${yv===1?"var(--mint)":"var(--level-2)"}" stroke="${margin?"var(--level-3)":"none"}" stroke-width="2" />`;
    }).join("");

    svg.innerHTML = axesSvg
      + `<path d="${marginPlus}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 3" fill="none" />`
      + `<path d="${marginMinus}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 3" fill="none" />`
      + `<path d="${lineD}" stroke="var(--ink)" stroke-width="2" fill="none" />`
      + dots;

    const nCorrect = SVM_DATA.filter(([x1v,x2v,yv]) => Math.sign(w1*x1v+w2*x2v+b)===yv).length;
    const lines = [`${S.steps}`, `  w=(${w1.toFixed(3)}, ${w2.toFixed(3)})  b=${b.toFixed(3)}`, `  ${LANG==="uk"?"точність":"accuracy"} = ${nCorrect}/${SVM_DATA.length}`];
    panel.querySelector("#svmStepsPanel").textContent = lines.join("\n");
  }
  [cSlider, stepsSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 21. Decision Tree (CART) — full tree, decision-region visualization
// ---------------------------------------------------------------------------
const CART_DATA = [[-2,-2,'A'],[-1.8,-2.2,'A'],[-2.1,-1.9,'A'],[2,2,'B'],[1.8,2.1,'B'],[2.2,1.9,'B'],[-2,2,'A'],[-1.7,1.8,'A'],[2,-2,'B'],[1.9,-1.8,'B']];

function giniImpurityFn(labels) { const counts={}; for (const l of labels) counts[l]=(counts[l]||0)+1; let g=1; for (const k in counts) { const p=counts[k]/labels.length; g-=p*p; } return g; }
function bestSplitCart(data) {
  let best = null;
  for (let feat = 0; feat < 2; feat++) {
    const vals = [...new Set(data.map((d)=>d[feat]))].sort((a,b)=>a-b);
    for (let i = 0; i < vals.length-1; i++) {
      const thresh = (vals[i]+vals[i+1])/2;
      const left = data.filter((d)=>d[feat]<thresh), right = data.filter((d)=>d[feat]>=thresh);
      if (left.length===0 || right.length===0) continue;
      const g = (left.length*giniImpurityFn(left.map((d)=>d[2])) + right.length*giniImpurityFn(right.map((d)=>d[2])))/data.length;
      if (!best || g < best.g) best = { feat, thresh, g, left, right };
    }
  }
  return best;
}
function majorityCart(rows) { const c={}; for (const r of rows) c[r[2]]=(c[r[2]]||0)+1; return Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0]; }
function buildCART(data, depth, maxDepth) {
  if (depth >= maxDepth || new Set(data.map((d)=>d[2])).size===1 || data.length<2) return { leaf: true, label: majorityCart(data) };
  const split = bestSplitCart(data);
  if (!split) return { leaf: true, label: majorityCart(data) };
  return { leaf: false, feat: split.feat, thresh: split.thresh, left: buildCART(split.left,depth+1,maxDepth), right: buildCART(split.right,depth+1,maxDepth) };
}
function predictCART(tree, point) { if (tree.leaf) return tree.label; return point[tree.feat] < tree.thresh ? predictCART(tree.left,point) : predictCART(tree.right,point); }
function cartDepth(tree) { return tree.leaf ? 0 : 1+Math.max(cartDepth(tree.left), cartDepth(tree.right)); }
function cartLeaves(tree) { return tree.leaf ? 1 : cartLeaves(tree.left)+cartLeaves(tree.right); }

function mountCartDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 20;
  const xMin=-3.2, xMax=3.2, yMin=-3.2, yMax=3.2;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="cartSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"макс. глибина":"max depth"} <span class="val" id="cartDepthVal">3</span></label><input type="range" id="cartDepth" min="1" max="5" step="1" value="3"></div>
        </div>
        <div class="demo-steps" id="cartSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.cartCallout}</p></div>
  `;

  const depthSlider = panel.querySelector("#cartDepth");
  const svg = panel.querySelector("#cartSvg");

  function render() {
    const maxDepth = parseInt(depthSlider.value, 10);
    panel.querySelector("#cartDepthVal").textContent = maxDepth;

    const tree = buildCART(CART_DATA, 0, maxDepth);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>v.toFixed(0), yFmt: (v)=>v.toFixed(0) });

    const gridN = 26, regions = [];
    for (let gi = 0; gi < gridN; gi++) for (let gj = 0; gj < gridN; gj++) {
      const gx = xMin + (gi/(gridN-1))*(xMax-xMin), gy = yMin + (gj/(gridN-1))*(yMax-yMin);
      const pred = predictCART(tree, [gx,gy]);
      regions.push(`<rect x="${(x(gx)-6).toFixed(1)}" y="${(y(gy)-6).toFixed(1)}" width="12" height="12" fill="${pred==='A'?'var(--mint)':'var(--level-2)'}" opacity="0.18" />`);
    }
    const dots = CART_DATA.map(([xx,yy,label]) => `<circle cx="${x(xx).toFixed(1)}" cy="${y(yy).toFixed(1)}" r="5" fill="${label==='A'?'var(--mint)':'var(--level-2)'}" stroke="var(--ink)" stroke-width="0.5" />`).join("");
    svg.innerHTML = axesSvg + regions.join("") + dots;

    const lines = [`${S.steps}`, `  ${LANG==="uk"?"глибина":"depth"}=${cartDepth(tree)}  ${LANG==="uk"?"листків":"leaves"}=${cartLeaves(tree)}`, `  ${LANG==="uk"?"точність на тренуванні":"training accuracy"} = ${CART_DATA.filter((d)=>predictCART(tree,d)===d[2]).length}/${CART_DATA.length}`];
    panel.querySelector("#cartSteps").textContent = lines.join("\n");
  }
  depthSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 22. CUSUM change-point detection
// ---------------------------------------------------------------------------
function cusumCalc(series, mu0, k) {
  let Sv = 0; const out = [];
  for (const xv of series) { Sv = Math.max(0, Sv + (xv-mu0-k)); out.push(Sv); }
  return out;
}
const CUSUM_SERIES = (function () {
  const rnd = mulberry32(8);
  const before = Array.from({length:30}, () => gaussFrom(rnd)*1+0);
  const after = Array.from({length:30}, () => gaussFrom(rnd)*1+2.5);
  return before.concat(after);
})();

function mountCusumDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="cusumSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>h (${LANG==="uk"?"поріг":"threshold"}) <span class="val" id="cuHVal">5.0</span></label><input type="range" id="cuH" min="1" max="12" step="0.5" value="5.0"></div>
          <div class="demo-slider-row"><label>k (${LANG==="uk"?"допуск дрейфу":"drift allowance"}) <span class="val" id="cuKVal">0.50</span></label><input type="range" id="cuK" min="0.1" max="1.5" step="0.05" value="0.50"></div>
        </div>
        <div class="demo-steps" id="cuSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.cusumCallout}</p></div>
  `;

  const hSlider = panel.querySelector("#cuH"), kSlider = panel.querySelector("#cuK");
  const svg = panel.querySelector("#cusumSvg");

  function render() {
    const h = parseFloat(hSlider.value), k = parseFloat(kSlider.value);
    panel.querySelector("#cuHVal").textContent = h.toFixed(1);
    panel.querySelector("#cuKVal").textContent = k.toFixed(2);

    const cusumVals = cusumCalc(CUSUM_SERIES, 0, k);
    const detectIdx = cusumVals.findIndex((v) => v > h);
    const maxS = Math.max(...cusumVals, h)*1.1;
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: cusumVals.length-1, yMin: 0, yMax: maxS, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(1), xLabel: "t", yLabel: "Sₜ" });
    const path = cusumVals.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const hLine = `M ${x(0)} ${y(h).toFixed(1)} L ${x(cusumVals.length-1)} ${y(h).toFixed(1)}`;
    let detectMark = "";
    if (detectIdx >= 0) detectMark = `<line x1="${x(detectIdx).toFixed(1)}" y1="${PAD}" x2="${x(detectIdx).toFixed(1)}" y2="${H-PAD}" stroke="var(--level-3)" stroke-width="1.5" stroke-dasharray="3 3" />`;
    svg.innerHTML = axesSvg + `<path d="${hLine}" fill="none" stroke="var(--level-2)" stroke-width="1.5" stroke-dasharray="4 3" />` + `<path d="${path}" fill="none" stroke="var(--mint)" stroke-width="2" />` + detectMark;

    const lines = [`${S.steps}`, `  Sₜ = max(0, Sₜ₋₁ + (xₜ − μ₀ − k))`, detectIdx>=0 ? `  ${S.cusumDetected} t=${detectIdx} (${LANG==="uk"?"справжній зсув: t=30":"true shift: t=30"})` : `  ${S.cusumNotDetected}`];
    panel.querySelector("#cuSteps").textContent = lines.join("\n");
  }
  [hSlider, kSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 23. Bayesian Optimization (real Gaussian Process + Expected Improvement)
// ---------------------------------------------------------------------------
function rbfKernel(x1, x2, l, sigmaF) { return sigmaF*sigmaF*Math.exp(-0.5*((x1-x2)/l)**2); }
function matInvSmall(A) {
  const n = A.length;
  const M = A.map((row,i) => row.concat(Array.from({length:n}, (_,j) => i===j?1:0)));
  for (let i = 0; i < n; i++) {
    let pivot = M[i][i]; if (Math.abs(pivot)<1e-10) pivot=1e-10;
    for (let j = 0; j < 2*n; j++) M[i][j] /= pivot;
    for (let k = 0; k < n; k++) { if (k===i) continue; const factor=M[k][i]; for (let j=0;j<2*n;j++) M[k][j] -= factor*M[i][j]; }
  }
  return M.map((row) => row.slice(n));
}
function matVecMulSmall(A, v) { return A.map((row) => row.reduce((s,a,j)=>s+a*v[j],0)); }
function gpPosterior(Xtrain, Ytrain, xTest, l, sigmaF, noise) {
  const K = Xtrain.map((xi) => Xtrain.map((xj) => rbfKernel(xi,xj,l,sigmaF)+(xi===xj?noise:0)));
  const Kinv = matInvSmall(K);
  const kStar = Xtrain.map((xi) => rbfKernel(xi,xTest,l,sigmaF));
  const alpha = matVecMulSmall(Kinv, Ytrain);
  const mean = kStar.reduce((s,kv,i)=>s+kv*alpha[i],0);
  const kInvK = matVecMulSmall(Kinv, kStar);
  const varr = rbfKernel(xTest,xTest,l,sigmaF) - kStar.reduce((s,kv,i)=>s+kv*kInvK[i],0);
  return { mean, std: Math.sqrt(Math.max(varr,1e-8)) };
}
function trueObjective(xv) {
  return Math.sin(xv*1.3)*2 + 0.1*xv;
}
function expectedImprovement(mean, std, fBest) {
  if (std < 1e-9) return 0;
  const zz = (mean-fBest)/std;
  return (mean-fBest)*normCDF(zz) + std*normPDF(zz);
}
function runBO(iterations) {
  let Xs = [-4, 0, 4];
  let Ys = Xs.map(trueObjective);
  const history = [{ Xs: Xs.slice(), Ys: Ys.slice() }];
  for (let it = 0; it < iterations; it++) {
    let bestX = null, bestEI = -1;
    for (let xi = -5; xi <= 5; xi += 0.1) {
      if (Xs.some((x0) => Math.abs(x0-xi)<0.05)) continue;
      const { mean, std } = gpPosterior(Xs, Ys, xi, 1.5, 1.5, 0.01);
      const ei = expectedImprovement(mean, std, Math.max(...Ys));
      if (ei > bestEI) { bestEI = ei; bestX = xi; }
    }
    Xs.push(bestX); Ys.push(trueObjective(bestX));
    history.push({ Xs: Xs.slice(), Ys: Ys.slice() });
  }
  return { Xs, Ys, history };
}

function mountBoDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="boSvg"></svg>
        <p class="demo-note" style="margin-top:8px"><span style="color:var(--ink-faint)">●</span> ${S.boTrueUnknown} &nbsp; <span style="color:var(--mint)">●</span> ${S.boGpMean}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.boIteration} <span class="val" id="boIterVal">3</span></label><input type="range" id="boIter" min="0" max="12" step="1" value="3"></div>
        </div>
        <div class="demo-steps" id="boSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.boCallout}</p></div>
  `;

  const iterSlider = panel.querySelector("#boIter");
  const svg = panel.querySelector("#boSvg");
  const xMin = -5, xMax = 5;

  function render() {
    const iterations = parseInt(iterSlider.value, 10);
    panel.querySelector("#boIterVal").textContent = iterations;

    const { Xs, Ys } = runBO(iterations);
    const nPts = 80;
    const trueCurve = [], meanCurve = [];
    for (let i = 0; i < nPts; i++) {
      const xv = xMin + (i/(nPts-1))*(xMax-xMin);
      trueCurve.push(trueObjective(xv));
      const { mean } = gpPosterior(Xs, Ys, xv, 1.5, 1.5, 0.01);
      meanCurve.push(mean);
    }
    const allY = trueCurve.concat(meanCurve).concat(Ys);
    const yMinC = Math.min(...allY)-0.3, yMaxC = Math.max(...allY)+0.3;
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin: yMinC, yMax: yMaxC, xTicks: 5, yTicks: 4, xFmt: (v)=>v.toFixed(0), yFmt: (v)=>v.toFixed(1), xLabel: "x (hyperparameter)", yLabel: "f(x)" });
    const trueLine = trueCurve.map((v,i)=>`${i===0?"M":"L"} ${x(xMin+(i/(nPts-1))*(xMax-xMin)).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const meanLine = meanCurve.map((v,i)=>`${i===0?"M":"L"} ${x(xMin+(i/(nPts-1))*(xMax-xMin)).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const sampledDots = Xs.map((xv,i) => `<circle cx="${x(xv).toFixed(1)}" cy="${y(Ys[i]).toFixed(1)}" r="5" fill="var(--level-3)" />`).join("");

    svg.innerHTML = axesSvg
      + `<path d="${trueLine}" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />`
      + `<path d="${meanLine}" fill="none" stroke="var(--mint)" stroke-width="2" />`
      + sampledDots;

    const bestY = Math.max(...Ys);
    const lines = [`${S.steps}`, `  ${LANG==="uk"?"вибірок":"samples"}: ${Xs.length}`, `  ${S.boBestFound} = ${bestY.toFixed(3)}`];
    panel.querySelector("#boSteps").textContent = lines.join("\n");
  }
  iterSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 24. Network centrality (degree vs eigenvector, power iteration with shift)
// ---------------------------------------------------------------------------
const CENTRALITY_ADJ = [
  [0,1,1,1,0,0],
  [1,0,0,0,0,0],
  [1,0,0,0,0,0],
  [1,0,0,0,0,0],
  [0,0,0,0,0,1],
  [0,0,0,0,1,0],
];
const CENTRALITY_POS = [[170,150],[80,80],[80,150],[80,220],[280,110],[280,190]];

function degreeCentrality(adj) { return adj.map((row) => row.reduce((a,b)=>a+b,0)); }
function eigenCentralityCalc(adj, iters, shift) {
  const n = adj.length;
  let v = new Array(n).fill(1);
  for (let it = 0; it < iters; it++) {
    const nv = adj.map((row,i) => row.reduce((s,a,j)=>s+a*v[j],0) + shift*v[i]);
    const norm = Math.sqrt(nv.reduce((s,xv)=>s+xv*xv,0)) || 1;
    v = nv.map((xv) => xv/norm);
  }
  return v;
}

function mountCentralityDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="centSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label style="justify-content:flex-start;gap:10px">
              <input type="radio" name="centMode" id="centDeg" value="deg" checked style="width:auto"> ${S.centralityDegree}
            </label>
          </div>
          <div class="demo-slider-row">
            <label style="justify-content:flex-start;gap:10px">
              <input type="radio" name="centMode" id="centEig" value="eig" style="width:auto"> ${S.centralityEigen}
            </label>
          </div>
        </div>
        <div class="demo-steps" id="centSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.centralityCallout}</p></div>
  `;

  const degRadio = panel.querySelector("#centDeg"), eigRadio = panel.querySelector("#centEig");
  const svg = panel.querySelector("#centSvg");

  function render() {
    const useDeg = degRadio.checked;
    const deg = degreeCentrality(CENTRALITY_ADJ);
    const eig = eigenCentralityCalc(CENTRALITY_ADJ, 60, 1.0);
    const vals = useDeg ? deg : eig;
    const maxV = Math.max(...vals);

    let edges = "";
    for (let i = 0; i < CENTRALITY_ADJ.length; i++) for (let j = i+1; j < CENTRALITY_ADJ.length; j++) {
      if (CENTRALITY_ADJ[i][j]) edges += `<line x1="${CENTRALITY_POS[i][0]}" y1="${CENTRALITY_POS[i][1]}" x2="${CENTRALITY_POS[j][0]}" y2="${CENTRALITY_POS[j][1]}" stroke="var(--rule)" stroke-width="1.5" />`;
    }
    const nodes = CENTRALITY_POS.map((p,i) => {
      const r = 8 + 20*(vals[i]/maxV);
      return `<circle cx="${p[0]}" cy="${p[1]}" r="${r.toFixed(1)}" fill="var(--mint)" opacity="0.8" /><text x="${p[0]}" y="${p[1]+4}" text-anchor="middle" font-family="var(--mono)" font-size="10" fill="var(--bg)">${i}</text>`;
    }).join("");
    svg.innerHTML = edges + nodes;

    const lines = [`${S.steps}`, `  ${S.centralityDegree}: [${deg.join(", ")}]`, `  ${S.centralityEigen}: [${eig.map((v)=>v.toFixed(2)).join(", ")}]`, `  (${LANG==="uk"?"вузол 0 = хаб; вузли 1,2,3 мають ту саму ступеневу центральність, що й пара 4-5, але вищу власновекторну":"node 0 = hub; nodes 1,2,3 share the same degree as the 4-5 pair but higher eigenvector centrality"})`];
    panel.querySelector("#centSteps").textContent = lines.join("\n");
  }
  [degRadio, eigRadio].forEach((el) => el.addEventListener("change", render));
  render();
}

// ---------------------------------------------------------------------------
// 25. Calmar Ratio / Max Drawdown
// ---------------------------------------------------------------------------
function maxDrawdownCalc(equity) {
  let peak = equity[0], maxDD = 0, peakIdx=0, troughIdx=0, curPeakIdx=0;
  for (let i=0;i<equity.length;i++) {
    if (equity[i] > peak) { peak = equity[i]; curPeakIdx = i; }
    const dd = (peak-equity[i])/peak;
    if (dd > maxDD) { maxDD = dd; peakIdx = curPeakIdx; troughIdx = i; }
  }
  return { maxDD, peakIdx, troughIdx };
}
function equityFromParams(driftAnnual, volAnnual, seed) {
  const rnd = mulberry32(seed);
  let eq = [1];
  const driftDaily = driftAnnual/252, volDaily = volAnnual/Math.sqrt(252);
  for (let i = 0; i < 252; i++) eq.push(eq[eq.length-1]*(1+driftDaily+gaussFrom(rnd)*volDaily));
  return eq;
}

function mountCalmarDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="calSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"річний дрейф":"annual drift"} <span class="val" id="calDriftVal">8%</span></label><input type="range" id="calDrift" min="-10" max="25" step="1" value="8"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"річна волатильність":"annual volatility"} <span class="val" id="calVolVal">20%</span></label><input type="range" id="calVol" min="5" max="50" step="1" value="20"></div>
        </div>
        <div class="demo-steps" id="calSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.calmarCallout}</p></div>
  `;

  const driftSlider = panel.querySelector("#calDrift"), volSlider = panel.querySelector("#calVol");
  const svg = panel.querySelector("#calSvg");

  function render() {
    const driftPct = parseFloat(driftSlider.value), volPct = parseFloat(volSlider.value);
    panel.querySelector("#calDriftVal").textContent = driftPct.toFixed(0)+"%";
    panel.querySelector("#calVolVal").textContent = volPct.toFixed(0)+"%";

    const eq = equityFromParams(driftPct/100, volPct/100, 77);
    const { maxDD, peakIdx, troughIdx } = maxDrawdownCalc(eq);
    const totalReturn = eq[eq.length-1]/eq[0];
    const cagr = Math.pow(totalReturn, 252/eq.length/252) - 1; // approx annualised from 1-yr series ~ totalReturn-1
    const cagrSimple = totalReturn - 1;
    const calmarRatio = maxDD > 0.001 ? cagrSimple/maxDD : 0;

    const yMin = Math.min(...eq)*0.95, yMax = Math.max(...eq)*1.05;
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: eq.length-1, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(2), xLabel: "t", yLabel: LANG==="uk"?"капітал":"equity" });
    const path = eq.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const ddZone = `<line x1="${x(peakIdx).toFixed(1)}" y1="${y(eq[peakIdx]).toFixed(1)}" x2="${x(troughIdx).toFixed(1)}" y2="${y(eq[troughIdx]).toFixed(1)}" stroke="var(--level-3)" stroke-width="2" stroke-dasharray="4 2" />`;
    svg.innerHTML = axesSvg + `<path d="${path}" fill="none" stroke="var(--mint)" stroke-width="2" />` + ddZone;

    const lines = [`${S.steps}`, `  CAGR ≈ ${(cagrSimple*100).toFixed(1)}%`, `  ${S.calmarDD} (MaxDD) = ${(maxDD*100).toFixed(1)}%`, `  Calmar = CAGR / MaxDD = ${calmarRatio.toFixed(2)}`];
    panel.querySelector("#calSteps").textContent = lines.join("\n");
  }
  [driftSlider, volSlider].forEach((el) => el.addEventListener("input", render));
  render();
}


// ---------------------------------------------------------------------------
// 26. LSTM — real one-step predictor trained via numerical BPTT on an AR(2)
// series with genuine 2-lag memory, so the learning curve is visibly clean.
// ---------------------------------------------------------------------------
const LSTM_DEMO_SEQ = (function () {
  const rnd = mulberry32(5);
  let x1 = 0, x2 = 0; const out = [x2, x1];
  for (let i = 2; i < 40; i++) { const xv = 0.5*x1 + 0.4*x2 + 0.3*gaussFrom(rnd); out.push(xv); x2 = x1; x1 = xv; }
  return out;
})();

function mountLstmDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="lstmDemoSvg"></svg>
        <p class="demo-note" style="margin-top:8px"><span style="color:var(--ink-faint)">●</span> ${LANG==="uk"?"справжній ряд":"actual series"} &nbsp; <span style="color:var(--mint)">●</span> ${LANG==="uk"?"прогноз LSTM":"LSTM prediction"}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"кроки навчання":"training steps"} <span class="val" id="lstmDemoStepsVal">300</span></label><input type="range" id="lstmDemoSteps" min="0" max="600" step="20" value="300"></div>
        </div>
        <div class="demo-steps" id="lstmDemoStepsPanel"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.lstmCallout}</p></div>
  `;

  const stepsSlider = panel.querySelector("#lstmDemoSteps");
  const svg = panel.querySelector("#lstmDemoSvg");

  function render() {
    const steps = parseInt(stepsSlider.value, 10);
    panel.querySelector("#lstmDemoStepsVal").textContent = steps;

    const { params, loss } = trainLstmCell(LSTM_DEMO_SEQ, steps, 0.3);
    const preds = lstmForward(params, LSTM_DEMO_SEQ);
    const actual = LSTM_DEMO_SEQ.slice(1);
    const allVals = actual.concat(preds);
    const yMin = Math.min(...allVals)-0.2, yMax = Math.max(...allVals)+0.2;
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: actual.length-1, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(1), xLabel: "t", yLabel: "x" });
    const actualPath = actual.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const predPath = preds.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    svg.innerHTML = axesSvg
      + `<path d="${actualPath}" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />`
      + `<path d="${predPath}" fill="none" stroke="var(--mint)" stroke-width="2" />`;

    const lines = [`${S.steps}`, `  ${LANG==="uk"?"дані: AR(2)-ряд зі справжньою 2-лаговою пам'яттю":"data: an AR(2) series with genuine 2-lag memory"}`, `  ${S.lstmLossLbl} = ${loss.toExponential(3)}`];
    panel.querySelector("#lstmDemoStepsPanel").textContent = lines.join("\n");
  }
  stepsSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 27. Transformer — real scaled dot-product self-attention on a toy sequence
// ---------------------------------------------------------------------------
function softmaxFn(arr) { const m = Math.max(...arr); const ex = arr.map((v)=>Math.exp(v-m)); const s = ex.reduce((a,b)=>a+b,0); return ex.map((v)=>v/s); }
function selfAttention(Q, K, V, scale) {
  const scores = Q.map((qi) => K.map((kj) => qi.reduce((s,v,d)=>s+v*kj[d],0)/scale));
  const weights = scores.map((row) => softmaxFn(row));
  const out = weights.map((row) => {
    const o = new Array(V[0].length).fill(0);
    row.forEach((w,j) => { V[j].forEach((v,d) => { o[d] += w*v; }); });
    return o;
  });
  return { weights, out };
}
const TRANSFORMER_TOKENS = ["price↑", "price↓", "price↑↑", "price flat"];
const TRANSFORMER_Q = [[1,0],[0,1],[1,1],[-1,0]];
const TRANSFORMER_V = [[1,0],[0,1],[0.5,0.5],[-1,-1]];

function mountTransformerDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const cellSize = 46, gridPad = 90;
  const n = TRANSFORMER_TOKENS.length;
  const W = gridPad + cellSize*n + 20, H = gridPad + cellSize*n + 20;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="attnSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.transformerScale} <span class="val" id="attnScaleVal">0.71</span></label><input type="range" id="attnScale" min="0.2" max="3" step="0.05" value="0.71"></div>
        </div>
        <div class="demo-steps" id="attnSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.transformerCallout}</p></div>
  `;

  const scaleSlider = panel.querySelector("#attnScale");
  const svg = panel.querySelector("#attnSvg");

  function render() {
    const invScale = parseFloat(scaleSlider.value);
    panel.querySelector("#attnScaleVal").textContent = invScale.toFixed(2);
    const scale = 1/invScale;

    const { weights } = selfAttention(TRANSFORMER_Q, TRANSFORMER_Q, TRANSFORMER_V, scale);

    let cells = "";
    for (let i = 0; i < n; i++) {
      cells += `<text x="${gridPad-8}" y="${gridPad+i*cellSize+cellSize/2+4}" text-anchor="end" font-family="var(--mono)" font-size="10" fill="var(--ink-soft)">${TRANSFORMER_TOKENS[i]}</text>`;
      cells += `<text x="${gridPad+i*cellSize+cellSize/2}" y="${gridPad-10}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--ink-soft)" transform="rotate(-30 ${gridPad+i*cellSize+cellSize/2} ${gridPad-10})">${TRANSFORMER_TOKENS[i]}</text>`;
      for (let j = 0; j < n; j++) {
        const w = weights[i][j];
        const cx = gridPad + j*cellSize, cy = gridPad + i*cellSize;
        cells += `<rect x="${cx}" y="${cy}" width="${cellSize-2}" height="${cellSize-2}" fill="var(--mint)" opacity="${w.toFixed(3)}" />`;
        cells += `<text x="${cx+cellSize/2-1}" y="${cy+cellSize/2+3}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="${w>0.4?'var(--bg)':'var(--ink-soft)'}">${w.toFixed(2)}</text>`;
      }
    }
    svg.innerHTML = cells;

    const lines = [`${S.steps}`, `  scores = Q·Kᵀ / √scale`, `  weights = softmax(scores)`, `  ${LANG==="uk"?"рядок 0 сума":"row 0 sum"} = ${weights[0].reduce((a,b)=>a+b,0).toFixed(4)} (${LANG==="uk"?"завжди 1":"always 1"})`];
    panel.querySelector("#attnSteps").textContent = lines.join("\n");
  }
  scaleSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 28. Variational Autoencoder — real ELBO gradient descent (beta-VAE)
// ---------------------------------------------------------------------------
function trainVae(steps, lr, betaKL, seed) {
  const rnd = mulberry32(seed);
  const dataMean = 3, dataStd = 1.5;
  let a=0.5,b=0,c=0,d=0,e=0.5,f=0;
  const batch = 8;
  for (let s = 0; s < steps; s++) {
    let ga=0,gb=0,gc=0,gd=0,ge=0,gf=0;
    for (let i = 0; i < batch; i++) {
      const xv = dataMean + dataStd*gaussFrom(rnd);
      const mu = a*xv+b, logvar = c*xv+d;
      const std = Math.exp(0.5*logvar);
      const epsv = gaussFrom(rnd);
      const z = mu + std*epsv;
      const xhat = e*z+f;
      const dRecon_dxhat = 2*(xhat-xv);
      ge += dRecon_dxhat*z; gf += dRecon_dxhat;
      const dRecon_dmu = dRecon_dxhat*e;
      const dRecon_dlogvar = dRecon_dxhat*e*0.5*std*epsv;
      const dKL_dmu = mu, dKL_dlogvar = 0.5*(Math.exp(logvar)-1);
      const dLoss_dmu = dRecon_dmu + betaKL*dKL_dmu;
      const dLoss_dlogvar = dRecon_dlogvar + betaKL*dKL_dlogvar;
      ga += dLoss_dmu*xv; gb += dLoss_dmu;
      gc += dLoss_dlogvar*xv; gd += dLoss_dlogvar;
    }
    a -= lr*ga/batch; b -= lr*gb/batch; c -= lr*gc/batch; d -= lr*gd/batch; e -= lr*ge/batch; f -= lr*gf/batch;
  }
  const testRnd = mulberry32(seed+1);
  const N = 300; const zs = []; let reconErr = 0;
  for (let i = 0; i < N; i++) {
    const xv = dataMean + dataStd*gaussFrom(testRnd);
    const mu = a*xv+b, logvar = c*xv+d, std = Math.exp(0.5*logvar);
    const z = mu + std*gaussFrom(testRnd);
    zs.push(z);
    reconErr += (e*z+f-xv)**2;
  }
  const latentMean = zs.reduce((s,v)=>s+v,0)/N;
  const latentVar = zs.reduce((s,v)=>s+(v-latentMean)**2,0)/N;
  return { a,b,c,d,e,f, reconErr: reconErr/N, latentMean, latentVar, zs };
}

function mountVaeDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="vaeSvg"></svg>
        <p class="demo-note" style="margin-top:8px"><span style="color:var(--ink-faint)">●</span> N(0,1) target &nbsp; <span style="color:var(--mint)">●</span> ${LANG==="uk"?"розподіл z":"z distribution"}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.vaeBeta} <span class="val" id="vaeBetaVal">0.30</span></label><input type="range" id="vaeBeta" min="0.001" max="2" step="0.01" value="0.30"></div>
        </div>
        <div class="demo-steps" id="vaeSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.vaeCallout}</p></div>
  `;

  const betaSlider = panel.querySelector("#vaeBeta");
  const svg = panel.querySelector("#vaeSvg");

  function render() {
    const betaKL = parseFloat(betaSlider.value);
    panel.querySelector("#vaeBetaVal").textContent = betaKL.toFixed(2);

    const { reconErr, latentMean, latentVar, zs } = trainVae(250, 0.015, betaKL, 5);

    const xMin = -6, xMax = 8;
    const nBins = 35;
    const counts = new Array(nBins).fill(0);
    for (const v of zs) { const bi = Math.min(nBins-1, Math.max(0, Math.floor((v-xMin)/(xMax-xMin)*nBins))); counts[bi]++; }
    const maxCount = Math.max(...counts, 1);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin: 0, yMax: maxCount, xTicks: 5, yTicks: 0, xFmt: (v)=>v.toFixed(0), yFmt: ()=>"", xLabel: "z" });
    let bars = "";
    for (let i = 0; i < nBins; i++) {
      const bx = xMin + (i/nBins)*(xMax-xMin);
      const h = (counts[i]/maxCount)*(H-2*PAD);
      bars += `<rect x="${x(bx).toFixed(1)}" y="${(H-PAD-h).toFixed(1)}" width="${((x(bx+(xMax-xMin)/nBins)-x(bx))-1).toFixed(1)}" height="${h.toFixed(1)}" fill="var(--mint)" opacity="0.8" />`;
    }
    // overlay standard normal target curve (scaled to same peak height for visual comparison)
    const nPts=80; const stdCurve=[];
    for (let i=0;i<nPts;i++){ const xv=xMin+(i/(nPts-1))*(xMax-xMin); stdCurve.push(normPDF(xv)); }
    const maxStd = Math.max(...stdCurve);
    const stdPath = stdCurve.map((v,i)=>`${i===0?"M":"L"} ${x(xMin+(i/(nPts-1))*(xMax-xMin)).toFixed(1)} ${(H-PAD-(v/maxStd)*(H-2*PAD)*0.9).toFixed(1)}`).join(" ");
    svg.innerHTML = axesSvg + bars + `<path d="${stdPath}" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />`;

    const lines = [`${S.steps}`, `  ${S.vaeRecon} = ${reconErr.toFixed(3)}`, `  ${S.vaeLatentStats}: mean=${latentMean.toFixed(2)}  var=${latentVar.toFixed(2)}`, `  (${LANG==="uk"?"мета: mean→0, var→1":"target: mean→0, var→1"})`];
    panel.querySelector("#vaeSteps").textContent = lines.join("\n");
  }
  betaSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 29. Graph Neural Network — real GCN message-passing
// ---------------------------------------------------------------------------
function gcnLayer(Ahat, H, Wm) {
  const AH = Ahat.map((row) => { const out = new Array(H[0].length).fill(0); row.forEach((a,j) => { H[j].forEach((h,d) => { out[d] += a*h; }); }); return out; });
  const AHW = AH.map((row) => Wm[0].map((_,c2) => row.reduce((s,v,r)=>s+v*Wm[r][c2],0)));
  return AHW.map((row) => row.map((v) => Math.max(0,v)));
}
function normalizeAdjGnn(A) {
  const n = A.length;
  const Aself = A.map((row,i) => row.map((v,j) => v+(i===j?1:0)));
  const deg = Aself.map((row) => row.reduce((a,b)=>a+b,0));
  return Aself.map((row,i) => row.map((v,j) => v/Math.sqrt(deg[i]*deg[j])));
}
const GNN_ADJ = [[0,1,1,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[0,0,0,0,1,0],[0,0,0,1,0,1],[0,0,0,0,1,0]];
const GNN_POS = [[170,150],[80,90],[80,210],[280,90],[280,150],[280,210]];
const GNN_H0 = [[1,0],[0.9,0.1],[0.8,0.2],[0,1],[0.1,0.9],[0.2,0.8]];
const GNN_AHAT = normalizeAdjGnn(GNN_ADJ);
const GNN_W = [[1,0],[0,1]];

function mountGnnDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="gnnSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.gnnLayers} <span class="val" id="gnnLayersVal">1</span></label><input type="range" id="gnnLayers" min="0" max="4" step="1" value="1"></div>
        </div>
        <div class="demo-steps" id="gnnSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.gnnCallout}</p></div>
  `;

  const layersSlider = panel.querySelector("#gnnLayers");
  const svg = panel.querySelector("#gnnSvg");

  function render() {
    const nLayers = parseInt(layersSlider.value, 10);
    panel.querySelector("#gnnLayersVal").textContent = nLayers;

    let H_cur = GNN_H0;
    for (let l = 0; l < nLayers; l++) H_cur = gcnLayer(GNN_AHAT, H_cur, GNN_W);

    let edges = "";
    for (let i = 0; i < GNN_ADJ.length; i++) for (let j = i+1; j < GNN_ADJ.length; j++) {
      if (GNN_ADJ[i][j]) edges += `<line x1="${GNN_POS[i][0]}" y1="${GNN_POS[i][1]}" x2="${GNN_POS[j][0]}" y2="${GNN_POS[j][1]}" stroke="var(--rule)" stroke-width="1.5" />`;
    }
    const nodes = GNN_POS.map((p,i) => {
      const feat = H_cur[i];
      const t2 = Math.max(0, Math.min(1, feat[1]/(feat[0]+feat[1]+1e-6)));
      const col = `color-mix(in srgb, var(--mint) ${Math.round((1-t2)*100)}%, var(--level-2))`;
      return `<circle cx="${p[0]}" cy="${p[1]}" r="16" fill="${col}" opacity="0.85" />`;
    }).join("");
    svg.innerHTML = edges + nodes;

    const lines = [`${S.steps}`, `  H' = ReLU(Â·H·W)`, `  ${LANG==="uk"?"ознаки вузлів":"node features"}:`, H_cur.map((f,i)=>`  [${i}]: (${f[0].toFixed(2)}, ${f[1].toFixed(2)})`).join("\n")];
    panel.querySelector("#gnnSteps").textContent = lines.join("\n");
  }
  layersSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 30. Q-Learning — real tabular RL on a mean-reverting trading environment
// ---------------------------------------------------------------------------
function qlearningEnvStep(state, rnd) {
  let nextRet;
  if (state === 2) nextRet = gaussFrom(rnd)*0.01 - 0.003;
  else if (state === 0) nextRet = gaussFrom(rnd)*0.01 + 0.003;
  else nextRet = gaussFrom(rnd)*0.01;
  const nextState = nextRet > 0.002 ? 2 : nextRet < -0.002 ? 0 : 1;
  return { nextRet, nextState };
}
function trainQLearning(episodes, alpha, gammaV, epsilon, rnd) {
  const nStates = 3, nActions = 3;
  let Q = Array.from({length:nStates}, () => new Array(nActions).fill(0));
  const positionMap = [-1,0,1];
  for (let ep = 0; ep < episodes; ep++) {
    let state = 1;
    for (let t = 0; t < 20; t++) {
      let action;
      if (rnd() < epsilon) action = Math.floor(rnd()*nActions);
      else action = Q[state].indexOf(Math.max(...Q[state]));
      const { nextRet, nextState } = qlearningEnvStep(state, rnd);
      const reward = positionMap[action]*nextRet;
      Q[state][action] += alpha*(reward + gammaV*Math.max(...Q[nextState]) - Q[state][action]);
      state = nextState;
    }
  }
  return Q;
}

function mountQlearningDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 220, PAD = 30;
  const stateLabels = LANG==="uk" ? ["впало","стабільно","зросло"] : ["fell","flat","rose"];
  const actionLabels = LANG==="uk" ? ["продати","тримати","купити"] : ["sell","hold","buy"];

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="qlSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.qlearningEpisodes} <span class="val" id="qlEpVal">400</span></label><input type="range" id="qlEp" min="0" max="1000" step="20" value="400"></div>
        </div>
        <div class="demo-steps" id="qlSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.qlearningCallout}</p></div>
  `;

  const epSlider = panel.querySelector("#qlEp");
  const svg = panel.querySelector("#qlSvg");
  const cellW = 70, cellH = 40;

  function render() {
    const episodes = parseInt(epSlider.value, 10);
    panel.querySelector("#qlEpVal").textContent = episodes;

    const rnd = mulberry32(3);
    const Q = trainQLearning(episodes, 0.1, 0.9, 0.2, rnd);
    const flat = Q.flat();
    const maxQ = Math.max(...flat.map(Math.abs), 1e-6);

    let cells = "";
    for (let s = 0; s < 3; s++) {
      cells += `<text x="${PAD-6}" y="${PAD+s*cellH+cellH/2+4}" text-anchor="end" font-family="var(--mono)" font-size="10" fill="var(--ink-soft)">${stateLabels[s]}</text>`;
      for (let a = 0; a < 3; a++) {
        const v = Q[s][a];
        const t2 = (v/maxQ+1)/2;
        const col = t2>0.5 ? `color-mix(in srgb, var(--mint) ${Math.round((t2-0.5)*200)}%, var(--card))` : `color-mix(in srgb, var(--level-3) ${Math.round((0.5-t2)*200)}%, var(--card))`;
        const cx = PAD+40+a*cellW, cy = PAD+s*cellH;
        const isBest = Q[s].indexOf(Math.max(...Q[s])) === a;
        cells += `<rect x="${cx}" y="${cy}" width="${cellW-4}" height="${cellH-4}" fill="${col}" stroke="${isBest?'var(--level-2)':'var(--rule)'}" stroke-width="${isBest?2:1}" />`;
        cells += `<text x="${cx+(cellW-4)/2}" y="${cy+(cellH-4)/2+4}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--ink)">${v.toFixed(3)}</text>`;
      }
    }
    for (let a=0;a<3;a++) cells += `<text x="${PAD+40+a*cellW+(cellW-4)/2}" y="${PAD-8}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--ink-soft)">${actionLabels[a]}</text>`;
    svg.innerHTML = cells;

    const policy = Q.map((row) => actionLabels[row.indexOf(Math.max(...row))]);
    const lines = [`${S.steps}`, `  Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') − Q(s,a)]`, `  ${S.qlearningPolicy}:`, `  ${stateLabels[0]}→${policy[0]}   ${stateLabels[1]}→${policy[1]}   ${stateLabels[2]}→${policy[2]}`];
    panel.querySelector("#qlSteps").textContent = lines.join("\n");
  }
  epSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 31. Lexicon-based sentiment scoring
// ---------------------------------------------------------------------------
const SENTIMENT_LEXICON = {
  surge:2, growth:2, beat:2, strong:1, record:2, gain:1, rally:2, upgrade:1, profit:1, outperform:2,
  miss:-2, decline:-2, weak:-1, loss:-2, crash:-3, downgrade:-1, plunge:-3, warning:-1, cut:-1, layoffs:-2,
};
const SENTIMENT_HEADLINES = [
  "Company reports record growth and strong beat on earnings",
  "Stock plunges after profit warning and downgrade",
  "Shares rally on unexpected gain despite market decline",
  "Firm announces layoffs amid weak outlook and cut guidance",
];
function scoreSentiment(text) {
  const words = text.toLowerCase().split(/\W+/);
  let score = 0, hits = 0;
  const matched = [];
  for (const w of words) if (SENTIMENT_LEXICON[w] !== undefined) { score += SENTIMENT_LEXICON[w]; hits++; matched.push([w,SENTIMENT_LEXICON[w]]); }
  return { score, hits, matched };
}

function mountSentimentDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 220, PAD = 30;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="sentSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"заголовок":"headline"} <span class="val" id="sentIdxVal">1</span></label><input type="range" id="sentIdx" min="0" max="${SENTIMENT_HEADLINES.length-1}" step="1" value="0"></div>
        </div>
        <div class="demo-steps" id="sentSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.sentimentCallout}</p></div>
  `;

  const idxSlider = panel.querySelector("#sentIdx");
  const svg = panel.querySelector("#sentSvg");

  function render() {
    const idx = parseInt(idxSlider.value, 10);
    panel.querySelector("#sentIdxVal").textContent = idx+1;
    const headline = SENTIMENT_HEADLINES[idx];
    const { score, hits, matched } = scoreSentiment(headline);

    const words = headline.split(/\s+/);
    const xStep = (W-2*PAD)/words.length;
    let cells = "";
    words.forEach((w, i) => {
      const clean = w.toLowerCase().replace(/[^a-z]/g,"");
      const val = SENTIMENT_LEXICON[clean];
      const col = val === undefined ? "var(--card-border)" : val > 0 ? "var(--mint)" : "var(--level-3)";
      cells += `<rect x="${PAD+i*xStep}" y="${H/2-18}" width="${xStep-4}" height="36" fill="${col}" opacity="${val===undefined?0.15:0.7}" rx="4" />`;
      cells += `<text x="${PAD+i*xStep+(xStep-4)/2}" y="${H/2+4}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--ink)">${w}</text>`;
    });
    svg.innerHTML = cells;

    const lines = [`${S.steps}`, `  "${headline}"`, `  ${S.sentimentScore} = ${score >= 0 ? "+" : ""}${score}`, `  ${S.sentimentHits}: ${hits} (${matched.map(([w,v])=>`${w}:${v>0?"+":""}${v}`).join(", ")})`];
    panel.querySelector("#sentSteps").textContent = lines.join("\n");
  }
  idxSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 32. SHAP — exact Shapley values via full coalition enumeration
// ---------------------------------------------------------------------------
function shapModelPredict(features, w, bv) { return w.reduce((s,wi,i)=>s+wi*features[i],0)+bv; }
function powersetIdx(arr) { return arr.reduce((subsets,v)=>subsets.concat(subsets.map((s)=>[...s,v])), [[]]); }
function factorialFn(k) { return k<=1 ? 1 : k*factorialFn(k-1); }
function shapleyValues(features, baseline, w, bv) {
  const n = features.length;
  const shap = new Array(n).fill(0);
  const idx = Array.from({length:n}, (_,i)=>i);
  const allSubsets = powersetIdx(idx);
  for (let i = 0; i < n; i++) {
    let total = 0;
    for (const Sset of allSubsets) {
      if (Sset.includes(i)) continue;
      function valueOf(subset) { const vec = features.map((fv,j)=>subset.includes(j)?fv:baseline[j]); return shapModelPredict(vec,w,bv); }
      const marginal = valueOf([...Sset,i]) - valueOf(Sset);
      const weight = factorialFn(Sset.length)*factorialFn(n-Sset.length-1)/factorialFn(n);
      total += weight*marginal;
    }
    shap[i] = total;
  }
  return shap;
}
const SHAP_W = [0.5,-0.3,0.8,0.2], SHAP_B = 0.1, SHAP_BASELINE = [0,0,0,0];
const SHAP_FEATURE_NAMES = ["debt/equity","liquidity","growth","volatility"];

function mountShapDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 220, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="shapSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${SHAP_FEATURE_NAMES[0]} <span class="val" id="shapF0Val">2.0</span></label><input type="range" id="shapF0" min="-3" max="3" step="0.1" value="2.0"></div>
          <div class="demo-slider-row"><label>${SHAP_FEATURE_NAMES[1]} <span class="val" id="shapF1Val">1.0</span></label><input type="range" id="shapF1" min="-3" max="3" step="0.1" value="1.0"></div>
          <div class="demo-slider-row"><label>${SHAP_FEATURE_NAMES[2]} <span class="val" id="shapF2Val">3.0</span></label><input type="range" id="shapF2" min="-3" max="3" step="0.1" value="3.0"></div>
          <div class="demo-slider-row"><label>${SHAP_FEATURE_NAMES[3]} <span class="val" id="shapF3Val">0.5</span></label><input type="range" id="shapF3" min="-3" max="3" step="0.1" value="0.5"></div>
        </div>
        <div class="demo-steps" id="shapSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.shapCallout}</p></div>
  `;

  const els = [0,1,2,3].map((i) => panel.querySelector("#shapF"+i));
  const svg = panel.querySelector("#shapSvg");

  function render() {
    const features = els.map((el) => parseFloat(el.value));
    features.forEach((v,i) => { panel.querySelector(`#shapF${i}Val`).textContent = v.toFixed(1); });

    const shap = shapleyValues(features, SHAP_BASELINE, SHAP_W, SHAP_B);
    const maxAbs = Math.max(...shap.map(Math.abs), 0.1);
    const barH = 30, gap = 12;
    const midX = W/2;
    let bars = "";
    shap.forEach((v,i) => {
      const yTop = PAD + i*(barH+gap);
      const bw = (Math.abs(v)/maxAbs)*(W/2-PAD-20);
      const xStart = v >= 0 ? midX : midX - bw;
      bars += `<rect x="${xStart.toFixed(1)}" y="${yTop}" width="${bw.toFixed(1)}" height="${barH}" fill="${v>=0?'var(--mint)':'var(--level-3)'}" opacity="0.85" />`;
      bars += `<text x="${midX < xStart ? xStart-4 : xStart+bw+4}" y="${yTop+barH/2+4}" text-anchor="${v>=0?'start':'end'}" font-family="var(--mono)" font-size="10" fill="var(--ink)">${v.toFixed(2)}</text>`;
      bars += `<text x="10" y="${yTop+barH/2+4}" font-family="var(--mono)" font-size="10" fill="var(--ink-soft)">${SHAP_FEATURE_NAMES[i]}</text>`;
    });
    bars += `<line x1="${midX}" y1="${PAD-10}" x2="${midX}" y2="${PAD+4*(barH+gap)}" stroke="var(--rule)" stroke-width="1" />`;
    svg.innerHTML = bars;

    const predFull = shapModelPredict(features, SHAP_W, SHAP_B);
    const predBaseline = shapModelPredict(SHAP_BASELINE, SHAP_W, SHAP_B);
    const sumShap = shap.reduce((a,b)=>a+b,0);
    const lines = [`${S.steps}`, `  ${S.shapSum} = ${sumShap.toFixed(4)}`, `  f(x)-f(baseline) = ${(predFull-predBaseline).toFixed(4)}`, `  ${S.shapCheck} ✓`];
    panel.querySelector("#shapSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 33. Walk-Forward Split
// ---------------------------------------------------------------------------
function walkForwardSplits(n, trainSize, testSize, step) {
  const splits = [];
  let start = 0;
  while (start+trainSize+testSize <= n) {
    splits.push({ trainStart:start, trainEnd:start+trainSize, testStart:start+trainSize, testEnd:start+trainSize+testSize });
    start += step;
  }
  return splits;
}

function mountWalkForwardDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 220, PAD = 40;
  const N = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="wfSvg"></svg>
        <p class="demo-note" style="margin-top:8px"><span style="color:var(--mint)">■</span> ${S.wfTrain} &nbsp; <span style="color:var(--level-2)">■</span> ${S.wfTest}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"розмір train":"train size"} <span class="val" id="wfTrainVal">15</span></label><input type="range" id="wfTrain" min="5" max="25" step="1" value="15"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"розмір test":"test size"} <span class="val" id="wfTestVal">5</span></label><input type="range" id="wfTest" min="2" max="10" step="1" value="5"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"крок":"step"} <span class="val" id="wfStepVal">5</span></label><input type="range" id="wfStep" min="1" max="10" step="1" value="5"></div>
        </div>
        <div class="demo-steps" id="wfSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.wfCallout}</p></div>
  `;

  const els = ["wfTrain","wfTest","wfStep"].map((id) => panel.querySelector("#"+id));
  const svg = panel.querySelector("#wfSvg");

  function render() {
    const [trainSize, testSize, step] = els.map((el) => parseInt(el.value,10));
    panel.querySelector("#wfTrainVal").textContent = trainSize;
    panel.querySelector("#wfTestVal").textContent = testSize;
    panel.querySelector("#wfStepVal").textContent = step;

    const splits = walkForwardSplits(N, trainSize, testSize, step);
    const rowH = 18, rowGap = 4;
    const xScale = (W-2*PAD)/N;
    let bars = "";
    splits.forEach((sp, i) => {
      const yy = PAD + i*(rowH+rowGap);
      bars += `<rect x="${PAD+sp.trainStart*xScale}" y="${yy}" width="${(sp.trainEnd-sp.trainStart)*xScale}" height="${rowH}" fill="var(--mint)" opacity="0.75" />`;
      bars += `<rect x="${PAD+sp.testStart*xScale}" y="${yy}" width="${(sp.testEnd-sp.testStart)*xScale}" height="${rowH}" fill="var(--level-2)" opacity="0.85" />`;
      bars += `<text x="${PAD-6}" y="${yy+rowH/2+4}" text-anchor="end" font-family="var(--mono)" font-size="9" fill="var(--ink-faint)">${i+1}</text>`;
    });
    const axisY = PAD + splits.length*(rowH+rowGap) + 10;
    bars += `<line x1="${PAD}" y1="${axisY}" x2="${PAD+N*xScale}" y2="${axisY}" stroke="var(--ink-faint)" stroke-width="1" />`;
    for (let t = 0; t <= N; t += 10) bars += `<text x="${PAD+t*xScale}" y="${axisY+14}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--ink-faint)">${t}</text>`;
    svg.innerHTML = bars;

    const lines = [`${S.steps}`, `  ${splits.length} ${S.wfFold}${splits.length===1?"":LANG==="uk"?"и":"s"}`];
    panel.querySelector("#wfSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 34. Benford's Law digit analysis
// ---------------------------------------------------------------------------
function leadingDigit(xv) { xv = Math.abs(xv); while (xv >= 10) xv /= 10; while (xv < 1 && xv > 0) xv *= 10; return Math.floor(xv); }
function benfordExpected(d) { return Math.log10(1+1/d); }
const BENFORD_REAL = (function () {
  const rnd = mulberry32(50); const out = [];
  for (let i = 0; i < 500; i++) { let v = 1; for (let k = 0; k < 8; k++) v *= (0.5+rnd()*1.5); out.push(v*1000); }
  return out;
})();
const BENFORD_FAKE = (function () {
  const rnd = mulberry32(51); const out = [];
  for (let i = 0; i < 500; i++) out.push(100+rnd()*9900);
  return out;
})();
function digitHistogram(data) { const counts = new Array(10).fill(0); for (const v of data) counts[leadingDigit(v)]++; return counts.map((c)=>c/data.length); }

function mountBenfordDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="benSvg"></svg>
        <p class="demo-note" style="margin-top:8px"><span style="color:var(--mint)">■</span> ${S.benfordReal} / ${S.benfordFake} &nbsp; <span style="color:var(--ink-faint)">●</span> ${S.benfordExpected}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row">
            <label style="justify-content:flex-start;gap:10px"><input type="radio" name="benMode" id="benReal" value="real" checked style="width:auto"> ${S.benfordReal}</label>
          </div>
          <div class="demo-slider-row">
            <label style="justify-content:flex-start;gap:10px"><input type="radio" name="benMode" id="benFake" value="fake" style="width:auto"> ${S.benfordFake}</label>
          </div>
        </div>
        <div class="demo-steps" id="benSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.benfordCallout}</p></div>
  `;

  const realRadio = panel.querySelector("#benReal"), fakeRadio = panel.querySelector("#benFake");
  const svg = panel.querySelector("#benSvg");

  function render() {
    const useReal = realRadio.checked;
    const hist = digitHistogram(useReal ? BENFORD_REAL : BENFORD_FAKE);
    const expected = Array.from({length:9}, (_,i) => benfordExpected(i+1));

    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0.5, xMax: 9.5, yMin: 0, yMax: 0.35, xTicks: 9, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>(v*100).toFixed(0)+"%", xLabel: LANG==="uk"?"перша цифра":"leading digit", yLabel: LANG==="uk"?"частка":"frequency" });
    let bars = "";
    for (let d = 1; d <= 9; d++) {
      const bw = 0.5;
      bars += `<rect x="${(x(d-bw/2)).toFixed(1)}" y="${y(hist[d]).toFixed(1)}" width="${(x(d+bw/2)-x(d-bw/2)).toFixed(1)}" height="${(H-PAD-y(hist[d])).toFixed(1)}" fill="var(--mint)" opacity="0.8" />`;
    }
    const expectedPath = expected.map((v,i)=>`${i===0?"M":"L"} ${x(i+1).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const expectedDots = expected.map((v,i)=>`<circle cx="${x(i+1).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="var(--ink-faint)" />`).join("");
    svg.innerHTML = axesSvg + bars + `<path d="${expectedPath}" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />` + expectedDots;

    let chi2 = 0;
    for (let d = 1; d <= 9; d++) chi2 += ((hist[d]-expected[d-1])**2)/expected[d-1];
    const lines = [`${S.steps}`, `  P(d) = log₁₀(1 + 1/d)`, `  χ² ${LANG==="uk"?"відхилення від закону Бенфорда":"deviation from Benford"} = ${chi2.toFixed(3)}`];
    panel.querySelector("#benSteps").textContent = lines.join("\n");
  }
  [realRadio, fakeRadio].forEach((el) => el.addEventListener("change", render));
  render();
}

// ---------------------------------------------------------------------------
// 35. Technical Indicators (RSI, Bollinger Bands)
// ---------------------------------------------------------------------------
function smaCalc(arr, period, i) { if (i<period-1) return null; let s=0; for(let k=0;k<period;k++) s+=arr[i-k]; return s/period; }
function stdDevCalc(arr, period, i, mean) { if (i<period-1) return null; let s=0; for(let k=0;k<period;k++) s+=(arr[i-k]-mean)**2; return Math.sqrt(s/period); }
function rsiCalc(prices, period) {
  const out = new Array(prices.length).fill(null);
  for (let i = period; i < prices.length; i++) {
    let gains = 0, losses = 0;
    for (let k = i-period+1; k <= i; k++) { const diff = prices[k]-prices[k-1]; if (diff>0) gains+=diff; else losses-=diff; }
    const avgGain = gains/period, avgLoss = losses/period;
    const rs = avgLoss===0 ? 100 : avgGain/avgLoss;
    out[i] = 100 - 100/(1+rs);
  }
  return out;
}
const TECH_PRICE = (function () {
  const rnd = mulberry32(60);
  let price = [100];
  for (let i = 0; i < 60; i++) price.push(price[price.length-1]*(1+gaussFrom(rnd)*0.018));
  return price;
})();

function mountTechDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 300, PAD = 34;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="techSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"період Боллінджера":"Bollinger period"} <span class="val" id="techBollPVal">20</span></label><input type="range" id="techBollP" min="10" max="30" step="1" value="20"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"множник σ":"σ multiplier"} <span class="val" id="techBollKVal">2.0</span></label><input type="range" id="techBollK" min="1" max="3" step="0.1" value="2.0"></div>
          <div class="demo-slider-row"><label>${S.techRsiLbl} ${LANG==="uk"?"період":"period"} <span class="val" id="techRsiPVal">14</span></label><input type="range" id="techRsiP" min="5" max="21" step="1" value="14"></div>
        </div>
        <div class="demo-steps" id="techSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.techCallout}</p></div>
  `;

  const els = ["techBollP","techBollK","techRsiP"].map((id) => panel.querySelector("#"+id));
  const svg = panel.querySelector("#techSvg");

  function render() {
    const [bollPeriod, bollK, rsiPeriod] = [parseInt(els[0].value,10), parseFloat(els[1].value), parseInt(els[2].value,10)];
    panel.querySelector("#techBollPVal").textContent = bollPeriod;
    panel.querySelector("#techBollKVal").textContent = bollK.toFixed(1);
    panel.querySelector("#techRsiPVal").textContent = rsiPeriod;

    const upper = [], lower = [], mid = [];
    for (let i = 0; i < TECH_PRICE.length; i++) {
      const m = smaCalc(TECH_PRICE, bollPeriod, i);
      const sd = m!==null ? stdDevCalc(TECH_PRICE, bollPeriod, i, m) : null;
      mid.push(m); upper.push(m!==null ? m+bollK*sd : null); lower.push(m!==null ? m-bollK*sd : null);
    }
    const rsiVals = rsiCalc(TECH_PRICE, rsiPeriod);

    const priceH = H*0.62, rsiH = H*0.28, gap = H*0.1;
    const yMinP = Math.min(...TECH_PRICE)*0.95, yMaxP = Math.max(...TECH_PRICE)*1.05;
    const { x, y } = axesSVG({ W, H: priceH+PAD, pad: PAD, xMin: 0, xMax: TECH_PRICE.length-1, yMin: yMinP, yMax: yMaxP, xTicks: 1, yTicks: 1, xFmt: ()=>"", yFmt: ()=>"" });
    const { svg: axesSvgPrice } = axesSVG({ W, H: priceH, pad: PAD, xMin: 0, xMax: TECH_PRICE.length-1, yMin: yMinP, yMax: yMaxP, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(0), yLabel: "price" });

    function pathOf(arr, yFn) { let d=""; let started=false; arr.forEach((v,i)=>{ if(v===null){started=false;return;} d+= (started?"L":"M")+` ${x(i).toFixed(1)} ${yFn(v).toFixed(1)} `; started=true; }); return d; }
    const pricePath = pathOf(TECH_PRICE, y);
    const upperPath = pathOf(upper, y);
    const lowerPath = pathOf(lower, y);
    const midPath = pathOf(mid, y);

    const rsiYmin=0, rsiYmax=100;
    const rsiY = (v) => priceH + gap + rsiH - ((v-rsiYmin)/(rsiYmax-rsiYmin))*rsiH;
    const rsiPath = pathOf(rsiVals, rsiY);
    const rsi30 = rsiY(30), rsi70 = rsiY(70);

    svg.innerHTML = `<svg viewBox="0 0 ${W} ${H}">` + axesSvgPrice
      + `<path d="${upperPath}" fill="none" stroke="var(--level-2)" stroke-width="1" stroke-dasharray="3 2" />`
      + `<path d="${lowerPath}" fill="none" stroke="var(--level-2)" stroke-width="1" stroke-dasharray="3 2" />`
      + `<path d="${midPath}" fill="none" stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="2 2" />`
      + `<path d="${pricePath}" fill="none" stroke="var(--mint)" stroke-width="2" />`
      + `<line x1="${PAD}" y1="${rsi30.toFixed(1)}" x2="${W-PAD}" y2="${rsi30.toFixed(1)}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="2 2" />`
      + `<line x1="${PAD}" y1="${rsi70.toFixed(1)}" x2="${W-PAD}" y2="${rsi70.toFixed(1)}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="2 2" />`
      + `<text x="${W-PAD}" y="${rsi70.toFixed(1)-3}" text-anchor="end" class="axis-tick">70</text>`
      + `<text x="${W-PAD}" y="${rsi30.toFixed(1)-3}" text-anchor="end" class="axis-tick">30</text>`
      + `<path d="${rsiPath}" fill="none" stroke="var(--level-3)" stroke-width="1.5" />`
      + `</svg>`;

    const lastRsi = rsiVals[rsiVals.length-1];
    const lines = [`${S.steps}`, `  RSI = 100 − 100/(1+avgGain/avgLoss)`, `  ${LANG==="uk"?"поточний RSI":"current RSI"} = ${lastRsi?lastRsi.toFixed(1):"—"}`, `  ${LANG==="uk"?"смуги Боллінджера":"Bollinger"}: mid=${mid[mid.length-1]?.toFixed(2)} upper=${upper[upper.length-1]?.toFixed(2)} lower=${lower[lower.length-1]?.toFixed(2)}`];
    panel.querySelector("#techSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}


// ---------------------------------------------------------------------------
// 36. ARIMA / ARMA — real AR(p) fit via least squares + forecast
// ---------------------------------------------------------------------------
function fitAR(series, p) {
  const n = series.length;
  const X = [], yv = [];
  for (let t = p; t < n; t++) { X.push(series.slice(t-p,t).reverse()); yv.push(series[t]); }
  const XtX = Array.from({length:p}, () => new Array(p).fill(0));
  const Xty = new Array(p).fill(0);
  for (let i = 0; i < X.length; i++) {
    for (let a = 0; a < p; a++) {
      Xty[a] += X[i][a]*yv[i];
      for (let b = 0; b < p; b++) XtX[a][b] += X[i][a]*X[i][b];
    }
  }
  function solve(A, bv) {
    const n2 = A.length;
    const M = A.map((row,i) => row.concat([bv[i]]));
    for (let i = 0; i < n2; i++) {
      let piv = M[i][i]; if (Math.abs(piv)<1e-9) piv=1e-9;
      for (let j = 0; j <= n2; j++) M[i][j] /= piv;
      for (let k = 0; k < n2; k++) { if (k===i) continue; const f=M[k][i]; for (let j=0;j<=n2;j++) M[k][j]-=f*M[i][j]; }
    }
    return M.map((row) => row[n2]);
  }
  const coefs = solve(XtX, Xty);
  function forecast(history, steps) {
    const h = history.slice();
    const preds = [];
    for (let s = 0; s < steps; s++) {
      const window = h.slice(-p).reverse();
      const pred = coefs.reduce((sum,c,i)=>sum+c*window[i],0);
      preds.push(pred); h.push(pred);
    }
    return preds;
  }
  return { coefs, forecast };
}
const ARIMA_SERIES = (function () {
  const rnd = mulberry32(5);
  let x1=0,x2=0; const out=[x2,x1];
  for (let i=2;i<45;i++) { const xv=0.5*x1+0.3*x2+0.3*gaussFrom(rnd); out.push(xv); x2=x1; x1=xv; }
  return out;
})();

function mountArimaDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="arimaSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>p (${LANG==="uk"?"порядок AR":"AR order"}) <span class="val" id="arimaPVal">2</span></label><input type="range" id="arimaP" min="1" max="5" step="1" value="2"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"кроків прогнозу":"forecast steps"} <span class="val" id="arimaHVal">5</span></label><input type="range" id="arimaH" min="1" max="15" step="1" value="5"></div>
        </div>
        <div class="demo-steps" id="arimaSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.arimaCallout}</p></div>
  `;

  const pSlider = panel.querySelector("#arimaP"), hSlider = panel.querySelector("#arimaH");
  const svg = panel.querySelector("#arimaSvg");

  function render() {
    const p = parseInt(pSlider.value, 10), hSteps = parseInt(hSlider.value, 10);
    panel.querySelector("#arimaPVal").textContent = p;
    panel.querySelector("#arimaHVal").textContent = hSteps;

    const { coefs, forecast } = fitAR(ARIMA_SERIES, p);
    const preds = forecast(ARIMA_SERIES, hSteps);
    const full = ARIMA_SERIES.concat(preds);
    const yMin = Math.min(...full)-0.2, yMax = Math.max(...full)+0.2;
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: full.length-1, yMin, yMax, xTicks: 5, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(1), xLabel: "t", yLabel: "x" });
    const histPath = ARIMA_SERIES.map((v,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const fcPath = preds.map((v,i)=>`${i===0?"M":"L"} ${x(ARIMA_SERIES.length-1+i+1).toFixed(1)} ${y(v).toFixed(1)}`).join(" ") ;
    const bridge = `M ${x(ARIMA_SERIES.length-1).toFixed(1)} ${y(ARIMA_SERIES[ARIMA_SERIES.length-1]).toFixed(1)} L ${x(ARIMA_SERIES.length).toFixed(1)} ${y(preds[0]).toFixed(1)}`;
    svg.innerHTML = axesSvg + `<path d="${histPath}" fill="none" stroke="var(--mint)" stroke-width="2" />` + `<path d="${bridge} ${fcPath.replace(/^M/,'L')}" fill="none" stroke="var(--level-2)" stroke-width="2" stroke-dasharray="4 3" />`;

    const lines = [`${S.steps}`, `  ${LANG==="uk"?"підігнані коефіцієнти":"fitted coefficients"}: [${coefs.map((c)=>c.toFixed(3)).join(", ")}]`, `  ${S.arimaForecast}: [${preds.slice(0,5).map((v)=>v.toFixed(3)).join(", ")}${preds.length>5?"...":""}]`];
    panel.querySelector("#arimaSteps").textContent = lines.join("\n");
  }
  [pSlider, hSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 37. Conditional VaR / Expected Shortfall (historical)
// ---------------------------------------------------------------------------
function historicalES(returns, confidence) {
  const sorted = returns.slice().sort((a,b)=>a-b);
  const cutoffIdx = Math.max(1, Math.floor((1-confidence)*sorted.length));
  const tail = sorted.slice(0, cutoffIdx);
  const es = -tail.reduce((a,b)=>a+b,0)/tail.length;
  const varVal = -sorted[Math.max(0,cutoffIdx-1)];
  return { es, varVal, tail, sorted };
}
const ES_RETURNS = (function () {
  const rnd = mulberry32(99);
  const out = []; for (let i=0;i<1000;i++) out.push(gaussFrom(rnd)*0.02);
  return out;
})();

function mountEsDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="esSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"довірчий рівень":"confidence level"} <span class="val" id="esConfVal">95%</span></label><input type="range" id="esConf" min="90" max="99.5" step="0.5" value="95"></div>
        </div>
        <div class="demo-steps" id="esSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.esCallout}</p></div>
  `;

  const confSlider = panel.querySelector("#esConf");
  const svg = panel.querySelector("#esSvg");

  function render() {
    const conf = parseFloat(confSlider.value)/100;
    panel.querySelector("#esConfVal").textContent = (conf*100).toFixed(1)+"%";

    const { es, varVal, sorted } = historicalES(ES_RETURNS, conf);
    const nBins = 40;
    const xMin = Math.min(...sorted), xMax = Math.max(...sorted);
    const counts = new Array(nBins).fill(0);
    for (const v of sorted) { const bi = Math.min(nBins-1, Math.max(0, Math.floor((v-xMin)/(xMax-xMin)*nBins))); counts[bi]++; }
    const maxCount = Math.max(...counts,1);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin: 0, yMax: maxCount, xTicks: 5, yTicks: 0, xFmt: (v)=>(v*100).toFixed(1)+"%", yFmt: ()=>"", xLabel: LANG==="uk"?"дохідність":"return" });
    let bars = "";
    for (let i=0;i<nBins;i++) {
      const bx = xMin+(i/nBins)*(xMax-xMin);
      const h = (counts[i]/maxCount)*(H-2*PAD);
      const isTail = bx <= -varVal;
      bars += `<rect x="${x(bx).toFixed(1)}" y="${(H-PAD-h).toFixed(1)}" width="${((x(bx+(xMax-xMin)/nBins)-x(bx))-1).toFixed(1)}" height="${h.toFixed(1)}" fill="${isTail?"var(--level-3)":"var(--mint)"}" opacity="0.8" />`;
    }
    const varX = x(-varVal), esX = x(-es);
    svg.innerHTML = axesSvg + bars
      + `<line x1="${varX.toFixed(1)}" y1="${PAD}" x2="${varX.toFixed(1)}" y2="${H-PAD}" stroke="var(--level-2)" stroke-width="1.5" stroke-dasharray="3 3" />`
      + `<line x1="${esX.toFixed(1)}" y1="${PAD}" x2="${esX.toFixed(1)}" y2="${H-PAD}" stroke="var(--ink)" stroke-width="1.5" />`;

    const lines = [`${S.steps}`, `  ${S.esVar} = ${(varVal*100).toFixed(2)}%`, `  ${S.esValue} = ${(es*100).toFixed(2)}%`, `  (${LANG==="uk"?"ES завжди ≥ VaR":"ES is always ≥ VaR"})`];
    panel.querySelector("#esSteps").textContent = lines.join("\n");
  }
  confSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 38. Logistic Regression Credit Scorecard
// ---------------------------------------------------------------------------
const SCORECARD_DATA = [[0.2,0,0],[0.3,1,0],[0.8,3,1],[0.9,4,1],[0.1,0,0],[0.7,2,1],[0.4,1,0],[0.85,3,1],[0.15,0,0],[0.6,2,1],[0.5,1,0],[0.75,3,1]];
function trainLogistic(data, steps, lr) {
  let w1=0,w2=0,b=0;
  for (let s=0;s<steps;s++) {
    let gw1=0,gw2=0,gb=0;
    for (const [x1,x2,yv] of data) { const p=sigmoidFn(w1*x1+w2*x2+b); gw1+=(p-yv)*x1; gw2+=(p-yv)*x2; gb+=(p-yv); }
    w1 -= lr*gw1/data.length; w2 -= lr*gw2/data.length; b -= lr*gb/data.length;
  }
  return { w1,w2,b };
}

function mountScorecardDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 30;
  const xMin=0, xMax=1, yMin=-0.5, yMax=4.5;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="scoreSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"DTI (борг/дохід)":"DTI (debt/income)"} <span class="val" id="scoreDtiVal">0.50</span></label><input type="range" id="scoreDti" min="0" max="1" step="0.02" value="0.50"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"прострочення":"late payments"} <span class="val" id="scoreLateVal">2</span></label><input type="range" id="scoreLate" min="0" max="4" step="1" value="2"></div>
        </div>
        <div class="demo-steps" id="scoreSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.scorecardCallout}</p></div>
  `;

  const dtiSlider = panel.querySelector("#scoreDti"), lateSlider = panel.querySelector("#scoreLate");
  const svg = panel.querySelector("#scoreSvg");
  const model = trainLogistic(SCORECARD_DATA, 600, 0.6);

  function render() {
    const dti = parseFloat(dtiSlider.value), late = parseInt(lateSlider.value, 10);
    panel.querySelector("#scoreDtiVal").textContent = dti.toFixed(2);
    panel.querySelector("#scoreLateVal").textContent = late;

    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>v.toFixed(1), yFmt: (v)=>v.toFixed(0), xLabel: "DTI", yLabel: LANG==="uk"?"прострочення":"late" });

    const gridN = 24, regions = [];
    for (let gi=0; gi<gridN; gi++) for (let gj=0; gj<10; gj++) {
      const gx = xMin+(gi/(gridN-1))*(xMax-xMin), gy = yMin+(gj/9)*(yMax-yMin);
      const p = sigmoidFn(model.w1*gx+model.w2*gy+model.b);
      regions.push(`<rect x="${(x(gx)-7).toFixed(1)}" y="${(y(gy)-14).toFixed(1)}" width="14" height="28" fill="${p>0.5?'var(--level-3)':'var(--mint)'}" opacity="${Math.abs(p-0.5)*0.5}" />`);
    }
    const dots = SCORECARD_DATA.map(([x1,x2,yv]) => `<circle cx="${x(x1).toFixed(1)}" cy="${y(x2).toFixed(1)}" r="4.5" fill="${yv===1?"var(--level-3)":"var(--mint)"}" stroke="var(--ink)" stroke-width="0.5" />`).join("");
    const queryDot = `<circle cx="${x(dti).toFixed(1)}" cy="${y(late).toFixed(1)}" r="7" fill="none" stroke="var(--level-2)" stroke-width="2.5" />`;
    svg.innerHTML = axesSvg + regions.join("") + dots + queryDot;

    const pDefault = sigmoidFn(model.w1*dti+model.w2*late+model.b);
    const lines = [`${S.steps}`, `  P(default) = sigmoid(${model.w1.toFixed(2)}·DTI + ${model.w2.toFixed(2)}·late + ${model.b.toFixed(2)})`, `  ${S.scorecardProb} = ${(pDefault*100).toFixed(1)}%`];
    panel.querySelector("#scoreSteps").textContent = lines.join("\n");
  }
  [dtiSlider, lateSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 39. Local Outlier Factor (real LOF)
// ---------------------------------------------------------------------------
function euclidLof(a,b) { return Math.hypot(a[0]-b[0],a[1]-b[1]); }
function kNeighborsLof(points, i, k) {
  return points.map((p,j)=>({j,d:euclidLof(points[i],p)})).filter((o)=>o.j!==i).sort((a,b)=>a.d-b.d).slice(0,k);
}
function reachDistLof(points, i, j, k) {
  const neighJ = kNeighborsLof(points, j, k);
  const kDistJ = neighJ[neighJ.length-1].d;
  return Math.max(kDistJ, euclidLof(points[i],points[j]));
}
function lrdLof(points, i, k) {
  const neighbors = kNeighborsLof(points, i, k);
  const sumReach = neighbors.reduce((s,o)=>s+reachDistLof(points,i,o.j,k),0);
  return neighbors.length/sumReach;
}
function lofScore(points, i, k) {
  const neighbors = kNeighborsLof(points, i, k);
  const lrdI = lrdLof(points, i, k);
  return neighbors.reduce((s,o)=>s+lrdLof(points,o.j,k)/lrdI,0)/neighbors.length;
}
const LOF_POINTS = (function () {
  const rnd = mulberry32(4);
  const pts = [];
  for (let i=0;i<25;i++) pts.push([gaussFrom(rnd)*0.5, gaussFrom(rnd)*0.5]);
  pts.push([3,3]); pts.push([2.6,-2.8]);
  return pts;
})();

function mountLofDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 340, H = 300, PAD = 20;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="lofSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>k (${LANG==="uk"?"сусідів":"neighbours"}) <span class="val" id="lofKVal">5</span></label><input type="range" id="lofK" min="2" max="15" step="1" value="5"></div>
        </div>
        <div class="demo-steps" id="lofSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.lofCallout}</p></div>
  `;

  const kSlider = panel.querySelector("#lofK");
  const svg = panel.querySelector("#lofSvg");
  const xs = LOF_POINTS.map((p)=>p[0]), ys = LOF_POINTS.map((p)=>p[1]);
  const xMin = Math.min(...xs)-0.5, xMax = Math.max(...xs)+0.5, yMin = Math.min(...ys)-0.5, yMax = Math.max(...ys)+0.5;

  function render() {
    const k = parseInt(kSlider.value, 10);
    panel.querySelector("#lofKVal").textContent = k;

    const scores = LOF_POINTS.map((_,i) => lofScore(LOF_POINTS, i, k));
    const maxScore = Math.max(...scores);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>v.toFixed(1), yFmt: (v)=>v.toFixed(1) });
    const dots = LOF_POINTS.map((p,i) => {
      const r = 4 + 8*(scores[i]/maxScore);
      return `<circle cx="${x(p[0]).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="${r.toFixed(1)}" fill="${scores[i]>1.5?"var(--level-3)":"var(--mint)"}" opacity="0.8" />`;
    }).join("");
    svg.innerHTML = axesSvg + dots;

    const outlierIdx = scores.indexOf(Math.max(...scores));
    const lines = [`${S.steps}`, `  LRD(p) = k / Σ reach-dist(p,o)`, `  ${S.lofScore} = LRD(neighbors)/LRD(p), ${LANG==="uk"?"усереднено":"averaged"}`, `  max ${S.lofScore} = ${scores[outlierIdx].toFixed(2)} (${LANG==="uk"?"точка":"point"} ${outlierIdx})`];
    panel.querySelector("#lofSteps").textContent = lines.join("\n");
  }
  kSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 40. Kyle's Lambda — price-impact regression
// ---------------------------------------------------------------------------
function kylesLambda(orderFlow, priceChanges) {
  const n = orderFlow.length;
  const meanX = orderFlow.reduce((a,b)=>a+b,0)/n, meanY = priceChanges.reduce((a,b)=>a+b,0)/n;
  let num=0, den=0;
  for (let i=0;i<n;i++) { num += (orderFlow[i]-meanX)*(priceChanges[i]-meanY); den += (orderFlow[i]-meanX)**2; }
  return num/den;
}

function mountKyleDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="kyleSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"справжня лямбда (×10⁻⁴)":"true lambda (×10⁻⁴)"} <span class="val" id="kyleLamVal">5.0</span></label><input type="range" id="kyleLam" min="1" max="20" step="0.5" value="5.0"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"рівень шуму":"noise level"} <span class="val" id="kyleNoiseVal">0.05</span></label><input type="range" id="kyleNoise" min="0.01" max="0.3" step="0.01" value="0.05"></div>
        </div>
        <div class="demo-steps" id="kyleSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.kyleCallout}</p></div>
  `;

  const lamSlider = panel.querySelector("#kyleLam"), noiseSlider = panel.querySelector("#kyleNoise");
  const svg = panel.querySelector("#kyleSvg");

  function render() {
    const trueLambda = parseFloat(lamSlider.value)/10000, noise = parseFloat(noiseSlider.value);
    panel.querySelector("#kyleLamVal").textContent = (trueLambda*10000).toFixed(1);
    panel.querySelector("#kyleNoiseVal").textContent = noise.toFixed(2);

    const rnd = mulberry32(11);
    const orderFlow=[], priceChanges=[];
    for (let i=0;i<150;i++) { const of=gaussFrom(rnd)*1000; orderFlow.push(of); priceChanges.push(trueLambda*of+gaussFrom(rnd)*noise); }
    const estLambda = kylesLambda(orderFlow, priceChanges);

    const xMin = Math.min(...orderFlow), xMax = Math.max(...orderFlow);
    const yMin = Math.min(...priceChanges), yMax = Math.max(...priceChanges);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin, xMax, yMin, yMax, xTicks: 4, yTicks: 4, xFmt: (v)=>v.toFixed(0), yFmt: (v)=>v.toFixed(2), xLabel: LANG==="uk"?"потік ордерів":"order flow", yLabel: LANG==="uk"?"зміна ціни":"Δprice" });
    const dots = orderFlow.map((ofv,i) => `<circle cx="${x(ofv).toFixed(1)}" cy="${y(priceChanges[i]).toFixed(1)}" r="2.5" fill="var(--mint)" opacity="0.5" />`).join("");
    const lineD = `M ${x(xMin).toFixed(1)} ${y(estLambda*xMin).toFixed(1)} L ${x(xMax).toFixed(1)} ${y(estLambda*xMax).toFixed(1)}`;
    svg.innerHTML = axesSvg + dots + `<path d="${lineD}" stroke="var(--level-3)" stroke-width="2" fill="none" />`;

    const lines = [`${S.steps}`, `  Δp = λ·OrderFlow + ε`, `  ${S.kyleLambda} = ${(estLambda*10000).toFixed(2)}×10⁻⁴ (${LANG==="uk"?"справжня":"true"}=${(trueLambda*10000).toFixed(1)}×10⁻⁴)`];
    panel.querySelector("#kyleSteps").textContent = lines.join("\n");
  }
  [lamSlider, noiseSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 41. Nelson-Siegel yield curve
// ---------------------------------------------------------------------------
function nelsonSiegel(tau, beta0, beta1, beta2, lambda) {
  const xv = tau/lambda;
  return beta0 + beta1*(1-Math.exp(-xv))/xv + beta2*((1-Math.exp(-xv))/xv - Math.exp(-xv));
}
const NS_MATURITIES = [0.25,0.5,1,2,3,5,7,10,20,30];

function mountNsDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="nsSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>β₀ (${LANG==="uk"?"рівень":"level"}) <span class="val" id="nsB0Val">4.0%</span></label><input type="range" id="nsB0" min="0" max="8" step="0.1" value="4.0"></div>
          <div class="demo-slider-row"><label>β₁ (${LANG==="uk"?"нахил":"slope"}) <span class="val" id="nsB1Val">-2.0%</span></label><input type="range" id="nsB1" min="-6" max="4" step="0.1" value="-2.0"></div>
          <div class="demo-slider-row"><label>β₂ (${LANG==="uk"?"кривизна":"curvature"}) <span class="val" id="nsB2Val">1.0%</span></label><input type="range" id="nsB2" min="-6" max="6" step="0.1" value="1.0"></div>
          <div class="demo-slider-row"><label>λ <span class="val" id="nsLamVal">2.0</span></label><input type="range" id="nsLam" min="0.3" max="6" step="0.1" value="2.0"></div>
        </div>
        <div class="demo-steps" id="nsSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.nsCallout}</p></div>
  `;

  const els = ["nsB0","nsB1","nsB2","nsLam"].map((id) => panel.querySelector("#"+id));
  const svg = panel.querySelector("#nsSvg");

  function render() {
    const [b0,b1,b2,lam] = [parseFloat(els[0].value)/100, parseFloat(els[1].value)/100, parseFloat(els[2].value)/100, parseFloat(els[3].value)];
    panel.querySelector("#nsB0Val").textContent = (b0*100).toFixed(1)+"%";
    panel.querySelector("#nsB1Val").textContent = (b1*100).toFixed(1)+"%";
    panel.querySelector("#nsB2Val").textContent = (b2*100).toFixed(1)+"%";
    panel.querySelector("#nsLamVal").textContent = lam.toFixed(1);

    const nPts = 100;
    const curve = [];
    for (let i=0;i<nPts;i++) { const tau = 0.1+(i/(nPts-1))*29.9; curve.push([tau, nelsonSiegel(tau,b0,b1,b2,lam)]); }
    const yVals = curve.map((c)=>c[1]);
    const yMin = Math.min(...yVals)-0.005, yMax = Math.max(...yVals)+0.005;
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: 30, yMin, yMax, xTicks: 5, yTicks: 4, xFmt: (v)=>v.toFixed(0), yFmt: (v)=>(v*100).toFixed(1)+"%", xLabel: LANG==="uk"?"строк (роки)":"maturity (yrs)", yLabel: "yield" });
    const path = curve.map(([tau,yield_],i)=>`${i===0?"M":"L"} ${x(tau).toFixed(1)} ${y(yield_).toFixed(1)}`).join(" ");
    const dots = NS_MATURITIES.map((tau)=>`<circle cx="${x(tau).toFixed(1)}" cy="${y(nelsonSiegel(tau,b0,b1,b2,lam)).toFixed(1)}" r="3" fill="var(--level-2)" />`).join("");
    svg.innerHTML = axesSvg + `<path d="${path}" fill="none" stroke="var(--mint)" stroke-width="2" />` + dots;

    const lines = [`${S.steps}`, `  y(τ) = β₀ + β₁·(1-e^(-τ/λ))/(τ/λ) + β₂·[(1-e^(-τ/λ))/(τ/λ) - e^(-τ/λ)]`, `  ${S.nsShort} ≈ ${((b0+b1)*100).toFixed(2)}%`, `  ${S.nsLong} = ${(b0*100).toFixed(2)}%`];
    panel.querySelector("#nsSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 42. DebtRank — correct active/inactive cascade propagation
// ---------------------------------------------------------------------------
function debtRankProper(A, capital, initialShock, maxIter) {
  const n = A.length;
  let h = initialShock.slice();
  let state = h.map((v) => v > 0 ? "D" : "U");
  for (let iter = 0; iter < maxIter; iter++) {
    const hNew = h.slice();
    const activeSet = [];
    for (let i = 0; i < n; i++) if (state[i] === "D") activeSet.push(i);
    if (activeSet.length === 0) break;
    for (let i = 0; i < n; i++) {
      if (state[i] === "I") continue;
      let impact = 0;
      for (const j of activeSet) { if (i===j) continue; impact += (A[i][j]/capital[i])*h[j]; }
      hNew[i] = Math.min(1, h[i]+impact);
    }
    const newState = state.slice();
    for (const j of activeSet) newState[j] = "I";
    for (let i = 0; i < n; i++) if (newState[i]==="U" && hNew[i]>h[i]) newState[i]="D";
    h = hNew; state = newState;
  }
  return h;
}
const DEBTRANK_POS = [[80,150],[190,80],[190,220],[300,150]];

function mountDebtrankDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 380, H = 300;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="drSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"експозиція 1→0":"exposure 1→0"} <span class="val" id="drE1Val">50</span></label><input type="range" id="drE1" min="10" max="100" step="5" value="50"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"експозиція 2→1":"exposure 2→1"} <span class="val" id="drE2Val">30</span></label><input type="range" id="drE2" min="10" max="100" step="5" value="30"></div>
          <div class="demo-slider-row"><label>${LANG==="uk"?"експозиція 3→2":"exposure 3→2"} <span class="val" id="drE3Val">20</span></label><input type="range" id="drE3" min="10" max="100" step="5" value="20"></div>
        </div>
        <div class="demo-steps" id="drSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.debtrankCallout}</p></div>
  `;

  const els = ["drE1","drE2","drE3"].map((id) => panel.querySelector("#"+id));
  const svg = panel.querySelector("#drSvg");

  function render() {
    const [e1,e2,e3] = els.map((el) => parseFloat(el.value));
    panel.querySelector("#drE1Val").textContent = e1;
    panel.querySelector("#drE2Val").textContent = e2;
    panel.querySelector("#drE3Val").textContent = e3;

    const A = [[0,0,0,0],[e1,0,0,0],[0,e2,0,0],[0,0,e3,0]];
    const h = debtRankProper(A, [100,100,100,100], [1,0,0,0], 20);

    let edges = "";
    edges += `<line x1="${DEBTRANK_POS[0][0]}" y1="${DEBTRANK_POS[0][1]}" x2="${DEBTRANK_POS[1][0]}" y2="${DEBTRANK_POS[1][1]}" stroke="var(--rule)" stroke-width="2" marker-end="url(#arrow)" />`;
    edges += `<line x1="${DEBTRANK_POS[1][0]}" y1="${DEBTRANK_POS[1][1]}" x2="${DEBTRANK_POS[2][0]}" y2="${DEBTRANK_POS[2][1]}" stroke="var(--rule)" stroke-width="2" />`;
    edges += `<line x1="${DEBTRANK_POS[2][0]}" y1="${DEBTRANK_POS[2][1]}" x2="${DEBTRANK_POS[3][0]}" y2="${DEBTRANK_POS[3][1]}" stroke="var(--rule)" stroke-width="2" />`;
    const nodes = DEBTRANK_POS.map((p,i) => {
      const col = `color-mix(in srgb, var(--level-3) ${Math.round(h[i]*100)}%, var(--mint))`;
      return `<circle cx="${p[0]}" cy="${p[1]}" r="22" fill="${col}" /><text x="${p[0]}" y="${p[1]+4}" text-anchor="middle" font-family="var(--mono)" font-size="10" fill="var(--bg)">${(h[i]*100).toFixed(0)}%</text><text x="${p[0]}" y="${p[1]-30}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--ink-soft)">${S.debtrankBank} ${i}</text>`;
    }).join("");
    svg.innerHTML = edges + nodes;

    const lines = [`${S.steps}`, `  h(t+1) = min(1, h(t) + Σ (A/capital)·h_active)`, DEBTRANK_POS.map((_,i)=>`  ${S.debtrankBank} ${i}: ${S.debtrankLevel} = ${(h[i]*100).toFixed(1)}%`).join("\n")];
    panel.querySelector("#drSteps").textContent = lines.join("\n");
  }
  els.forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 43. Deflated Sharpe Ratio
// ---------------------------------------------------------------------------
function deflatedSharpe(observedSR, nTrials, nObs, skew, kurt) {
  const emGamma = 0.5772156649;
  let expectedMaxSR = 0;
  if (nTrials > 1) {
    const zMax = (1-emGamma)*invNormCDF(1-1/nTrials) + emGamma*invNormCDF(1-1/(nTrials*Math.E));
    expectedMaxSR = zMax/Math.sqrt(nObs);
  }
  const denomAdj = Math.sqrt(Math.max((1 - skew*observedSR + (kurt-1)/4*observedSR**2)/(nObs-1), 1e-6));
  const dsr = normCDF((observedSR - expectedMaxSR)/denomAdj);
  return { dsr, expectedMaxSR };
}

function mountDsrDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="dsrSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"виміряний Sharpe":"measured Sharpe"} <span class="val" id="dsrSrVal">0.30</span></label><input type="range" id="dsrSr" min="0.1" max="1.5" step="0.05" value="0.30"></div>
          <div class="demo-slider-row"><label>${S.dsrTrials} <span class="val" id="dsrTrialsVal">50</span></label><input type="range" id="dsrTrials" min="1" max="1000" step="1" value="50"></div>
        </div>
        <div class="demo-steps" id="dsrSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.dsrCallout}</p></div>
  `;

  const srSlider = panel.querySelector("#dsrSr"), trialsSlider = panel.querySelector("#dsrTrials");
  const svg = panel.querySelector("#dsrSvg");
  const nObs = 50;

  function render() {
    const observedSR = parseFloat(srSlider.value);
    const nTrials = parseInt(trialsSlider.value, 10);
    panel.querySelector("#dsrSrVal").textContent = observedSR.toFixed(2);
    panel.querySelector("#dsrTrialsVal").textContent = nTrials;

    const nPts = 60;
    const logMin = Math.log(1), logMax = Math.log(1000);
    function xLog(nT) { return PAD + ((Math.log(nT)-logMin)/(logMax-logMin))*(W-2*PAD); }
    const curve = [];
    for (let i = 0; i < nPts; i++) {
      const nT = Math.max(1, Math.round(Math.exp(logMin + (i/(nPts-1))*(logMax-logMin))));
      curve.push([nT, deflatedSharpe(observedSR, nT, nObs, 0, 3).dsr]);
    }
    const yMin = 0, yMax = 1;
    function yScale(v) { return H-PAD-((v-yMin)/(yMax-yMin))*(H-2*PAD); }
    const path = curve.map(([nT,d],i)=>`${i===0?"M":"L"} ${xLog(nT).toFixed(1)} ${yScale(d).toFixed(1)}`).join(" ");

    let axesManual = "";
    for (const tv of [0,0.25,0.5,0.75,1]) {
      const yy = yScale(tv);
      axesManual += `<line class="axis-grid" x1="${PAD}" y1="${yy.toFixed(1)}" x2="${W-PAD}" y2="${yy.toFixed(1)}" />`;
      axesManual += `<text class="axis-tick" x="${PAD-5}" y="${(yy+3).toFixed(1)}" text-anchor="end">${tv.toFixed(2)}</text>`;
    }
    for (const tv of [1,10,100,1000]) {
      const xx = xLog(tv);
      axesManual += `<line class="axis-grid" x1="${xx.toFixed(1)}" y1="${PAD}" x2="${xx.toFixed(1)}" y2="${H-PAD}" />`;
      axesManual += `<text class="axis-tick" x="${xx.toFixed(1)}" y="${H-PAD+13}" text-anchor="middle">${tv}</text>`;
    }
    axesManual += `<line class="axis-line" x1="${PAD}" y1="${H-PAD}" x2="${W-PAD}" y2="${H-PAD}" />`;
    axesManual += `<line class="axis-line" x1="${PAD}" y1="${PAD}" x2="${PAD}" y2="${H-PAD}" />`;
    axesManual += `<text class="axis-label" x="${W-PAD}" y="${H-3}" text-anchor="end">${LANG==="uk"?"випробувань (лог. шкала)":"trials (log scale)"}</text>`;

    const { dsr, expectedMaxSR } = deflatedSharpe(observedSR, nTrials, nObs, 0, 3);
    svg.innerHTML = axesManual + `<path d="${path}" fill="none" stroke="var(--mint)" stroke-width="2" />` + `<circle cx="${xLog(nTrials).toFixed(1)}" cy="${yScale(dsr).toFixed(1)}" r="5" fill="var(--level-3)" />`;

    const lines = [`${S.steps}`, `  E[max SR | H0] ≈ ${expectedMaxSR.toFixed(3)}`, `  ${S.dsrValue} = ${dsr.toFixed(3)}`];
    panel.querySelector("#dsrSteps").textContent = lines.join("\n");
  }
  [srSlider, trialsSlider].forEach((el) => el.addEventListener("input", render));
  render();
}

// ---------------------------------------------------------------------------
// 44. Genetic Algorithm
// ---------------------------------------------------------------------------
function gaFitness(xv) { return -((xv-3)**2) + 10 + Math.sin(xv*3)*0.5; }
function runGA(popSize, generations, mutRate, rnd) {
  let pop = Array.from({length:popSize}, () => rnd()*10-5);
  const bestHistory = [];
  for (let g = 0; g < generations; g++) {
    const fitness = pop.map(gaFitness);
    bestHistory.push(Math.max(...fitness));
    const newPop = [];
    for (let i = 0; i < popSize; i++) {
      const a = pop[Math.floor(rnd()*popSize)], b = pop[Math.floor(rnd()*popSize)];
      const parent1 = gaFitness(a)>gaFitness(b) ? a : b;
      const c = pop[Math.floor(rnd()*popSize)], d = pop[Math.floor(rnd()*popSize)];
      const parent2 = gaFitness(c)>gaFitness(d) ? c : d;
      let child = (parent1+parent2)/2;
      if (rnd() < mutRate) child += gaussFrom(rnd)*0.5;
      newPop.push(child);
    }
    pop = newPop;
  }
  return { bestHistory, pop };
}

function mountGaDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" id="gaSvg"></svg>
        <p class="demo-note" style="margin-top:8px"><span style="color:var(--ink-faint)">●</span> ${LANG==="uk"?"цільова функція":"objective function"} &nbsp; <span style="color:var(--level-3)">●</span> ${LANG==="uk"?"поточна популяція":"current population"}</p>
      </div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${S.gaGeneration} <span class="val" id="gaGenVal">15</span></label><input type="range" id="gaGen" min="0" max="60" step="1" value="15"></div>
        </div>
        <div class="demo-steps" id="gaSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.gaCallout}</p></div>
  `;

  const genSlider = panel.querySelector("#gaGen");
  const svg = panel.querySelector("#gaSvg");

  function render() {
    const generations = parseInt(genSlider.value, 10);
    panel.querySelector("#gaGenVal").textContent = generations;

    const { bestHistory, pop } = runGA(30, Math.max(1,generations), 0.15, mulberry32(21));

    const nPts = 100;
    const curve = [];
    for (let i=0;i<nPts;i++) { const xv=-5+(i/(nPts-1))*10; curve.push([xv, gaFitness(xv)]); }
    const yVals = curve.map((c)=>c[1]);
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: -5, xMax: 5, yMin: Math.min(...yVals)-1, yMax: Math.max(...yVals)+1, xTicks: 5, yTicks: 4, xFmt: (v)=>v.toFixed(0), yFmt: (v)=>v.toFixed(0), xLabel: "x" });
    const path = curve.map(([xv,fv],i)=>`${i===0?"M":"L"} ${x(xv).toFixed(1)} ${y(fv).toFixed(1)}`).join(" ");
    const popDots = pop.map((xv) => `<circle cx="${x(xv).toFixed(1)}" cy="${y(gaFitness(xv)).toFixed(1)}" r="4" fill="var(--level-3)" opacity="0.7" />`).join("");
    svg.innerHTML = axesSvg + `<path d="${path}" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />` + popDots;

    const bestFit = generations===0 ? Math.max(...pop.map(gaFitness)) : bestHistory[bestHistory.length-1];
    const lines = [`${S.steps}`, `  ${S.gaBestFitness} = ${bestFit.toFixed(3)} (${LANG==="uk"?"максимум":"max"}≈10.4 ${LANG==="uk"?"поблизу":"near"} x=3)`];
    panel.querySelector("#gaSteps").textContent = lines.join("\n");
  }
  genSlider.addEventListener("input", render);
  render();
}

// ---------------------------------------------------------------------------
// 45. Policy Gradient / REINFORCE
// ---------------------------------------------------------------------------
function softmaxPolicy(theta) { const m=Math.max(...theta); const ex=theta.map((t)=>Math.exp(t-m)); const s=ex.reduce((a,b)=>a+b,0); return ex.map((v)=>v/s); }
function trainReinforce(episodes, lr, rnd) {
  let theta = [0,0,0];
  const trueReward = [-0.5, 0, 1.2];
  const history = [];
  for (let ep = 0; ep < episodes; ep++) {
    const probs = softmaxPolicy(theta);
    const r = rnd(); let cum = 0, action = 0;
    for (let a = 0; a < 3; a++) { cum += probs[a]; if (r <= cum) { action = a; break; } }
    const reward = trueReward[action] + gaussFrom(rnd)*0.3;
    for (let k = 0; k < 3; k++) { const grad = (k===action?1:0)-probs[k]; theta[k] += lr*reward*grad; }
    history.push(softmaxPolicy(theta));
  }
  return { theta, history };
}

function mountReinforceDemo(panel) {
  const S = DEMO_STRINGS[LANG];
  const W = 600, H = 260, PAD = 40;
  const actionLabels = LANG==="uk" ? ["продати","тримати","купити"] : ["sell","hold","buy"];

  panel.innerHTML = `
    <div class="demo-layout">
      <div class="demo-chart-wrap"><svg viewBox="0 0 ${W} ${H}" id="pgSvg"></svg></div>
      <div>
        <div class="demo-controls">
          <div class="demo-slider-row"><label>${LANG==="uk"?"епізоди навчання":"training episodes"} <span class="val" id="pgEpVal">300</span></label><input type="range" id="pgEp" min="0" max="800" step="20" value="300"></div>
        </div>
        <div class="demo-steps" id="pgSteps"></div>
      </div>
    </div>
    <div class="demo-callout"><p class="eyebrow2">${S.inFinance}</p><p>${S.pgCallout}</p></div>
  `;

  const epSlider = panel.querySelector("#pgEp");
  const svg = panel.querySelector("#pgSvg");

  function render() {
    const episodes = parseInt(epSlider.value, 10);
    panel.querySelector("#pgEpVal").textContent = episodes;

    const rnd = mulberry32(9);
    const { history } = trainReinforce(Math.max(1,episodes), 0.05, rnd);
    const colors = ["var(--level-3)","var(--level-2)","var(--mint)"];
    const { x, y, svg: axesSvg } = axesSVG({ W, H, pad: PAD, xMin: 0, xMax: history.length-1, yMin: 0, yMax: 1, xTicks: 4, yTicks: 4, xFmt: (v)=>Math.round(v), yFmt: (v)=>v.toFixed(1), xLabel: LANG==="uk"?"епізод":"episode", yLabel: "P(action)" });
    let paths = "";
    for (let a=0;a<3;a++) {
      const path = history.map((probs,i)=>`${i===0?"M":"L"} ${x(i).toFixed(1)} ${y(probs[a]).toFixed(1)}`).join(" ");
      paths += `<path d="${path}" fill="none" stroke="${colors[a]}" stroke-width="2" />`;
    }
    svg.innerHTML = axesSvg + paths;

    const finalProbs = history[history.length-1];
    const lines = [`${S.steps}`, `  θ_k += lr · reward · (1{k=a} − π(k))`, `  ${S.pgProbs}: [${finalProbs.map((p)=>p.toFixed(2)).join(", ")}]`];
    panel.querySelector("#pgSteps").textContent = lines.join("\n");
  }
  epSlider.addEventListener("input", render);
  render();
}


const DEMOS = {
  "volatility::GARCH(1,1)": { mount: mountGarchDemo },
  "unsupervised-outliers::Isolation Forest": { mount: mountIsoForestDemo },
  "derivatives::Black-Scholes-Merton": { mount: mountBlackScholesDemo },
  "factor::CAPM": { mount: mountCapmDemo },
  "portfolio::Kelly Criterion": { mount: mountKellyDemo },
  "portfolio::Markowitz Mean-Variance": { mount: mountMarkowitzDemo },
  "risk-measures::Parametric (Variance-Covariance) VaR": { mount: mountVarDemo },
  "time-series::Kalman Filter (state-space)": { mount: mountKalmanDemo },
  "regime::Hidden Markov Model": { mount: mountHmmDemo },
  "rates::Vasicek Model": { mount: mountVasicekDemo },
  "microstructure::Hawkes Process": { mount: mountHawkesDemo },
  "fuzzy::Fuzzy C-Means Clustering": { mount: mountFcmDemo },
  "classical-ml::k-Nearest Neighbours": { mount: mountKnnDemo },
  "classical-ml::Random Forest": { mount: mountRfDemo },
  "metrics::Sharpe / Sortino Ratio": { mount: mountSharpeDemo },
  "metrics::AUROC vs AUPRC": { mount: mountAucDemo },
  "volatility::Heston Stochastic Volatility": { mount: mountHestonDemo },
  "credit::Merton Structural Model": { mount: mountMertonDemo },
  "generative::GAN": { mount: mountGanDemo },
  "generative::TimeGAN": { mount: mountTimeganDemo },
  "generative::TAnoGAN": { mount: mountTanoganDemo },
  "generative::GAN-LSTM Hybrid": { mount: mountGanLstmDemo },
  "generative::Diffusion Models for Time Series": { mount: mountDiffusionDemo },
  "volatility::EGARCH": { mount: mountEgarchDemo },
  "derivatives::Binomial / Trinomial Trees": { mount: mountBinomialDemo },
  "derivatives::Monte Carlo Option Pricing": { mount: mountMcDemo },
  "unsupervised-outliers::DBSCAN": { mount: mountDbscanDemo },
  "classical-ml::Support Vector Machines": { mount: mountSvmDemo },
  "classical-ml::Decision Trees (CART)": { mount: mountCartDemo },
  "regime::Change-Point Detection (CUSUM, Bayesian Online)": { mount: mountCusumDemo },
  "search::Bayesian Optimization": { mount: mountBoDemo },
  "systemic::Network Centrality Measures": { mount: mountCentralityDemo },
  "metrics::Calmar Ratio / Max Drawdown": { mount: mountCalmarDemo },
  "sequential-dl::LSTM": { mount: mountLstmDemo },
  "attention::Transformer": { mount: mountTransformerDemo },
  "autoencoders::Variational Autoencoder": { mount: mountVaeDemo },
  "graph::Graph Neural Network": { mount: mountGnnDemo },
  "rl::Q-Learning": { mount: mountQlearningDemo },
  "nlp::Lexicon-Based Sentiment Scoring": { mount: mountSentimentDemo },
  "xai::SHAP": { mount: mountShapDemo },
  "validation::Walk-Forward Split": { mount: mountWalkForwardDemo },
  "fraud::Benford's Law Digit Analysis": { mount: mountBenfordDemo },
  "alt-data::Technical Indicators (RSI, MACD, Bollinger)": { mount: mountTechDemo },
  "time-series::ARIMA / ARMA": { mount: mountArimaDemo },
  "risk-measures::Conditional VaR / Expected Shortfall": { mount: mountEsDemo },
  "credit::Logistic Regression Scorecard": { mount: mountScorecardDemo },
  "unsupervised-outliers::Local Outlier Factor": { mount: mountLofDemo },
  "microstructure::Kyle's Lambda": { mount: mountKyleDemo },
  "rates::Nelson-Siegel / Svensson": { mount: mountNsDemo },
  "systemic::DebtRank": { mount: mountDebtrankDemo },
  "validation::Deflated Sharpe Ratio": { mount: mountDsrDemo },
  "search::Genetic Algorithms": { mount: mountGaDemo },
  "rl::Policy Gradient / REINFORCE": { mount: mountReinforceDemo },
};

function applyFilters() {
  closeAllDemoPanels();
  const q = document.getElementById("searchBox").value.trim().toLowerCase();
  const emptyState = document.getElementById("emptyState");
  let anyVisible = false;

  document.querySelectorAll("[data-topic]").forEach((section) => {
    let topicHasVisible = false;
    section.querySelectorAll(".card").forEach((card) => {
      const lvl = card.getAttribute("data-lvl");
      const text = card.getAttribute("data-search");
      const visible = activeLevels.has(lvl) && (!q || text.includes(q));
      card.classList.toggle("hidden", !visible);
      if (visible) topicHasVisible = true;
    });
    section.classList.toggle("hidden", !topicHasVisible);
    if (topicHasVisible) anyVisible = true;
  });

  emptyState.classList.toggle("hidden", anyVisible);
}

function updateMetaLine() {
  const nTopics = TOPICS.length;
  const nItems = TOPICS.reduce((sum, topic) => sum + topic.items.length, 0);
  document.getElementById("metaLine").textContent = UI_STRINGS[LANG].metaTemplate(nItems, nTopics);
}

function setLanguage(lang) {
  if (lang !== "uk" && lang !== "en") return;
  LANG = lang;
  localStorage.setItem("market-atlas-lang", lang);
  applyUIStrings();
  renderNav();
  renderTopics();
  updateMetaLine();
  applyFilters();
  attachTopicObserver();
}

function setupInteractions() {
  document.getElementById("searchBox").addEventListener("input", applyFilters);

  document.querySelectorAll(".chip[data-lvl]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const lvl = chip.getAttribute("data-lvl");
      if (activeLevels.has(lvl)) {
        activeLevels.delete(lvl);
        chip.classList.remove("on");
        chip.classList.add("off");
      } else {
        activeLevels.add(lvl);
        chip.classList.add("on");
        chip.classList.remove("off");
      }
      applyFilters();
    });
  });

  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    themeToggle.textContent = isDark ? "☾" : "☀";
  });

  document.getElementById("langUk").addEventListener("click", () => setLanguage("uk"));
  document.getElementById("langEn").addEventListener("click", () => setLanguage("en"));
}

let navObserver = null;
function attachTopicObserver() {
  if (navObserver) navObserver.disconnect();
  navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.topnav a[data-target="${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll(".topnav a").forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  document.querySelectorAll("[data-topic]").forEach((s) => navObserver.observe(s));
}

async function init() {
  await loadData();
  applyUIStrings();
  renderNav();
  renderTopics();
  updateMetaLine();
  setupInteractions();
  attachTopicObserver();
}

init();
