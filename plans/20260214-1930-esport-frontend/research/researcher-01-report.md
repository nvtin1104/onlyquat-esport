# Research Report 01: Next.js 14 App Router + i18n + Framer Motion

## 1. Next.js 14 App Router + next-intl

### Recommended Setup
- Use `next-intl` v3+ — best App Router support, server component compatible
- Middleware-based locale detection + `[locale]` dynamic segment

```
src/
├── middleware.ts          # locale detection/redirect
├── i18n/
│   ├── request.ts         # getRequestConfig
│   └── routing.ts         # defineRouting
├── messages/
│   ├── en.json
│   └── vi.json
├── app/
│   └── [locale]/
│       ├── layout.tsx     # NextIntlClientProvider
│       └── page.tsx
```

### Key Config
- `middleware.ts`: Use `createMiddleware` from `next-intl/middleware`
- `i18n/routing.ts`: Define locales `['en', 'vi']`, defaultLocale `'vi'`
- Server components: `useTranslations()` works directly
- Client components: Wrap with `NextIntlClientProvider`, pass `messages` from layout

### Pitfalls
- Don't import `useTranslations` in server components from client path
- Always wrap client components needing translations in provider
- Locale param must be validated in layout to avoid 404s

### Dependencies
- `next-intl@^3.22` (latest stable)

## 2. Framer Motion + Next.js 14

### Approach
- Framer Motion requires `"use client"` — cannot use in server components
- Create thin client wrapper components for animations
- Use `<AnimatePresence>` in layout for page transitions

### Pattern
```tsx
// components/motion/MotionDiv.tsx
"use client";
import { motion } from "framer-motion";
export const MotionDiv = motion.div;
```

### Page Transitions
- Wrap `{children}` in layout with `<AnimatePresence mode="wait">`
- Each page exports a client wrapper with entry/exit variants
- Keep animation components minimal — heavy logic stays in server components

### Performance Tips
- Use `layout` animations sparingly (triggers reflow)
- Prefer `opacity` + `transform` (GPU composited)
- Use `whileInView` for scroll-triggered animations
- Set `viewport={{ once: true }}` to animate only on first view

### Dependencies
- `framer-motion@^11` (latest, React 18+ support)

## 3. Project Bootstrapping

### Create Next App
```bash
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Key Dependencies
```json
{
  "next": "^14.2",
  "react": "^18.3",
  "tailwindcss": "^3.4",
  "framer-motion": "^11",
  "next-intl": "^3.22",
  "lucide-react": "^0.460",
  "@next/font": "latest"
}
```

### TailwindCSS Config
- Extend with custom colors (eSport palette)
- Add custom `fontFamily` for Rajdhani, Inter, JetBrains Mono
- Custom `screens` for `xs: 475px` breakpoint
- Add glassmorphism utilities via plugin or custom classes

### Folder Structure (recommended for this project)
```
web/src/
├── app/[locale]/           # i18n routes
├── components/
│   ├── layout/             # Header, Footer, Nav
│   ├── home/               # Homepage sections
│   ├── ui/                 # Reusable primitives
│   └── shared/             # Domain-specific shared
├── lib/
│   ├── mock-data/          # Mock data files
│   └── utils.ts
├── i18n/                   # next-intl config
├── messages/               # JSON translations
└── types/                  # TypeScript interfaces
```

## Unresolved Questions
- TailwindCSS v4 (released 2025) uses CSS-first config — prompt specifies v3.4+ so sticking with v3.4
- next-intl v4 may be available — v3 is more battle-tested, recommend v3
