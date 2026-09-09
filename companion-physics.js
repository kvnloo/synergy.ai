/**
 * Pure physics for the Syn companion pet.
 * No DOM. Used by companion-bot.js and unit/property/mutation tests.
 */

export const FLICK_MIN_SPEED = 220;
export const FLICK_MAX_SPEED = 3400;
export const COAST_FRICTION = 1.85;
export const BOUNCE_RESTITUTION = 0.78;
export const COAST_STOP_SPEED = 48;
export const JELLY_MAX = 0.38;
export const VELOCITY_WINDOW_MS = 90;

export function clamp(n, a, b, fallback = a) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(b, Math.max(a, n));
}

export function seatBounds(width, height, viewportW, viewportH, pad = { x: 10, y: 12, r: 16, b: 22 }) {
  return {
    minX: pad.x,
    minY: pad.y,
    maxX: Math.max(pad.x, viewportW - width - pad.r),
    maxY: Math.max(pad.y, viewportH - height - pad.b),
    w: width,
    h: height
  };
}

export function clampSeat(x, y, bounds) {
  return {
    x: clamp(x, bounds.minX, bounds.maxX, bounds.maxX),
    y: clamp(y, bounds.minY, bounds.maxY, bounds.maxY)
  };
}

/** Sample pointer trail → velocity (px/s), capped. */
export function velocityFromSamples(samples, {
  windowMs = VELOCITY_WINDOW_MS,
  maxSpeed = FLICK_MAX_SPEED
} = {}) {
  if (!Array.isArray(samples) || samples.length < 2) return { vx: 0, vy: 0 };
  const newest = samples[samples.length - 1];
  let oldest = samples[0];
  for (let i = samples.length - 2; i >= 0; i -= 1) {
    if (newest.t - samples[i].t >= windowMs) {
      oldest = samples[i];
      break;
    }
    oldest = samples[i];
  }
  const dt = Math.max(0.016, (newest.t - oldest.t) / 1000);
  let vx = (newest.x - oldest.x) / dt;
  let vy = (newest.y - oldest.y) / dt;
  const speed = Math.hypot(vx, vy);
  if (speed > maxSpeed) {
    const s = maxSpeed / speed;
    vx *= s;
    vy *= s;
  }
  return { vx, vy };
}

export function shouldStartCoast(vx, vy, {
  minSpeed = FLICK_MIN_SPEED,
  reducedMotion = false
} = {}) {
  if (reducedMotion) return false;
  return Math.hypot(vx, vy) >= minSpeed;
}

/**
 * One integration step of coasting pong physics.
 * @returns {{ seatX, seatY, velX, velY, hit: null|"x"|"y", stopped: boolean }}
 */
export function stepCoast({
  seatX,
  seatY,
  velX,
  velY,
  dt,
  bounds,
  friction = COAST_FRICTION,
  restitution = BOUNCE_RESTITUTION,
  stopSpeed = COAST_STOP_SPEED
}) {
  let x = seatX + velX * dt;
  let y = seatY + velY * dt;
  let vx = velX;
  let vy = velY;
  let hit = null;

  if (x < bounds.minX) {
    x = bounds.minX;
    vx = Math.abs(vx) * restitution;
    hit = "x";
  } else if (x > bounds.maxX) {
    x = bounds.maxX;
    vx = -Math.abs(vx) * restitution;
    hit = "x";
  }
  if (y < bounds.minY) {
    y = bounds.minY;
    vy = Math.abs(vy) * restitution;
    hit = hit || "y";
  } else if (y > bounds.maxY) {
    y = bounds.maxY;
    vy = -Math.abs(vy) * restitution;
    hit = hit || "y";
  }

  const damp = Math.exp(-friction * dt);
  vx *= damp;
  vy *= damp;

  const stopped = Math.hypot(vx, vy) < stopSpeed;
  if (stopped) {
    vx = 0;
    vy = 0;
  }

  return { seatX: x, seatY: y, velX: vx, velY: vy, hit, stopped };
}

/** Run coast until stop or maxSteps. Returns path stats. */
export function simulateCoast(state, {
  dt = 1 / 60,
  maxSteps = 600,
  ...opts
} = {}) {
  let cur = { ...state, hit: null, stopped: false };
  let bounces = 0;
  let steps = 0;
  const path = [{ x: cur.seatX, y: cur.seatY }];

  while (steps < maxSteps && !cur.stopped) {
    cur = stepCoast({ ...cur, dt, ...opts });
    if (cur.hit) bounces += 1;
    path.push({ x: cur.seatX, y: cur.seatY });
    steps += 1;
    if (Math.hypot(cur.velX, cur.velY) === 0 && cur.stopped) break;
  }

  return {
    final: cur,
    bounces,
    steps,
    path,
    stayedInBounds: path.every(
      (p) =>
        p.x >= opts.bounds.minX - 1e-6 &&
        p.x <= opts.bounds.maxX + 1e-6 &&
        p.y >= opts.bounds.minY - 1e-6 &&
        p.y <= opts.bounds.maxY + 1e-6
    )
  };
}

/** Jelly stretch targets from velocity (axis-aligned approx). */
export function jellyTargets(vx, vy, {
  max = JELLY_MAX,
  holding = false,
  bounceAxis = null
} = {}) {
  let tx = 1;
  let ty = 1;
  if (holding) {
    tx = 0.92;
    ty = 0.96;
  }
  const speed = Math.hypot(vx, vy);
  if (speed > 20) {
    const amount = clamp(speed / 1400, 0, max, 0);
    const ang = Math.atan2(vy, vx);
    const ax = Math.abs(Math.cos(ang));
    const ay = Math.abs(Math.sin(ang));
    tx = 1 + amount * ax - amount * 0.45 * ay;
    ty = 1 + amount * ay - amount * 0.45 * ax;
  }
  if (bounceAxis === "x") {
    tx *= 0.82;
    ty *= 1.16;
  } else if (bounceAxis === "y") {
    tx *= 1.16;
    ty *= 0.82;
  }
  return { sx: tx, sy: ty };
}
