# 0004 Cloudflare KV 数据存储与 API 同步流程

决定将域名扫描数据库记录存储在 Cloudflare KV 中。Cloudflare Workers API (Hono) 提供用于前端查询的 `GET /api/domains` 接口，以及用于 GitHub Actions Node.js 扫描器静默推送最新验证数据（无需修改 Git 历史）的 `POST /api/sync`（通过 Secret 密钥鉴权）接口。
