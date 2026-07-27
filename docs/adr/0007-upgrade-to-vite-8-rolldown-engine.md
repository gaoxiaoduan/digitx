# 0007. Upgrade to Vite 8 (Rolldown & Oxc Bundler Engine)

* Status: accepted
* Date: 2026-07-27

## Context and Problem Statement

Vite 8 introduces next-generation frontend tooling powered by Rust-native Rolldown (bundler) and Oxc (transformer), offering faster HMR, smaller install footprints, and optimized production builds.

## Decision Drivers

* Build and dev-server performance for `@digitx/web`.
* Synchronized adoption of `@vitejs/plugin-react@6` without Babel overhead.
* Alignment with modern browser targets (`ES2022`).

## Considered Options

1. Stay on Vite 5.4.x
2. Upgrade to Vite 8.0.x and `@vitejs/plugin-react@6` (Chosen)
3. Upgrade Vite without updating React plugin

## Decision Outcome

Chosen option: **Upgrade to Vite 8.0.x and `@vitejs/plugin-react@6`**, because `@digitx/web` uses a clean standard Vite setup, allowing immediate performance gains from Rolldown and Oxc without legacy configuration debt.
