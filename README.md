# Daniel Li — Portfolio

A responsive, three-page portfolio with a dark theme and green and blue accents.

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

Vite builds `index.html`, `projects.html`, and `my-story.html` into `dist/` for static hosting.

## Personalize

Edit `main.js` to update the résumé-based experience, introduction, and LinkedIn profile. Career details were supplied in Daniel’s résumé. Project cards remain illustrative concepts and should be replaced with verified projects and case studies. The homepage portrait is Daniel’s uploaded photo in `public/images/FrontPgaePhoto.jpg`; CSS frames it for desktop and mobile. Typography uses Google Fonts with local system font fallbacks.

## GitHub Pages

The `docs/` folder contains the published build. In repository Settings → Pages, choose Deploy from a branch, then main and /docs. After editing the site, refresh this folder with `npm run build -- --outDir docs` and commit the generated files.

## Custom domain

The site uses `dli95.com`, declared in `public/CNAME` and copied to `docs/CNAME` during builds. Configure GitHub Pages with this custom domain. At the domain provider, point the apex (`@`) A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`; point `www` via CNAME to `bigboybry69.github.io`. Enable Enforce HTTPS in GitHub Pages once the certificate is ready.

## My Story

`my-story.html` shares résumé-based career context, with content in `main.js`. The personal motivation section is a clearly marked placeholder awaiting Daniel’s own story.
