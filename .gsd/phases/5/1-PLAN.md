---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Dark Mode CSS Variables + Theme Provider

## Objective
Add dark mode color tokens to globals.css and create a ThemeProvider component that toggles `data-theme="dark"` on `<html>`, persists choice to localStorage, defaults to light.

## Context
- src/app/globals.css — current `:root` has light-only variables
- src/app/layout.tsx — server component, needs client ThemeProvider child

## Tasks

<task type="auto" effort="small">
  <name>Add dark mode CSS variables to globals.css</name>
  <files>src/app/globals.css</files>
  <action>
    Add `[data-theme="dark"]` selector block with dark mode values:
    - --green: #00D62B (same)
    - --green-hover: #00C025 (same)
    - --green-10: rgba(0, 214, 43, 0.12)
    - --bg: #0D0D0F
    - --card: #1A1A1E
    - --card-hover: #222226
    - --border: #2A2A2E
    - --border-light: #333338
    - --text: #E8E8EA
    - --text-2: #8E8E93
    - --text-3: #5A5A5E
    - --error: #FF4444

    AVOID: changing existing :root values
    USE: [data-theme="dark"] selector so it overrides :root when active
  </action>
  <verify>grep "data-theme" src/app/globals.css</verify>
  <done>Dark mode variables defined, light mode untouched</done>
</task>

<task type="auto" effort="small">
  <name>Create ThemeProvider client component</name>
  <files>src/app/ThemeProvider.tsx</files>
  <action>
    Create "use client" component that:
    1. On mount, reads localStorage("theme") — default "light"
    2. Sets document.documentElement.setAttribute("data-theme", theme)
    3. Exports a useTheme() hook or passes toggle function via context
    4. Provides { theme, toggleTheme } to children
    5. toggleTheme: flips between "light"/"dark", saves to localStorage, updates attribute

    Use React.createContext + useContext pattern.
    Wrap children in the context provider.
    Handle SSR: use useEffect for DOM access, not during render.
  </action>
  <verify>Build succeeds: npx next build</verify>
  <done>ThemeProvider component exists, exports useTheme hook</done>
</task>

## Success Criteria
- [ ] globals.css has both :root (light) and [data-theme="dark"] variables
- [ ] ThemeProvider reads/writes localStorage
- [ ] ThemeProvider sets data-theme attribute on html
- [ ] Build passes
