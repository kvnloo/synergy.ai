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

There is no unlimited hosted LLM with a permanent free guarantee. Without local software, the reader uses OpenRouter's `openrouter/free` route as a best-effort option, subject to OpenRouter's account, model, rate, and availability limits. The browser flow follows [OpenRouter's documented OAuth PKCE flow](https://openrouter.ai/docs/guides/overview/auth/oauth). Its returned user-controlled key remains in JavaScript memory until the tab closes.

The optional local companion adds encrypted on-device storage and first-class authentication adapters for Oh My Pi and Hermes Agent:

```sh
python -m venv .venv
.venv/bin/pip install -e companion
.venv/bin/synergy-companion
```

Because browsers block an HTTPS page from fetching a plain-HTTP loopback service, the published reader does not attempt that request. Start the companion and follow its printed `http://127.0.0.1:4388/app/` URL, or use the published page's **Open the same-origin local reader** link. Enter the printed pairing code there. The code remains only in page memory. The companion binds to `127.0.0.1:4388`, serves the checked-out static site at `/app/`, accepts only an exact origin allowlist, requires the pairing code on every privileged request, and does not log paths, request bodies, or provider output.

The companion's own vault is an authenticated AES-256-GCM envelope. Its random master key is stored in the operating-system keychain when available. If no usable keychain exists, startup requires a passphrase and derives the key with Argon2id; there is no plaintext fallback. Pairing codes and manually saved OpenRouter keys are encrypted at rest. The browser can list credential labels and delete entries, but the listing endpoint never returns secrets.

Oh My Pi authentication runs through `omp auth-broker login <provider>` and discovers available providers from `omp auth-broker list --json`. Hermes authentication runs through `hermes auth add <provider> --type oauth`; the allowlist covers Anthropic, Nous Portal, ChatGPT Codex, xAI, Qwen, and MiniMax OAuth as exposed by Hermes. OMP and Hermes retain subscription credentials in their own local stores. Synergy receives job status and redacted command output, never their access tokens, refresh tokens, browser cookies, or credential files.

These adapters authenticate provider subscriptions; they do not pretend those subscriptions are interchangeable API entitlements. The evidence Q&A path currently uses OpenRouter, either directly from tab memory or through an OpenRouter key in the local encrypted vault. Adding inference through OMP or Hermes requires a separately constrained execution contract so an evidence question cannot become an arbitrary coding-agent or tool invocation.

OpenRouter is a gateway account, not a universal subscription importer. ChatGPT/Codex, Claude/Claude Code, Gemini CLI/Code Assist, Copilot, and provider API billing expose separate authorization and entitlement surfaces. No standard OAuth aggregator converts those consumer subscriptions into one credential.

Each request includes the open article's full five-part brief, causal chains, numbered source register, source relationship labels, and the reader's question. The system instruction requires bracketed source citations, separates interpretation from sourced statements, and asks the model to name missing evidence rather than invent it. When an OpenRouter key is in the local vault, the companion decrypts it only for the outbound OpenRouter request; Synergy has no hosted proxy and does not receive the key.

## Harness handoff

Every editorial headline on the homepage opens an internal evidence brief. Primary sources remain one level deeper in the evidence drawer so the first click teaches the issue instead of sending the reader away.

The mini whiteboard beside each brief accumulates visited briefing insights and the reader's jurisdiction, intended user, and solution hypothesis in tab memory. It turns that state into a bounded Markdown task for Claude Code, Codex, Hermes, or another coding agent. The task includes the problem, causal chain, prior approaches, source register, human-outcome measures, failure conditions, and safety constraints.

GitHub Pages cannot safely start software on a reader's computer. The handoff therefore requires the reader to inspect and copy or download the task before opening a local harness. Direct execution would require a separately authenticated local relay whose sender credential never enters browser JavaScript.

## Voice input

Voice dictation is optional and starts only after the reader accepts an explicit microphone disclosure. It uses the browser's native `SpeechRecognition` API; some browsers route audio through a vendor service. Synergy does not create an audio stream, record audio, upload transcripts, or persist transcripts outside the field the reader is editing. Dictation stops from the visible Voice control, when its briefing closes, when the tab is hidden, or when the page is left.

Future full-duplex ChatGPT, Grok, Claude, or other realtime voice belongs behind the same trusted companion/backend boundary as direct provider credentials. The browser should receive only a narrowly scoped, short-lived realtime session token when a provider officially supports one; long-lived API keys, refresh tokens, and coding-subscription tokens stay in the trusted component.

The newsletter form is intentionally a browser-only preview. It stores and sends nothing until an email provider is chosen and disclosed to readers.
