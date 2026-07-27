# 0007. 升级至 Vite 8 (Rolldown & Oxc 打包引擎)

* 状态: 已接受 (accepted)
* 日期: 2026-07-27

## 背景与问题陈述

Vite 8 带来了下一代前端构建工具链架构：基于 Rust 的 Rolldown（打包器）与 Oxc（代码转换器），提供极速的 HMR、更小的依赖体积与更优的生产构建效率。

## 决策驱动因素

* `@digitx/web` 的开发服务器与生产打包构建效率。
* 同步引入无 Babel 沉重依赖的 `@vitejs/plugin-react@6` 转换插件。
* 与现代浏览器 Target (`ES2022`) 保持一致。

## 备选方案

1. 保持在 Vite 5.4.x
2. 全局升级至 Vite 8.0.x 与 `@vitejs/plugin-react@6`（选中）
3. 仅升级 Vite 而保留旧版 React 插件

## 决策结果

选择方案：**升级至 Vite 8.0.x 与 `@vitejs/plugin-react@6`**。由于 `@digitx/web` 项目采用了标准的极简 Vite 配置，升级至 Rolldown + Oxc 引擎可直接享受极速转换与构建性能，且无需额外配置调整。
