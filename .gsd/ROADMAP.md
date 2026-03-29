# ROADMAP.md

> **Current Phase**: 5
> **Milestone**: v1.1 — Dark/Light Mode

## Must-Haves (from SPEC)
- [ ] Search by token mint → fee analytics
- [ ] Launch feed with live token data
- [ ] Token detail page (fees, creators, claims, status)
- [ ] Dark theme UI
- [ ] Bags API integration (real data, not mocks)

## Phases

### Phase 1: Foundation
**Status**: ⬜ Not Started
**Objective**: Working Next.js app with Bags API client, layout shell, and route structure
**Deliverable**: App runs locally, API client fetches real data, layout + nav in place

### Phase 2: Launch Feed
**Status**: ⬜ Not Started
**Objective**: Live feed of Bags token launches with status, metadata, and quick-score
**Deliverable**: /feed page showing real-time launches from Bags API

### Phase 3: Token Analytics
**Status**: ⬜ Not Started
**Objective**: Deep token detail page — fees, creators, claim stats, claim events
**Deliverable**: /token/[mint] page with full analytics from Bags API

### Phase 4: Polish & Deploy
**Status**: ✅ Complete
**Objective**: Landing page, search, responsive design, deploy to Vercel
**Deliverable**: Public URL, polished UI, hackathon-ready

### Phase 5: Dark/Light Mode Toggle
**Status**: ⬜ Not Started
**Objective**: Add dark/light theme toggle next to Apps button in sticky nav. Persist preference in localStorage. Dark mode with proper color tokens for all components.
**Deliverable**: Working theme toggle, dark mode CSS variables, all pages render correctly in both modes
