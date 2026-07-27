# 0001 Architecture Refactor: Cloudflare Workers KV API with React SPA

Decided to refactor DIGITX into a Vite + React + TypeScript Single Page Application (SPA) hosted on Cloudflare Pages, backed by a Cloudflare Workers (Hono API) endpoint and Cloudflare KV / D1 store. GitHub Actions automated scanning will write results directly to Cloudflare KV / D1 via Wrangler / REST API rather than committing `domains_db.json` to Git, keeping the repository history clean and enabling real-time edge API queries.
