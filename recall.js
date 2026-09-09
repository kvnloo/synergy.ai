export const RECALL_KEY = "synergy.recall.v1";

function isoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function buildPrompts(article) {
  const prompts = article.slides.map((slide, index) => ({
    id: `${article.id}:${index}:claim`,
    articleId: article.id,
    slideIndex: index,
    type: "claim",
    cue: `Under “${slide.kind}”, what does this brief claim?`,
    answer: slide.title
  }));
  const chainSlide = article.slides[1] || article.slides[0];
  const chain = chainSlide?.chain || [];
  if (chain.length) {
    prompts.push({
      id: `${article.id}:1:chain`,
      articleId: article.id,
      slideIndex: 1,
      type: "chain",
      cue: `Rebuild the chain (${chain.length} steps). It starts at “${chain[0]}” and ends at “${chain[chain.length - 1]}”.`,
      answer: chain.join(" → ")
    });
  }
  return prompts;
}

export function primingText(article) {
  return `Read to answer: ${article.slides.map((slide) => slide.kind).join(" · ")}. Six recall prompts wait at the end.`;
}

// Stryker disable all: non-pure / DOM-adjacent surface
export function loadState() {
  try {
    const raw = localStorage.getItem(RECALL_KEY);
    if (!raw) return { version: 1, cards: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.cards) {
      return { version: 1, cards: {} };
    }
    return { version: 1, cards: parsed.cards };
  } catch {
    return { version: 1, cards: {} };
  }
}
// Stryker restore all


// Stryker disable all: non-pure / DOM-adjacent surface
export function saveState(state) {
  try {
    localStorage.setItem(RECALL_KEY, JSON.stringify(state));
  } catch {
    /* private mode */
  }
}
// Stryker restore all


export function grade(state, id, result, today = new Date()) {
  const prev = state.cards[id]?.interval;
  let interval;
  if (result === "forgot") {
    interval = 1;
  } else if (result === "hard") {
    interval = Math.max(1, Math.ceil((prev || 1) * 1.3));
  } else {
    interval = prev ? Math.ceil(prev * 2.5) : 3;
  }
  const dueDate = addDays(today, interval);
  state.cards[id] = {
    interval,
    due: isoDate(dueDate),
    reps: (state.cards[id]?.reps || 0) + 1,
    last: isoDate(today)
  };
  return state;
}

export function dueCards(articles, state, today = new Date()) {
  const todayISO = isoDate(today);
  const due = [];
  for (const article of articles) {
    for (const prompt of buildPrompts(article)) {
      const card = state.cards[prompt.id];
      if (card && card.due <= todayISO) {
        due.push(prompt);
      }
    }
  }
  due.sort((a, b) => {
    const da = state.cards[a.id].due;
    const db = state.cards[b.id].due;
    if (da !== db) return da < db ? -1 : 1;
    return 0;
  });
  return due;
}

// Stryker disable all: non-pure / DOM-adjacent surface
export function renderRecall(container, prompts, { state, onGrade }
// Stryker restore all
) {
  container.replaceChildren();
  for (const prompt of prompts) {
    const card = state.cards[prompt.id];
    const article = document.createElement("article");
    article.className = "recall-card";
    article.dataset.id = prompt.id;

    const cue = document.createElement("p");
    cue.className = "recall-cue";
    cue.textContent = prompt.cue;

    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "recall-reveal";
    reveal.textContent = "Reveal";

    const answer = document.createElement("p");
    answer.className = "recall-answer";
    answer.hidden = true;
    answer.textContent = prompt.answer;

    const gradeRow = document.createElement("div");
    gradeRow.className = "recall-grade";
    gradeRow.hidden = true;
    for (const [value, label] of [
      ["forgot", "Forgot"],
      ["hard", "Hard"],
      ["got", "Got it"]
    ]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.grade = value;
      btn.textContent = label;
      gradeRow.append(btn);
    }

    const footer = document.createElement("small");
    footer.className = "recall-next";
    if (card) {
      footer.textContent = `Next: in ${card.interval} day${card.interval === 1 ? "" : "s"}`;
    }

    reveal.addEventListener("click", () => {
      answer.hidden = false;
      gradeRow.hidden = false;
      reveal.disabled = true;
    });

    gradeRow.addEventListener("click", (event) => {
      const button = event.target.closest("[data-grade]");
      if (!button || gradeRow.hidden) return;
      const result = button.dataset.grade;
      onGrade(prompt.id, result);
      const updated = state.cards[prompt.id];
      if (updated) {
        footer.textContent = `Next: in ${updated.interval} day${updated.interval === 1 ? "" : "s"}`;
      }
      for (const child of gradeRow.querySelectorAll("button")) {
        child.disabled = true;
      }
    });

    article.append(cue, reveal, answer, gradeRow, footer);
    container.append(article);
  }
}

export function scoreExplanation(text, summary) {
  const norm = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3);
  const words = new Set(norm(text));
  const targets = norm(summary);
  if (!words.size || !targets.length) return { overlap: 0, hits: 0, total: targets.length };
  const hits = targets.filter((w) => words.has(w)).length;
  return { overlap: hits / targets.length, hits, total: targets.length };
}

export function shuffleSteps(steps) {
  const copy = [...steps];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  // avoid already-correct shuffle
  if (copy.length > 1 && copy.every((s, idx) => s === steps[idx])) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}
