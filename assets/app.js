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
