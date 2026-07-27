# DIGITX 领域上下文

高性能力度数字域名查找与验证器，针对优质数字域名模式，并通过多阶段 DNS 和 WHOIS 扫描验证域名可用性。

## 领域语言词汇

**数字域名 (Numeric Domain)**：
完全或主要由数字构成的域名（例如 `8888.xyz`、`1024.xyz`）。
_避免使用_：Number domain, digital domain

**盲扫 (Blind Scan)**：
第 1 阶段验证，通过高速并发 DNS 查询快速过滤已被占用的活跃域名。
_避免使用_：DNS check, quick check

**WHOIS 校验 (WHOIS Verification)**：
第 2 阶段限流验证，连接注册局 WHOIS 服务器以确认域名的确切注册状态。
_避免使用_：Slow scan, WHOIS check

**扫描引擎 (Scan Engine)**：
后台扫描逻辑（在 Node.js 环境中通过 GitHub Actions 定时运行），负责执行第 1 阶段和第 2 阶段的验证任务。
_避免使用_：Worker, checker background
