/**
 * Syn companion — Moodie-style face as a draggable page pet.
 *
 * Face geometry + expression table adapted from Moodie (MIT)
 *   https://github.com/arhxam/moodie-react  ·  https://moodie.arhamamin.com
 * Liveliness (loop noise wander, blink curve, breath) adapted from bloub (MIT)
 *   https://github.com/jeremy-prt/bloub
 *
 * Pet: fixed viewport seat, pointer-drag with capture, click-to-poke bubble
 * (no chat panel). Position persists in localStorage.
 *
 * CSP-safe ES module — no React / no motion package.
 */

const EYE_POINTS = 12;
const POS_KEY = "synergy.syn.pet.pos";
const DRAG_THRESHOLD = 6;
const TAU = Math.PI * 2;

function eye(x, y, width, height, rotation = 0, curve = 0.8, skew = 0, open = 1) {
  return { x, y, width, height, rotation, curve, skew, open };
}

/** Moodie presets + bloub emotion coverage, flat SVG geometry (MIT). */
const EXPRESSIONS = {
  neutral: { label: "Neutral", left: eye(72, 94, 22, 42, -5), right: eye(128, 94, 22, 42, 5) },
  happy: { label: "Happy", left: eye(72, 100, 31, 13, 7, 0.38), right: eye(128, 100, 31, 13, -7, 0.38), body: { y: -2 }, reaction: "bounce" },
  excited: { label: "Excited", left: eye(70, 96, 29, 53, -9, 0.92), right: eye(130, 96, 29, 53, 9, 0.92), body: { scaleX: 1.03, scaleY: 0.97 }, reaction: "bounce" },
  sleepy: { label: "Sleepy", left: eye(72, 100, 28, 34, 2, 0.55, 0, 0.42), right: eye(128, 100, 28, 34, -2, 0.55, 0, 0.42), body: { rotate: -3, y: 4 }, reaction: "tilt" },
  worried: { label: "Worried", left: eye(72, 96, 22, 38, 16, 0.76), right: eye(128, 96, 22, 38, -16, 0.76), reaction: "tilt" },
  thinking: { label: "Thinking", left: eye(68, 91, 17, 30, -18, 0.88), right: eye(126, 101, 32, 15, -24, 0.46), body: { rotate: -4 }, reaction: "tilt" },
  curious: { label: "Curious", left: eye(70, 89, 18, 34, -12, 0.85), right: eye(130, 100, 31, 47, 10, 0.84), body: { rotate: 5 }, reaction: "tilt" },
  surprised: { label: "Surprised", left: eye(72, 95, 34, 52, 0, 1), right: eye(128, 95, 34, 52, 0, 1), body: { scaleX: 0.96, scaleY: 1.04 }, reaction: "bounce" },
  focused: { label: "Focused", left: eye(72, 97, 31, 13, 14, 0.4), right: eye(128, 97, 31, 13, -14, 0.4), body: { scaleX: 1.01 }, reaction: "squash" },
  cheeky: { label: "Cheeky", left: eye(72, 94, 28, 13, 10, 0.35), right: eye(128, 95, 21, 42, 8, 0.84), body: { rotate: 4 }, reaction: "tilt" },
  calm: { label: "Calm", left: eye(72, 99, 34, 9, 0, 0.3), right: eye(128, 99, 34, 9, 0, 0.3), body: { scaleX: 1.01, scaleY: 0.99 } },
  wink: { label: "Wink", left: eye(72, 99, 35, 8, 8, 0.25), right: eye(128, 95, 23, 43, 4, 0.85), body: { rotate: 3 }, reaction: "bounce" },
  alert: { label: "Alert", left: eye(72, 91, 21, 48, -3, 0.9), right: eye(128, 91, 21, 48, 3, 0.9), body: { y: -3, scaleY: 1.02 }, reaction: "bounce" },
  angry: { label: "Angry", left: eye(72, 97, 30, 14, 28, 0.4), right: eye(128, 97, 30, 14, -28, 0.4), body: { y: 1, scaleY: 0.98 }, reaction: "squash" },
  sad: { label: "Sad", left: eye(72, 100, 20, 36, -26, 0.78), right: eye(128, 100, 20, 36, 26, 0.78), body: { y: 3, rotate: -2 }, reaction: "tilt" },
  shy: { label: "Shy", left: eye(68, 98, 16, 28, -4, 0.8), right: eye(124, 98, 16, 28, 4, 0.8), body: { rotate: -6, y: 2 }, reaction: "tilt" },
  bored: { label: "Bored", left: eye(70, 99, 30, 11, 0, 0.28), right: eye(130, 99, 30, 11, 0, 0.28), body: { rotate: 2 }, reaction: "tilt" },
  proud: { label: "Proud", left: eye(72, 96, 28, 14, 16, 0.36), right: eye(128, 96, 28, 14, -16, 0.36), body: { y: -3, scaleY: 1.02 }, reaction: "bounce" },
  confused: { label: "Confused", left: eye(68, 92, 18, 40, -16, 0.85), right: eye(130, 100, 28, 14, 12, 0.4), body: { rotate: 7 }, reaction: "tilt" }
};

const MOOD_TO_EXPRESSION = {
  greet: "curious",
  home: "calm",
  stories: "curious",
  reading: "focused",
  board: "thinking",
  projects: "excited",
  principles: "neutral",
  voice: "alert",
  poke: "happy",
  idle: "sleepy"
};

const MOOD_LINES = {
  greet: ["Hey — drag me anywhere. I'm your page pet.", "Poke me. I'll hop."],
  home: ["Slow scroll. I'm parked.", "Nice corner."],
  stories: ["These notes keep their sources.", "Open one — I'll lean in."],
  reading: ["Reading with you.", "Worth pinning?"],
  board: ["Sketch the messy thought.", "I'll hold it."],
  projects: ["Something here wants a builder.", "Pick a lane."],
  principles: ["Small claims. Real sources.", "Hold me to it."],
  voice: ["I'm all ears.", "Say it out loud."],
  poke: ["Boop.", "Still here.", "That tickled.", "Again?", "Ok ok — I'm awake."],
  idle: ["…", "zzz", "Whenever."]
};

const POKE_EXPRESSIONS = ["happy", "cheeky", "wink", "surprised", "excited", "curious", "proud"];

function clamp(n, a, b, fallback = a) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(b, Math.max(a, n));
}

function round(n) {
  return Number(n.toFixed(3));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function rotatePoint(x, y, degrees) {
  const rad = (degrees * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [x * c - y * s, x * s + y * c];
}

function createClosedPath(points, tension = 1) {
  if (points.length < 3) return "";
  const safeTension = clamp(tension, 0, 2, 1);
  const first = points[0];
  let path = `M${round(first[0])},${round(first[1])}`;
  for (let i = 0; i < points.length; i += 1) {
    const prev = points[(i - 1 + points.length) % points.length];
    const cur = points[i];
    const next = points[(i + 1) % points.length];
    const after = points[(i + 2) % points.length];
    const c1 = [
      round(cur[0] + ((next[0] - prev[0]) / 6) * safeTension),
      round(cur[1] + ((next[1] - prev[1]) / 6) * safeTension)
    ];
    const c2 = [
      round(next[0] - ((after[0] - cur[0]) / 6) * safeTension),
      round(next[1] - ((after[1] - cur[1]) / 6) * safeTension)
    ];
    path += `C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${round(next[0])},${round(next[1])}`;
  }
  return `${path}Z`;
}

function createEyePoints(geometry = {}) {
  const centerX = clamp(geometry.x, -100, 300, 0);
  const centerY = clamp(geometry.y, -100, 300, 0);
  const width = clamp(geometry.width, 2, 120, 24);
  const height = clamp(geometry.height, 2, 120, 44);
  const rotation = clamp(geometry.rotation, -180, 180, 0);
  const curve = clamp(geometry.curve, 0, 1, 0.78);
  const skew = clamp(geometry.skew, -1, 1, 0);
  const exponent = 2 + curve * 2.4;
  return Array.from({ length: EYE_POINTS }, (_, index) => {
    const angle = (index / EYE_POINTS) * Math.PI * 2;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const localX =
      Math.sign(cosine || 1) * Math.pow(Math.abs(cosine), 2 / exponent) * (width / 2)
      + sine * skew * (height / 5);
    const localY =
      Math.sign(sine || 1) * Math.pow(Math.abs(sine), 2 / exponent) * (height / 2);
    const [rx, ry] = rotatePoint(localX, localY, rotation);
    return [round(centerX + rx), round(centerY + ry)];
  });
}

function createEyePath(geometry = {}) {
  const curve = clamp(geometry.curve, 0, 1, 0.78);
  return createClosedPath(createEyePoints(geometry), 0.82 + curve * 0.12);
}

function createBlobBodyPath() {
  const points = Array.from({ length: 16 }, (_, index) => {
    const angle = (index / 16) * Math.PI * 2 - Math.PI / 2;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const unitX = Math.sign(cosine || 1) * Math.abs(cosine);
    const unitY = Math.sign(sine || 1) * Math.abs(sine);
    const wobble = 1 + Math.sin(angle * 3 + 0.7) * 0.045 + Math.cos(angle * 2 - 0.4) * 0.025;
    return [round(100 + unitX * 88 * wobble), round(100 + 2 + unitY * (88 / wobble))];
  });
  return createClosedPath(points, 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpEye(a, b, t) {
  return {
    x: lerp(a.x ?? 0, b.x ?? 0, t),
    y: lerp(a.y ?? 0, b.y ?? 0, t),
    width: lerp(a.width ?? 24, b.width ?? 24, t),
    height: lerp(a.height ?? 44, b.height ?? 44, t),
    rotation: lerp(a.rotation ?? 0, b.rotation ?? 0, t),
    curve: lerp(a.curve ?? 0.8, b.curve ?? 0.8, t),
    skew: lerp(a.skew ?? 0, b.skew ?? 0, t),
    open: lerp(a.open ?? 1, b.open ?? 1, t)
  };
}

function spring(state, target, stiffness, damping, dt) {
  const force = (target - state.x) * stiffness;
  state.v = (state.v + force * dt) * damping;
  state.x += state.v * dt;
  if (Math.abs(target - state.x) < 0.0005 && Math.abs(state.v) < 0.0005) {
    state.x = target;
    state.v = 0;
  }
  return state.x;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1, 0), 3);
}

/** bloub loopNoise — seamless 1D wander for idle gaze. */
function loopNoise(t, period, seed = 0) {
  const p = (t / period) * TAU;
  return (
    0.55 * Math.sin(p + seed)
    + 0.3 * Math.sin(2 * p + seed * 1.7 + 1.1)
    + 0.15 * Math.sin(3 * p + seed * 2.3 + 2.4)
  );
}

function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BLINK_RNG = createRng(0x5eed);
const BLINK_DUR = 0.18;
const BLINKS = (() => {
  const out = [];
  let t = 1.4;
  while (t < 900) {
    out.push(t);
    t += 1.9 + BLINK_RNG() * 2.7;
    if (BLINK_RNG() < 0.18) {
      out.push(t);
      t += 0.24;
    }
  }
  return out;
})();

/** bloub blinkLid: 1 open → 0 closed → 1 open over BLINK_DUR. */
function blinkLid(tSec) {
  for (let i = 0; i < BLINKS.length; i += 1) {
    const start = BLINKS[i];
    if (tSec < start) break;
    const k = (tSec - start) / BLINK_DUR;
    if (k >= 0 && k <= 1) {
      return k < 0.45 ? 1 - k / 0.45 : (k - 0.45) / 0.55;
    }
  }
  return 1;
}

function lidToScale(lid) {
  return 0.06 + 0.94 * clamp(lid, 0, 1, 1);
}

function liveliness(tSec, { wander = 1, blink = true, float = true } = {}) {
  return {
    dYaw: (loopNoise(tSec, 11.3, 0.4) * 5.5 + loopNoise(tSec, 3.7, 2.1) * 1.6) * wander,
    dPitch: (loopNoise(tSec, 9.1, 1.3) * 4.2 + loopNoise(tSec, 4.3, 0.7) * 1.3) * wander,
    dRoll: loopNoise(tSec, 13.7, 3.2) * 2.2 * wander,
    lid: blink ? blinkLid(tSec) : 1,
    driftX: float ? loopNoise(tSec, 7.9, 1.9) * 0.006 : 0,
    driftY: float ? loopNoise(tSec, 5.3, 0.3) * 0.007 : 0,
    breath: float ? 1 + Math.sin((tSec / 3.4) * Math.PI * 2) * 0.005 : 1
  };
}

export function setupSynCompanion(options = {}) {
  const root = document.querySelector("#syn-companion");
  if (!root) return null;

  const buddy = root.querySelector("#syn-buddy");
  const bubble = root.querySelector("#syn-bubble");
  const bubbleText = root.querySelector("#syn-bubble-text");
  const bodyPath = root.querySelector("#syn-body-path");
  const eyeLPath = root.querySelector("#syn-eye-l-path");
  const eyeRPath = root.querySelector("#syn-eye-r-path");
  const faceRoot = root.querySelector("#syn-face-root");
  const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motion = options.motion || null;

  if (bodyPath) bodyPath.setAttribute("d", createBlobBodyPath());

  let mood = "greet";
  let expressionName = "curious";
  let fromExpr = EXPRESSIONS.curious;
  let toExpr = EXPRESSIONS.curious;
  let morphT = 1;
  let morphStart = 0;
  let morphDuration = 520;

  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  let lastTs = performance.now();
  let bubbleTimer = 0;
  let speakingUntil = 0;
  let hopUntil = 0;
  let reactionUntil = 0;
  let reactionKind = "none";
  let awake = false;
  let frame = 0;
  const bootMs = performance.now();

  let seatX = 0;
  let seatY = 0;
  let dragging = false;
  let didDrag = false;
  let dragPointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragStartX = 0;
  let dragStartY = 0;

  const gazeX = { x: 0, v: 0 };
  const gazeY = { x: 0, v: 0 };
  const leanX = { x: 0, v: 0 };
  const leanY = { x: 0, v: 0 };
  const bob = { x: 0, v: 0 };
  const scale = { x: 1, v: 0 };

  const ctx = { reading: false, board: false, voice: false, section: "home" };

  function petSize() {
    return { w: root.offsetWidth || 96, h: root.offsetHeight || 96 };
  }

  function clampSeat(x, y) {
    const { w, h } = petSize();
    const maxX = Math.max(0, window.innerWidth - w);
    const maxY = Math.max(0, window.innerHeight - h);
    return {
      x: clamp(x, 0, maxX, maxX),
      y: clamp(y, 0, maxY, maxY)
    };
  }

  function applySeat(x, y, { save = false } = {}) {
    const next = clampSeat(x, y);
    seatX = next.x;
    seatY = next.y;
    root.style.left = `${seatX}px`;
    root.style.top = `${seatY}px`;
    root.style.right = "auto";
    root.style.bottom = "auto";
    if (save) {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify({ x: seatX, y: seatY }));
      } catch {
        /* ignore */
      }
    }
  }

  function defaultSeat() {
    const { w, h } = petSize();
    return {
      x: Math.max(14, window.innerWidth - w - 18),
      y: Math.max(14, window.innerHeight - h - 18)
    };
  }

  function restoreSeat() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
    } catch {
      saved = null;
    }
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      applySeat(saved.x, saved.y);
    } else {
      const d = defaultSeat();
      applySeat(d.x, d.y);
    }
  }

  function currentExpression() {
    const t = easeOutCubic(morphT);
    return {
      left: lerpEye(fromExpr.left, toExpr.left, t),
      right: lerpEye(fromExpr.right, toExpr.right, t),
      body: {
        rotate: lerp(fromExpr.body?.rotate ?? 0, toExpr.body?.rotate ?? 0, t),
        scaleX: lerp(fromExpr.body?.scaleX ?? 1, toExpr.body?.scaleX ?? 1, t),
        scaleY: lerp(fromExpr.body?.scaleY ?? 1, toExpr.body?.scaleY ?? 1, t),
        y: lerp(fromExpr.body?.y ?? 0, toExpr.body?.y ?? 0, t)
      },
      reaction: toExpr.reaction || "none"
    };
  }

  function setExpression(name, { force = false } = {}) {
    const next = EXPRESSIONS[name] || EXPRESSIONS.neutral;
    if (!force && name === expressionName && morphT >= 1) return;
    const live = currentExpression();
    fromExpr = { left: live.left, right: live.right, body: live.body, reaction: live.reaction };
    toExpr = next;
    expressionName = EXPRESSIONS[name] ? name : "neutral";
    morphT = 0;
    morphStart = performance.now();
    morphDuration = reducedMq.matches ? 1 : 480 + Math.random() * 120;
    reactionKind = next.reaction || "none";
    reactionUntil = performance.now() + (reactionKind === "none" ? 0 : 420);
    root.dataset.expression = expressionName;
  }

  function sayLine(text, { hold = 3200 } = {}) {
    if (!awake) return;
    if (!bubble || !bubbleText) return;
    bubble.hidden = false;
    bubbleText.textContent = text;
    void bubble.offsetWidth;
    bubble.classList.add("is-open");
    root.classList.add("is-talking");
    speakingUntil = performance.now() + Math.min(1800, 500 + text.length * 24);
    window.clearTimeout(bubbleTimer);
    const exitMs = reducedMq.matches ? 20 : 160;
    bubbleTimer = window.setTimeout(() => {
      bubble.classList.remove("is-open");
      root.classList.remove("is-talking");
      window.setTimeout(() => {
        if (!bubble.classList.contains("is-open")) bubble.hidden = true;
      }, exitMs);
    }, hold);
  }

  function setMood(next, { say = false, force = false } = {}) {
    if (!force && next === mood) {
      if (say && awake) sayLine(pick(MOOD_LINES[next] || MOOD_LINES.idle));
      return;
    }
    mood = next;
    root.dataset.mood = next;
    setExpression(MOOD_TO_EXPRESSION[next] || "neutral", { force: true });
    if (say && awake) sayLine(pick(MOOD_LINES[next] || MOOD_LINES.idle));
  }

  function poke() {
    awake = true;
    root.dataset.awake = "1";
    hopUntil = performance.now() + 420;
    setExpression(pick(POKE_EXPRESSIONS), { force: true });
    sayLine(pick(MOOD_LINES.poke), { hold: 2600 });
  }

  function updateContextFromDom() {
    const reader = document.querySelector("#story-reader");
    const boardEl = document.querySelector("#prototype-board");
    const was = { ...ctx };
    ctx.reading = Boolean(reader?.open);
    ctx.board = Boolean(boardEl?.classList.contains("is-open"));
    ctx.voice = document.documentElement.classList.contains("voice-is-live");

    let next = ctx.section;
    if (ctx.voice) next = "voice";
    else if (ctx.board) next = "board";
    else if (ctx.reading) next = "reading";

    const changed = was.reading !== ctx.reading || was.board !== ctx.board || was.voice !== ctx.voice;
    if (changed) setMood(next, { say: awake, force: true });
  }

  function observeSections() {
    const map = [
      ["#latest", "stories"],
      ["#projects", "projects"],
      ["#principles", "principles"],
      ["#top", "home"],
      [".hero", "home"],
      ["#newsletter", "home"]
    ];
    const nodes = map
      .map(([sel, name]) => {
        const el = document.querySelector(sel);
        return el ? { el, name } : null;
      })
      .filter(Boolean);
    if (!nodes.length || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const hit = nodes.find((node) => node.el === visible.target);
      if (!hit || hit.name === ctx.section) return;
      ctx.section = hit.name;
      if (!ctx.reading && !ctx.board && !ctx.voice) {
        setMood(hit.name, { say: false, force: true });
      }
    }, { threshold: [0.35, 0.55], rootMargin: "-12% 0px -40% 0px" });

    nodes.forEach((node) => io.observe(node.el));
  }

  function samplePointer(clientX, clientY) {
    pointerX = clientX;
    pointerY = clientY;
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    const dt = clamp((now - lastTs) / 1000, 0.001, 0.048, 0.016);
    lastTs = now;
    const reduced = reducedMq.matches;
    const tSec = (now - bootMs) / 1000;

    if (morphT < 1) {
      morphT = clamp((now - morphStart) / morphDuration, 0, 1, 1);
    }

    const rect = root.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.42;

    const life = reduced || dragging
      ? { dYaw: 0, dPitch: 0, dRoll: 0, lid: 1, driftX: 0, driftY: 0, breath: 1 }
      : liveliness(tSec, {
        wander: mood === "idle" || mood === "home" ? 1 : 0.45,
        blink: true,
        float: true
      });

    let targetGazeX = life.dYaw / 28;
    let targetGazeY = life.dPitch / 28;
    let targetLeanX = life.dRoll * 0.35;
    let targetLeanY = life.dPitch * 0.12;

    if (!reduced && !dragging) {
      const dx = pointerX - cx;
      const dy = pointerY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = clamp(dist / 260, 0, 1, 0);
      const curved = (v) => Math.sin((v * Math.PI) / 2);
      const lookX = curved(clamp((dx / dist) * reach, -1, 1, 0));
      const lookY = curved(clamp((dy / dist) * reach, -1, 1, 0));
      // Pointer look dominates when close; liveliness fills the rest (bloub Look mix)
      const mix = clamp(reach * 1.2, 0, 1, 0);
      targetGazeX = lerp(targetGazeX, lookX, mix);
      targetGazeY = lerp(targetGazeY, lookY, mix);
      targetLeanX = lerp(targetLeanX, lookX * 8, mix);
      targetLeanY = lerp(targetLeanY, lookY * 5, mix);
    }

    spring(gazeX, targetGazeX, reduced ? 40 : 26, reduced ? 0.5 : 0.8, dt);
    spring(gazeY, targetGazeY, reduced ? 40 : 26, reduced ? 0.5 : 0.8, dt);
    spring(leanX, targetLeanX, 16, 0.84, dt);
    spring(leanY, targetLeanY, 16, 0.84, dt);

    let targetBob = life.driftY * 120;
    let targetScale = life.breath;
    if (!reduced) {
      if (dragging) {
        targetScale = 1.08;
        targetBob = -4;
      } else if (now < hopUntil || (now < reactionUntil && reactionKind === "bounce")) {
        targetBob = -11;
        targetScale = 1.07;
      } else if (now < reactionUntil && reactionKind === "squash") {
        targetScale = 0.94;
        targetBob = 3;
      } else if (now < reactionUntil && reactionKind === "tilt") {
        targetBob = -2;
      } else if (root.classList.contains("is-talking") || now < speakingUntil) {
        targetBob = Math.sin(now / 90) * 2.4;
        targetScale = 1.03 + Math.sin(now / 70) * 0.02;
      } else if (mood === "voice") {
        targetBob = Math.sin(now / 140) * 3.5;
        targetScale = 1.04;
      }
    } else {
      targetBob = 0;
      targetScale = 1;
    }
    spring(bob, targetBob, 38, 0.76, dt);
    spring(scale, targetScale, 34, 0.74, dt);

    const expr = currentExpression();
    const openL = clamp(expr.left.open ?? 1, 0.08, 1, 1);
    const openR = clamp(expr.right.open ?? 1, 0.08, 1, 1);
    const blinkS = reduced ? 1 : lidToScale(life.lid);
    const gazePullX = gazeX.x * 14 + life.driftX * 80;
    const gazePullY = gazeY.x * 10 + life.driftY * 80;
    const compress = 1 - Math.abs(gazeX.x) * 0.12;

    const leftGeo = {
      ...expr.left,
      x: (expr.left.x ?? 72) + gazePullX,
      y: (expr.left.y ?? 94) + gazePullY,
      width: (expr.left.width ?? 22) * compress,
      height: (expr.left.height ?? 42) * blinkS * openL
    };
    const rightGeo = {
      ...expr.right,
      x: (expr.right.x ?? 128) + gazePullX,
      y: (expr.right.y ?? 94) + gazePullY,
      width: (expr.right.width ?? 22) * compress,
      height: (expr.right.height ?? 42) * blinkS * openR
    };

    if (eyeLPath) eyeLPath.setAttribute("d", createEyePath(leftGeo));
    if (eyeRPath) eyeRPath.setAttribute("d", createEyePath(rightGeo));

    const bodyRotate = expr.body.rotate + leanX.x * 0.55
      + (now < reactionUntil && reactionKind === "tilt" ? leanX.x * 2 : 0)
      + life.dRoll * 0.15;
    const bodyY = expr.body.y + leanY.x + bob.x;
    const sx = expr.body.scaleX * scale.x * (1 + Math.abs(gazeX.x) * 0.03);
    const sy = expr.body.scaleY * scale.x * (1 - Math.abs(gazeY.x) * 0.02);

    if (faceRoot) {
      faceRoot.setAttribute(
        "transform",
        `translate(100 ${100 + bodyY}) rotate(${bodyRotate.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-100 -100)`
      );
    }

    root.style.setProperty("--syn-gaze-x", gazeX.x.toFixed(3));
    root.style.setProperty("--syn-gaze-y", gazeY.x.toFixed(3));
  }

  window.addEventListener("pointermove", (event) => {
    if (dragging) return;
    samplePointer(event.clientX, event.clientY);
  }, { passive: true });

  document.documentElement.addEventListener("synergy-motion", (event) => {
    const detail = event.detail || {};
    if (detail.op === "setGazePoint" && Number.isFinite(detail.x) && Number.isFinite(detail.y)) {
      samplePointer(detail.x, detail.y);
    }
  });

  const dragSurface = buddy || root;

  dragSurface.addEventListener("pointerdown", (event) => {
    if (event.button != null && event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    dragging = true;
    didDrag = false;
    dragPointerId = event.pointerId;
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    root.classList.add("is-dragging");
    try {
      dragSurface.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    event.preventDefault();
  });

  dragSurface.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== dragPointerId) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    if (!didDrag && Math.hypot(dx, dy) >= DRAG_THRESHOLD) didDrag = true;
    if (!didDrag) return;
    applySeat(event.clientX - dragOffsetX, event.clientY - dragOffsetY);
    samplePointer(event.clientX, event.clientY);
  });

  function endDrag(event) {
    if (!dragging) return;
    if (event && dragPointerId != null && event.pointerId !== dragPointerId) return;
    const wasDrag = didDrag;
    dragging = false;
    root.classList.remove("is-dragging");
    if (dragPointerId != null) {
      try {
        if (dragSurface.hasPointerCapture?.(dragPointerId)) {
          dragSurface.releasePointerCapture(dragPointerId);
        }
      } catch {
        /* ignore */
      }
    }
    dragPointerId = null;
    if (wasDrag) {
      applySeat(seatX, seatY, { save: true });
      hopUntil = performance.now() + 280;
      setExpression("surprised", { force: true });
      if (awake) sayLine(pick(["Parked.", "New spot!", "I like it here."]), { hold: 1800 });
    }
  }

  dragSurface.addEventListener("pointerup", endDrag);
  dragSurface.addEventListener("pointercancel", endDrag);

  buddy?.addEventListener("click", (event) => {
    if (didDrag) {
      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
      return;
    }
    poke();
  });

  const reader = document.querySelector("#story-reader");
  reader?.addEventListener("toggle", () => window.setTimeout(updateContextFromDom, 30));

  const mo = new MutationObserver(() => updateContextFromDom());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const board = document.querySelector("#prototype-board");
  if (board) mo.observe(board, { attributes: true, attributeFilter: ["class", "hidden", "aria-hidden"] });

  document.querySelector(".board-toggle")?.addEventListener("click", () => window.setTimeout(updateContextFromDom, 40));
  document.querySelector(".board-close")?.addEventListener("click", () => window.setTimeout(updateContextFromDom, 40));

  window.addEventListener("resize", () => {
    applySeat(seatX, seatY, { save: true });
  });

  observeSections();
  restoreSeat();
  setMood("greet", { say: false, force: true });
  window.setInterval(() => {
    if (!awake || document.hidden || reducedMq.matches) return;
    if (Math.random() > 0.35) return;
    if (ctx.reading || ctx.board || ctx.voice) return;
    if (Math.random() < 0.55) setExpression("sleepy", { force: true });
    else sayLine(pick(MOOD_LINES.idle), { hold: 2200 });
  }, 16000);

  frame = requestAnimationFrame(tick);

  // Keep a soft link so tooling can see the motion bus was handed in.
  if (motion && typeof motion.refresh === "function") {
    try { motion.refresh(); } catch { /* ignore */ }
  }

  const api = {
    say: sayLine,
    setMood,
    setExpression,
    poke,
    hop() {
      hopUntil = performance.now() + 400;
    },
    moveTo(x, y) {
      applySeat(x, y, { save: true });
    }
  };
  globalThis.SynCompanion = api;
  root.dataset.companion = "syn";
  root.dataset.face = "moodie-bloub";
  root.dataset.pet = "1";
  return api;
}
