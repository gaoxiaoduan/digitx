# Cloudflare deployment

DIGITX uses Cloudflare Workers for the API and KV storage, plus Cloudflare Pages for the static web application.

## One-time account setup

1. Log in to Cloudflare:

   ```bash
   pnpm --filter @digitx/api exec wrangler login
   ```

2. Confirm that the `DIGITX_KV` ID in `apps/api/wrangler.jsonc` matches the production KV namespace. Namespace IDs are public identifiers and are safe to commit; do not commit API tokens or `SYNC_SECRET`.

3. Set the scanner-to-API secret interactively:

   ```bash
   pnpm --filter @digitx/api exec wrangler secret put SYNC_SECRET
   ```

4. Create the Pages project once:

   ```bash
   pnpm pages:init
   ```

## Domains

The API Worker deploys on `https://digitx-api.33338888.xyz`. The Worker configuration declares it as a Cloudflare Custom Domain, so Cloudflare provisions the DNS record and certificate when the domain's zone is in the same Cloudflare account.

After the first Pages deployment, add `digitx.33338888.xyz` under **Workers & Pages → digitx → Custom domains**. This is a one-time dashboard operation required by Cloudflare Pages.

## Deploy

```bash
pnpm deploy
```

The command deploys the Worker first, then builds and uploads `apps/web/dist` to the `digitx` Pages project. The production Vite build reads `apps/web/.env.production`, which directs browser API calls to `https://digitx-api.33338888.xyz`.

## Scanner sync

Add these GitHub Actions secrets before dispatching the scheduled scan:

```text
DIGITX_API_URL=https://digitx-api.33338888.xyz
DIGITX_SYNC_SECRET=<the same SYNC_SECRET set on the Worker>
```

Never commit the secret value or an API token.
