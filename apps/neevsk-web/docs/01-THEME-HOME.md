# Theme 01: Home / Threshold
## For HOME Page - "Our Everyday Hero"

**Primary Use:** Landing page, entry point, the threshold  
**Vibe Expression:** Alive through invitation, possibility, presence

---

## 🚪 Theme Philosophy

Home is not a sixth theme competing with the others. It's the **threshold** - the liminal space where all five themes exist in potential before any door is chosen.

**This is:**
- **The welcoming** - first impression, invitation
- **The preview** - hints of all themes without being any of them
- **The presence** - unmistakably you, before specialization
- **The breath** - calm before the choice

**Visual Metaphor:** Standing in a gallery entrance where you can glimpse five different rooms, each with its own light. You're in the neutral space between them, but you can feel their presence.

**Key Principle:** Home doesn't try to be everything. It's **confidently neutral** with **strategic hints** of what's to come.

---

## 🎨 Color Palette

### Primary Colors (Neutral Base)

**Warm Charcoal** - `#2C2C2C` (rgb: 44, 44, 44)
- Use: Primary text, headings
- Feeling: Present, grounded, warm black

**Soft Slate** - `#5C5C5C` (rgb: 92, 92, 92)
- Use: Secondary text, supporting information
- Feeling: Neutral, balanced, professional

**Clean White** - `#FAFAFA` (rgb: 250, 250, 250)
- Primary background
- Not pure white - slightly warm

**Light Gray** - `#F5F5F5` (rgb: 245, 245, 245)
- Secondary background, cards
- Subtle depth

### Accent Colors (Theme Hints)

These appear **only** as subtle accents, never dominating:

**Nature Hint** - `#4A9B9B` at 20% opacity
- For Personal door preview

**Twilight Hint** - `#5C527F` at 20% opacity  
- For Intellectual door preview

**Light-Tech Hint** - `#4F7CAC` at 20% opacity
- For Professional door preview

**Archive Hint** - `#B8956A` at 20% opacity
- For Library door preview

**Neon Hint** - `#00D9FF` at 20% opacity
- For Connect door preview

### Special Elements

**Gradient Neutral** (for subtle backgrounds):
```css
background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
```

**Multi-Theme Gradient** (used very sparingly):
```css
background: linear-gradient(
  135deg,
  rgba(74, 155, 155, 0.1) 0%,    /* Nature */
  rgba(92, 82, 127, 0.1) 20%,    /* Twilight */
  rgba(79, 124, 172, 0.1) 40%,   /* Light-Tech */
  rgba(184, 149, 106, 0.1) 60%,  /* Archive */
  rgba(0, 217, 255, 0.1) 80%     /* Neon */
);
```
- Use only in hero background or decorative elements
- Very subtle (10% opacity)

---

## 🔤 Typography

### Font Stack

**Primary (All Text):**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```
- Clean, modern, universally readable
- Neutral enough to preview all themes
- Professional but approachable

**Accent (Special Moments):**
```css
font-family: 'Space Grotesk', sans-serif;
```
- For tagline or special emphasis
- Modern, distinctive
- Use sparingly

### Type Scale

**Hero Title (Name):**
- Font: Inter
- Size: 4rem (64px) desktop / 2.5rem (40px) mobile
- Weight: 700 (Bold)
- Line-height: 1.1
- Letter-spacing: -0.02em
- Color: Warm Charcoal

**Hero Subtitle (Tagline):**
- Font: Space Grotesk
- Size: 1.5rem (24px) desktop / 1.25rem (20px) mobile
- Weight: 500 (Medium)
- Line-height: 1.3
- Letter-spacing: 0.02em
- Color: Soft Slate

**Body Large (Intro):**
- Font: Inter
- Size: 1.25rem (20px) desktop / 1.125rem (18px) mobile
- Weight: 400 (Regular)
- Line-height: 1.6
- Color: Warm Charcoal

**Door Card Title:**
- Font: Inter
- Size: 1.5rem (24px)
- Weight: 600 (Semi-bold)
- Line-height: 1.2
- Color: Warm Charcoal

**Door Card Description:**
- Font: Inter
- Size: 1rem (16px)
- Weight: 400
- Line-height: 1.5
- Color: Soft Slate

---

## 📐 Spacing System

Based on 8px grid:

- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px
- **4xl:** 96px
- **5xl:** 128px

**Generous Spacing:** Home needs breathing room. Use larger spacing values (3xl, 4xl, 5xl) between major sections.

---

## 🎭 Components

### Hero Section

**Structure:**
```html
<section class="hero-home">
  <div class="hero-content">
    <h1 class="hero-title">
      <span class="hero-name">Neev SK</span>
      <span class="hero-subtitle">Existential Cyberneticist</span>
    </h1>
    <p class="hero-intro">
      Building the soul behind the machines. Creating education transformation ecosystems through systems thinking and human-centered design.
    </p>
  </div>
  <div class="hero-visual">
    <!-- Optional: subtle abstract visual -->
  </div>
</section>
```

**Styling:**
```css
.hero-home {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-lg);
  position: relative;
  background: var(--color-clean-white);
}

/* Subtle multi-theme gradient background */
.hero-home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(74, 155, 155, 0.03) 0%,
    rgba(92, 82, 127, 0.03) 25%,
    rgba(79, 124, 172, 0.03) 50%,
    rgba(184, 149, 106, 0.03) 75%,
    rgba(0, 217, 255, 0.03) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  text-align: center;
}

.hero-name {
  display: block;
  margin-bottom: var(--spacing-md);
}

.hero-subtitle {
  display: block;
  margin-bottom: var(--spacing-xl);
}

.hero-intro {
  margin-top: var(--spacing-xl);
}
```

### Five Doors Section

**Door Card Structure:**
```html
<a href="/personal" class="door-card" data-theme-preview="nature">
  <div class="door-icon">🌿</div>
  <h3 class="door-title">Personal</h3>
  <p class="door-description">Soul, heart, lineage</p>
  <span class="door-cta">Enter →</span>
  <div class="door-glow"></div>
</a>
```

**Door Card Styling:**
```css
.door-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-2xl);
  background: var(--color-light-gray);
  border: 2px solid transparent;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* Theme-specific glow on hover */
.door-card[data-theme-preview="nature"]:hover {
  border-color: rgba(74, 155, 155, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(74, 155, 155, 0.15);
}

.door-card[data-theme-preview="nature"]:hover .door-glow {
  opacity: 1;
  background: radial-gradient(
    circle at center,
    rgba(74, 155, 155, 0.15) 0%,
    transparent 70%
  );
}

.door-card[data-theme-preview="twilight"]:hover {
  border-color: rgba(92, 82, 127, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(92, 82, 127, 0.15);
}

.door-card[data-theme-preview="twilight"]:hover .door-glow {
  opacity: 1;
  background: radial-gradient(
    circle at center,
    rgba(92, 82, 127, 0.15) 0%,
    transparent 70%
  );
}

.door-card[data-theme-preview="light-tech"]:hover {
  border-color: rgba(79, 124, 172, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(79, 124, 172, 0.15);
}

.door-card[data-theme-preview="light-tech"]:hover .door-glow {
  opacity: 1;
  background: radial-gradient(
    circle at center,
    rgba(79, 124, 172, 0.15) 0%,
    transparent 70%
  );
}

.door-card[data-theme-preview="warm-archive"]:hover {
  border-color: rgba(184, 149, 106, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(184, 149, 106, 0.15);
}

.door-card[data-theme-preview="warm-archive"]:hover .door-glow {
  opacity: 1;
  background: radial-gradient(
    circle at center,
    rgba(184, 149, 106, 0.15) 0%,
    transparent 70%
  );
}

.door-card[data-theme-preview="digital-neon"]:hover {
  border-color: rgba(0, 217, 255, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 217, 255, 0.15);
}

.door-card[data-theme-preview="digital-neon"]:hover .door-glow {
  opacity: 1;
  background: radial-gradient(
    circle at center,
    rgba(0, 217, 255, 0.15) 0%,
    transparent 70%
  );
}

.door-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
  transition: transform 0.3s ease;
}

.door-card:hover .door-icon {
  transform: scale(1.1);
}

.door-title {
  margin-bottom: var(--spacing-sm);
}

.door-description {
  color: var(--color-soft-slate);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.door-cta {
  font-weight: 600;
  color: var(--color-warm-charcoal);
  transition: transform 0.2s ease;
}

.door-card:hover .door-cta {
  transform: translateX(4px);
}

.door-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: -1;
}
```

**Grid Layout:**
```css
.doors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

@media (max-width: 640px) {
  .doors-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}
```

### Current Focus Section (Optional)

```html
<section class="current-focus">
  <h2>What I'm Building Now</h2>
  <div class="focus-card">
    <span class="status-badge">Active</span>
    <h3>Gurudevi</h3>
    <p>Teacher wellbeing sanctuary for Sri Lanka...</p>
    <a href="/professional/projects/gurudevi">Learn More →</a>
  </div>
</section>
```

**Styling:**
```css
.current-focus {
  padding: var(--spacing-4xl) var(--spacing-lg);
  background: var(--color-light-gray);
  text-align: center;
}

.focus-card {
  max-width: 600px;
  margin: var(--spacing-2xl) auto 0;
  padding: var(--spacing-2xl);
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #D1FAE5;
  color: #059669;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: var(--spacing-md);
}
```

---

## ✨ Animation Patterns

### Page Load Sequence

```css
/* Hero fade in */
@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-name {
  animation: heroFadeIn 0.8s ease-out forwards;
}

.hero-subtitle {
  animation: heroFadeIn 0.8s ease-out 0.2s forwards;
  opacity: 0;
}

.hero-intro {
  animation: heroFadeIn 0.8s ease-out 0.4s forwards;
  opacity: 0;
}
```

### Door Cards Stagger

```css
.door-card {
  animation: doorReveal 0.6s ease-out forwards;
  opacity: 0;
}

.door-card:nth-child(1) { animation-delay: 0.1s; }
.door-card:nth-child(2) { animation-delay: 0.2s; }
.door-card:nth-child(3) { animation-delay: 0.3s; }
.door-card:nth-child(4) { animation-delay: 0.4s; }
.door-card:nth-child(5) { animation-delay: 0.5s; }

@keyframes doorReveal {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Subtle Background Animation

```css
.hero-home::before {
  animation: subtleShift 20s ease-in-out infinite;
}

@keyframes subtleShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

---

## 🎨 Decorative Elements

### Subtle Geometric Patterns

```css
/* Optional: Very subtle grid or pattern */
.hero-home::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;
}
```

### Floating Elements (Very Subtle)

```html
<div class="floating-shapes">
  <div class="shape shape-1"></div>
  <div class="shape shape-2"></div>
  <div class="shape shape-3"></div>
</div>
```

```css
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #4A9B9B;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #5C527F;
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: #00D9FF;
  bottom: 20%;
  left: 50%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(20px, -20px);
  }
  66% {
    transform: translate(-20px, 20px);
  }
}
```

---

## 📱 Responsive Behavior

### Mobile (<640px)
- Hero min-height: 60vh
- Typography scales down
- Door cards: single column
- Padding reduces
- Floating shapes hidden or simplified

### Tablet (640-1024px)
- Hero min-height: 70vh
- Door cards: 2 columns
- Maintain most desktop features

### Desktop (>1024px)
- Full experience
- All animations
- Optimal spacing

---

## 🔄 Transition to Sections

### On Door Click

```javascript
function transitionToSection(sectionUrl, themeName) {
  // 1. Fade out current content
  gsap.to('main', { 
    opacity: 0, 
    duration: 0.3,
    ease: 'power2.out'
  });
  
  // 2. Navigate after fade
  setTimeout(() => {
    window.location.href = sectionUrl;
  }, 300);
}

// Apply to door cards
document.querySelectorAll('.door-card').forEach(door => {
  door.addEventListener('click', (e) => {
    e.preventDefault();
    const url = door.getAttribute('href');
    const theme = door.getAttribute('data-theme-preview');
    transitionToSection(url, theme);
  });
});
```

---

## 🎯 Design Principles for Home

**DO:**
- Keep it clean and uncluttered
- Use generous whitespace
- Let the five doors be the stars
- Preview themes subtly, never overwhelm
- Make the invitation clear
- Be confidently neutral

**DON'T:**
- Try to compete with the five themes
- Overdesign or add complexity
- Use too many accent colors
- Make navigation confusing
- Hide the doors
- Be cold or sterile

**Balance:**
- Neutral + Warm
- Simple + Alive
- Calm + Inviting
- Professional + Personal

---

## 🔗 Integration with Other Themes

**Home is the bridge:**
- Navigation from Home should smoothly transition to each theme
- Each door preview should feel like a glimpse, not a commitment
- The neutral palette allows any theme to feel natural as the next step

**Visual Hierarchy:**
```
HOME (Neutral threshold)
  ↓
[User chooses door]
  ↓
THEME-SPECIFIC SECTION (Full theme expression)
```

---

## 💡 Implementation Notes

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neev SK - Existential Cyberneticist</title>
  
  <!-- Home-specific styles -->
  <link rel="stylesheet" href="/styles/themes/home.css">
</head>
<body data-theme="home">
  <nav class="site-nav">
    <!-- Simple nav, or hidden on load -->
  </nav>
  
  <main>
    <section class="hero-home">
      <!-- Hero content -->
    </section>
    
    <section class="five-doors-section">
      <h2 class="section-title">Explore</h2>
      <div class="doors-grid">
        <!-- Five door cards -->
      </div>
    </section>
    
    <section class="current-focus">
      <!-- Optional: what you're building now -->
    </section>
  </main>
  
  <footer>
    <!-- Minimal footer -->
  </footer>
  
  <script src="/scripts/home-animations.js"></script>
</body>
</html>
```

### CSS Variables

```css
:root[data-theme="home"] {
  /* Colors */
  --color-warm-charcoal: #2C2C2C;
  --color-soft-slate: #5C5C5C;
  --color-clean-white: #FAFAFA;
  --color-light-gray: #F5F5F5;
  
  /* Theme hints */
  --hint-nature: rgba(74, 155, 155, 0.2);
  --hint-twilight: rgba(92, 82, 127, 0.2);
  --hint-light-tech: rgba(79, 124, 172, 0.2);
  --hint-archive: rgba(184, 149, 106, 0.2);
  --hint-neon: rgba(0, 217, 255, 0.2);
  
  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-accent: 'Space Grotesk', sans-serif;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  --spacing-4xl: 96px;
  --spacing-5xl: 128px;
  
  /* Effects */
  --transition-speed: 0.4s;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🎨 Final Touch: The Vibe

**Home embodies:**
- **Chill** - No pressure, take your time
- **Alive** - Subtle animations, responsive to hover
- **Cool** - Clean aesthetic, modern
- **Soothing** - Neutral palette, generous spacing
- **Wise** - Confident in its simplicity

**The feeling when someone lands:**
"This person knows who they are. I'm curious which door to choose."

---

*Home is the threshold. It doesn't need to shout - it just needs to invite.*
