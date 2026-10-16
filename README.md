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

## About Me

`my-story.html` shares Daniel’s personal account of growing up around residential construction, his interest in technology, and his résumé-based career context. Edit the story content in `main.js`.

## Interactive model preview

The Projects page dynamically loads `model-viewer.js` (Three.js) and `public/models/chiller-water.glb`. The GLB was converted from Daniel’s Revit FBX export using Blender 4.3.2. It contains 436 mesh parts and no supplied materials/textures; the viewer applies a neutral blue-gray display material. The original FBX is not published. The viewer supports orbit, pan, zoom, reset, keyboard panning, and fullscreen where supported. Rendering is event-driven rather than continuous.

To remove the test later, remove the `.model-project` section and Projects viewer initialization from `main.js`, remove `model-viewer.js` and `public/models/chiller-water.glb`, uninstall Three.js if unused, and rebuild `docs/`. Keep `public/CNAME` when rebuilding for the custom domain.
