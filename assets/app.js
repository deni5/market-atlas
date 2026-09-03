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

const DEMOS = {
  "volatility::GARCH(1,1)": { mount: mountGarchDemo },
  "unsupervised-outliers::Isolation Forest": { mount: mountIsoForestDemo },
  "derivatives::Black-Scholes-Merton": { mount: mountBlackScholesDemo },
  "factor::CAPM": { mount: mountCapmDemo },
  "portfolio::Kelly Criterion": { mount: mountKellyDemo },
  "portfolio::Markowitz Mean-Variance": { mount: mountMarkowitzDemo },
  "risk-measures::Parametric (Variance-Covariance) VaR": { mount: mountVarDemo },
  "time-series::Kalman Filter (state-space)": { mount: mountKalmanDemo },
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
