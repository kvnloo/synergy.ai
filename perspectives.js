/** Multi-source seminar helpers. Inspired by epistemedia claim/span discipline:
 * quotes stay attached to sources; agreement and tension stay separate; thin
 * single-source slides are labeled, not papered over.
 */

export const LENS_LABEL = {
  agency: "Agency",
  local: "Field / local",
  press: "Reporting",
  research: "Research",
  standard: "Standard",
  community: "Community",
  clinical: "Clinical",
  policy: "Policy"
};

export function sourceOrg(source) {
  if (source.org) return source.org;
  const title = String(source.title || "");
  const beforeColon = title.split(":")[0].trim();
  if (beforeColon && beforeColon.length < 48) return beforeColon;
  return title.slice(0, 40) || "Source";
}

export function sourceLens(source) {
  if (source.lens && LENS_LABEL[source.lens]) return source.lens;
  const blob = `${source.kind || ""} ${source.evidenceType || ""} ${source.title || ""}`.toLowerCase();
  if (/peer-reviewed|lancet|journal|study|research|doi/.test(blob)) return "research";
  if (/who|ocha|unhcr|icrc|iasc|cdc|niosh|ohchr|unicef|wfp/.test(blob)) return "agency";
  if (/reuters|bbc|ap |guardian|al jazeera|nytimes|reporting/.test(blob)) return "press";
  if (/sphere|standard|principle|guideline/.test(blob)) return "standard";
  if (/msf|local|community|red crescent|clinic/.test(blob)) return "local";
  if (String(source.relation || "") === "risk") return "press";
  return "agency";
}

export function sourceClaim(source) {
  return source.claim || source.note || "";
}

export function sourceQuote(source) {
  const q = String(source.quote || "").trim();
  return q || "";
}

export function quoteKind(source) {
  if (source.quoteKind === "paraphrase") return "paraphrase";
  if (sourceQuote(source)) return source.quoteKind || "verbatim";
  return "none";
}

export function buildCrosscut(slide) {
  if (slide.crosscut && (slide.crosscut.agree || slide.crosscut.tension || slide.crosscut.open)) {
    return {
      agree: slide.crosscut.agree || "",
      tension: slide.crosscut.tension || "",
      open: slide.crosscut.open || ""
    };
  }
  const sources = slide.sources || [];
  if (sources.length < 2) {
    return {
      agree: sources[0]
        ? "Only one lens is attached. Treat the claim as a lead, not a settled map."
        : "",
      tension: "",
      open: sources[0]
        ? "Add a second independent lens before you act on this slide alone."
        : ""
    };
  }
  const support = sources.filter((s) => ["supports", "principle", "method"].includes(s.relation));
  const friction = sources.filter((s) =>
    ["qualifies", "limits", "risk", "context"].includes(s.relation)
  );
  const orgs = [...new Set(sources.map(sourceOrg))];
  return {
    agree: support.length
      ? `${support.map(sourceOrg).join(" · ")} back the core claim.`
      : `${orgs.slice(0, 3).join(" · ")} sit on the same slide. Read each lens.`,
    tension: friction.length
      ? `${friction.map(sourceOrg).join(" · ")} qualify, limit, or reframe it.`
      : "No dissent is tagged. That can mean agreement, or a missing counter-source.",
    open: sources.length < 3
      ? "Fewer than three independent lenses. A local, press, or research view may still be missing."
      : sources.some((s) => !sourceQuote(s))
        ? "Some sources still lack a frozen quote. Open the link before you rely on wording."
        : ""
  };
}

export function groupSourcesByLens(sources = []) {
  const groups = new Map();
  for (const source of sources) {
    const lens = sourceLens(source);
    if (!groups.has(lens)) groups.set(lens, []);
    groups.get(lens).push(source);
  }
  const order = ["agency", "local", "press", "research", "clinical", "policy", "standard", "community"];
  return order
    .filter((lens) => groups.has(lens))
    .concat([...groups.keys()].filter((lens) => !order.includes(lens)))
    .map((lens) => ({
      lens,
      label: LENS_LABEL[lens] || lens,
      sources: groups.get(lens)
    }));
}

export function seminarQuestions(slide, article) {
  if (Array.isArray(slide.seminar) && slide.seminar.length) return slide.seminar.slice(0, 3);
  if (Array.isArray(slide.questions) && slide.questions.length) return slide.questions.slice(0, 3);
  const orgs = [...new Set((slide.sources || []).map(sourceOrg))].slice(0, 2);
  const a = orgs[0] || "one source";
  const b = orgs[1] || "another source";
  return [
    `What does ${a} assert that ${b} does not?`,
    "If you had to act tomorrow, which disagreement would change your plan?",
    `What evidence would make you drop the claim in “${slide.title.slice(0, 42)}”?`
  ];
}

export function diversityStats(article) {
  const all = article.slides.flatMap((slide) => slide.sources || []);
  const urls = new Set(all.map((s) => s.url).filter(Boolean));
  const lenses = new Set(all.map(sourceLens));
  const orgs = new Set(all.map(sourceOrg));
  const quoted = all.filter((s) => sourceQuote(s)).length;
  const thinSlides = article.slides.filter((s) => (s.sources || []).length < 2).length;
  const sourceCount = Math.max(urls.size, all.length);
  return {
    sources: sourceCount,
    lenses: lenses.size,
    orgs: orgs.size,
    quoted,
    thinSlides,
    multi: lenses.size >= 2 && (sourceCount >= 6 || quoted >= 6)
  };
}

export function perspectivesSummary(slide, article) {
  const sources = slide.sources || [];
  return {
    count: sources.length,
    groups: groupSourcesByLens(sources),
    crosscut: buildCrosscut(slide),
    questions: seminarQuestions(slide, article),
    thin: sources.length < 2,
    quoted: sources.filter((s) => sourceQuote(s)).length
  };
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSeminarMarkup(slide, article, { startIndex = 0 } = {}) {
  const summary = perspectivesSummary(slide, article);
  const { crosscut, groups, questions, thin, count, quoted } = summary;
  const lensChips = groups
    .map(
      (g) =>
        `<span class="lens-chip" data-lens="${escapeHtml(g.lens)}">${escapeHtml(g.label)} · ${g.sources.length}</span>`
    )
    .join("");

  const cross = `
    <div class="seminar-crosscut">
      ${crosscut.agree ? `<div class="cross-block cross-agree"><h4>What holds</h4><p>${escapeHtml(crosscut.agree)}</p></div>` : ""}
      ${crosscut.tension ? `<div class="cross-block cross-tension"><h4>Where they pull apart</h4><p>${escapeHtml(crosscut.tension)}</p></div>` : ""}
      ${crosscut.open ? `<div class="cross-block cross-open"><h4>Still open</h4><p>${escapeHtml(crosscut.open)}</p></div>` : ""}
    </div>`;

  const ask = `
    <div class="seminar-ask">
      <h4>Think with the room</h4>
      <ol>${questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ol>
    </div>`;

  let index = startIndex;
  const voices = groups
    .map((group) => {
      const cards = group.sources
        .map((source) => {
          const i = index;
          index += 1;
          const q = sourceQuote(source);
          const kind = quoteKind(source);
          const claim = sourceClaim(source);
          const quoteBlock = q
            ? `<blockquote class="source-quote" data-quote-kind="${escapeHtml(kind)}"><p>“${escapeHtml(q)}”</p><footer>${kind === "paraphrase" ? "Paraphrase · " : ""}${escapeHtml(sourceOrg(source))}</footer></blockquote>`
            : `<p class="source-claim-only">${escapeHtml(claim || "Open the source for exact wording.")}</p>`;
          return `
          <article class="voice-card" data-lens="${escapeHtml(group.lens)}">
            <div class="voice-meta">
              <span class="evidence-type">${escapeHtml(source.kind || source.relation || group.label)}</span>
              <span class="voice-relation">${escapeHtml(source.relation)}</span>
            </div>
            <a class="voice-title" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)} ↗</a>
            ${claim && q ? `<p class="voice-claim">${escapeHtml(claim)}</p>` : ""}
            ${quoteBlock}
            <button class="evidence-verify" type="button" data-source="${i}">Verify this span</button>
          </article>`;
        })
        .join("");
      return `
        <section class="voice-group">
          <h4 class="voice-group-title">${escapeHtml(group.label)}</h4>
          <div class="voice-grid">${cards}</div>
        </section>`;
    })
    .join("");

  const thinNote = thin
    ? `<p class="seminar-thin">Thin slide: one lens only. This is a lead, not a multi-source verdict.</p>`
    : "";

  return {
    markup: `
      <div class="seminar-head">
        <div>
          <p class="seminar-kicker">Source seminar</p>
          <p class="seminar-count">${count} source${count === 1 ? "" : "s"} · ${groups.length} lens${groups.length === 1 ? "" : "es"} · ${quoted} quoted</p>
        </div>
        <div class="lens-row">${lensChips}</div>
      </div>
      ${thinNote}
      ${cross}
      ${ask}
      <div class="seminar-voices">${voices}</div>
    `,
    nextIndex: index,
    summary
  };
}
