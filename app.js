import { articles } from "./content.js";

const dispatches = [
  {
    label: "Reading list",
    title: "The ICRC's rules for protecting civilians",
    summary: "A plain-language entry point to international humanitarian law.",
    url: "https://www.icrc.org/en/law-and-policy"
  },
  {
    label: "Source desk",
    title: "Track displacement without turning people into a statistic",
    summary: "UNHCR's data portal, its definitions, and the gaps behind the totals.",
    url: "https://www.unhcr.org/refugee-statistics/"
  },
  {
    label: "Open work",
    title: "Can small tools support local responders?",
    summary: "Three project questions, with risks named before features.",
    url: "#projects"
  },
  {
    label: "Methods",
    title: "What counts as a primary source here",
    summary: "Our source order and how we separate a fact from an inference.",
    url: "#principles"
  }
];

const storyArticles = articles.filter((article) => article.id !== "sudan-access");
const dispatchList = document.querySelector("#dispatch-list");
const storyGrid = document.querySelector("#story-grid");
const topicLinks = [...document.querySelectorAll("[data-topic]")];
const searchButton = document.querySelector(".search-button");
const searchPanel = document.querySelector("#search-panel");
const searchInput = document.querySelector("#site-search");
const searchCount = document.querySelector("#search-count");
const filterStatus = document.querySelector("#filter-status");
const emptyState = document.querySelector("#empty-state");
const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector("#site-nav");
const reader = document.querySelector("#story-reader");
const readerStage = reader.querySelector(".reader-stage");
const readerCard = reader.querySelector(".reader-card");
const readerProgress = document.querySelector("#reader-progress");
const readerKicker = document.querySelector("#reader-kicker");
const readerCount = document.querySelector("#reader-count");
const readerTitle = document.querySelector("#reader-title");
const readerBody = document.querySelector("#reader-body");
const causalChain = document.querySelector("#causal-chain");
const evidenceList = document.querySelector("#evidence-list");
const evidenceCount = document.querySelector("#evidence-count");
const evidenceDrawer = document.querySelector("#evidence-drawer");
const previousButton = reader.querySelector(".reader-arrow-prev");
const nextButton = reader.querySelector(".reader-arrow-next");

let activeTopic = "all";
let searchTerm = "";
let currentArticle = null;
let currentSlideIndex = 0;
let touchStartX = null;

function externalAttributes(url) {
  return url.startsWith("http") ? 'target="_blank" rel="noreferrer"' : "";
}

function renderDispatches() {
  dispatchList.innerHTML = dispatches.map((dispatch) => `
    <article class="dispatch">
      <time>${dispatch.label}</time>
      <h3><a href="${dispatch.url}" ${externalAttributes(dispatch.url)}>${dispatch.title}</a></h3>
      <p>${dispatch.summary}</p>
    </article>
  `).join("");
}

function renderStories() {
  storyGrid.innerHTML = storyArticles.map((article) => `
    <article class="story-card searchable" data-topic="${article.topic}" data-search="${article.label} ${article.title} ${article.summary}">
      <a class="story-card-visual visual-${article.visual} article-link" href="#story-reader" data-article="${article.id}" aria-label="Open evidence briefing for ${article.title}">
        <span class="visual-label">Evidence brief / ${article.label}</span>
        <span class="visual-word">${article.visualWord}</span>
      </a>
      <div class="story-meta"><span>${article.label}</span><span>${article.readTime}</span></div>
      <h3><a class="article-link" href="#story-reader" data-article="${article.id}">${article.title}</a></h3>
      <p>${article.summary}</p>
      <a class="story-source article-link" href="#story-reader" data-article="${article.id}">Open five-part briefing →</a>
    </article>
  `).join("");
}

function itemMatches(item) {
  const topics = item.dataset.topic?.split(" ") ?? [];
  const topicMatch = activeTopic === "all" || topics.includes(activeTopic);
  const searchText = `${item.dataset.search ?? ""} ${item.textContent}`.toLowerCase();
  return topicMatch && searchText.includes(searchTerm);
}

function applyFilters() {
  const storyCards = [...document.querySelectorAll(".story-card")];
  const allSearchable = [...document.querySelectorAll(".searchable")];
  let visibleStories = 0;
  let matches = 0;

  allSearchable.forEach((item) => {
    const matchesFilter = itemMatches(item);
    if (item.classList.contains("story-card")) {
      item.classList.toggle("is-hidden", !matchesFilter);
      if (matchesFilter) visibleStories += 1;
    }
    if (matchesFilter) matches += 1;
  });

  const activeLabel = activeTopic === "all"
    ? "all topics"
    : topicLinks.find((link) => link.dataset.topic === activeTopic)?.textContent.toLowerCase();
  filterStatus.textContent = `Showing ${activeLabel}`;
  emptyState.hidden = visibleStories > 0;
  searchCount.textContent = searchTerm ? `${matches} matching item${matches === 1 ? "" : "s"}` : "";
}

function setTopic(topic, selectedLink) {
  activeTopic = topic === "projects" ? "all" : topic;
  topicLinks.forEach((link) => link.classList.toggle("is-active", link === selectedLink));
  applyFilters();
}

function evidenceMarkup(source) {
  return `
    <article class="evidence-item">
      <div class="evidence-relation">${source.relation}</div>
      <div>
        <a href="${source.url}" target="_blank" rel="noreferrer">${source.title} ↗</a>
        <p>${source.note}</p>
      </div>
    </article>
  `;
}

function renderReaderSlide() {
  const slide = currentArticle.slides[currentSlideIndex];
  const slideNumber = currentSlideIndex + 1;
  readerStage.dataset.theme = currentArticle.visual;
  readerKicker.textContent = `${currentArticle.label} / ${slide.kind}`;
  readerCount.textContent = `${String(slideNumber).padStart(2, "0")} / ${String(currentArticle.slides.length).padStart(2, "0")}`;
  readerTitle.textContent = slide.title;
  readerBody.textContent = slide.body;
  causalChain.innerHTML = slide.chain.map((step, index) => `
    <li><span>${String(index + 1).padStart(2, "0")}</span><p>${step}</p></li>
  `).join("");
  evidenceList.innerHTML = slide.sources.map(evidenceMarkup).join("");
  evidenceCount.textContent = `${slide.sources.length} source${slide.sources.length === 1 ? "" : "s"}`;
  evidenceDrawer.open = false;
  readerProgress.innerHTML = currentArticle.slides.map((item, index) => `
    <button type="button" class="${index === currentSlideIndex ? "is-active" : ""}" data-slide="${index}" aria-label="Open snippet ${index + 1}: ${item.kind}"><span></span></button>
  `).join("");
  previousButton.disabled = currentSlideIndex === 0;
  nextButton.disabled = currentSlideIndex === currentArticle.slides.length - 1;
  readerCard.animate(
    [{ opacity: 0.35, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 220, easing: "ease-out" }
  );
}

function openArticle(articleId) {
  const article = articles.find((candidate) => candidate.id === articleId);
  if (!article) return;
  currentArticle = article;
  currentSlideIndex = 0;
  renderReaderSlide();
  reader.showModal();
  document.documentElement.classList.add("reader-open");
}

function closeReader() {
  if (reader.open) reader.close();
}

function setSlide(index) {
  if (!currentArticle || index < 0 || index >= currentArticle.slides.length || index === currentSlideIndex) return;
  currentSlideIndex = index;
  renderReaderSlide();
}

function previousSlide() {
  setSlide(currentSlideIndex - 1);
}

function nextSlide() {
  setSlide(currentSlideIndex + 1);
}

topicLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setTopic(link.dataset.topic, link);
    if (window.innerWidth <= 760) {
      siteNav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
});

searchButton.addEventListener("click", () => {
  const willOpen = searchPanel.hidden;
  searchPanel.hidden = !willOpen;
  searchButton.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) searchInput.focus();
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  applyFilters();
});

menuButton.addEventListener("click", () => {
  const willOpen = !siteNav.classList.contains("is-open");
  siteNav.classList.toggle("is-open", willOpen);
  menuButton.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (event) => {
  const articleLink = event.target.closest(".article-link");
  if (!articleLink) return;
  event.preventDefault();
  openArticle(articleLink.dataset.article);
});

reader.querySelector(".reader-close").addEventListener("click", closeReader);
previousButton.addEventListener("click", previousSlide);
nextButton.addEventListener("click", nextSlide);
readerProgress.addEventListener("click", (event) => {
  const progressButton = event.target.closest("[data-slide]");
  if (progressButton) setSlide(Number(progressButton.dataset.slide));
});

readerStage.addEventListener("click", (event) => {
  if (event.target.closest("a, button, summary, details")) return;
  if (event.clientX >= window.innerWidth / 2) nextSlide();
  else previousSlide();
});

readerStage.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

readerStage.addEventListener("touchend", (event) => {
  if (touchStartX === null) return;
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 55) {
    if (distance < 0) nextSlide();
    else previousSlide();
  }
  touchStartX = null;
}, { passive: true });

reader.addEventListener("close", () => {
  document.documentElement.classList.remove("reader-open");
  currentArticle = null;
});

document.addEventListener("keydown", (event) => {
  if (reader.open) {
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      nextSlide();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousSlide();
    }
    return;
  }
  if (event.key === "Escape" && !searchPanel.hidden) {
    searchPanel.hidden = true;
    searchButton.setAttribute("aria-expanded", "false");
    searchButton.focus();
  }
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#form-message").textContent = "Preview confirmed. Connect an email provider before launch.";
});

const today = new Date();
document.querySelector("#current-date").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
}).format(today);
document.querySelector("#current-year").textContent = today.getFullYear();

renderDispatches();
renderStories();
applyFilters();
