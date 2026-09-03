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
  },
  en: {
    steps: "steps:",
    inFinance: "IN FINANCE",
    garchNote: "Stationarity requires α + β < 1. Current α + β =",
    garchCallout:
      "GARCH(1,1) is the standard model behind daily VaR: ω, α and β are fit by maximum likelihood on historical returns, and the resulting forecast σₜ plugs directly into VaR = z·σₜ·√1 for a one-day horizon.",
    garchChartCaption: "σₜ (annualised volatility, %) over a synthetic shock series with a volatility cluster",
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

const DEMOS = {
  "volatility::GARCH(1,1)": { mount: mountGarchDemo },
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
