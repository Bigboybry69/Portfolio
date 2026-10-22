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

The portfolio uses `portfolio.dli95.com`, declared in `public/CNAME` and copied to `docs/CNAME` during builds. Set the GitHub Pages custom domain to `portfolio.dli95.com`. At GoDaddy, the `portfolio` CNAME points to `bigboybry69.github.io`. Existing apex (`@`) and `www` records are separate and should only be changed when configuring their intended website or redirect. Enable Enforce HTTPS in GitHub Pages once the certificate is ready.

## About Me

`my-story.html` shares Daniel’s personal account of growing up around residential construction, his interest in technology, and his résumé-based career context. Edit the story content in `main.js`.

## INL academic building concept

`inl-building.html` presents Daniel’s team school project with an interactive viewer (`model-viewer.js`). The GLB in `models/inl-building.glb` was converted from the supplied FBX using Blender. Presentation materials were assigned to match Daniel’s Revit reference: glass panels, neutral roofs and solid walls, and a grass courtyard. The viewer adds steel-colored outlines to the glazing panels. These are visual approximations rather than manufacturer textures. The original FBX is not published. The Three.js viewer is loaded only on this project page; Home and Projects use `public/images/inl-building-preview.png`. Sustainability and daylighting are stated design goals, not measured performance claims.

The INL model is bundled with a content-hashed filename so material updates do not reuse an older cached GLB.

## Data Center Chilled Water fabrication project

`chilled-water-fabrication.html` presents the supplied LOD 400 fabrication model, crediting Revit, eVolve Mechanical, and Autodesk Fabrication CADmep. `models/chilled-water-fabrication.glb` contains 82 IFC-derived component meshes with display finishes and selected metadata (component name, assembly label, system label, source element ID, IFC class). It was tessellated with IfcOpenShell, converted from IFC coordinates into glTF Y-up meters, and recentered for browser rendering. The original IFC is not published.

CHWS and CHWR labels are inferred from assembly naming, not formal IFC system objects: 42 supply and 37 return components. The three generic equipment objects are labeled as CRAH units based on Daniel’s clarification. One stray, unassigned field weld is omitted from the web export; welds within CHWS/CHWR assemblies remain. The source contains no verified material specifications; assigned steel, fitting, valve, gasket/weld, and CRAH equipment finishes are illustrative. `chilled-water-viewer.js` preserves those finishes and offers optional system colors, visibility filters, component picking, an accessible component dropdown, and orbit/zoom/pan controls. Model assets are content-hashed by Vite. The Home preview remains capped at four projects.
