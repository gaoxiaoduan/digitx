# 0002 Monorepo 项目结构：pnpm Workspaces

决定将代码库构建为 pnpm monorepo，包含 `apps/web` (Vite + React SPA)、`apps/api` (Cloudflare Workers Hono API)、`apps/scanner` (Node.js TS CLI 与 GitHub Actions 扫描器)，以及 `packages/core` (共享的 TS 类型、模式逻辑与生成器引擎)。
