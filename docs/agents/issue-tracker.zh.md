# 问题追踪器：GitHub

本仓库的问题（Issue）和 PRD 均存放于 GitHub Issues。所有操作请使用 `gh` CLI。

## 约定规范

- **创建 Issue**：`gh issue create --title "..." --body "..."`。多行内容使用 heredoc。
- **读取 Issue**：`gh issue view <number> --comments`，结合 `jq` 过滤评论并获取标签。
- **列出 Issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，附带适当的 `--label` 和 `--state` 过滤器。
- **评论 Issue**：`gh issue comment <number> --body "..."`
- **添加/移除标签**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **关闭 Issue**：`gh issue close <number> --comment "..."`

从 `git remote -v` 自动推断仓库——在 Clone 目录下运行 `gh` 时会自动完成。

## 将 Pull Request 作为分流入口

**将 PR 作为需求入口: 否 (no)** _(如果本仓库将外部 PR 视为功能需求，请设为 `yes`；`/triage` 会读取该标志。)_

## 当 Skill 要求 "发布到 Issue 追踪器" 时

创建一个 GitHub Issue。

## 当 Skill 要求 "读取相关 Ticket" 时

运行 `gh issue view <number> --comments`。
