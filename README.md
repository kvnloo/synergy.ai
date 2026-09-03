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

There is no unlimited hosted LLM with a permanent free guarantee. The reader uses OpenRouter's `openrouter/free` route as a best-effort option, subject to OpenRouter's account, model, rate, and availability limits. Readers can enter their own OpenRouter key and choose any model route their account can access. OpenRouter also lets a user connect provider credentials to that account, which gives the site one browser API instead of separate OpenAI, Anthropic, Google, and other integrations.

The static site sends requests directly from the reader's browser to `https://openrouter.ai/api/v1/chat/completions`. Synergy has no proxy and never receives the key. The page does not place keys in cookies, local storage, session storage, URLs, logs, or analytics. A key remains only in the password input for the current tab and the reader can clear it. Do not replace this with a developer-owned key in client JavaScript.

Each request includes the open article's full five-part brief, causal chains, numbered source register, source relationship labels, and the reader's question. The system instruction requires bracketed source citations, separates interpretation from sourced statements, and asks the model to name missing evidence rather than invent it.

The newsletter form is intentionally a browser-only preview. It stores and sends nothing until an email provider is chosen and disclosed to readers.
