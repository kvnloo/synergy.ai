/** @feature F-companion-pet — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fc from "fast-check";
import {
  clamp,
  simulateCoast,
  velocityFromSamples,
  FLICK_MAX_SPEED,
  stepCoast
} from "../../companion-physics.js";

const boundsArb = fc.record({
  minX: fc.constant(10),
  minY: fc.constant(12),
  maxX: fc.integer({ min: 80, max: 1200 }),
  maxY: fc.integer({ min: 80, max: 1200 })
});

describe("property: clamp", () => {
  it("output always in [a,b] for finite n", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: -1e3, max: 1e3, noNaN: true }),
        fc.double({ min: -1e3, max: 1e3, noNaN: true }),
        (n, a0, b0) => {
          const a = Math.min(a0, b0);
          const b = Math.max(a0, b0);
          const c = clamp(n, a, b);
          return c >= a && c <= b;
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe("property: coast never escapes bounds", () => {
  it("for random flicks inside a pad", () => {
    fc.assert(
      fc.property(
        boundsArb,
        fc.double({ min: -4000, max: 4000, noNaN: true }),
        fc.double({ min: -4000, max: 4000, noNaN: true }),
        (bounds, vx, vy) => {
          if (bounds.maxX <= bounds.minX || bounds.maxY <= bounds.minY) return true;
          const seatX = (bounds.minX + bounds.maxX) / 2;
          const seatY = (bounds.minY + bounds.maxY) / 2;
          const sim = simulateCoast(
            { seatX, seatY, velX: vx, velY: vy },
            { bounds, maxSteps: 400 }
          );
          return sim.stayedInBounds === true;
        }
      ),
      { numRuns: 150 }
    );
  });
});

describe("property: bounce restitution never increases speed on that axis beyond input*rest+eps", () => {
  it("single step wall hit damps", () => {
    fc.assert(
      fc.property(fc.double({ min: 100, max: 3000, noNaN: true }), (speed) => {
        const bounds = { minX: 10, minY: 10, maxX: 200, maxY: 200 };
        const next = stepCoast({
          seatX: 10,
          seatY: 50,
          velX: -speed,
          velY: 0,
          dt: 1 / 60,
          bounds
        });
        // After bounce + friction, |vx| < speed
        return Math.abs(next.velX) < speed;
      }),
      { numRuns: 100 }
    );
  });
});

describe("property: velocity sample cap", () => {
  it("never exceeds max speed", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 8 }),
        fc.array(fc.record({
          t: fc.integer({ min: 0, max: 500 }),
          x: fc.integer({ min: -5000, max: 5000 }),
          y: fc.integer({ min: -5000, max: 5000 })
        }), { minLength: 2, maxLength: 8 }),
        (_n, raw) => {
          const samples = [...raw].sort((a, b) => a.t - b.t);
          // ensure strictly increasing t
          for (let i = 1; i < samples.length; i++) {
            if (samples[i].t <= samples[i - 1].t) samples[i].t = samples[i - 1].t + 1;
          }
          const { vx, vy } = velocityFromSamples(samples);
          return Math.hypot(vx, vy) <= FLICK_MAX_SPEED + 1e-6;
        }
      ),
      { numRuns: 100 }
    );
  });
});
