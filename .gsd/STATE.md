# STATE.md — Project Memory

## Current Position
- **Phase**: 5 — Dark/Light Mode Toggle
- **Task**: Planning complete, ready for execution
- **Status**: Plans 5.1 and 5.2 created

## Plans
- **5.1** (Wave 1): Dark mode CSS variables + ThemeProvider component
- **5.2** (Wave 2): Wire ThemeProvider into layout + toggle button in nav + deploy

## Key Decisions
- Stack: Next.js 15 + TypeScript + Tailwind v4
- Theme: CSS variables with `[data-theme="dark"]` selector
- Persistence: localStorage("theme")
- Toggle: SVG sun/moon icon next to Apps button in sticky nav
- Default: Light mode

## Known Context
- All components use CSS variables (--bg, --card, --border, --text, --text-2, --text-3, --green)
- page.tsx has ~72 references to CSS variables — all will auto-switch
- Sticky nav already has Apps button — toggle goes next to it
- Deploy target: Vercel (bagsscan.vercel.app)
