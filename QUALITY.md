# Quality contracts

You cannot prove a non-trivial product is **bug-free for life**.  
What you *can* do is make regressions **expensive to miss** and residual risk **measurable**.

This repo’s gate is layered. Each layer answers a different question.

## Traceability

Every shipped capability must be walkable end-to-end:

```text
product ethos  →  feature  →  acceptance spec  →  UI surface  →  backend module  →  test
     E*              F-*         acceptance[]        ui[]           backend[]        tests[]
```

| Artifact | Role |
|----------|------|
| `TRACEABILITY.json` | Machine source of truth |
| `TRACEABILITY.yaml` | Human-readable mirror (same IDs) |
| `scripts/check-trace.mjs` | Gate: orphans, missing anchors, missing tests, SW shell, smoke labels |
| `@feature F-*` in test headers | Reverse link test → feature |
| `smoke_asserts` | Maps each smoke label → feature |

Ethos IDs `E0–E4` are the published editorial code in `index.html#principles`.  
`E5–E9` are product/security ethos from README and design intent (credentials local, brief-first, companion-as-pet, …).

**Rule:** a PR that adds user-visible behavior without a matrix row + tests fails `npm run check:trace`.


## What “guarantee” means here

| Claim | Meaning | Not a claim |
|--------|---------|-------------|
| **Unit green** | Pure functions match specified examples | UI look & feel |
| **Property green** | Random inputs obey invariants (N runs) | All possible inputs (∞) |
| **Mutation score ≥ break** | Tests kill ≥ threshold of seeded faults | No unknown fault classes |
| **Smoke green** | Critical user paths work in headless Chromium | Every device/browser |
| **Companion unittest** | Local companion HTTP + loop contracts | Cloud agent harnesses |

Residual risk after a green `npm run gate:full` is **non-zero**.  
We reduce it by stacking independent detectors (Hamming-style: uncorrelated checks).

## Math (short)

- **Unit / example tests** — point checks. Coverage of *behavior*, not lines.
- **Property-based tests** (`fast-check`) — for invariant `P`, `numRuns=N` failing to find a counterexample raises confidence but never to 1. Treat as **statistical sampling** over a generator, not a proof.
- **Mutation testing** (Stryker) — if score = killed/total mutants, a low score means the suite accepts wrong programs. Thresholds in `stryker.config.json`:
  - `break: 50` — CI fails below this
  - `high: 80` — aspirational for pure modules
- **Smoke** — end-to-end oracle on a fixed scenario set. High value per test; brittle if over-specified.

No layer replaces another. Mutation without properties misses continuum bugs; smoke without units is slow and opaque.

## Commands

```bash
npm ci
npm run check:trace   # ethos→feature→spec→ui/backend→test
npm test              # check-trace + syntax + unit + property
npm run test:companion
npm run test:smoke    # needs Chrome; set CHROME= if needed
npm run test:mutation # Stryker on pure modules
npm run gate          # test + companion + smoke
npm run gate:full     # gate + mutation
```


## Mutated surface (on purpose)

Only **pure, high-leverage modules** with strong unit/property oracles are mutated by default:

- `companion-physics.js` — flick, bounce, jelly math
- `recall.js` — spaced repetition (DOM `renderRecall` excluded via Stryker disable)
- `trust.js` — verification URLs/comments (`copyText` excluded)

`perspectives.js` stays on **unit tests + smoke** until seminar pure helpers justify mutation cost (string-template mutants drown signal). DOM shells (`app.js`, `companion-bot.js`) are smoke-gated, not mutated.

Thresholds (`stryker.config.json`): `break: 55`, `low: 65`, `high: 80`.

## CI

`.github/workflows/quality.yml` runs on `main` / `dev` / PRs:

1. Unit + property + `node --check`
2. Companion Python unittests
3. Headless UI smoke
4. Stryker (after unit job)

Pages deploy (`.github/workflows/pages.yml`) stays separate so content publish is not blocked by a slow mutation run — but **merges to `main` should wait on Quality**.

## Adding a feature (TDD + trace contract)

1. Add or extend a row in `TRACEABILITY.json` / `.yaml`: ethos links, acceptance spec, ui, backend, tests.
2. Write a **failing** unit or property for the pure core (`@feature F-…` header).
3. Implement the core in a pure module when possible.
4. Wire UI; keep anchors listed in the matrix real.
5. Add a **smoke assert** only for an observable user risk; register it under `smoke_asserts` and `tests[]`.
6. Run `npm run gate` before merge.
7. If the core is pure, confirm mutation score does not collapse.


## Explicit non-goals

- Formal verification of the whole app
- 100% line coverage theater
- Pixel-perfect screenshot diffs on every commit (add later if brand-critical)
- “AI reviewed so it’s fine”

## Honest lifetime stance

Bugs will still ship. The system is working when:

1. **Known** critical paths are gated,
2. **New** pure logic is born under tests,
3. **Mutants** die,
4. **Smoke** fails closed on gesture/reader regressions,
5. Failures are **cheap to localize**.

That is engineering confidence — not prophecy.
