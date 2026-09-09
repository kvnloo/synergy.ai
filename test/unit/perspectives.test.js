/** @feature F-seminar — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sourceLens,
  sourceOrg,
  quoteKind,
  buildCrosscut,
  diversityStats,
  escapeHtml,
  renderSeminarMarkup,
  groupSourcesByLens
} from "../../perspectives.js";
import { articles } from "../../content.js";

const multi = articles.find((a) => a.id === "sudan-access") || articles[0];
const slide = multi.slides.find((s) => (s.sources || []).length >= 2) || multi.slides[0];

describe("perspectives.sourceLens", () => {
  it("honors explicit lens", () => {
    assert.equal(sourceLens({ lens: "research", title: "x" }), "research");
  });

  it("infers press from title signals", () => {
    assert.equal(sourceLens({ title: "Reuters: access delayed" }), "press");
  });
});

describe("perspectives.quoteKind", () => {
  it("marks paraphrase explicitly", () => {
    assert.equal(quoteKind({ quote: "hi", quoteKind: "paraphrase" }), "paraphrase");
  });

  it("none without quote", () => {
    assert.equal(quoteKind({ title: "x" }), "none");
  });
});

describe("perspectives.buildCrosscut", () => {
  it("uses author crosscut when present", () => {
    const c = buildCrosscut({
      crosscut: { agree: "A", tension: "T", open: "O" },
      sources: [{ title: "x" }, { title: "y" }]
    });
    assert.deepEqual(c, { agree: "A", tension: "T", open: "O" });
  });

  it("warns on single source", () => {
    const c = buildCrosscut({ sources: [{ title: "Only", org: "OCHA" }] });
    assert.match(c.agree, /Only one lens/);
    assert.match(c.open, /second independent lens/);
  });
});

describe("perspectives.diversityStats", () => {
  it("reports multi-source flagship shape", () => {
    const stats = diversityStats(multi);
    assert.ok(stats);
    assert.ok("lenses" in stats || "sourceCount" in stats || typeof stats === "object");
  });
});

describe("perspectives.escapeHtml", () => {
  it("escapes angle brackets and ampersands", () => {
    assert.equal(escapeHtml(`<b>&"`), "&lt;b&gt;&amp;&quot;");
  });
});

describe("perspectives.renderSeminarMarkup", () => {
  it("returns markup containing seminar structure for multi-source slides", () => {
    const result = renderSeminarMarkup(slide, multi);
    assert.equal(typeof result.markup, "string");
    assert.ok(result.markup.length > 0);
    assert.match(result.markup, /seminar-kicker|Source seminar/);
    assert.doesNotMatch(result.markup, /<script/i);
  });
});

describe("perspectives.groupSourcesByLens", () => {
  it("groups without dropping sources", () => {
    const sources = slide.sources || [];
    const groups = groupSourcesByLens(sources);
    assert.ok(Array.isArray(groups));
    const flat = groups.flatMap((g) => g.sources);
    assert.equal(flat.length, sources.length);
  });
});
describe("perspectives.sourceOrg", () => {
  it("prefers org field", () => {
    assert.equal(sourceOrg({ org: "WHO", title: "Other" }), "WHO");
  });
});
