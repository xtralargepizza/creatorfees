---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Wire ThemeProvider + Toggle Button in Nav

## Objective
Integrate ThemeProvider into layout, add toggle button next to Apps in the sticky nav and hero.

## Context
- src/app/layout.tsx — needs ThemeProvider wrapping children
- src/app/page.tsx — sticky nav has Apps button, toggle goes next to it
- src/app/ThemeProvider.tsx — created in Plan 5.1

## Tasks

<task type="auto" effort="small">
  <name>Wrap layout children with ThemeProvider</name>
  <files>src/app/layout.tsx</files>
  <action>
    Import ThemeProvider from ./ThemeProvider.
    Wrap the body contents (VideoBg + main + footer) with ThemeProvider.
    ThemeProvider is "use client" so it can be a child of the server layout.
  </action>
  <verify>Build succeeds: npx next build</verify>
  <done>ThemeProvider wraps all body content</done>
</task>

<task type="auto" effort="small">
  <name>Add theme toggle button to page.tsx sticky nav + hero</name>
  <files>src/app/page.tsx</files>
  <action>
    Import useTheme from ./ThemeProvider.

    In the sticky nav (hasResults section), add a toggle button NEXT TO the Apps button:
    - Show sun icon when dark, moon icon when light
    - Use simple SVG icons (no external deps)
    - Style: same dimensions as the Apps button (h-10, px-3)
    - On click: call toggleTheme()

    The button should be clean, minimal — just an icon, no text.

    AVOID: adding the toggle to the hero section (keep hero clean)
    USE: consistent styling with the Apps button (border, bg, hover states)
  </action>
  <verify>Build succeeds: npx next build</verify>
  <done>Toggle button visible in sticky nav, switches theme on click</done>
</task>

<task type="auto" effort="small">
  <name>Deploy and verify both modes work</name>
  <files>(none — deployment task)</files>
  <action>
    1. git add -A && git commit
    2. npx vercel --yes --prod --name bagsscan
    3. Verify homepage loads in light mode
    4. Verify API still works: curl /api/feed
  </action>
  <verify>curl -s -o /dev/null -w "%{http_code}" https://bagsscan.vercel.app/</verify>
  <done>200 OK, deployed with theme toggle</done>
</task>

## Success Criteria
- [ ] Toggle button visible next to Apps button in sticky nav
- [ ] Clicking toggle switches between light and dark
- [ ] Preference persists across page reloads (localStorage)
- [ ] All cards, text, backgrounds, borders adapt to dark mode
- [ ] Deployed and live
