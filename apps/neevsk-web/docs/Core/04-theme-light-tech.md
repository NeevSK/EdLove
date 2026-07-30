# Theme 03: Light-Tech
## For PROFESSIONAL Section (Work/Credibility)

**Primary Use:** Professional section, Projects, CV  
**Vibe Expression:** Alive through smooth precision, humane technology, confident clarity

---

## 🚀 Theme Philosophy

Light-Tech embodies professional competence with human warmth. This is **humane technology** - futuristic but approachable, clean but not sterile, confident but not arrogant. Think:

- **Credible** - this person builds things that work
- **Clear** - no ambiguity, no confusion
- **Future-forward** - optimistic about technology's potential
- **Human-centered** - technology serves people
- **Efficient** - respects time and attention
- **Professional** - taken seriously by serious people

**Visual Metaphor:** A well-designed workspace with natural light. Apple product launch aesthetic meets thoughtful startup. Notion's clarity + Linear's precision + Stripe's confidence.

**NOT:**
- Cold corporate
- Overly minimal to the point of sterile
- Flashy tech-bro aesthetic
- Complicated or cluttered

---

## 🎨 Color Palette

### Primary Colors

**Deep Navy** - `#1A1D2E` (rgb: 26, 29, 46)
- Use: Primary headings, strong statements
- Feeling: Professional depth, serious but not harsh

**Clear Blue** - `#4F7CAC` (rgb: 79, 124, 172)
- Use: Primary interactive elements, CTAs, links
- Feeling: Trustworthy, clear, forward-moving

**Soft Cyan** - `#5DADE2` (rgb: 93, 173, 226)
- Use: Accents, highlights, energy moments
- Feeling: Fresh, modern, approachable tech

**Professional Gray** - `#6B7280` (rgb: 107, 114, 128)
- Use: Supporting text, secondary information
- Feeling: Balanced, neutral, professional

### Background Colors

**Pure White** - `#FFFFFF` (rgb: 255, 255, 255)
- Primary background
- Clean, spacious, professional

**Soft Gray** - `#F9FAFB` (rgb: 249, 250, 251)
- Secondary background, cards, sections
- Subtle depth without heaviness

**Light Blue** - `#F0F7FF` (rgb: 240, 247, 255)
- Highlight areas, info sections
- Soft tech feeling

**Deep Background** - `#F3F4F6` (rgb: 243, 244, 246)
- For contrast sections
- Still light but with more presence

### Text Colors

**Rich Black** - `#111827` (rgb: 17, 24, 39)
- Primary text
- Strong readability, not harsh

**Charcoal** - `#374151` (rgb: 55, 65, 81)
- Secondary text, longer content
- Softer than primary but still clear

**Slate** - `#6B7280` (rgb: 107, 114, 128)
- Tertiary text, captions, metadata
- Professional neutral

### Accent Colors

**Success Green** - `#10B981` (rgb: 16, 185, 129)
- For success states, positive indicators
- Feeling: Achievement, growth, "shipped"

**Attention Amber** - `#F59E0B` (rgb: 245, 158, 11)
- For important notices, in-progress states
- Feeling: Active, energetic, "building"

**Gradient Accent:**
```css
background: linear-gradient(135deg, #4F7CAC 0%, #5DADE2 100%);
```
- For hero elements, featured items
- Use sparingly for impact

---

## 🔤 Typography

### Font Stack

**Primary (All Use):**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```
- Clean, modern, highly readable
- Professional standard
- Excellent for UI and content

**Monospace (Technical):**
```css
font-family: 'JetBrains Mono', 'SF Mono', 'Courier New', monospace;
```
- For code snippets, technical specs
- Clean, readable monospace
- Professional developer aesthetic

### Type Scale

**Display (Hero):**
- Font: Inter
- Size: 4rem (64px) desktop / 2.5rem (40px) mobile
- Weight: 700 (Bold)
- Line-height: 1.1
- Letter-spacing: -0.03em
- Use: Page hero only

**Heading 1 (H2):**
- Font: Inter
- Size: 2.5rem (40px) desktop / 2rem (32px) mobile
- Weight: 600 (Semi-bold)
- Line-height: 1.2
- Letter-spacing: -0.02em
- Use: Section titles

**Heading 2 (H3):**
- Font: Inter
- Size: 1.875rem (30px) desktop / 1.5rem (24px) mobile
- Weight: 600
- Line-height: 1.3
- Use: Project titles, major subsections

**Heading 3 (H4):**
- Font: Inter
- Size: 1.25rem (20px)
- Weight: 600
- Line-height: 1.4
- Use: Card titles, small sections

**Body Large:**
- Font: Inter
- Size: 1.125rem (18px)
- Weight: 400 (Regular)
- Line-height: 1.7
- Use: Introductory text, important content

**Body Regular:**
- Font: Inter
- Size: 1rem (16px)
- Weight: 400
- Line-height: 1.6
- Use: Standard body text, descriptions

**Body Small:**
- Font: Inter
- Size: 0.875rem (14px)
- Weight: 400
- Line-height: 1.5
- Use: Captions, metadata, secondary info

**Label/Button:**
- Font: Inter
- Size: 0.875rem (14px)
- Weight: 500 (Medium)
- Line-height: 1.4
- Letter-spacing: 0.01em
- Use: Buttons, labels, tags

**Code/Technical:**
- Font: JetBrains Mono
- Size: 0.875rem (14px)
- Weight: 400
- Line-height: 1.6
- Use: Technical specs, code

---

## 📐 Spacing System

Based on 4px grid (tighter than other themes for precision):

- **xs:** 4px
- **sm:** 8px
- **md:** 12px
- **lg:** 16px
- **xl:** 24px
- **2xl:** 32px
- **3xl:** 48px
- **4xl:** 64px
- **5xl:** 96px

**Precision Principle:** Spacing is exact and consistent. This creates the "clean, professional" feeling.

---

## 🎭 Components

### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #4F7CAC 0%, #5DADE2 100%);
color: #FFFFFF;
padding: 12px 24px;
border-radius: 8px;
font-weight: 500;
font-size: 0.875rem;
border: none;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
box-shadow: 0 1px 3px rgba(79, 124, 172, 0.2);
cursor: pointer;

/* Hover */
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(79, 124, 172, 0.3);

/* Active */
transform: translateY(0);
box-shadow: 0 1px 2px rgba(79, 124, 172, 0.2);
```

**Secondary Button:**
```css
background: #FFFFFF;
color: #4F7CAC;
border: 1.5px solid #4F7CAC;
padding: 12px 24px;
border-radius: 8px;
font-weight: 500;
transition: all 0.2s ease;

/* Hover */
background: #F0F7FF;
border-color: #5DADE2;
color: #5DADE2;
```

**Ghost Button:**
```css
background: transparent;
color: #4F7CAC;
padding: 12px 24px;
border: none;
font-weight: 500;
transition: all 0.2s ease;

/* Hover */
background: rgba(79, 124, 172, 0.1);
```

**Icon Button:**
```css
width: 40px;
height: 40px;
border-radius: 8px;
background: transparent;
border: none;
color: #6B7280;
transition: all 0.2s ease;
display: flex;
align-items: center;
justify-content: center;

/* Hover */
background: #F3F4F6;
color: #4F7CAC;
```

### Cards

**Project Card:**
```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
cursor: pointer;

/* Hover */
transform: translateY(-4px);
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
border-color: #5DADE2;
```

**Feature Card:**
```css
background: #F9FAFB;
border-radius: 16px;
padding: 32px;
border: 1px solid #E5E7EB;
position: relative;
overflow: hidden;

/* Gradient accent bar */
&::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #4F7CAC 0%, #5DADE2 100%);
}
```

**Info Card (CV section):**
```css
background: #F0F7FF;
border-left: 3px solid #4F7CAC;
border-radius: 4px 8px 8px 4px;
padding: 20px 24px;
```

### Navigation

**Nav Container:**
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(229, 231, 235, 0.8);
padding: 16px 0;
position: sticky;
top: 0;
z-index: 100;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
```

**Nav Links:**
```css
color: #374151;
font-weight: 500;
font-size: 0.9375rem;
padding: 8px 16px;
border-radius: 6px;
transition: all 0.2s ease;

/* Hover */
background: #F3F4F6;
color: #4F7CAC;

/* Active */
background: #F0F7FF;
color: #4F7CAC;
font-weight: 600;
```

### Badges/Tags

**Status Badge:**
```css
display: inline-flex;
align-items: center;
padding: 4px 12px;
border-radius: 12px;
font-size: 0.75rem;
font-weight: 500;
letter-spacing: 0.02em;

/* Active */
background: #D1FAE5;
color: #059669;

/* In Progress */
background: #FEF3C7;
color: #D97706;

/* Completed */
background: #DBEAFE;
color: #1D4ED8;
```

**Skill Tag:**
```css
background: #F3F4F6;
color: #374151;
padding: 6px 12px;
border-radius: 6px;
font-size: 0.8125rem;
font-weight: 500;
transition: all 0.2s ease;
border: 1px solid transparent;

/* Hover */
background: #F0F7FF;
border-color: #5DADE2;
color: #4F7CAC;
```

### Dividers

**Standard Divider:**
```css
height: 1px;
background: #E5E7EB;
margin: 48px 0;
```

**Gradient Divider:**
```css
height: 1px;
background: linear-gradient(90deg, 
  transparent 0%, 
  #E5E7EB 20%, 
  #E5E7EB 80%, 
  transparent 100%
);
margin: 64px 0;
```

---

## ✨ Animation Patterns

### Smooth Entrance
```css
@keyframes smoothIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.element {
  animation: smoothIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--index) * 0.08s);
}
```

### Subtle Float (for cards on hover)
```css
.card:hover {
  animation: subtleFloat 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes subtleFloat {
  to {
    transform: translateY(-4px);
  }
}
```

### Progress Indicator
```css
@keyframes progress {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

.loading-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(93, 173, 226, 0.5), transparent);
  animation: progress 1.5s ease-in-out infinite;
}
```

### Pulse (for status indicators)
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.status-indicator {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 🎨 Decorative Elements

### Grid Pattern (subtle)
```css
background-image: 
  linear-gradient(#E5E7EB 1px, transparent 1px),
  linear-gradient(90deg, #E5E7EB 1px, transparent 1px);
background-size: 24px 24px;
opacity: 0.3;
```

### Gradient Accents
- Use sparingly for visual interest
- Top of cards, section backgrounds
- Always subtle, never overwhelming

### Geometric Shapes
- Simple circles, squares, lines
- Use as background elements
- Very low opacity (3-5%)
- Suggest structure and order

### Icon System
- Use Lucide Icons or similar clean icon set
- Size: 20px or 24px standard
- Color: Match text color or use Clear Blue for emphasis
- Consistent stroke width: 2px

---

## 📊 Professional-Specific Elements

### Project Showcase
```html
<div class="project-card">
  <div class="project-image">
    <!-- Screenshot or hero image -->
  </div>
  <div class="project-content">
    <div class="project-meta">
      <span class="badge">Active</span>
      <span class="year">2025-Present</span>
    </div>
    <h3>Gurudevi</h3>
    <p class="project-description">Teacher wellbeing sanctuary for Sri Lanka...</p>
    <div class="project-tags">
      <span class="tag">Product Design</span>
      <span class="tag">Systems Thinking</span>
    </div>
    <a href="#" class="project-link">View Project →</a>
  </div>
</div>
```

### CV Timeline
```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-marker"></div>
    <div class="timeline-content">
      <h4>Vice President, Student Union</h4>
      <p class="organization">University of Moratuwa</p>
      <p class="duration">2024 - Present</p>
      <p class="description">Leading student initiatives...</p>
    </div>
  </div>
  <!-- More items -->
</div>
```

**Timeline Styling:**
```css
.timeline {
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #4F7CAC, #5DADE2);
}

.timeline-marker {
  position: absolute;
  left: -28px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 3px solid #4F7CAC;
  box-shadow: 0 0 0 4px #F0F7FF;
}
```

### Skills Grid
```html
<div class="skills-grid">
  <div class="skill-category">
    <h4>Design</h4>
    <div class="skill-tags">
      <span class="tag">Product Design</span>
      <span class="tag">Systems Thinking</span>
      <span class="tag">UX Research</span>
    </div>
  </div>
  <!-- More categories -->
</div>
```

### Stats/Metrics
```html
<div class="metrics-grid">
  <div class="metric-card">
    <div class="metric-value">3</div>
    <div class="metric-label">Active Projects</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">2500+</div>
    <div class="metric-label">Students Impacted</div>
  </div>
  <!-- More metrics -->
</div>
```

---

## 📱 Responsive Behavior

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px
- **Large:** > 1280px

### Mobile Adaptations
- Typography scales appropriately
- Cards become full-width
- Grid layouts become single column
- Navigation becomes hamburger menu
- Reduced spacing (by ~25%)
- Simplified hover states (tap-friendly)

### Tablet Considerations
- 2-column grids where appropriate
- Maintain most desktop interactions
- Adjust image sizes
- Optimize for both portrait and landscape

---

## 🔍 Accessibility

### Contrast Ratios
- Rich Black on Pure White: 18:1 ✓
- Clear Blue on Pure White: 4.7:1 ✓
- All text meets WCAG AA minimum

### Focus States
```css
:focus-visible {
  outline: 2px solid #5DADE2;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover states
- Keyboard navigation support
- Screen reader friendly labels

---

## 💡 Usage Examples

### Hero Section
```html
<section class="hero">
  <div class="hero-content">
    <h1>Building the soul behind the machines</h1>
    <p class="hero-subtitle">Product designer, systems thinker, and existential cyberneticist crafting education transformation ecosystems.</p>
    <div class="hero-actions">
      <button class="btn-primary">View Projects</button>
      <button class="btn-secondary">Download CV</button>
    </div>
  </div>
  <div class="hero-visual">
    <!-- Optional visual element -->
  </div>
</section>
```

### Project Grid
```html
<section class="projects-section">
  <h2>Featured Projects</h2>
  <div class="projects-grid">
    <!-- Project cards -->
  </div>
</section>
```

---

## 🎯 Theme-Specific Guidelines

**DO:**
- Keep it clean and clear
- Use whitespace generously
- Show competence through clarity
- Make CTAs obvious
- Use consistent spacing
- Maintain visual hierarchy
- Show, don't tell (use visuals)

**DON'T:**
- Make it feel cold or corporate
- Over-design simple elements
- Use too many colors
- Clutter the space
- Hide important information
- Use unclear language
- Sacrifice usability for aesthetics

**Balance:**
- Professional + approachable
- Modern + timeless
- Tech-forward + human-centered
- Confident + humble

---

## 🔗 Integration Notes

**With Other Themes:**
- Clean transition from other sections
- Can preview via gradient accents on Home
- Navigation clearly indicates professional section
- Consider subtle "mode shift" animation

**Subsection Variations:**

**Projects:**
- More visual, showcase-focused
- Larger images, clear CTAs
- Status indicators prominent
- Interactive elements

**CV:**
- More structured, timeline-based
- Clean typography hierarchy
- Downloadable PDF option
- Print-friendly considerations

**About/Professional Bio:**
- Balanced text and visual
- Clear, confident copy
- Social proof elements
- Contact CTAs

---

*This theme is confident competence. Design with clarity.*
