#!/usr/bin/env node
/**
 * Orchestrated browser smoke for synergy.ai
 * Gates: static parse, mobile reader scroll+theme, companion physics gestures.
 *
 * CHROME=/path/to/chrome node scripts/smoke-ui.mjs
 * Optional: BASE=http://127.0.0.1:4173  PORT=4173
 */
import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT || 4179);
const BASE = process.env.BASE || `http://127.0.0.1:${PORT}`;
const CHROME =
  process.env.CHROME ||
  [
    `${process.env.HOME}/.omp/puppeteer/chrome/linux-150.0.7871.24/chrome-linux64/chrome`,
    `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium"
  ].find((p) => p && existsSync(p));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

function fail(msg) {
  console.error("FAIL:", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("  ok ", msg);
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", BASE);
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = join(root, path.replace(/^\//, ""));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolvePromise) => {
    server.listen(PORT, "127.0.0.1", () => resolvePromise(server));
  });
}

async function dbg(page) {
  return page.evaluate(() => window.SynCompanion.debug());
}

async function run() {
  if (!CHROME) {
    fail("No Chrome binary. Set CHROME=");
    return;
  }
  console.log("smoke-ui · chrome", CHROME);
  console.log("smoke-ui · base", BASE);

  const external = Boolean(process.env.BASE);
  const server = external ? null : await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    // —— Boot
    await page.goto(`${BASE}/?smoke=${Date.now()}`, { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForFunction(() => typeof window.SynCompanion?.debug === "function", {
      timeout: 10000
    });
    ok("boot SynCompanion");

    // —— Reader scroll + theme
    await page.evaluate(() => {
      const link = [...document.querySelectorAll("a.article-link")].find((a) =>
        /Sudan/i.test(a.textContent || "")
      );
      if (!link) throw new Error("sudan link missing");
      link.click();
    });
    await page.waitForFunction(() => document.querySelector("#story-reader")?.open, {
      timeout: 5000
    });
    const reader = await page.evaluate(() => {
      const card = document.querySelector(".reader-card");
      const theme = document.querySelector('meta[name="theme-color"]')?.content;
      card.scrollTop = 240;
      return {
        theme,
        canScroll: card.scrollHeight > card.clientHeight + 2,
        scrollTop: card.scrollTop,
        open: document.documentElement.classList.contains("reader-open")
      };
    });
    if (!reader.canScroll) fail(`reader cannot scroll (${JSON.stringify(reader)})`);
    else ok(`reader scrollTop=${reader.scrollTop}`);
    if (reader.theme === "#f3efe4") fail(`theme-color still paper while open: ${reader.theme}`);
    else ok(`theme open ${reader.theme}`);

    await page.click(".reader-close");
    await page.waitForFunction(() => !document.querySelector("#story-reader")?.open, {
      timeout: 5000
    });
    const themeClosed = await page.evaluate(
      () => document.querySelector('meta[name="theme-color"]')?.content
    );
    if (themeClosed !== "#f3efe4") fail(`theme on close ${themeClosed}`);
    else ok("theme closed #f3efe4");

    // —— API flick coast
    await page.evaluate(() => {
      SynCompanion.moveTo(100, 220);
      SynCompanion.flick(1500, -900);
    });
    await new Promise((r) => setTimeout(r, 120));
    let d = await dbg(page);
    if (!d.coasting) fail("api flick did not coast");
    else ok("api flick coasting");
    const s0 = d.seat;
    await new Promise((r) => setTimeout(r, 400));
    d = await dbg(page);
    const moved = Math.hypot(d.seat.x - s0.x, d.seat.y - s0.y);
    if (moved < 20) fail(`coast moved only ${moved}`);
    else ok(`coast moved ${moved.toFixed(0)}px`);
    await page.evaluate(() => SynCompanion.stop());

    // —— Hold
    const box = await page.$("#syn-buddy").then((el) => el.boundingBox());
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    let held = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 100));
      d = await dbg(page);
      if (d.holding) {
        held = true;
        break;
      }
    }
    await page.mouse.up();
    if (!held) fail("hold gesture never armed");
    else ok("hold ~500ms");

    // —— Pointer flick (retry once — headless timing jitter)
    let pointerCoast = false;
    for (let attempt = 0; attempt < 2 && !pointerCoast; attempt++) {
      await page.evaluate(() => {
        SynCompanion.stop();
        SynCompanion.moveTo(150, 380);
      });
      await new Promise((r) => setTimeout(r, 80));
      const b2 = await page.$("#syn-buddy").then((el) => el.boundingBox());
      const sx = b2.x + b2.width / 2;
      const sy = b2.y + b2.height / 2;
      const before = await dbg(page);
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      // Fast swipe: high instantaneous velocity
      for (let i = 1; i <= 8; i++) {
        await page.mouse.move(sx + i * 40, sy - i * 28, { steps: 1 });
        await new Promise((r) => setTimeout(r, 8));
      }
      await page.mouse.up();
      await new Promise((r) => setTimeout(r, 100));
      d = await dbg(page);
      const moved = Math.hypot(d.seat.x - before.seat.x, d.seat.y - before.seat.y);
      pointerCoast = d.coasting || moved > 40;
    }
    if (!pointerCoast) fail("pointer flick no coast");
    else ok("pointer flick coast");
    await page.evaluate(() => SynCompanion.stop());
    await new Promise((r) => setTimeout(r, 200));

    // —— Multi-tap triple / double via public API (pointer path covered above)
    // API path is deterministic; gesture CSS is still asserted via debug().
    await page.evaluate(() => {
      SynCompanion.stop();
      SynCompanion.tripleTap();
    });
    await new Promise((r) => setTimeout(r, 80));
    d = await dbg(page);
    if (d.gesture !== "triple") fail(`triple got gesture=${d.gesture}`);
    else ok("triple tap");
    await page.evaluate(() => SynCompanion.stop());
    await new Promise((r) => setTimeout(r, 400));

    await page.evaluate(() => {
      SynCompanion.stop();
      SynCompanion.doubleTap();
    });
    await new Promise((r) => setTimeout(r, 80));
    d = await dbg(page);
    if (d.gesture !== "double") fail(`double got gesture=${d.gesture}`);
    else ok("double tap");
    await page.evaluate(() => SynCompanion.stop());
    await new Promise((r) => setTimeout(r, 200));

    // —— Pinch expand via touch CDP
    await page.evaluate(() => SynCompanion.stop());
    const b5 = await page.$("#syn-buddy").then((el) => el.boundingBox());
    const px = b5.x + b5.width / 2;
    const py = b5.y + b5.height / 2;
    const client = await page.createCDPSession();
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: px - 20, y: py, id: 1 },
        { x: px + 20, y: py, id: 2 }
      ]
    });
    await new Promise((r) => setTimeout(r, 40));
    d = await dbg(page);
    const pinching = d.pinching;
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: px - 70, y: py, id: 1 },
        { x: px + 70, y: py, id: 2 }
      ]
    });
    await new Promise((r) => setTimeout(r, 40));
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await new Promise((r) => setTimeout(r, 150));
    d = await dbg(page);
    if (!pinching) fail("pinch did not start");
    else ok("pinch start");
    if (d.gesture !== "expand") fail(`pinch end gesture=${d.gesture}`);
    else ok("pinch expand");

    // —— Reduced motion disables coast
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForFunction(() => typeof window.SynCompanion?.debug === "function");
    await page.evaluate(() => {
      SynCompanion.moveTo(100, 200);
      SynCompanion.flick(1800, -900);
    });
    await new Promise((r) => setTimeout(r, 100));
    d = await dbg(page);
    if (d.coasting) fail("reduced-motion still coasting");
    else ok("reduced-motion blocks coast");
  } finally {
    await browser.close().catch(() => {});
    if (server) await new Promise((r) => server.close(r));
  }

  if (process.exitCode) {
    console.error("\nsmoke-ui FAILED");
    process.exit(1);
  }
  console.log("\nsmoke-ui PASSED");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
