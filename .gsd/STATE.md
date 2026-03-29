# STATE.md — Project Memory

## Current Position
- **Phase**: Not started
- **Last Action**: Project initialized
- **Next Step**: /plan 1

## Key Decisions
- Stack: Next.js 15 + TypeScript + Tailwind v4
- Data: All from Bags API (no backend DB)
- Auth: None (public dashboard)
- Deploy target: Vercel

## Known Context
- Bags API base: https://public-api-v2.bags.fm/api/v1/
- API key stored in .env.local
- Partner config: DceKxtaxVHxiKE4B8CeHNFHe4ms5p3VmuLAUbLAcbSaB
- Existing files: bags-api.ts (client), risk-engine.ts (scoring), globals.css
- Rate limit: 1000 req/hr per IP
