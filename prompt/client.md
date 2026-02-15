# High-Contrast Stealth Style Conversion Prompt

## 🎯 Objective
Transform existing local source code to implement a "High-Contrast Stealth" design system featuring dark, sophisticated aesthetics with strong visual hierarchy and maximum readability.

---

## 🎨 Design System Specifications

### Color Palette

#### Primary Colors
```
Background Layers:
- bg-primary:     #000000  (Pure black)
- bg-secondary:   #0a0a0a  (Near black)
- bg-tertiary:    #141414  (Dark gray)
- bg-elevated:    #1a1a1a  (Elevated surfaces)

Accent Colors:
- accent-primary:   #00d4ff  (Electric blue)
- accent-secondary: #0088ff  (Deep blue)
- accent-success:   #00ff88  (Neon green)
- accent-warning:   #ffaa00  (Amber)
- accent-error:     #ff3366  (Bright red)
- accent-info:      #8b5cf6  (Purple)

Text Colors:
- text-primary:     #ffffff  (Pure white)
- text-secondary:   #a0a0a0  (Light gray)
- text-tertiary:    #666666  (Medium gray)
- text-disabled:    #444444  (Dark gray)

Border & Divider Colors:
- border-subtle:    #222222
- border-default:   #333333
- border-emphasis:  #444444
- border-accent:    #00d4ff
```

#### Gradient Definitions
```
gradient-primary:   linear-gradient(135deg, #00d4ff 0%, #0088ff 100%)
gradient-success:   linear-gradient(135deg, #00ff88 0%, #00cc66 100%)
gradient-dark:      linear-gradient(180deg, #0a0a0a 0%, #000000 100%)
gradient-glow:      radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)
```

---

### Typography System

#### Font Families
```
Primary Font:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace Font:  'JetBrains Mono', 'Fira Code', 'Consolas', monospace
Display Font:    'Space Grotesk', 'Inter', sans-serif (for headings)
```

#### Font Scales
```
Headings:
- h1: 48px / 3rem    - font-weight: 700 - letter-spacing: -0.02em
- h2: 36px / 2.25rem - font-weight: 700 - letter-spacing: -0.01em
- h3: 28px / 1.75rem - font-weight: 600 - letter-spacing: 0
- h4: 24px / 1.5rem  - font-weight: 600 - letter-spacing: 0
- h5: 20px / 1.25rem - font-weight: 600 - letter-spacing: 0
- h6: 16px / 1rem    - font-weight: 600 - letter-spacing: 0.02em - text-transform: uppercase

Body Text:
- body-large:  18px / 1.125rem - font-weight: 400 - line-height: 1.6
- body-base:   16px / 1rem     - font-weight: 400 - line-height: 1.5
- body-small:  14px / 0.875rem - font-weight: 400 - line-height: 1.5
- caption:     12px / 0.75rem  - font-weight: 500 - line-height: 1.4
```

#### Contrast Requirements
- Minimum contrast ratio: **7:1** (WCAG AAA)
- Heading contrast: White (#ffffff) on black backgrounds
- Body text: Light gray (#a0a0a0) minimum
- Links: Electric blue (#00d4ff) with underline on hover

---

### UI Component Specifications

#### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #00d4ff 0%, #0088ff 100%);
color: #000000;
border: none;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
transition: all 0.3s ease;

&:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 212, 255, 0.5);
}

&:active {
  transform: translateY(0);
}
```

**Secondary Button:**
```css
background: transparent;
color: #00d4ff;
border: 2px solid #00d4ff;
border-radius: 8px;
padding: 10px 22px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
transition: all 0.3s ease;

&:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}
```

**Ghost Button:**
```css
background: transparent;
color: #ffffff;
border: 1px solid #333333;
border-radius: 8px;
padding: 10px 22px;
font-weight: 500;

&:hover {
  border-color: #00d4ff;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
}
```

#### Input Fields

```css
background: #0a0a0a;
color: #ffffff;
border: 2px solid #333333;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
transition: all 0.3s ease;

&:focus {
  outline: none;
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

&::placeholder {
  color: #666666;
}

&:disabled {
  background: #141414;
  color: #444444;
  cursor: not-allowed;
}
```

#### Cards

```css
background: #0a0a0a;
border: 1px solid #222222;
border-radius: 12px;
padding: 24px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
transition: all 0.3s ease;

&:hover {
  border-color: #333333;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(0, 212, 255, 0.1);
}

/* Card with accent */
&.accent {
  border-top: 3px solid #00d4ff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3),
              0 -3px 20px rgba(0, 212, 255, 0.2);
}
```

#### Modals / Dialogs

```css
background: #0a0a0a;
border: 1px solid #333333;
border-radius: 16px;
padding: 32px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(0, 212, 255, 0.1);
max-width: 600px;

/* Overlay */
&::backdrop {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
}
```

#### Navigation

```css
background: #000000;
border-bottom: 1px solid #222222;
padding: 16px 24px;
backdrop-filter: blur(10px);

/* Nav Links */
.nav-link {
  color: #a0a0a0;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffffff;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 6px;
  }
  
  &.active {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.15);
    border-radius: 6px;
  }
}
```

#### Tables

```css
background: #0a0a0a;
border: 1px solid #222222;
border-radius: 12px;
overflow: hidden;

thead {
  background: #000000;
  border-bottom: 2px solid #333333;
  
  th {
    color: #ffffff;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.05em;
    padding: 16px;
  }
}

tbody {
  tr {
    border-bottom: 1px solid #222222;
    transition: background 0.2s ease;
    
    &:hover {
      background: rgba(0, 212, 255, 0.05);
    }
    
    td {
      color: #a0a0a0;
      padding: 16px;
    }
  }
}
```

---

### Effects & Animations

#### Glow Effects
```css
--glow-primary: 0 0 20px rgba(0, 212, 255, 0.3);
--glow-secondary: 0 0 20px rgba(0, 255, 136, 0.3);
--glow-error: 0 0 20px rgba(255, 51, 102, 0.3);
--glow-intense: 0 0 40px rgba(0, 212, 255, 0.5);
```

#### Shadows
```css
--shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.5);
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.5);
--shadow-lg:  0 10px 25px rgba(0, 0, 0, 0.6);
--shadow-xl:  0 20px 50px rgba(0, 0, 0, 0.7);
```

#### Transitions
```css
--transition-fast:   all 0.15s ease;
--transition-base:   all 0.3s ease;
--transition-slow:   all 0.5s ease;
--transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### Animations
```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 🛠️ Implementation Steps

### Phase 1: Setup CSS Variables

Create a new file: `styles/theme/high-contrast-stealth.css`

```css
:root {
  /* Backgrounds */
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-tertiary: #141414;
  --bg-elevated: #1a1a1a;
  
  /* Accents */
  --accent-primary: #00d4ff;
  --accent-secondary: #0088ff;
  --accent-success: #00ff88;
  --accent-warning: #ffaa00;
  --accent-error: #ff3366;
  --accent-info: #8b5cf6;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-tertiary: #666666;
  --text-disabled: #444444;
  
  /* Borders */
  --border-subtle: #222222;
  --border-default: #333333;
  --border-emphasis: #444444;
  --border-accent: #00d4ff;
  
  /* Effects */
  --glow-primary: 0 0 20px rgba(0, 212, 255, 0.3);
  --glow-secondary: 0 0 20px rgba(0, 255, 136, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.6);
  
  /* Transitions */
  --transition-base: all 0.3s ease;
  --transition-fast: all 0.15s ease;
}
```

### Phase 2: Update Global Styles

```css
/* Base styles */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 12px;
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-emphasis);
  border-radius: 6px;
  border: 2px solid var(--bg-primary);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}

/* Selection */
::selection {
  background: var(--accent-primary);
  color: var(--bg-primary);
}
```

### Phase 3: Component Migration Checklist

- [ ] **Buttons**: Update all button variants (primary, secondary, ghost, icon)
- [ ] **Forms**: Convert inputs, textareas, selects, checkboxes, radios
- [ ] **Cards**: Update card backgrounds, borders, shadows
- [ ] **Navigation**: Update navbar, sidebar, breadcrumbs, tabs
- [ ] **Modals**: Convert dialogs, popovers, tooltips
- [ ] **Tables**: Update table styles, row hovers, sorting indicators
- [ ] **Alerts**: Update success, warning, error, info states
- [ ] **Badges**: Update status badges, labels, tags
- [ ] **Icons**: Ensure consistent stroke and fill colors
- [ ] **Loading States**: Update spinners, skeletons, progress bars
- [ ] **Charts**: Update chart colors to match palette
- [ ] **Code Blocks**: Update syntax highlighting

### Phase 4: Accessibility Testing

```markdown
Checklist:
- [ ] All text meets WCAG AAA contrast ratio (7:1)
- [ ] Focus indicators are highly visible (2px solid accent color)
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility verified
- [ ] Color is not the only means of conveying information
- [ ] Interactive elements have clear hover/focus states
- [ ] Error messages are clearly visible
- [ ] Skip to main content link available
```

### Phase 5: Performance Optimization

```markdown
- [ ] Remove unused CSS
- [ ] Minimize CSS file size
- [ ] Use CSS custom properties for theming
- [ ] Avoid expensive CSS selectors
- [ ] Optimize animations (use transform/opacity)
- [ ] Enable GPU acceleration where needed
- [ ] Test on low-end devices
```

---

## 📁 File Structure

```
src/
├── styles/
│   ├── theme/
│   │   ├── high-contrast-stealth.css    # Main theme file
│   │   ├── variables.css                # CSS variables
│   │   ├── animations.css               # Keyframe animations
│   │   └── utilities.css                # Utility classes
│   ├── components/
│   │   ├── buttons.css
│   │   ├── forms.css
│   │   ├── cards.css
│   │   ├── navigation.css
│   │   ├── modals.css
│   │   └── tables.css
│   └── global.css                       # Global resets and base styles
```

---

## 🎯 Quick Start Commands

### Find and Replace Color Values

```bash
# Replace old background colors
find ./src -type f \( -name "*.css" -o -name "*.scss" \) -exec sed -i 's/#ffffff/#000000/g' {} +
find ./src -type f \( -name "*.css" -o -name "*.scss" \) -exec sed -i 's/#f5f5f5/#0a0a0a/g' {} +

# Replace old accent colors
find ./src -type f \( -name "*.css" -o -name "*.scss" \) -exec sed -i 's/#007bff/#00d4ff/g' {} +
find ./src -type f \( -name "*.css" -o -name "*.scss" \) -exec sed -i 's/#28a745/#00ff88/g' {} +
```

### Convert RGB to Hex Script

```javascript
// convert-colors.js
const fs = require('fs');
const path = require('path');

const colorMap = {
  'rgb(255, 255, 255)': '#ffffff',
  'rgb(0, 123, 255)': '#00d4ff',
  // Add more mappings
};

function convertColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    content = content.replace(new RegExp(oldColor, 'g'), newColor);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}
```

---

## ✅ Testing Checklist

### Visual Testing
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test at different viewport sizes
- [ ] Verify all hover states work correctly
- [ ] Check focus indicators are visible
- [ ] Verify animations are smooth (60fps)

### Accessibility Testing
- [ ] Run axe DevTools audit
- [ ] Run Lighthouse accessibility audit
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Test keyboard-only navigation
- [ ] Verify color contrast ratios
- [ ] Check for flashing/motion sensitivity

### Cross-Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## 📚 Resources

### Design Inspiration
- Vercel Dashboard
- GitHub Dark Mode
- Stripe Dashboard
- Linear App
- Raycast

### Color Tools
- [Coolors.co](https://coolors.co) - Color palette generator
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ColorBox](https://colorbox.io) - Color scale generator

### Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)

---

## 🐛 Common Issues & Solutions

### Issue: Text is hard to read
**Solution**: Increase contrast ratio, use #ffffff for primary text

### Issue: Borders are too bright
**Solution**: Use subtle grays (#222222, #333333) instead of accent colors

### Issue: Glow effects are too intense
**Solution**: Reduce opacity to 0.3 or lower

### Issue: Animations feel sluggish
**Solution**: Reduce transition duration to 0.2-0.3s

### Issue: Colors look different on mobile
**Solution**: Test color profiles and ensure sRGB compatibility

---

## 📝 Notes

- Always test in dark environment for true experience
- Maintain consistency across all components
- Use CSS variables for easy theme switching
- Document any custom color variations
- Keep accessibility as top priority
- Get feedback from real users before finalizing

---

## 🚀 Deployment Checklist

- [ ] All components converted to new theme
- [ ] CSS variables implemented globally
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Performance metrics acceptable
- [ ] Documentation updated
- [ ] Team review completed
- [ ] Staging deployment successful
- [ ] User acceptance testing passed
- [ ] Production deployment ready

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-15  
**Maintained by:** Your Team