/** @feature F-recall — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fc from "fast-check";
import { grade } from "../../recall.js";

describe("property: grade invariants", () => {
  it("interval always positive integer; reps monotonic", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("forgot", "hard", "got"),
        fc.integer({ min: 0, max: 40 }),
        fc.integer({ min: 0, max: 20 }),
        (result, priorInterval, priorReps) => {
          const state = {
            version: 1,
            cards: priorReps
              ? {
                  x: {
                    interval: Math.max(1, priorInterval),
                    due: "2026-01-01",
                    reps: priorReps,
                    last: "2026-01-01"
                  }
                }
              : {}
          };
          const beforeReps = state.cards.x?.reps || 0;
          grade(state, "x", result, new Date(2026, 0, 15));
          const card = state.cards.x;
          return (
            Number.isInteger(card.interval) &&
            card.interval >= 1 &&
            card.reps === beforeReps + 1 &&
            /^\d{4}-\d{2}-\d{2}$/.test(card.due) &&
            card.last === "2026-01-15"
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  it("forgot always yields interval 1", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (prev) => {
        const state = {
          version: 1,
          cards: { x: { interval: prev, due: "2026-01-01", reps: 3, last: "2026-01-01" } }
        };
        grade(state, "x", "forgot", new Date(2026, 0, 2));
        return state.cards.x.interval === 1;
      }),
      { numRuns: 50 }
    );
  });
});
