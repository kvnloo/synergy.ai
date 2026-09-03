# Synergy

Synergy is an independent briefing site about humanitarian crises, public-interest technology, and small projects worth testing. It borrows the dense editorial rhythm of [Garry's List](https://garryslist.org/) while using an original identity, design, and body of work.

The first version is deliberately small. Plain HTML, CSS, and JavaScript. No build step, account system, analytics, or live feed.

## Run it

```sh
python -m http.server 4173
```

Open `http://localhost:4173`.

## Publish it

The workflow in `.github/workflows/pages.yml` deploys the repository root to GitHub Pages after every push to `main`.

1. Create an empty GitHub repository.
2. Add it as `origin` and push `main`.
3. In the repository settings, set Pages source to **GitHub Actions**.
4. Add a custom domain only after its DNS is ready. Do not commit a `CNAME` file before then.

## Edit the site

- `index.html` owns the page structure, lead story, projects, and editorial principles.
- `app.js` owns dispatch and story data plus topic, search, menu, and signup-preview behavior.
- `styles.css` owns the visual system and responsive layouts.

Every published issue note should link to its closest available source. Prefer local response organizations, original documents, agency situation pages, and public datasets. Distinguish reported facts from interpretation. Do not publish sensitive personal data.

The newsletter form is intentionally a browser-only preview. It stores and sends nothing until an email provider is chosen and disclosed to readers.
