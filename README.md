# Synergy

Synergy is an independent briefing site about humanitarian crises, public-interest technology, and small projects worth testing. It borrows the dense editorial rhythm of [Garry's List](https://garryslist.org/) while using an original identity, design, and body of work.

The first version is deliberately small. Plain HTML, CSS, and JavaScript. No build step, account system, analytics, or live feed.

## Run it

```sh
python -m http.server 4173
```

Open `http://localhost:4173`.

## Publish it

The workflow in `.github/workflows/pages.yml` deploys the repository root to GitHub Pages after every push to `main`. The public deployment is [kvnloo.github.io/synergy.ai](https://kvnloo.github.io/synergy.ai/). Add a custom domain only after its DNS is ready. Do not commit a `CNAME` file before then.

## Edit the site

- `index.html` owns the page structure, lead story, projects, reader dialog, and editorial principles.
- `content.js` owns the issue briefs, causal chains, attempted solutions, translation questions, and typed evidence links.
- `app.js` owns rendering plus topic, search, reader navigation, mobile gestures, and signup-preview behavior.
- `styles.css` owns the visual system and responsive layouts.

Every published issue note should link to its closest available source. Prefer local response organizations, original documents, agency situation pages, and public datasets. Distinguish reported facts from interpretation. Do not publish sensitive personal data.

## Evidence model

The evidence reader adapts a small, static subset of [Yohei Nakajima's Epistemedia](https://github.com/yoheinakajima/epistemedia), an Apache-2.0 project for knowledge that can show its work. Synergy keeps narrative claims separate from source links and labels each relationship, such as support, qualification, context, risk, method, or principle. It does not copy Epistemedia's Python compiler, claim that a citation proves truth, or display a universal confidence score.

The current briefs are AI-assisted editorial drafts. Each reader panel exposes the sources used for synthesis. Before treating a brief as reviewed reporting, a human editor should inspect each source, bind important claims to exact passages, look for rebutting evidence, and record the review date.

## Optional AI access

There is no unlimited hosted LLM with a permanent free guarantee. The reader uses OpenRouter's `openrouter/free` route as a best-effort option, subject to OpenRouter's account, model, rate, and availability limits. The primary connection uses [OpenRouter's documented OAuth PKCE flow](https://openrouter.ai/docs/guides/overview/auth/oauth): the browser generates an S256 verifier, OpenRouter authorizes the user, and the returned user-controlled key remains only in JavaScript memory until the tab closes. An advanced field accepts an existing OpenRouter key without persisting it.

The static site sends requests directly from the reader's browser to `https://openrouter.ai/api/v1/chat/completions`. Synergy has no proxy and never receives the key. It does not place keys in cookies, local storage, URLs, logs, analytics, or service-worker caches. PKCE protects the authorization-code exchange, not the resulting bearer key; the interface therefore exposes Disconnect and OpenRouter's remote revocation page. Do not replace this with a developer-owned key in client JavaScript.

OpenRouter is a gateway account, not a universal subscription importer. ChatGPT/Codex entitlements, Claude/Claude Code OAuth, Gemini CLI/Code Assist quota, Copilot, and provider API billing are separate authorization surfaces. Supporting those directly requires an optional trusted local companion or backend with provider-specific approval, endpoint allowlists, refresh locking, OS credential storage, exact-origin CORS, and a per-install pairing secret. It must bind only to loopback and must never upload CLI credential files, browser cookies, or long-lived tokens to this site.

Each request includes the open article's full five-part brief, causal chains, numbered source register, source relationship labels, and the reader's question. The system instruction requires bracketed source citations, separates interpretation from sourced statements, and asks the model to name missing evidence rather than invent it.

## Harness handoff

Every editorial headline on the homepage opens an internal evidence brief. Primary sources remain one level deeper in the evidence drawer so the first click teaches the issue instead of sending the reader away.

The mini whiteboard beside each brief accumulates visited briefing insights and the reader's jurisdiction, intended user, and solution hypothesis in tab memory. It turns that state into a bounded Markdown task for Claude Code, Codex, Hermes, or another coding agent. The task includes the problem, causal chain, prior approaches, source register, human-outcome measures, failure conditions, and safety constraints.

GitHub Pages cannot safely start software on a reader's computer. The handoff therefore requires the reader to inspect and copy or download the task before opening a local harness. Direct execution would require a separately authenticated local relay whose sender credential never enters browser JavaScript.

## Voice input

Voice dictation is optional and starts only after the reader accepts an explicit microphone disclosure. It uses the browser's native `SpeechRecognition` API; some browsers route audio through a vendor service. Synergy does not create an audio stream, record audio, upload transcripts, or persist transcripts outside the field the reader is editing. Dictation stops from the visible Voice control, when its briefing closes, when the tab is hidden, or when the page is left.

Future full-duplex ChatGPT, Grok, Claude, or other realtime voice belongs behind the same trusted companion/backend boundary as direct provider credentials. The browser should receive only a narrowly scoped, short-lived realtime session token when a provider officially supports one; long-lived API keys, refresh tokens, and coding-subscription tokens stay in the trusted component.

The newsletter form is intentionally a browser-only preview. It stores and sends nothing until an email provider is chosen and disclosed to readers.
