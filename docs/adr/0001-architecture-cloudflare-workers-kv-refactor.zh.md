# 0001 架构重构：Cloudflare Workers KV API 与 React SPA

决定将 DIGITX 重构为部署在 Cloudflare Pages 上的 Vite + React + TypeScript 单页应用（SPA），后端由 Cloudflare Workers (Hono API) 节点以及 Cloudflare KV / D1 存储提供支持。GitHub Actions 自动扫描程序将通过 Wrangler / REST API 直接将结果写入 Cloudflare KV / D1，而不是将 `domains_db.json` 提交到 Git 中，从而保持仓库提交历史干净，并支持边缘 API 的实时查询。
