# 0004 Cloudflare KV Data Storage & API Sync Flow

Decided to store domain scan database records in Cloudflare KV. The Cloudflare Workers API (Hono) provides `GET /api/domains` for frontend queries and `POST /api/sync` (secured via secret bearer token) for GitHub Actions Node.js scanner to push verified domain updates without modifying Git history.
