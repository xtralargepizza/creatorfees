# DECISIONS.md — Architecture Decision Records

## ADR-001: View-Only Dashboard (No Wallet Connection)
**Decision**: No wallet connection or trading. View-only analytics.
**Rationale**: Fastest path to ship. Reduces security surface. Focus on analytics value.

## ADR-002: No Backend Database
**Decision**: All data fetched directly from Bags API. No persistence layer.
**Rationale**: Eliminates infra complexity. Bags API is the source of truth. Simplifies deployment.

## ADR-003: Next.js App Router + Server Components
**Decision**: Use Next.js app router with server components for API calls.
**Rationale**: API key stays server-side. No CORS issues. Built-in caching.
