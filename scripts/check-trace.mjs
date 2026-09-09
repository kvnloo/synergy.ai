#!/usr/bin/env node
/**
 * Traceability gate — ethos → feature → spec → ui/backend → tests.
 * Source of truth: TRACEABILITY.json (YAML is the human mirror).
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const matrixPath = join(root, "TRACEABILITY.json");
const errors = [];
const warnings = [];

const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function resolveAnchor(anchor) {
  if (anchor.startsWith("smoke:")) return { ok: true };
  const pathPart = anchor.split("#")[0].split(/\s+/)[0];
  const file = join(root, pathPart);
  if (!existsSync(file)) return { ok: false, path: pathPart };
  return { ok: true, path: pathPart };
}

function main() {
  if (!existsSync(matrixPath)) {
    console.error("TRACEABILITY.json missing");
    process.exit(1);
  }

  const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
  const { ethos, features, smoke_asserts: smoke } = matrix;

  console.log(
    `trace · ethos ${Object.keys(ethos).length} · features ${Object.keys(features).length} · smoke ${Object.keys(smoke).length}`
  );

  if (Object.keys(ethos).length < 5) fail("ethos map too thin");
  if (Object.keys(features).length < 5) fail("feature map too thin");

  for (const [id, e] of Object.entries(ethos)) {
    if (!e.title || !e.statement) fail(`ethos ${id} incomplete`);
    if (e.source) {
      const r = resolveAnchor(e.source);
      if (!r.ok) fail(`ethos ${id} source missing: ${e.source}`);
    }
  }

  const ethosHits = Object.fromEntries(Object.keys(ethos).map((k) => [k, 0]));

  for (const [fid, f] of Object.entries(features)) {
    if (!f.name) fail(`${fid}: missing name`);
    if (!f.acceptance || f.acceptance.length < 24) fail(`${fid}: acceptance/spec too short`);
    if (!Array.isArray(f.ethos) || !f.ethos.length) fail(`${fid}: no ethos link`);
    for (const e of f.ethos) {
      if (!ethos[e]) fail(`${fid}: unknown ethos ${e}`);
      else ethosHits[e] += 1;
    }
    if (!(f.ui?.length || f.backend?.length)) fail(`${fid}: no ui/backend anchors`);
    if (!f.tests?.length) fail(`${fid}: no tests`);

    for (const a of [...(f.ui || []), ...(f.backend || [])]) {
      const r = resolveAnchor(a);
      if (!r.ok) fail(`${fid}: missing anchor ${a}`);
    }

    for (const t of f.tests) {
      if (t.startsWith("smoke:")) {
        const sid = t.slice(6);
        if (!smoke[sid]) warn(`${fid}: smoke:${sid} not in smoke_asserts`);
        continue;
      }
      if (!existsSync(join(root, t.split("#")[0]))) fail(`${fid}: test missing ${t}`);
    }
  }

  for (const [e, n] of Object.entries(ethosHits)) {
    if (n === 0) fail(`ethos ${e} orphaned — no feature references it`);
  }

  for (const [sid, fid] of Object.entries(smoke)) {
    if (!features[fid]) fail(`smoke_asserts.${sid} → unknown ${fid}`);
    if (!features[fid].tests.includes(`smoke:${sid}`) && !features[fid].tests.includes("smoke:boot")) {
      // require explicit listing for non-boot
      if (!features[fid].tests.includes(`smoke:${sid}`)) {
        fail(`${fid}.tests must list smoke:${sid}`);
      }
    }
  }

  const sw = readFileSync(join(root, "sw.js"), "utf8");
  if (!sw.includes("companion-physics.js")) fail("sw.js SHELL missing companion-physics.js");
  else console.log("  ok  sw shell includes companion-physics.js");

  const smokeSrc = readFileSync(join(root, "scripts/smoke-ui.mjs"), "utf8");
  for (const label of [
    "boot SynCompanion",
    "reader scroll",
    "theme open",
    "theme closed",
    "api flick",
    "hold",
    "pointer flick",
    "triple",
    "double",
    "pinch",
    "reduced-motion"
  ]) {
    if (!smokeSrc.includes(label)) fail(`smoke-ui.mjs missing "${label}"`);
  }
  console.log("  ok  smoke assert labels present");

  // Bidirectional: test files → @feature
  const testFiles = [
    "test/unit/content.test.js",
    "test/unit/perspectives.test.js",
    "test/unit/physics.test.js",
    "test/unit/recall.test.js",
    "test/unit/trust.test.js",
    "test/property/physics.prop.test.js",
    "test/property/recall.prop.test.js"
  ];
  for (const tf of testFiles) {
    const body = readFileSync(join(root, tf), "utf8");
    const tags = [...body.matchAll(/@feature\s+(F-[\w-]+)/g)].map((m) => m[1]);
    if (!tags.length) {
      fail(`${tf}: missing @feature tag`);
      continue;
    }
    for (const tag of tags) {
      if (!features[tag]) fail(`${tf}: @feature ${tag} not in matrix`);
      else if (!features[tag].tests.some((t) => t === tf || t.startsWith(tf))) {
        fail(`${tf}: @feature ${tag} does not list this file in tests[]`);
      }
    }
  }
  console.log("  ok  @feature tags bidirectional");

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (!pkg.scripts?.["check:trace"]?.includes("check-trace")) {
    fail('package.json scripts.check:trace must run scripts/check-trace.mjs');
  }
  const chain = `${pkg.scripts.check || ""} ${pkg.scripts.test || ""} ${pkg.scripts.gate || ""}`;
  if (!chain.includes("check:trace") && !chain.includes("check-trace")) {
    fail("npm check/test/gate must include check:trace");
  }
  console.log("  ok  package scripts wire check-trace");

  if (!existsSync(join(root, "TRACEABILITY.yaml"))) {
    fail("TRACEABILITY.yaml human mirror missing");
  }
  if (!existsSync(join(root, "QUALITY.md"))) fail("QUALITY.md missing");
  const quality = readFileSync(join(root, "QUALITY.md"), "utf8");
  if (!/traceability/i.test(quality)) fail("QUALITY.md must document traceability");
  console.log("  ok  QUALITY.md documents traceability");

  // YAML mirror must mention same feature ids (soft)
  const yaml = readFileSync(join(root, "TRACEABILITY.yaml"), "utf8");
  for (const fid of Object.keys(features)) {
    if (!yaml.includes(fid)) fail(`TRACEABILITY.yaml missing feature ${fid}`);
  }
  for (const eid of Object.keys(ethos)) {
    if (!yaml.includes(eid + ":") && !yaml.includes(eid)) fail(`TRACEABILITY.yaml missing ethos ${eid}`);
  }
  console.log("  ok  YAML mirror covers matrix ids");

  if (warnings.length) for (const w of warnings) console.warn("  warn", w);

  if (errors.length) {
    console.error("\ntrace FAILED");
    for (const e of errors) console.error("  ✗", e);
    process.exit(1);
  }
  console.log(`\ntrace PASSED · ${Object.keys(features).length} features · ${Object.keys(ethos).length} ethos linked`);
}

main();
