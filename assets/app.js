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
          </article>
        `;
          })
          .join("")}
      </div>
    </section>
  `
  ).join("");
}

function applyFilters() {
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
