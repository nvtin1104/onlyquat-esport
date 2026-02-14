# Phase 01: Core Infrastructure

**Parent:** [plan.md](./plan.md)
**Dependencies:** None
**Priority:** Critical — must complete before Phase 02

## Overview

- **Date:** 2026-02-15
- **Description:** Set up CSS variables, update Tailwind config, create ThemeProvider, update layout
- **Implementation Status:** Pending
- **Review Status:** Pending

## Key Insights

- Current system: all colors hardcoded hex in tailwind.config.ts, dark-only
- Need CSS vars for runtime theme switching — Tailwind can reference `var()` but opacity modifiers (e.g. `bg-accent-blue/20`) require raw hex OR Tailwind's `rgb()` format
- **Solution:** Define CSS vars as raw RGB channels (e.g. `--accent-blue: 14 165 233`) so Tailwind can apply opacity: `rgb(var(--accent-blue) / 0.2)`
- For colors that don't need opacity modifiers, can use hex directly
- Default to dark to preserve current UX feel

## Requirements

1. CSS variables for all theme colors in globals.css
2. Tailwind config mapped to CSS variables
3. ThemeProvider with context, localStorage persistence, system pref detection
4. Anti-flash script in layout head
5. Layout updated to use ThemeProvider + dynamic data-theme

## Architecture

```
globals.css
  :root { /* light colors */ }
  [data-theme="dark"] { /* dark colors */ }

tailwind.config.ts
  colors: { bg: { primary: "rgb(var(--bg-primary) / <alpha-value>)" } }

ThemeProvider.tsx (client component)
  - ThemeContext with useTheme() hook
  - Reads localStorage on mount, falls back to "dark"
  - Sets data-theme on <html>
  - Exposes toggle function

layout.tsx
  - Wraps body content with ThemeProvider
  - Inline script in <head> to set data-theme before paint
  - Remove className="dark" from <html>
```

## Related Code Files

| File | Action |
|------|--------|
| `web/src/app/globals.css` | Rewrite — add CSS vars, update utilities |
| `web/tailwind.config.ts` | Rewrite — map colors to CSS vars |
| `web/src/components/layout/ThemeProvider.tsx` | Create new |
| `web/src/app/[locale]/layout.tsx` | Update — add ThemeProvider, remove "dark" class |

## Implementation Steps

### 1. globals.css — CSS Variables + Updated Utilities

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@layer base {
  :root {
    /* Backgrounds (RGB channels for opacity support) */
    --bg-primary: 255 255 255;
    --bg-secondary: 248 250 252;
    --bg-tertiary: 241 245 249;
    --bg-card: 255 255 255;

    /* Text */
    --text-primary: 15 23 42;
    --text-secondary: 71 85 105;
    --text-tertiary: 100 116 139;
    --text-muted: 148 163 184;

    /* Borders */
    --border: 226 232 240;
    --border-secondary: 203 213 225;

    /* Shadows */
    --shadow-color: 15 23 42;
  }

  [data-theme="dark"] {
    --bg-primary: 15 15 15;
    --bg-secondary: 26 26 26;
    --bg-tertiary: 38 38 38;
    --bg-card: 30 30 30;

    --text-primary: 248 250 252;
    --text-secondary: 203 213 225;
    --text-tertiary: 148 163 184;
    --text-muted: 100 116 139;

    --border: 51 65 85;
    --border-secondary: 30 41 59;

    --shadow-color: 0 0 0;
  }
}

/* Accent colors (static — same in both themes) */
/* These stay in tailwind.config as plain hex since they don't change per theme */
```

### 2. tailwind.config.ts — Color Mapping

Key pattern: `"rgb(var(--bg-primary) / <alpha-value>)"` — Tailwind replaces `<alpha-value>` with the opacity when you use `/20` etc.

```ts
colors: {
  bg: {
    primary: "rgb(var(--bg-primary) / <alpha-value>)",
    secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
    tertiary: "rgb(var(--bg-tertiary) / <alpha-value>)",
    card: "rgb(var(--bg-card) / <alpha-value>)",
  },
  "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
  "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
  "text-tertiary": "rgb(var(--text-tertiary) / <alpha-value>)",
  "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
  border: {
    DEFAULT: "rgb(var(--border) / <alpha-value>)",
    secondary: "rgb(var(--border-secondary) / <alpha-value>)",
  },
  accent: {
    blue: "#0EA5E9",
    "blue-hover": "#0284C7",
    "blue-light": "#38BDF8",
    "blue-dark": "#0369A1",
    purple: "#9333ea",
    red: "#EF4444",
    gold: "#FFD700",
  },
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
}
```

Also update keyframes: replace `#00d4ff` → `#0EA5E9`.

### 3. ThemeProvider.tsx

```tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 4. layout.tsx Updates

- Remove `className="dark"` from `<html>`
- Add `data-theme="dark"` as default on `<html>` (prevents flash)
- Add inline `<script>` to read localStorage before paint
- Wrap content with `<ThemeProvider>`
- Update body classes: `bg-bg` → `bg-bg-primary`, keep `text-text-primary font-body`

## Updated Utilities (globals.css)

```css
html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', sans-serif;
}

/* Glass utility — theme aware, reduced effect */
.glass {
  @apply bg-bg-card/80 border border-border rounded-xl;
}

/* Neon text — updated to blue accent */
.neon-blue {
  text-shadow: 0 0 10px #0EA5E9, 0 0 20px #0EA5E9;
}
```

## Todo

- [ ] Rewrite globals.css with CSS variables
- [ ] Rewrite tailwind.config.ts with var() color mapping
- [ ] Create ThemeProvider.tsx
- [ ] Update layout.tsx with ThemeProvider + anti-flash script
- [ ] Verify build compiles with no errors

## Success Criteria

- `npm run build` passes
- Both `data-theme="light"` and `data-theme="dark"` render correctly
- Theme persists across page reloads via localStorage
- No flash of wrong theme on load
- All Tailwind opacity modifiers (`/20`, `/50`, etc.) still work

## Risk Assessment

- **Medium:** Tailwind RGB var pattern `rgb(var(--x) / <alpha-value>)` — must ensure all vars use space-separated RGB, not hex
- **Low:** Some components may use hardcoded hex that bypass the variable system — caught in Phase 02

## Security Considerations

- localStorage is same-origin only — no XSS risk from theme storage
- Inline script is minimal, no user input involved
