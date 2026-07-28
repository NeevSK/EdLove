# Technical Implementation Guide
## Astro-Specific Build Instructions

**Version:** 1.0  
**For:** NeevSK Digital Home  
**Framework:** Astro 4.x+

---

## 🚀 Project Setup

### Initialize Astro Project

```bash
npm create astro@latest neevsk-site

# Choose options:
# - Empty template
# - TypeScript: Yes (strict)
# - Install dependencies: Yes
# - Git repository: Yes
```

### Install Dependencies

```bash
cd neevsk-site
npm install

# Additional packages
npm install @astrojs/react
npm install gsap
npm install intersection-observer
npm install --save-dev sass
```

### Configure Astro

**astro.config.mjs:**
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static', // or 'hybrid' if needed
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "/src/styles/_variables.scss";`
        }
      }
    }
  }
});
```

---

## 📁 Project Structure

```
neevsk-site/
├── public/
│   ├── fonts/
│   ├── images/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   └── Navigation.astro
│   │   ├── sections/
│   │   │   ├── HeroHome.astro
│   │   │   ├── FiveDoors.astro
│   │   │   └── ...
│   │   └── theme-specific/
│   │       ├── nature/
│   │       ├── twilight/
│   │       ├── light-tech/
│   │       ├── warm-archive/
│   │       └── digital-neon/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── NatureLayout.astro
│   │   ├── TwilightLayout.astro
│   │   ├── LightTechLayout.astro
│   │   ├── WarmArchiveLayout.astro
│   │   └── DigitalNeonLayout.astro
│   ├── pages/
│   │   ├── index.astro (Home)
│   │   ├── personal/
│   │   │   ├── index.astro
│   │   │   └── hall-of-flame.astro
│   │   ├── intellectual/
│   │   ├── professional/
│   │   ├── library/
│   │   └── connect/
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── global.scss
│   │   └── themes/
│   │       ├── nature.scss
│   │       ├── twilight.scss
│   │       ├── light-tech.scss
│   │       ├── warm-archive.scss
│   │       └── digital-neon.scss
│   ├── scripts/
│   │   ├── theme-switcher.ts
│   │   ├── animations.ts
│   │   └── utils.ts
│   └── data/
│       ├── projects.json
│       ├── books.json
│       └── hall-of-flame.json
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🎨 Theme System Implementation

### CSS Custom Properties (Variables)

**src/styles/_variables.scss:**
```scss
// Base variables
$spacing-unit: 8px;
$transition-speed: 0.3s;

// Breakpoints
$mobile: 640px;
$tablet: 1024px;
$desktop: 1280px;

// Z-index scale
$z-nav: 100;
$z-modal: 200;
$z-notification: 300;
```

### Theme-Specific Variables

**src/styles/themes/nature.scss:**
```scss
[data-theme="nature"] {
  // Colors
  --color-primary: #4A9B9B;
  --color-secondary: #5C7C5D;
  --color-accent: #F4A460;
  --color-background: #FAF8F3;
  --color-text: #2C2C2C;
  
  // Typography
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Literata', serif;
  --font-mono: 'Inconsolata', monospace;
  
  // Spacing
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  // Border radius
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  // Shadows
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  // Transitions
  --transition-speed: 0.3s;
  --ease: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Repeat for each theme (twilight, light-tech, warm-archive, digital-neon)**

### Theme Switcher Script

**src/scripts/theme-switcher.ts:**
```typescript
export class ThemeSwitcher {
  private currentTheme: string = 'home';
  
  constructor() {
    this.init();
  }
  
  init() {
    // Check for saved theme preference
    const saved = localStorage.getItem('theme-preference');
    if (saved) {
      this.setTheme(saved);
    }
    
    // Listen for section changes
    this.observeSections();
  }
  
  setTheme(themeName: string) {
    document.documentElement.setAttribute('data-theme', themeName);
    this.currentTheme = themeName;
    localStorage.setItem('theme-preference', themeName);
  }
  
  observeSections() {
    const sections = document.querySelectorAll('[data-theme-section]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const theme = entry.target.getAttribute('data-theme-section');
          if (theme) {
            this.setTheme(theme);
          }
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
  }
}

// Initialize on page load
if (typeof window !== 'undefined') {
  new ThemeSwitcher();
}
```

---

## 🧩 Component Examples

### Base Layout

**src/layouts/BaseLayout.astro:**
```astro
---
export interface Props {
  title: string;
  description?: string;
  theme?: string;
}

const { title, description, theme = 'home' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en" data-theme={theme}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Neev SK</title>
    {description && <meta name="description" content={description} />}
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    
    <!-- Global styles -->
    <link rel="stylesheet" href="/styles/global.css" />
    
    <!-- Theme styles -->
    <link rel="stylesheet" href={`/styles/themes/${theme}.css`} />
  </head>
  <body>
    <Navigation />
    
    <main>
      <slot />
    </main>
    
    <Footer />
    
    <script src="/scripts/theme-switcher.js"></script>
    <script src="/scripts/animations.js"></script>
  </body>
</html>

<style is:global>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: var(--font-body);
    color: var(--color-text);
    background: var(--color-background);
    line-height: 1.6;
  }
</style>
```

### Theme-Specific Layout

**src/layouts/NatureLayout.astro:**
```astro
---
import BaseLayout from './BaseLayout.astro';

export interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<BaseLayout title={title} description={description} theme="nature">
  <div class="nature-container" data-theme-section="nature">
    <slot />
  </div>
</BaseLayout>

<style>
  .nature-container {
    /* Nature-specific container styles */
    position: relative;
    min-height: 100vh;
  }
  
  /* Organic background elements */
  .nature-container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at top right,
      rgba(74, 155, 155, 0.05) 0%,
      transparent 50%
    );
    pointer-events: none;
    z-index: -1;
  }
</style>
```

### Button Component

**src/components/common/Button.astro:**
```astro
---
export interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  href?: string;
  class?: string;
  [key: string]: any;
}

const { variant = 'primary', href, class: className, ...rest } = Astro.props;
const Tag = href ? 'a' : 'button';
---

<Tag
  class:list={['btn', `btn-${variant}`, className]}
  href={href}
  {...rest}
>
  <span class="btn-content">
    <slot />
  </span>
</Tag>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: var(--border-radius);
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all var(--transition-speed) var(--ease);
    text-decoration: none;
    border: none;
    background: none;
  }
  
  .btn-primary {
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-secondary) 100%
    );
    color: var(--color-background);
    box-shadow: var(--shadow-sm);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .btn-secondary {
    background: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
  }
  
  .btn-secondary:hover {
    background: var(--color-primary);
    color: var(--color-background);
  }
  
  .btn-ghost {
    background: transparent;
    color: var(--color-primary);
  }
  
  .btn-ghost:hover {
    background: rgba(var(--color-primary-rgb), 0.1);
  }
</style>
```

### Card Component

**src/components/common/Card.astro:**
```astro
---
export interface Props {
  variant?: 'default' | 'feature' | 'minimal';
  class?: string;
}

const { variant = 'default', class: className } = Astro.props;
---

<article class:list={['card', `card-${variant}`, className]}>
  <slot />
</article>

<style>
  .card {
    background: var(--color-background);
    border: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
    border-radius: var(--border-radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-speed) var(--ease);
  }
  
  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  
  .card-feature {
    padding: 32px;
    background: linear-gradient(
      135deg,
      var(--color-background) 0%,
      var(--color-background-secondary) 100%
    );
  }
  
  .card-minimal {
    border: none;
    box-shadow: none;
    padding: 16px;
  }
</style>
```

---

## 📄 Page Implementation

### Home Page

**src/pages/index.astro:**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroHome from '../components/sections/HeroHome.astro';
import FiveDoors from '../components/sections/FiveDoors.astro';
import CurrentFocus from '../components/sections/CurrentFocus.astro';
---

<BaseLayout 
  title="Neev SK - Existential Cyberneticist" 
  description="Building the soul behind the machines"
  theme="home"
>
  <HeroHome />
  <FiveDoors />
  <CurrentFocus />
</BaseLayout>
```

### Personal Section Page

**src/pages/personal/index.astro:**
```astro
---
import NatureLayout from '../../layouts/NatureLayout.astro';
import PersonalIntro from '../../components/sections/PersonalIntro.astro';
---

<NatureLayout title="Personal" description="Soul, heart, and lineage">
  <PersonalIntro />
  
  <section class="navigation-cards">
    <a href="/personal/hall-of-flame" class="section-card">
      <h2>🔥 Hall of Flame</h2>
      <p>Where legacy is love</p>
    </a>
    
    <a href="/personal/journey" class="section-card">
      <h2>🌱 Journey</h2>
      <p>The path of becoming</p>
    </a>
  </section>
</NatureLayout>
```

---

## 🎭 Animation Integration

### Using GSAP

**src/scripts/animations.ts:**
```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Page entrance
  gsap.from('.hero > *', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out'
  });
  
  // Scroll-triggered animations
  gsap.utils.toArray('.fade-in-scroll').forEach((element: any) => {
    gsap.from(element, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

// Initialize on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAnimations);
}
```

---

## 🔧 Build & Deployment

### Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for build issues
npm run astro check
```

### Environment Variables

**.env:**
```
PUBLIC_SITE_URL=https://neevsk.edlove.org
CONTACT_FORM_API=your-api-endpoint
```

### Deployment (Example: Vercel)

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy

---

## 📊 Performance Optimization

### Image Optimization

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/image.jpg';
---

<Image 
  src={myImage}
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  quality={80}
/>
```

### Code Splitting

Astro automatically code-splits by page. For component-level splitting:

```astro
---
// Load heavy components only when needed
const HeavyComponent = await import('../components/HeavyComponent.astro');
---
```

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin />
```

---

## ♿ Accessibility Implementation

### Focus Management

```typescript
// Trap focus in modals
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}
```

### Skip Links

```astro
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  }
  
  .skip-link:focus {
    top: 0;
  }
</style>
```

---

## 🧪 Testing

### Component Testing

```bash
npm install --save-dev @playwright/test
```

**tests/button.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test('button renders correctly', async ({ page }) => {
  await page.goto('/');
  const button = await page.locator('.btn-primary');
  await expect(button).toBeVisible();
});

test('button hover state works', async ({ page }) => {
  await page.goto('/');
  const button = await page.locator('.btn-primary');
  await button.hover();
  // Assert hover styles applied
});
```

---

## 📝 Development Checklist

- [ ] Astro project initialized
- [ ] Dependencies installed
- [ ] File structure created
- [ ] Theme system implemented
- [ ] All five themes styled
- [ ] Components created
- [ ] Layouts built
- [ ] Pages implemented
- [ ] Navigation working
- [ ] Animations added
- [ ] Responsive design tested
- [ ] Accessibility checked
- [ ] Performance optimized
- [ ] SEO metadata added
- [ ] Cross-browser tested
- [ ] Build successful
- [ ] Deployed

---

*This is your technical foundation. Build with precision, care, and love.*
