# Project instructions

## Goal
Build and run a Vite + React meme generator for user review. Match the neon 1990s newsletter style at https://github.com/mathnasiumlakeland/email and reuse its exact GIF assets.

## Design and implementation
- Preserve the reference navy #000066, yellow #ffff00, cyan #00ffff, magenta #ff00ff, green #00ff00, Comic Sans fonts, ridge borders and dancing hamsters.
- Keep the layout responsive and keyboard accessible. Respect reduced motion and offer an animation toggle.
- Bundle meme template images and GIFs locally so previews and PNG exports work without remote-image CORS.
- Implement template search, captions, image upload, styling, shuffle and PNG download in the browser.
- Never imply PNG exports preserve GIF animation; animated decorations stay on the site.
- Application lives in meme-generator/. Use npm.cmd on Windows PowerShell when npm.ps1 is blocked.

## Progress (2026-10-08)
- Inspected the empty workspace and downloaded the reference repository to .reference-email/ for read-only study.
- Located the original hamster, dancing baby and animated button GIF URLs in email.html.
- Scaffolding React through the official Vite starter.
- Unified shell sandbox failed to initialize; public-repository commands work through approved escalation.

## User clarification
- Use email.html directly as the visual and structural skeleton, editing its text and content for a meme generator. Preserve the section order: cyan title, magenta dance banner, white hamster strip, yellow greeting, blue instructions, generator, dancing baby, green download action, colorful news cards and terminal footer.
- Preserve the original email in meme-generator/reference-email.html for comparison.

- Implemented the React email skeleton, rewritten meme copy, 12 bundled templates, live canvas rendering, per-template caption placement, uploads, styles, shuffle, recent downloads and original GIF decorations.
- All three original GIFs are downloaded locally. GIF animations can be paused; reduced-motion preferences start with still frames.

## Final verification (2026-10-08)
- Production build and oxlint passed without findings. npm reported zero dependency vulnerabilities on installation.
- All 7 Playwright checks passed: reference skeleton/assets, all 12 template layouts and filtering, caption/style/reset/shuffle, PNG dimensions/signature and recent downloads, valid/invalid uploads, GIF pause/reduced motion, and mobile overflow.
- Inspected full-page desktop (1440px) and mobile (390px) screenshots; no clipping or horizontal overflow.
- Local Vite server is running at http://127.0.0.1:5173 (http://localhost:5173) for user review.
- No connected user-browser surfaces were available. Headless Chromium verified the app and generated review screenshots instead.
- README.md contains setup, review and check commands. Original email is preserved in meme-generator/reference-email.html; asset attribution is in public/assets/SOURCES.md.
- PNG exports are static; the original GIFs animate as site decorations. My memes keeps at most 6 downloads in memory for the current visit.

## Maintenance
- Keep this email skeleton and the exact original GIF assets unless the user asks to change them.
- After functional changes, run npm.cmd test and npm.cmd run build; run npm.cmd run lint for source checks.
- Keep GIFs and templates locally served to avoid CORS export failures. Update SOURCES.md if assets change.

## GitHub Pages support (2026-10-08)
- User confirmed static hosting on GitHub Pages and requested the deployment workflow.
- Added .github/workflows/deploy.yml with main-push/manual triggers, Node 24, npm ci, lint, production build, browser verification, Pages artifact upload and deploy.
- All template/GIF URLs use import.meta.env.BASE_URL. Build/preview default to /scottsiegel/; development stays at /. VITE_BASE_PATH overrides this and the workflow derives it from configure-pages.
- Added npm.cmd run test:pages to exercise the actual static bundle at the repository subdirectory. Browser checks are portable across Windows and Linux.
- Deployment is prepared locally; no commit, push or GitHub settings changes have been made. README includes activation instructions.
- Verified the final static /scottsiegel/ production build: all 7 browser checks passed, including local GIF/template loads and full-resolution PNG downloads. Lint and git diff --check passed.
