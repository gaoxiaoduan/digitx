# 0006. 升级至 TypeScript 7.0 (Go 原生编译器)

* 状态: 已接受 (accepted)
* 日期: 2026-07-27

## 背景与问题陈述

TypeScript 7.0 带来了重大架构演进：使用 Go 语言重构的原生编译器，带来 8 倍至 12 倍的构建与类型检查性能提升、显著降低的内存开销以及原生多线程能力。

## 决策驱动因素

* Monorepo 中各子包 (`@digitx/core`, `@digitx/web`, `@digitx/api`, `@digitx/scanner`) 的编译与类型检查效率。
* 与现有构建及打包工具链 (`tsup`, `tsx`, `vite`, `wrangler`) 的无缝兼容。
* 通过保留既有 Target 版本 (`ES2020` / `ES2022`) 控制迁移风险。

## 备选方案

1. 保持在 TypeScript 5.4.x / 5.8.x
2. 全局升级至 TypeScript 7.0 (Go 原生编译器)（选中）
3. 使用 Compiler API 兼容别名的混合过渡方案

## 决策结果

选择方案：**全局升级至 TypeScript 7.0**。由于 DIGITX 项目的 TS 配置清晰规范且不依赖复杂的旧版 Node.js TS 编译器插件，直接升级可获得最佳的类型检查性能提升，同时保持 Target 配置稳定不变。
