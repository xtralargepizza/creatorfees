# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A real-time fee revenue dashboard for Bags.fm token creators. Paste a token mint address and instantly see lifetime fees earned, claim history, fee share configuration, and token status. Dark-themed, fast, and directly useful for any Bags token creator tracking their income. Submitting as a Bags Hackathon entry under the "Bags API" category.

## Goals
1. Real-time fee analytics — lifetime fees, claim stats, claim events timeline for any Bags token
2. Launch feed — live view of new Bags token launches with status and metadata
3. Token detail page — deep dive into any token (creators, fee config, pool data, claim history)
4. Clean dark UI — professional dashboard aesthetic matching Bags.fm brand
5. Hackathon submission — working product with real Bags API integration

## Non-Goals (Out of Scope)
- No wallet connection or on-chain transactions (view-only dashboard)
- No trading execution (not a DEX)
- No user accounts or auth
- No mobile app
- No custom backend database — all data from Bags API

## Users
Bags.fm token creators who earn 1% of every trade and need to:
- Track how much fee revenue their token has generated
- See claim history (who claimed, when, how much)
- Monitor their token's status (pre-grad, migrating, migrated)
- Compare fee performance across tokens they manage

## Constraints
- Bags API rate limit: 1,000 requests/hour per IP
- API key: bags_prod_* (stored in .env.local)
- Partner config key: DceKxtaxVHxiKE4B8CeHNFHe4ms5p3VmuLAUbLAcbSaB
- Must use Bags API (hackathon requirement)
- Next.js + TypeScript + Tailwind (already scaffolded)
- Ship fast — rolling hackathon applications

## Success Criteria
- [ ] Landing page with search bar (paste token mint → analytics)
- [ ] Launch feed page showing real-time Bags token launches
- [ ] Token detail page with lifetime fees, creators, claim stats, claim events
- [ ] All data sourced from Bags API (no mocks in production)
- [ ] Dark theme matching Bags.fm aesthetic
- [ ] Deployed and accessible via public URL
