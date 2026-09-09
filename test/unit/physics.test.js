/** @feature F-companion-pet — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clamp,
  seatBounds,
  clampSeat,
  velocityFromSamples,
  shouldStartCoast,
  stepCoast,
  simulateCoast,
  jellyTargets,
  FLICK_MIN_SPEED,
  FLICK_MAX_SPEED,
  BOUNCE_RESTITUTION
} from "../../companion-physics.js";

describe("physics.clamp", () => {
  it("clamps finite values", () => {
    assert.equal(clamp(5, 0, 3), 3);
    assert.equal(clamp(-1, 0, 3), 0);
  });

  it("uses fallback for non-finite", () => {
    assert.equal(clamp(NaN, 0, 3, 9), 9);
  });
});

describe("physics.seatBounds / clampSeat", () => {
  it("keeps seat inside pad", () => {
    const b = seatBounds(84, 84, 390, 844);
    const c = clampSeat(-100, 9999, b);
    assert.equal(c.x, b.minX);
    assert.equal(c.y, b.maxY);
  });
});

describe("physics.velocityFromSamples", () => {
  it("returns zero with <2 samples", () => {
    assert.deepEqual(velocityFromSamples([{ t: 0, x: 0, y: 0 }]), { vx: 0, vy: 0 });
  });

  it("measures px/s over window", () => {
    const samples = [
      { t: 0, x: 0, y: 0 },
      { t: 100, x: 100, y: 0 }
    ];
    const { vx, vy } = velocityFromSamples(samples);
    assert.ok(Math.abs(vx - 1000) < 1);
    assert.equal(vy, 0);
  });

  it("caps at FLICK_MAX_SPEED", () => {
    const samples = [
      { t: 0, x: 0, y: 0 },
      { t: 16, x: 5000, y: 0 }
    ];
    const { vx, vy } = velocityFromSamples(samples);
    assert.ok(Math.hypot(vx, vy) <= FLICK_MAX_SPEED + 1e-6);
  });
});

describe("physics.shouldStartCoast", () => {
  it("rejects reduced motion and slow flicks", () => {
    assert.equal(shouldStartCoast(1000, 0, { reducedMotion: true }), false);
    assert.equal(shouldStartCoast(10, 0), false);
    assert.equal(shouldStartCoast(FLICK_MIN_SPEED, 0), true);
  });
});

describe("physics.stepCoast / simulateCoast", () => {
  const bounds = { minX: 10, minY: 12, maxX: 300, maxY: 500 };

  it("reflects on left wall with restitution", () => {
    const next = stepCoast({
      seatX: 10,
      seatY: 100,
      velX: -800,
      velY: 0,
      dt: 1 / 60,
      bounds
    });
    assert.equal(next.hit, "x");
    assert.equal(next.seatX, bounds.minX);
    assert.ok(next.velX > 0);
    assert.ok(Math.abs(next.velX - 800 * BOUNCE_RESTITUTION * Math.exp(-1.85 / 60)) < 5);
  });

  it("never leaves bounds over a long coast", () => {
    const sim = simulateCoast(
      { seatX: 100, seatY: 100, velX: 2200, velY: -1600 },
      { bounds }
    );
    assert.equal(sim.stayedInBounds, true);
    assert.equal(sim.final.stopped, true);
    assert.ok(sim.bounces >= 1);
  });

  it("stops below stop speed", () => {
    const next = stepCoast({
      seatX: 50,
      seatY: 50,
      velX: 20,
      velY: 0,
      dt: 1 / 60,
      bounds,
      stopSpeed: 48
    });
    assert.equal(next.stopped, true);
    assert.equal(next.velX, 0);
  });
});

describe("physics.jellyTargets", () => {
  it("stretches along fast horizontal velocity", () => {
    const j = jellyTargets(1200, 0);
    assert.ok(j.sx > 1);
    assert.ok(j.sy < j.sx);
  });

  it("squashes on bounce axis", () => {
    const j = jellyTargets(0, 0, { bounceAxis: "x" });
    assert.ok(j.sx < 1);
    assert.ok(j.sy > 1);
  });
});

describe("physics.survivor hunts", () => {
  it("seatBounds computes max from viewport minus pad", () => {
    const b = seatBounds(80, 90, 400, 800, { x: 10, y: 12, r: 16, b: 22 });
    assert.equal(b.minX, 10);
    assert.equal(b.minY, 12);
    assert.equal(b.maxX, 400 - 80 - 16);
    assert.equal(b.maxY, 800 - 90 - 22);
    assert.equal(b.w, 80);
    assert.equal(b.h, 90);
  });

  it("seatBounds floors max to pad when viewport tiny", () => {
    const b = seatBounds(200, 200, 100, 100, { x: 10, y: 12, r: 16, b: 22 });
    assert.equal(b.maxX, 10);
    assert.equal(b.maxY, 12);
  });

  it("clampSeat keeps interior points", () => {
    const b = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    assert.deepEqual(clampSeat(40, 60, b), { x: 40, y: 60 });
  });

  it("velocity uses ~90ms window not whole trail", () => {
    const samples = [
      { t: 0, x: 0, y: 0 },
      { t: 200, x: 0, y: 0 },
      { t: 300, x: 100, y: 0 }
    ];
    const { vx } = velocityFromSamples(samples, { windowMs: 90 });
    // last 100ms: 100px → ~1000 px/s, not diluted by early samples
    assert.ok(vx > 800 && vx < 1200, `vx=${vx}`);
  });

  it("shouldStartCoast exact threshold", () => {
    assert.equal(shouldStartCoast(FLICK_MIN_SPEED - 1, 0), false);
    assert.equal(shouldStartCoast(0, FLICK_MIN_SPEED), true);
  });

  it("stepCoast hits right and bottom walls", () => {
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const right = stepCoast({
      seatX: 100, seatY: 50, velX: 500, velY: 0, dt: 1 / 60, bounds, friction: 0
    });
    assert.equal(right.hit, "x");
    assert.equal(right.seatX, 100);
    assert.ok(right.velX < 0);

    const bottom = stepCoast({
      seatX: 50, seatY: 100, velX: 0, velY: 500, dt: 1 / 60, bounds, friction: 0
    });
    assert.equal(bottom.hit, "y");
    assert.equal(bottom.seatY, 100);
    assert.ok(bottom.velY < 0);
  });

  it("stepCoast hits top wall", () => {
    const bounds = { minX: 0, minY: 10, maxX: 100, maxY: 100 };
    const top = stepCoast({
      seatX: 50, seatY: 10, velX: 0, velY: -400, dt: 1 / 60, bounds, friction: 0
    });
    assert.equal(top.hit, "y");
    assert.equal(top.seatY, 10);
    assert.ok(top.velY > 0);
  });

  it("restitution multiplies bounce speed", () => {
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const speed = 1000;
    const next = stepCoast({
      seatX: 0, seatY: 50, velX: -speed, velY: 0, dt: 1 / 60, bounds, friction: 0, restitution: 0.5
    });
    assert.ok(Math.abs(next.velX - speed * 0.5) < 1e-6);
  });

  it("jelly holding and bounce-y axis", () => {
    const hold = jellyTargets(0, 0, { holding: true });
    assert.equal(hold.sx, 0.92);
    assert.equal(hold.sy, 0.96);
    const by = jellyTargets(0, 0, { bounceAxis: "y" });
    assert.ok(by.sx > 1);
    assert.ok(by.sy < 1);
  });

  it("jelly vertical velocity stretches sy", () => {
    const j = jellyTargets(0, 1200);
    assert.ok(j.sy > 1);
    assert.ok(j.sx < j.sy);
  });
});

