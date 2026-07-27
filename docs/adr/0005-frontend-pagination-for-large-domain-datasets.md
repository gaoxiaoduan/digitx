# 0005. Frontend Pagination for Large Domain Datasets

* Status: accepted
* Date: 2026-07-27

## Context and Problem Statement

When rendering large numeric domain databases (> 10,000 domains), rendering all filtered domain rows simultaneously into the DOM caused severe layout reflow lag and browser tab freezing.

## Decision Drivers

* High DOM node counts degrade table rendering and interaction performance.
* Domain hunters require precise position tracking, explicit page totals, and stable visual UI.
* Virtual scrolling introduces scrollbar precision loss and visual flash/blanking during fast scrolling.

## Considered Options

1. Full unpaginated DOM rendering (Previous implementation)
2. Virtual scrolling (Windowing via `@tanstack/react-virtual`)
3. Frontend Pagination with `shadcn/ui` Pagination (Chosen)

## Decision Outcome

Chosen option: **Frontend Pagination with `shadcn/ui` Pagination**, because it caps DOM nodes per view to a fixed constant (25/50/100 rows), guarantees 0ms visual flickering, gives clear position feedback, and integrates seamlessly with our Vercel-style UI design.
