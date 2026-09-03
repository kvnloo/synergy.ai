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

const stories = [
  {
    topic: "climate",
    label: "Climate",
    readTime: "6 min",
    title: "Heat is a public-health emergency before it becomes a headline.",
    summary: "Start with exposure, housing, power, and access to care. The temperature alone does not describe who is at risk.",
    source: "WHO climate and health",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
    visual: "climate",
    visualWord: "HEAT / CARE"
  },
  {
    topic: "technology",
    label: "Public-interest tech",
    readTime: "8 min",
    title: "AI can shorten the research loop. It cannot own the judgment.",
    summary: "A working rule for crisis research: automate retrieval and comparison, then keep a person responsible for every published claim.",
    source: "ICRC data protection handbook",
    url: "https://www.icrc.org/en/publication/4305-handbook-data-protection-humanitarian-action-third-edition",
    visual: "technology",
    visualWord: "HUMAN / REVIEW"
  },
  {
    topic: "conflict displacement",
    label: "Displacement",
    readTime: "5 min",
    title: "Displacement totals are the beginning of the question.",
    summary: "Definitions, reporting windows, and missing registrations matter. Read the number with the method that produced it.",
    source: "UNHCR Refugee Data Finder",
    url: "https://www.unhcr.org/refugee-statistics/",
    visual: "displacement",
    visualWord: "COUNT / PEOPLE"
  },
  {
    topic: "health conflict",
    label: "Health",
    readTime: "7 min",
    title: "A hospital is a network, not a building.",
    summary: "Staff, fuel, clean water, medicine, referrals, and safe access determine whether care continues during conflict.",
    source: "WHO emergencies",
    url: "https://www.who.int/emergencies/situations/conflict-in-Israel-and-oPt",
    visual: "health",
    visualWord: "SYSTEM / DOWN"
  },
  {
    topic: "conflict",
    label: "Humanitarian law",
    readTime: "4 min",
    title: "The rules of war are practical constraints, not background theory.",
    summary: "Distinction, proportionality, and precautions shape what parties may do and what monitors document.",
    source: "ICRC law and policy",
    url: "https://www.icrc.org/en/law-and-policy",
    visual: "conflict",
    visualWord: "RULES / APPLY"
  }
];

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

let activeTopic = "all";
let searchTerm = "";

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
  storyGrid.innerHTML = stories.map((story) => `
    <article class="story-card searchable" data-topic="${story.topic}" data-search="${story.label} ${story.title} ${story.summary} ${story.source}">
      <a class="story-card-visual visual-${story.visual}" href="${story.url}" target="_blank" rel="noreferrer" aria-label="Read source for ${story.title}">
        <span class="visual-label">Source note / ${story.label}</span>
        <span class="visual-word">${story.visualWord}</span>
      </a>
      <div class="story-meta"><span>${story.label}</span><span>${story.readTime}</span></div>
      <h3><a href="${story.url}" target="_blank" rel="noreferrer">${story.title}</a></h3>
      <p>${story.summary}</p>
      <a class="story-source" href="${story.url}" target="_blank" rel="noreferrer">Open source: ${story.source} ↗</a>
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !searchPanel.hidden) {
    searchPanel.hidden = true;
    searchButton.setAttribute("aria-expanded", "false");
    searchButton.focus();
  }
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.querySelector("#form-message");
  message.textContent = "Preview confirmed. Connect an email provider before launch.";
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
