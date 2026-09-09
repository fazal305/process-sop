# Deployment

This is a static single-page app with no backend and no required environment variables (see
`.env.example`), so it deploys the same way to any static host.

## Vercel (recommended)

1. Import the repository in Vercel.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. No environment variables are required.
4. Because this is a client-side-routed SPA (React Router), configure a rewrite so unknown paths
   fall back to `index.html` — Vercel's Vite preset does this automatically; if deploying
   elsewhere, add an equivalent rewrite/fallback rule.

## Any static host (Netlify, GitHub Pages, Cloudflare Pages, etc.)

```bash
npm install
npm run build
```

Upload the resulting `dist/` directory. Configure the host's SPA fallback (serve `index.html` for
unmatched routes) so direct links to `/workflow`, `/simulation`, etc. don't 404 on refresh.
