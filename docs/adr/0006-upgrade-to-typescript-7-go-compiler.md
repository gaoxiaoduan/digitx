# 0006. Upgrade to TypeScript 7.0 (Go Native Compiler)

* Status: accepted
* Date: 2026-07-27

## Context and Problem Statement

TypeScript 7.0 introduces a major architectural evolution: a native compiler re-written in Go, providing 8x–12x faster build and type-checking performance, reduced memory footprint, and native multithreading.

## Decision Drivers

* Build and typecheck speed across the monorepo packages (`@digitx/core`, `@digitx/web`, `@digitx/api`, `@digitx/scanner`).
* Compatibility with existing bundlers and tools (`tsup`, `tsx`, `vite`, `wrangler`).
* Minimizing migration risks by preserving existing target versions (`ES2020` / `ES2022`).

## Considered Options

1. Stay on TypeScript 5.4.x / 5.8.x
2. Upgrade to TypeScript 7.0 (Go Native Compiler) across all monorepo packages (Chosen)
3. Hybrid approach with compiler API fallback aliases

## Decision Outcome

Chosen option: **Upgrade to TypeScript 7.0 across all monorepo packages**, because the clean TypeScript setup in DIGITX requires no complex legacy compiler plugins, enabling maximum performance gains for `tsc --noEmit` and build pipelines while preserving existing target configurations.
