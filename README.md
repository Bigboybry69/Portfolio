# Daniel Li — Portfolio

A responsive, two-page portfolio with a dark theme and green and blue accents.

## Develop

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci --cache /tmp/portfolio-npm-cache
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Vite builds both `index.html` and `projects.html` into `dist/` for static hosting.

## Personalize

Edit `main.js` to replace the introductory copy, experience placeholder, and illustrative project concepts with Daniel’s verified details. Both LinkedIn links currently point to the LinkedIn homepage; replace them with Daniel’s profile URL. The forest photograph is a temporary photo placeholder from Unsplash; replace it with Daniel’s own photo. Typography uses Google Fonts with local system font fallbacks.

## GitHub Pages

The `docs/` folder contains the published build. In repository Settings → Pages, choose Deploy from a branch, then main and /docs. After editing the site, refresh this folder with `npm run build -- --outDir docs` and commit the generated files.
