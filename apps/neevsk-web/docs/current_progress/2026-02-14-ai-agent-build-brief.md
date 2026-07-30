# AI Agent Build Brief: NeevSK Digital Home
## Visually Superior, Premium, Alive, Soothing, Chill

**For:** Claude Code / AI Development Agents  
**Goal:** Build a living, breathing website that feels premium and human  
**Current State:** Plain color pages that need transformation

---

## 🎯 THE MISSION

Transform neevsk.edlove.org from plain pages into a **visually premium, alive, soothing, chill** digital home.

**Core Vibe:** Chill, Alive, Cool, Soothing, Gen Z + Wise

**What this means:**
- **Chill** = Effortless confidence, not trying too hard, generous spacing
- **Alive** = Subtle animations, responsive interactions, breathing elements
- **Cool** = Modern aesthetic, clean typography, tasteful colors
- **Soothing** = Soft colors, smooth transitions, no harsh contrasts
- **Wise** = Depth present but not overwhelming, thoughtful design

---

## 🎨 VISUAL FOUNDATION

### Typography

**Primary Font (Headings):**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Secondary Font (Body):**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
/* OR for warmer feel: */
font-family: 'Literata', Georgia, serif;
```

**Type Scale:**
- Hero/H1: 3.5-4rem (56-64px) desktop / 2.5rem (40px) mobile, weight 700
- H2: 2.5rem (40px) desktop / 2rem (32px) mobile, weight 600
- H3: 1.5rem (24px), weight 500
- Body: 1rem-1.125rem (16-18px), weight 400, line-height 1.6-1.8

### Color Palette (Neutral Base with Warmth)

**Background:**
```css
--bg-primary: #FAFAFA;      /* Warm white */
--bg-secondary: #F5F5F5;    /* Light gray */
--bg-elevated: #FFFFFF;     /* Pure white for cards */
```

**Text:**
```css
--text-primary: #2C2C2C;    /* Warm charcoal */
--text-secondary: #5C5C5C;  /* Soft slate */
--text-tertiary: #8B8B8B;   /* Light gray */
```

**Accents (Vivid & Bright):**
```css
--accent-teal:    #00D9D9;   /* Electric bright teal - calm, alive */
--accent-coral:   #FF3366;   /* Vibrant hot coral - energy */
--accent-purple:  #D946EF;   /* Bright magenta - wisdom */
--accent-gold:    #FFB800;   /* Bright golden yellow - warmth */
--accent-emerald: #00FF88;   /* Neon bright green - growth */
--accent-sky:     #00CCFF;   /* Bright cyan - clarity */
```

### Spacing System (8px base)

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
```

**Use generously.** Premium feels spacious.

### Shadows (Soft, Subtle)

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
```

Never use harsh shadows. Everything should feel lifted gently, not dropped.

---

## ✨ MAKING IT ALIVE

### Essential Animations

**Page Load:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply to sections with stagger */
section {
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: calc(var(--index) * 0.15s);
}
```

**Hover States (ALL interactive elements):**
```css
.interactive-element {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

**Smooth Scrolling:**
```css
html {
  scroll-behavior: smooth;
}
```

**Breathing Effect (Optional, for background elements):**
```css
@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
}

.background-element {
  animation: breathe 8s ease-in-out infinite;
}
```

---

## 🧩 KEY COMPONENTS

### Navigation

**Requirements:**
- Sticky at top
- Backdrop blur + transparency
- Smooth transitions
- Clear active states
- Mobile hamburger menu

```css
.site-nav {
  position: sticky;
  top: 0;
  background: rgba(250, 250, 250, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 100;
  transition: all 0.3s ease;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: rgba(74, 155, 155, 0.1);
  color: #4A9B9B;
}
```

### Buttons

**Primary:**
```css
.btn-primary {
  background: linear-gradient(135deg, #4A9B9B 0%, #5C7C5D 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(74, 155, 155, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 155, 155, 0.3);
}
```

**Secondary:**
```css
.btn-secondary {
  background: transparent;
  color: #4A9B9B;
  border: 2px solid #4A9B9B;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #4A9B9B;
  color: white;
}
```

### Cards

```css
.card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(74, 155, 155, 0.3);
}
```

---

## 📐 LAYOUT PRINCIPLES

### Maximum Width & Centering

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* For text content, narrower for readability */
.text-content {
  max-width: 65ch; /* ~65 characters per line */
  margin: 0 auto;
}
```

### Vertical Rhythm

```css
section {
  padding: 96px 24px;
}

/* Mobile */
@media (max-width: 640px) {
  section {
    padding: 64px 16px;
  }
}
```

### Grid Layouts

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}
```

---

## 🎭 SPECIFIC PAGE REQUIREMENTS

### Home Page

**Structure:**
1. Hero section with name + tagline
2. Brief intro (2-3 sentences)
3. Navigation to main sections (cards or links)

**Visual Treatment:**
- Large, confident typography for name
- Generous whitespace
- Subtle background gradient or pattern (very light, <5% opacity)
- Gentle fade-in animation on load

### Section Pages

**Each page should have:**
1. Clear hierarchy (H1 → H2 → Body)
2. Breathing room between sections
3. Consistent card treatment for content blocks
4. Smooth transitions between sections

---

## 🚫 WHAT TO AVOID

**DON'T:**
- Use harsh, saturated colors
- Create busy, cluttered layouts
- Use jarring animations (no flashing, spinning, bouncing)
- Ignore mobile responsiveness
- Use tiny fonts (minimum 16px body)
- Create low contrast (WCAG AA minimum)
- Make everything bold/uppercase (use sparingly)
- Forget hover states
- Use more than 3-4 font weights
- Create layouts that jump on load

**DO:**
- Use soft, muted colors
- Create spacious, breathable layouts
- Use smooth, purposeful animations
- Design mobile-first
- Use readable font sizes
- Ensure good contrast
- Use hierarchy through size/weight, not decoration
- Make everything interactive feel responsive
- Limit font variations
- Prevent layout shift with proper spacing

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Single column, larger touch targets */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 2-column where appropriate */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full layout */
}
```

### Mobile Specifics

- Touch targets minimum 44x44px
- Hamburger menu for navigation
- Stack all grids to single column
- Reduce spacing by ~30%
- Larger fonts for readability
- Simplify animations

---

## ✨ PREMIUM TOUCHES

### Micro-Interactions

**Link Underlines:**
```css
a {
  position: relative;
  text-decoration: none;
  color: #4A9B9B;
}

a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #4A9B9B;
  transition: width 0.3s ease;
}

a:hover::after {
  width: 100%;
}
```

**Focus States:**
```css
:focus-visible {
  outline: 2px solid #4A9B9B;
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Loading States:**
```css
.loading {
  position: relative;
  pointer-events: none;
  opacity: 0.6;
}

.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #4A9B9B;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

- [ ] Set up clean, semantic HTML5 structure
- [ ] Implement typography system (Inter font loaded)
- [ ] Set up CSS custom properties for colors/spacing
- [ ] Create navigation (sticky, blur, responsive)
- [ ] Build component library (buttons, cards, forms)
- [ ] Add smooth animations (fade-in, hover states)
- [ ] Ensure responsive design (mobile, tablet, desktop)
- [ ] Test all interactive elements
- [ ] Verify accessibility (WCAG AA contrast, focus states)
- [ ] Optimize performance (lazy load images, minify CSS)
- [ ] Add subtle background patterns/gradients
- [ ] Polish micro-interactions
- [ ] Test across browsers

---

## 💡 CURRENT SITE ISSUES TO FIX

**Based on "plain color pages" description:**

1. **Add depth through shadows** - Cards should lift, not sit flat
2. **Implement spacing system** - Everything needs room to breathe
3. **Add animations** - Page loads, hovers, transitions
4. **Improve typography** - Hierarchy, sizing, line-height
5. **Create visual interest** - Subtle gradients, patterns (very light)
6. **Polish interactions** - Every hover should feel smooth
7. **Add navigation** - Sticky, blurred, responsive
8. **Responsive design** - If not already mobile-optimized
9. **Color refinement** - Move from flat colors to subtle variations
10. **Component consistency** - All buttons/cards should match

---

## 🚀 QUICK START STEPS

1. **Load Inter font** from Google Fonts
2. **Set CSS custom properties** (colors, spacing, shadows)
3. **Apply base styles** (typography, smooth scrolling)
4. **Build navigation** with blur and sticky
5. **Create component styles** (buttons, cards)
6. **Add animations** to all sections
7. **Test responsiveness** on mobile
8. **Polish details** (shadows, hovers, spacing)

---

## 📖 REFERENCE AESTHETIC

Think:
- **Apple.com** - Clean, spacious, premium
- **Linear.app** - Smooth animations, modern
- **Notion.so** - Calm colors, good hierarchy
- **Stripe.com** - Confident, clear, polished

**But simpler.** Not corporate. More human. More breathing.

---

## 🎨 EXAMPLE CODE SNIPPET (Complete Section)

```html
<section class="hero">
  <div class="container">
    <h1 class="hero-title">Neev SK</h1>
    <p class="hero-subtitle">Existential Cyberneticist</p>
    <p class="hero-intro">
      Building the soul behind the machines. Creating education 
      transformation ecosystems through systems thinking and 
      human-centered design.
    </p>
  </div>
</section>

<style>
.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
  background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
  position: relative;
}

/* Subtle pattern overlay */
.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(74, 155, 155, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 155, 155, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
  pointer-events: none;
}

.container {
  max-width: 800px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2C2C2C;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 500;
  color: #5C5C5C;
  margin-bottom: 32px;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.hero-intro {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #2C2C2C;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
}
</style>
```

---

**BUILD THIS. Make it premium. Make it alive. Make it soothing.**

*The plain pages need depth, space, and breath. Give them life.*
