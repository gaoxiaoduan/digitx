# DIGITX - AI 智能体开发上下文指南

你好，Agent！本文档为你提供了 **DIGITX** 项目的核心背景、架构设计和开发原则。在对代码库进行任何修改之前，请务必阅读本指南。

## 1. 项目背景
DIGITX 是一个高性能的“双通道域名检索引擎”，专门用于挖掘和验证“极品纯数字域名”（例如：豹子号、顺子号、国人吉祥号等）。系统会根据指定长度智能生成高潜力的数字组合，进行算法评分和特征分类，并极其快速地验证它们是否可以被注册。

## 2. 核心架构设计
系统采用了“双模自适应架构”，以应对本地开发与云端静态部署：
- **本地模式 (Local Mode)**：通过 Express 后端 (`server.js`) 或终端 (`cli.js`) 运行。它允许在浏览器或终端内进行实时交互式扫描、参数配置以及实时终端日志输出。
- **静态模式 (Static Mode / Production)**：网页被编译并完全静态化托管（例如在 Cloudflare Pages 上）。前端 (`public/js/app.js`) 会自动检测运行环境，一旦发现处于线上静态环境中，将自动隐藏扫描操作按钮，转而加载预编译的静态 JSON 结果数据。
- **自动化流水线 (Automation Pipeline)**：借助 GitHub Actions 定时任务 (`.github/workflows/scheduled_scan.yml`) 周期性地拉起无头 Node.js 脚本 (`cron_scan.js`)。这个后台任务会分批次执行繁重的 WHOIS 域名查验，并将最新的数据 (`public/data/domains.json` 和 `public/data/status.json`) 提交回仓库中，从而触发静态网页的自动重新部署更新。

## 3. 扫描引擎 (双通道机制)
域名可用性验证在 `checker.js` 中分为两步严格执行：
1. **第一阶段 (DNS 极速盲查)**：高并发执行 `dns.resolveAny`。这一步不请求 WHOIS 服务器，仅通过探测 DNS 记录来瞬间剔除一大批已经被解析使用的域名。
2. **第二阶段 (WHOIS 权威核对)**：对上一轮存活的疑似未注册域名进行 WHOIS 核对。**此步骤已被强制节流（默认每次请求间隔 2000 毫秒）**，以防止注册局将扫描服务器的 IP 封禁。

## 4. 关键文件与目录结构
- **`generator.js`**：核心生成算法。根据位数生成数字域名，过滤不吉利数字（如 '4'，但智能保留程序员偏爱的 '1024'、'404'），赋予类别（如“至尊连号豹子”），并进行动态价值打分。
- **`checker.js`**：核心查验逻辑（DNS + WHOIS）。包含 `CheckerQueue` 用于异步节流处理，以及 `LocalStore` 负责本地数据状态持久化。
- **`server.js`**：本地模式下的 Express API 服务器。承载 UI 界面，提供扫描启停 API，并推送 SSE 终端日志。
- **`cli.js`**：命令行交互界面，借助 `inquirer` 可直接在终端内完整运行扫描与配置流程。
- **`cron_scan.js`**：专为 GitHub Actions 定制的环境无头脚本。内建了“安全防超时断点机制”（能在 GitHub 强制杀掉任务前，提前暂停队列并保存进度）。
- **`public/index.html`**：Web UI 入口文件。使用现代 CSS（如玻璃拟态 Glassmorphism、赛博朋克霓虹发光）。
- **`public/js/app.js`**：前端核心逻辑。自动处理中英双语 (`LOCALIZATION`)，管理域名的排序/正则筛选/导出功能，并在本地模式与静态模式间自适应切换 UI 展现。
- **`domains_db.json`**：数据库唯一事实来源（Single Source of Truth）。它被 Git 追踪，用于承载 GitHub Actions 每天中断又恢复的状态进度。

## 5. Agent 开发修改原则
- **UI 视觉规范**：项目确立了非常精致的“赛博朋克深色拟态”视觉审美。新增的任何 UI 元素都必须严格复用当前的 CSS 变量（如 `--neon-cyan`, `--glass-bg`），切勿编写简陋的默认样式。
- **国际化 (i18n)**：任何出现在前端的文本变更都不能硬编码在 `index.html` 中，必须添加到 `app.js` 头部的 `LOCALIZATION` 字典对象中，确保中英双语完美适配。
- **云端状态无状态化**：牢记 GitHub Actions 的运行环境是短暂的。任何引擎扫描进度的变动，都必须由 `checker.js` 实时写入 `domains_db.json`，并在脚本结束前被 Git Commit 推送到仓库，否则一切进展将会丢失。
- **节流底线不可碰**：绝对不要在 `checker.js` 或 `cron_scan.js` 中移除或过度压缩 WHOIS 的延时限制。绕过频率限制必定导致 IP 被拉黑。
