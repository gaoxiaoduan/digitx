# DIGITX - AI 智能体开发上下文指南

你好，Agent！本文档为你提供了 **DIGITX** 项目的核心背景、架构设计和开发原则。在对代码库进行任何修改之前，请务必阅读本指南。

## 1. 项目背景
DIGITX 是一个高性能的“双通道域名检索引擎”，专门用于挖掘和验证“极品纯数字域名”（例如：豹子号、顺子号、国人吉祥号等）。系统会根据指定长度智能生成高潜力的数字组合，进行算法评分和特征分类，并极其快速地验证它们是否可以被注册。

## 2. 核心架构设计
项目采用 pnpm TypeScript monorepo：
- **`apps/web`**：React + Vite + Tailwind/shadcn 单页应用，部署到 Cloudflare Pages，并从 `GET /api/domains` 获取数据。
- **`apps/api`**：Hono Cloudflare Worker，提供公开查询接口和受鉴权保护的 `POST /api/sync`，数据存放在 Cloudflare KV。
- **`apps/scanner`**：Node.js 命令行与定时扫描器。GitHub Actions 运行 `pnpm scan`，将每批扫描结果同步到 Worker API。
- **`packages/core`**：共享的类型安全候选生成、DNS/WHOIS 检查及域名数据库工具。

## 3. 扫描引擎 (双通道机制)
`packages/core/src/scan-engine.ts` 负责两阶段验证；`checker.ts` 提供其生产 adapter 使用的 DNS/WHOIS implementation：
1. **第一阶段 (DNS 极速盲查)**：并发查询 NS 记录，不请求 WHOIS，快速滤掉已使用的域名。
2. **第二阶段 (WHOIS 权威核对)**：检查剩余的疑似未注册域名。**必须保留默认 2000ms 节流**，避免注册局封禁扫描 IP。

## 4. 关键文件与目录结构
- **`packages/core/src/generator.ts`**：生成和评分高价值纯数字域名候选。
- **`packages/core/src/scan-engine.ts`**：deep Scan Engine interface、扫描策略、checkpoint/progress seam 及生产/fake adapter。
- **`packages/core/src/checker.ts`**：DNS/WHOIS implementation 及类型化数据库工具。
- **`apps/scanner/src/cli.ts`**：本地交互式扫描器。
- **`apps/scanner/src/cron_scan.ts`**：定时批处理扫描器及 API 同步客户端。
- **`apps/api/src/index.ts`**：Hono Worker 路由与 KV 访问。
- **`apps/web/src/App.tsx`**：React SPA 组合入口，组件位于 `apps/web/src/components`。
- **`apps/api/wrangler.jsonc`**：Worker binding 配置。

## 5. Agent 开发修改原则
- **UI 视觉规范**：遵循 `DESIGN.md` 和 `apps/web` 中的 Tailwind 设计令牌；当前视觉方向为 Vercel 风格的近白背景与墨黑文字。
- **云端数据流**：Cloudflare KV 是生产环境唯一数据源。`domains_db.json` 仅为本地扫描检查点，已被忽略，绝不能提交。
- **构建命令**：在仓库根目录使用 `pnpm check-types`、`pnpm build`、`pnpm cli` 和 `pnpm scan`。
- **节流底线不可碰**：绝对不要绕过 `packages/core/src/scan-engine.ts` 中 2000ms 的 WHOIS 延时下限；CLI 和定时扫描 adapter 不得重新实现该逻辑。
