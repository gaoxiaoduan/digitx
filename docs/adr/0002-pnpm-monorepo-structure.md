# 0002 Monorepo Project Structure: pnpm Workspaces

Decided to structure the codebase as a pnpm monorepo containing `apps/web` (Vite + React SPA), `apps/api` (Cloudflare Workers Hono API), `apps/scanner` (Node.js TS CLI and GitHub Actions scanner), and `packages/core` (shared TS types, pattern logic, and generator engine).
