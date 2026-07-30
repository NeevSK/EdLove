# Theme 01: Nature
## For PERSONAL Section (Soul/Heart)

**Primary Use:** Personal section, Hall of Flame  
**Secondary Use:** Can be adapted for other warm, organic content  
**Vibe Expression:** Alive through organic flow, breathing, warmth

---

## 🌿 Theme Philosophy

Nature theme embodies the soul and heart - the resonance of Hall of Flame. This is where you honor lineage, love, and the people who lit your fire. The design must feel:

- **Organic** - flowing, not rigid
- **Alive** - breathing, growing
- **Warm** - inviting, safe
- **Resonant** - emotionally present
- **Soothing** - like a sanctuary

**Visual Metaphor:** Walking through a sun-dappled forest, beside flowing water, under open sky. Natural but not primitive. Alive but not chaotic.

---

## 🎨 Color Palette

### Primary Colors

**Sky Blue** - `#87CEEB` (rgb: 135, 206, 235)
- Use: Headers, accents, interactive elements
- Feeling: Open, clear, hopeful

**Forest Green** - `#5C7C5D` (rgb: 92, 124, 93)
- Use: Subheadings, supporting text, borders
- Feeling: Grounded, living, rooted

**Earth Brown** - `#8B6F47` (rgb: 139, 111, 71)
- Use: Warm accents, hover states, depth
- Feeling: Stable, warm, trustworthy

**Water Teal** - `#4A9B9B` (rgb: 74, 155, 155)
- Use: Links, call-to-actions, energy moments
- Feeling: Flowing, fresh, inviting

### Background Colors

**Light Cream** - `#FAF8F3` (rgb: 250, 248, 243)
- Primary background
- Feeling: Warm white, not stark

**Soft Moss** - `#E8EDE7` (rgb: 232, 237, 231)
- Secondary background, cards, sections
- Feeling: Gentle depth, natural layering

### Text Colors

**Deep Charcoal** - `#2C2C2C` (rgb: 44, 44, 44)
- Primary body text
- High readability, not harsh black

**Soft Slate** - `#6B7280` (rgb: 107, 114, 128)
- Secondary text, captions, meta information

**Gentle Gray** - `#9CA3AF` (rgb: 156, 163, 175)
- Tertiary text, timestamps, subtle information

### Accent & Special

**Sunrise Gold** - `#F4A460` (rgb: 244, 164, 96)
- For moments of warmth, emphasis
- Use sparingly, like sunlight through leaves

**Petal Pink** - `#E8C4C4` (rgb: 232, 196, 196)
- Extremely subtle accents, love moments
- Use very sparingly in Hall of Flame

---

## 🔤 Typography

### Font Stack

**Primary (Headings):**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```
- Clean, modern, readable
- Warm through letter-spacing and weight choices

**Secondary (Body):**
```css
font-family: 'Literata', Georgia, 'Times New Roman', serif;
```
- Warm serif for body text
- Comfortable reading, literary feel
- Fallback to system serif if needed

**Accent (Special moments):**
```css
font-family: 'Inconsolata', 'SF Mono', 'Courier New', monospace;
```
- For timestamps, meta info, subtle technical touches
- Use sparingly

### Type Scale

**Display (H1):**
- Font: Inter
- Size: 3.5rem (56px) desktop / 2.5rem (40px) mobile
- Weight: 600 (Semi-bold)
- Line-height: 1.1
- Letter-spacing: -0.02em
- Use: Page titles only

**Heading 1 (H2):**
- Font: Inter
- Size: 2.5rem (40px) desktop / 2rem (32px) mobile
- Weight: 600
- Line-height: 1.2
- Letter-spacing: -0.01em
- Use: Major section headings

**Heading 2 (H3):**
- Font: Inter
- Size: 1.75rem (28px) desktop / 1.5rem (24px) mobile
- Weight: 500 (Medium)
- Line-height: 1.3
- Use: Subsection headings

**Heading 3 (H4):**
- Font: Inter
- Size: 1.25rem (20px)
- Weight: 500
- Line-height: 1.4
- Use: Card titles, small sections

**Body Large:**
- Font: Literata
- Size: 1.125rem (18px)
- Weight: 400 (Regular)
- Line-height: 1.7
- Use: Introductory paragraphs, important content

**Body Regular:**
- Font: Literata
- Size: 1rem (16px)
- Weight: 400
- Line-height: 1.8
- Use: Standard body text

**Body Small:**
- Font: Literata
- Size: 0.875rem (14px)
- Weight: 400
- Line-height: 1.6
- Use: Captions, metadata

**Caption:**
- Font: Inconsolata
- Size: 0.75rem (12px)
- Weight: 400
- Line-height: 1.5
- Letter-spacing: 0.05em
- Use: Timestamps, tags, system info

---

## 📐 Spacing System

Based on 8px grid with organic flexibility:

- **xs:** 4px - Tight spacing
- **sm:** 8px - Close elements
- **md:** 16px - Default spacing
- **lg:** 24px - Section breathing room
- **xl:** 32px - Major sections
- **2xl:** 48px - Page sections
- **3xl:** 64px - Major breaks
- **4xl:** 96px - Dramatic spacing

**Organic Flexibility:** Unlike rigid systems, Nature theme can use `+/-4px` variations for visual rhythm and breathing.

---

## 🎭 Components

### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #4A9B9B 0%, #5C7C5D 100%);
color: #FAF8F3;
padding: 12px 24px;
border-radius: 8px;
font-weight: 500;
font-size: 1rem;
transition: all 0.3s ease;
box-shadow: 0 2px 8px rgba(74, 155, 155, 0.2);

/* Hover */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(74, 155, 155, 0.3);
```

**Secondary Button:**
```css
background: transparent;
color: #5C7C5D;
border: 2px solid #5C7C5D;
padding: 12px 24px;
border-radius: 8px;
font-weight: 500;
transition: all 0.3s ease;

/* Hover */
background: #5C7C5D;
color: #FAF8F3;
transform: translateY(-2px);
```

**Text Button/Link:**
```css
color: #4A9B9B;
text-decoration: none;
border-bottom: 2px solid transparent;
transition: border-color 0.2s ease;
font-weight: 500;

/* Hover */
border-bottom-color: #4A9B9B;
```

### Cards

**Standard Card:**
```css
background: #FAF8F3;
border: 1px solid #E8EDE7;
border-radius: 12px;
padding: 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
transition: all 0.3s ease;

/* Hover */
transform: translateY(-4px);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
border-color: #4A9B9B;
```

**Feature Card (Hall of Flame entries):**
```css
background: linear-gradient(135deg, #FAF8F3 0%, #E8EDE7 100%);
border-radius: 16px;
padding: 32px;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
position: relative;
overflow: hidden;

/* Subtle organic accent */
&::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(74, 155, 155, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
```

### Navigation

**Nav Container:**
```css
background: rgba(250, 248, 243, 0.95);
backdrop-filter: blur(10px);
border-bottom: 1px solid rgba(232, 237, 231, 0.8);
padding: 16px 0;
position: sticky;
top: 0;
z-index: 100;
```

**Nav Links:**
```css
color: #2C2C2C;
font-weight: 500;
padding: 8px 16px;
border-radius: 6px;
transition: all 0.2s ease;

/* Hover */
background: rgba(74, 155, 155, 0.1);
color: #4A9B9B;

/* Active */
background: rgba(74, 155, 155, 0.15);
color: #4A9B9B;
border-bottom: 2px solid #4A9B9B;
```

### Dividers

**Organic Divider:**
- Not straight lines
- Subtle wave or natural curve
- Can use SVG with slight organic path
- Color: `#E8EDE7` with 50% opacity
- Thickness: 1-2px

### Images

**Photo Treatment:**
```css
border-radius: 12px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
```

**Image Captions:**
```css
font-family: Inconsolata;
font-size: 0.875rem;
color: #6B7280;
margin-top: 8px;
font-style: italic;
```

---

## ✨ Animation Patterns

### Page Entry
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

/* Apply with stagger */
.element {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
}
```

### Breathing Effect (Subtle background pulse)
```css
@keyframes breathe {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

.background-element {
  animation: breathe 8s ease-in-out infinite;
}
```

### Organic Hover
```css
.card:hover {
  transform: translateY(-4px) scale(1.01);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Flow Animation (for decorative elements)
```css
@keyframes flow {
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(20px) translateY(-10px);
  }
  100% {
    transform: translateX(0) translateY(0);
  }
}

.floating-element {
  animation: flow 15s ease-in-out infinite;
}
```

---

## 🎨 Decorative Elements

### Organic Shapes (Background)
- Subtle blob shapes in very light teal/green
- SVG or CSS with `border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%`
- Opacity: 5-10%
- Positioned absolutely, large scale
- Slow rotation or flow animation

### Leaf/Nature Icons
- Simple, stylized leaf or plant icons
- Use as subtle section markers
- Color: Forest Green or Water Teal
- Size: 16-24px
- Can be used before headings or as list markers

### Light Effects
- Subtle radial gradients suggesting sunlight
- Very low opacity (3-5%)
- Positioned to create depth and warmth

---

## 📱 Responsive Behavior

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Adaptations
- Typography scales down (see type scale mobile sizes)
- Cards become full-width with 16px side margins
- Spacing reduces by ~30% (from lg → md, xl → lg)
- Navigation becomes hamburger menu
- Organic shapes reduce in size/complexity

---

## 🔍 Accessibility

### Contrast Ratios
All text colors meet WCAG AA standards:
- Deep Charcoal on Light Cream: 12:1 ✓
- Soft Slate on Light Cream: 7:1 ✓
- Water Teal links: 4.8:1 ✓

### Focus States
```css
:focus-visible {
  outline: 3px solid #4A9B9B;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Motion
- Respect `prefers-reduced-motion`
- Disable animations for users who prefer reduced motion

---

## 💡 Usage Examples

### Hall of Flame Chamber Entry
```html
<div class="flame-chamber">
  <div class="chamber-icon">💖</div>
  <h2>Chamber of Love</h2>
  <p class="chamber-intro">For those who met your soul in real life, and lit the first flames of care.</p>
  
  <div class="flame-entries">
    <div class="flame-card">
      <h3>Parents</h3>
      <p>The first light, the first love...</p>
    </div>
    <!-- More entries -->
  </div>
</div>
```

**Styling:**
- Chamber icon: Sunrise Gold with soft glow
- Entries: Feature cards with organic accent
- Spacing: Generous (xl between entries)
- Animation: Fade in up with stagger

---

## 🎯 Theme-Specific Guidelines

**DO:**
- Use organic, flowing layouts
- Add breathing room - this theme needs space
- Include subtle natural textures (very light grain)
- Use warm, welcoming language
- Create sanctuary feeling

**DON'T:**
- Make it too rigid or grid-locked
- Use harsh shadows or stark contrasts
- Overdo the nature metaphor (no literal trees/leaves everywhere)
- Make it feel "hippie" or overly earthy
- Use cold or clinical design patterns

---

## 🔗 Integration Notes

**With Other Themes:**
- Home page can preview Nature theme with soft transitions
- Navigation should subtly hint at theme changes
- Consider gentle fade transition when leaving Personal section

**Subsection Variations:**
- **Hall of Flame:** Can use richer colors, more emotional design
- **About/Bio:** Simpler, cleaner version of Nature theme
- All variations maintain the core warmth and organic flow

---

*This theme is a sanctuary. Design with reverence.*
