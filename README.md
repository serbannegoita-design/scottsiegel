# Teh Meme Machine!!! :p

A React meme generator scaffolded with Vite. The visual skeleton comes directly from [Max's email newsletter](https://github.com/mathnasiumlakeland/email): Comic Sans, navy background, cyan and magenta banners, yellow body, ridge borders, dancing hamsters, dancing baby, retro green button, colorful news cards and terminal footer.

## Run locally

From this repository:

```powershell
cd meme-generator
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://localhost:5173. Use npm.cmd on Windows if PowerShell blocks npm.ps1.

## Review

1. Pick a template or search for a classic.
2. Edit the captions and try the font, size, colors, outline and ALL CAPS controls.
3. Download a full-resolution PNG. Recent downloads appear in My memes for the current visit.
4. Upload your own JPG, PNG or WebP; images are processed entirely in your browser.
5. Try Pause GIFs and the mobile layout. Reduced-motion preferences start with still frames.

The hamsters and baby animate on the website; downloaded memes are static PNGs.

## Checks

```powershell
cd meme-generator
npm.cmd run build
npm.cmd run lint
npm.cmd exec playwright install chromium
npm.cmd test
```

The browser checks cover local assets and runtime errors, all 12 template layouts, search and filters, caption changes, styling, reset and shuffle, full-resolution PNG export, upload validation, GIF pause, reduced motion and mobile overflow. Screenshots are generated at meme-generator/test-results/review-desktop.png and review-mobile.png.

## Files

- meme-generator/src/App.jsx: React adaptation of the newsletter skeleton and generator controls.
- meme-generator/src/App.css: original newsletter palette and responsive layout.
- meme-generator/src/templates.js: curated Imgflip templates and caption placement.
- meme-generator/src/meme.js: canvas text wrapping, sizing and drawing.
- meme-generator/reference-email.html: unchanged reference email for side-by-side comparison.
- meme-generator/public/assets/SOURCES.md: source URLs for bundled images and original GIFs.
- agents.md: project guidance and progress notes.

## Deploy to GitHub Pages

This is a fully static site. React, captions, uploads, GIF controls and PNG exports all run in the browser. Node is needed only to build the HTML/CSS/JavaScript bundle; GitHub Pages does not need a Node server, API, database or secrets.

1. Commit and push the project, including `.github/workflows/deploy.yml`, to `main`.
2. In the GitHub repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Run **Deploy meme generator to GitHub Pages** from the Actions tab if needed. Later pushes to `main` deploy automatically.

Expected address for this repository: https://serbannegoita-design.github.io/scottsiegel/ (not published by this local setup).

The workflow installs pinned dependencies, lints the source, builds `meme-generator/dist`, verifies the static build with all browser checks, then uploads and deploys that folder using the official Pages actions. Asset URLs use Vite's base path, including all original GIFs. The workflow detects the Pages base path, so custom domains and renamed repositories use the appropriate path. Local builds default to `/scottsiegel/`; set `VITE_BASE_PATH` if testing a different deployment path.

Verify the GitHub Pages production build locally:

```powershell
cd meme-generator
npm.cmd run test:pages
npm.cmd run preview -- --host 127.0.0.1
```

Then open http://localhost:4173/scottsiegel/. The development server still uses http://localhost:5173/.
