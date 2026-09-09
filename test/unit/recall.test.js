/** @feature F-recall — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildPrompts,
  primingText,
  grade,
  dueCards,
  scoreExplanation,
  shuffleSteps
} from "../../recall.js";
import { articles } from "../../content.js";

const sample = articles[0];

describe("recall.buildPrompts", () => {
  it("builds one claim cue per slide plus optional chain", () => {
    const prompts = buildPrompts(sample);
    const claims = prompts.filter((p) => p.type === "claim");
    assert.equal(claims.length, sample.slides.length);
    assert.ok(prompts.every((p) => p.articleId === sample.id));
    assert.ok(prompts.every((p) => p.cue && p.answer));
  });

  it("ids are stable and unique", () => {
    const prompts = buildPrompts(sample);
    const ids = prompts.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("recall.primingText", () => {
  it("lists slide kinds", () => {
    const text = primingText(sample);
    assert.match(text, /^Read to answer:/);
    for (const slide of sample.slides) {
      assert.match(text, new RegExp(slide.kind));
    }
  });
});

describe("recall.grade", () => {
  const today = new Date(2026, 8, 9); // local date, month 0-index

  it("forgot resets interval to 1 day", () => {
    const state = { version: 1, cards: {} };
    grade(state, "a", "forgot", today);
    assert.equal(state.cards.a.interval, 1);
    assert.equal(state.cards.a.reps, 1);
    assert.equal(state.cards.a.last, "2026-09-09");
  });

  it("got first success schedules 3 days", () => {
    const state = { version: 1, cards: {} };
    grade(state, "a", "got", today);
    assert.equal(state.cards.a.interval, 3);
  });

  it("got multiplies prior interval by 2.5 ceil", () => {
    const state = { version: 1, cards: { a: { interval: 3, due: "2026-09-09", reps: 1, last: "2026-09-06" } } };
    grade(state, "a", "got", today);
    assert.equal(state.cards.a.interval, Math.ceil(3 * 2.5));
    assert.equal(state.cards.a.reps, 2);
  });

  it("hard multiplies by 1.3 with floor 1", () => {
    const state = { version: 1, cards: {} };
    grade(state, "a", "hard", today);
    assert.equal(state.cards.a.interval, Math.max(1, Math.ceil(1 * 1.3)));
  });
});

describe("recall.dueCards", () => {
  it("returns only due cards ordered by due date", () => {
    const prompts = buildPrompts(sample);
    const a = prompts[0].id;
    const b = prompts[1].id;
    const state = {
      version: 1,
      cards: {
        [a]: { interval: 1, due: "2026-09-08", reps: 1, last: "2026-09-07" },
        [b]: { interval: 1, due: "2026-09-10", reps: 1, last: "2026-09-09" }
      }
    };
    const due = dueCards([sample], state, new Date(2026, 8, 9));
    assert.equal(due.length, 1);
    assert.equal(due[0].id, a);
  });
});

describe("recall.scoreExplanation", () => {
  it("scores overlap against summary tokens", () => {
    const summary = "Access is the bottleneck for aid in Sudan conflict zones.";
    const good = scoreExplanation("Aid access is the bottleneck in Sudan", summary);
    const bad = scoreExplanation("I like pizza", summary);
    assert.ok(good.overlap > bad.overlap);
  });
});

describe("recall.shuffleSteps", () => {
  it("preserves multiset of steps", () => {
    const steps = ["a", "b", "c", "d"];
    const out = shuffleSteps(steps);
    assert.deepEqual([...out].sort(), [...steps].sort());
  });
});
