export const TASK_QUEUE_ISSUES = "https://github.com/kvnloo/synergy-tasks/issues";

export function findVerifyTask(board, articleId) {
  const tasks = board?.tasks;
  if (!Array.isArray(tasks)) return null;
  return (
    tasks.find(
      (task) =>
        task.brief === articleId &&
        task.type === "verify-evidence" &&
        task.state !== "done"
    ) || null
  );
}

export function buildVerificationComment({ article, slideIndex, source, finding, passage, date }) {
  const slide = article.slides[slideIndex];
  const lines = [
    `**Micro-verification** · brief \`${article.id}\` · slide ${slideIndex + 1} “${slide.title}”`,
    `Source: [${source.title}](${source.url}) · claimed relation: ${source.relation}`,
    `Reader finding: **${finding}**`,
  ];
  if (passage) {
    lines.push(`Passage: “${passage}”`);
  }
  lines.push(`Checked ${date} · unverified reader report via synergy.ai`);
  return lines.join("\n");
}

export function buildCorrectionUrl({ article, slideIndex, source, finding, passage }) {
  const slide = article.slides[slideIndex];
  const insights = buildVerificationComment({
    article,
    slideIndex,
    source,
    finding,
    passage,
    date: new Date().toISOString().slice(0, 10)
  });
  const params = new URLSearchParams({
    template: "task.yml",
    title: `Correction: ${article.id} slide ${slideIndex + 1} — ${slide.title.slice(0, 60)}`,
    brief: article.id,
    task_type: "verify-evidence",
    jurisdiction: "Global; assess per source.",
    intended_user: "Synergy readers and humanitarian practitioners.",
    hypothesis: `Slide ${slideIndex + 1} “${slide.title}” is not supported as written by its cited sources.`,
    insights,
    deliverables:
      "contributions/<issue>/evidence-ledger.md: exact passage, relation, KEEP | REVISE | RETRACT."
  });
  let url = `${TASK_QUEUE_ISSUES}/new?${params}`;
  if (url.length >= 6000) {
    params.set("insights", insights.slice(0, Math.max(0, 1500 - (url.length - 5999))));
    url = `${TASK_QUEUE_ISSUES}/new?${params}`;
  }
  return url;
}

export function pickDailyClaim(articles, dayIndex = Math.floor(Date.now() / 86400000)) {
  const entries = [];
  for (const article of articles) {
    article.slides.forEach((slide, slideIndex) => {
      slide.sources.forEach((source, sourceIndex) => {
        entries.push({ article, slideIndex, sourceIndex, source, slide });
      });
    });
  }
  if (!entries.length) return null;
  return entries[dayIndex % entries.length];
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
