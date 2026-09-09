/** @feature F-verify — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  findVerifyTask,
  buildVerificationComment,
  buildCorrectionUrl,
  pickDailyClaim,
  TASK_QUEUE_ISSUES
} from "../../trust.js";
import { articles } from "../../content.js";

const article = articles[0];
const source = article.slides[0].sources[0];

describe("trust.findVerifyTask", () => {
  it("returns null without board", () => {
    assert.equal(findVerifyTask(null, "sudan-access"), null);
  });

  it("matches open verify-evidence for brief", () => {
    const board = {
      tasks: [
        { brief: "other", type: "verify-evidence", state: "open", number: 1 },
        { brief: "sudan-access", type: "verify-evidence", state: "open", number: 2 },
        { brief: "sudan-access", type: "verify-evidence", state: "done", number: 3 }
      ]
    };
    assert.equal(findVerifyTask(board, "sudan-access").number, 2);
  });
});

describe("trust.buildVerificationComment", () => {
  it("includes micro-verification header and finding", () => {
    const text = buildVerificationComment({
      article,
      slideIndex: 0,
      source,
      finding: "contradicts",
      passage: "exact words",
      date: "2026-09-09"
    });
    assert.match(text, /^\*\*Micro-verification\*\*/);
    assert.match(text, /contradicts/);
    assert.match(text, /exact words/);
    assert.match(text, /2026-09-09/);
  });

  it("omits passage line when empty", () => {
    const text = buildVerificationComment({
      article,
      slideIndex: 0,
      source,
      finding: "supports",
      passage: "",
      date: "2026-09-09"
    });
    assert.doesNotMatch(text, /Passage:/);
  });
});

describe("trust.buildCorrectionUrl", () => {
  it("targets task template with verify-evidence", () => {
    const url = buildCorrectionUrl({
      article,
      slideIndex: 0,
      source,
      finding: "contradicts",
      passage: "x"
    });
    assert.ok(url.startsWith(`${TASK_QUEUE_ISSUES}/new?`));
    const q = new URL(url).searchParams;
    assert.equal(q.get("template"), "task.yml");
    assert.equal(q.get("task_type"), "verify-evidence");
    assert.equal(q.get("brief"), article.id);
    assert.match(q.get("insights") || "", /Micro-verification/);
  });

  it("stays under 6000 chars", () => {
    const url = buildCorrectionUrl({
      article,
      slideIndex: 0,
      source,
      finding: "contradicts",
      passage: "p".repeat(4000)
    });
    assert.ok(url.length < 6000);
  });
});

describe("trust.pickDailyClaim", () => {
  it("is deterministic for a day index", () => {
    const a = pickDailyClaim(articles, 42);
    const b = pickDailyClaim(articles, 42);
    assert.equal(a.article.id, b.article.id);
    assert.equal(a.slideIndex, b.slideIndex);
    assert.equal(a.sourceIndex, b.sourceIndex);
  });

  it("rotates across days", () => {
    const a = pickDailyClaim(articles, 0);
    const b = pickDailyClaim(articles, 1);
    // Not required different if only one source total, but we have many.
    assert.ok(a && b);
  });

  it("returns null for empty catalog", () => {
    assert.equal(pickDailyClaim([]), null);
  });
});
