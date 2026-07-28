# DIGITX - Project Context for Agents

Welcome, Agent! This document provides the necessary context, architecture, and design principles for the **DIGITX** project. Read this before modifying the codebase.

## 1. Project Background
DIGITX is a high-performance, dual-channel domain finder and validator designed specifically for hunting "premium numeric domains" (e.g., repeating numbers, sequences, lucky numbers). It generates potential high-value numeric domains, scores them based on specific patterns, and rapidly checks their availability.

## 2. Core Architecture
The project is a pnpm TypeScript monorepo:
- **`apps/web`**: React + Vite + Tailwind/shadcn SPA, deployed to Cloudflare Pages. It reads domain data from `GET /api/domains`.
- **`apps/api`**: Hono Cloudflare Worker. It exposes public read endpoints and the authenticated `POST /api/sync` endpoint, and stores data in Cloudflare KV.
- **`apps/scanner`**: Node.js CLI and scheduled scanner. The GitHub Actions workflow runs `pnpm scan` and sends its batch result to the Worker API.
- **`packages/core`**: Shared, typed generator, DNS/WHOIS checker, and domain database utilities.

## 3. The Scanning Engine (Dual-Channel)
`packages/core/src/scan-engine.ts` owns validation in two stages; `checker.ts` provides the DNS/WHOIS implementation used by its production adapters:
1. **Stage 1 (DNS Blind Scan)**: Concurrent NS-record lookups filter actively used domains without querying WHOIS.
2. **Stage 2 (WHOIS Verification)**: The remaining domains are verified through WHOIS. Keep the default 2000ms throttle to avoid registry IP bans.

## 4. Key Files & Structure
- **`packages/core/src/generator.ts`**: Generates and scores premium numeric-domain candidates.
- **`packages/core/src/scan-engine.ts`**: Deep Scan Engine interface, scan policy, checkpoint/progress seams, and production/fake adapters.
- **`packages/core/src/checker.ts`**: DNS/WHOIS implementation and typed database helpers.
- **`apps/scanner/src/cli.ts`**: Interactive local scanner.
- **`apps/scanner/src/cron_scan.ts`**: Scheduled batch scanner and API sync client.
- **`apps/api/src/index.ts`**: Hono Worker routes and KV access.
- **`apps/web/src/App.tsx`**: React SPA composition; components are in `apps/web/src/components`.
- **`apps/api/wrangler.jsonc`**: Worker binding configuration.

## 5. Development Guidelines
- **UI aesthetics**: Follow `DESIGN.md` and the established Tailwind design tokens in `apps/web`; the approved direction is Vercel-style near-white surfaces and ink text.
- **Cloud data flow**: Cloudflare KV is the production source of truth. `domains_db.json` is an ignored local scanner checkpoint only; never commit it.
- **Build commands**: Use `pnpm check-types`, `pnpm build`, `pnpm cli`, and `pnpm scan` from the repository root.
- **Throttling is critical**: Never bypass the 2000ms WHOIS delay floor in `packages/core/src/scan-engine.ts`; CLI and scheduled scanner adapters must not reimplement it.

## Agent skills

### Issue tracker

Issues and PRDs for this repo live as GitHub issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped to GitHub label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/` at root). See `docs/agents/domain.md`.
