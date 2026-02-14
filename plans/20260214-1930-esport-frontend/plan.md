# eSport Frontend Demo — Implementation Plan

**Date:** 2026-02-14
**Status:** In Progress
**Output Dir:** `plans/20260214-1930-esport-frontend/`

---

## Project Summary

Next.js 14 App Router frontend demo for an eSport platform. Mounts at `web/` in
project root alongside `serve/` (NestJS monorepo). Uses mock data (aligned to backend
schemas) until real API is ready. Dark glassmorphism + neon design, vi/en i18n,
Framer Motion animations.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18+, TypeScript |
| Styling | TailwindCSS 3.4+, custom eSport palette |
| Animation | Framer Motion 11 |
| i18n | next-intl v3 |
| Icons | Lucide React |
| Fonts | Rajdhani (headings), Inter (body), JetBrains Mono (scores) |
| Mock Data | Static TypeScript files |

---

## Phases

| # | Phase | Status | File |
|---|---|---|---|
| 01 | Project Setup & Config | pending | [phase-01-project-setup.md](./phase-01-project-setup.md) |
| 02 | Types, Mock Data & UI Primitives | pending | [phase-02-types-mock-data.md](./phase-02-types-mock-data.md) |
| 03 | Layout Components | pending | [phase-03-layout-components.md](./phase-03-layout-components.md) |
| 04 | Homepage Sections | pending | [phase-04-homepage-sections.md](./phase-04-homepage-sections.md) |
| 05 | Subpages | pending | [phase-05-subpages.md](./phase-05-subpages.md) |
| 06 | Polish & Optimization | pending | [phase-06-polish-optimization.md](./phase-06-polish-optimization.md) |

---

## Key Dependencies

- Phase 01 must complete before any other phase (bootstraps the project)
- Phase 02 must complete before 03/04/05 (types + components required everywhere)
- Phase 03 must complete before 04/05 (layout wraps all pages)
- Phases 04 and 05 can run in parallel after 03
- Phase 06 runs last (polish requires all content in place)

---

## Research

- [researcher-01-report.md](./research/researcher-01-report.md) — Next.js 14 + i18n + Framer Motion
- [researcher-02-report.md](./research/researcher-02-report.md) — eSport UI patterns + design + mock data
