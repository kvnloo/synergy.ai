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

The newsletter form is intentionally a browser-only preview. It stores and sends nothing until an email provider is chosen and disclosed to readers.
