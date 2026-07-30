# Page Designs
## Specific Layouts for Each Section

**Version:** 1.0  
**For:** NeevSK Digital Home

---

## 🏠 HOME PAGE - "Our Everyday Hero"

**Theme:** Preview of all themes  
**Purpose:** Entry point, introduces the five doors

### Layout Structure

```
┌─────────────────────────────────────────┐
│         Navigation (sticky)             │
├─────────────────────────────────────────┤
│                                         │
│            Hero Section                 │
│      Name + Tagline + Intro            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         Five Doors Section             │
│  ┌───────┐ ┌───────┐ ┌───────┐        │
│  │Personal│ │Intell │ │ Prof  │        │
│  └───────┘ └───────┘ └───────┘        │
│  ┌───────┐ ┌───────┐                  │
│  │Library│ │Connect│                  │
│  └───────┘ └───────┘                  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│        Current Focus/Status            │
│                                         │
├─────────────────────────────────────────┤
│              Footer                     │
└─────────────────────────────────────────┘
```

### Hero Section
```html
<section class="hero-home">
  <div class="hero-content">
    <h1 class="hero-title">
      <span class="hero-name">Neev SK</span>
      <span class="hero-subtitle">Existential Cyberneticist</span>
    </h1>
    <p class="hero-intro">
      Building the soul behind the machines. 
      Creating education transformation ecosystems through systems thinking and human-centered design.
    </p>
  </div>
  <div class="hero-visual">
    <!-- Optional: Abstract visual representation -->
  </div>
</section>
```

**Styling Notes:**
- Large, confident typography
- Subtle animations on load
- Preview of theme colors in background
- Breathing space

### Five Doors Section
```html
<section class="five-doors">
  <h2 class="section-title">Explore</h2>
  <div class="doors-grid">
    
    <a href="/personal" class="door-card" data-theme-preview="nature">
      <div class="door-icon">🌿</div>
      <h3 class="door-title">Personal</h3>
      <p class="door-description">Soul, heart, lineage</p>
      <span class="door-cta">Enter →</span>
    </a>
    
    <a href="/intellectual" class="door-card" data-theme-preview="twilight">
      <div class="door-icon">🌌</div>
      <h3 class="door-title">Intellectual</h3>
      <p class="door-description">Mind, systems, frameworks</p>
      <span class="door-cta">Enter →</span>
    </a>
    
    <a href="/professional" class="door-card" data-theme-preview="light-tech">
      <div class="door-icon">🚀</div>
      <h3 class="door-title">Professional</h3>
      <p class="door-description">Work, projects, competence</p>
      <span class="door-cta">Enter →</span>
    </a>
    
    <a href="/library" class="door-card" data-theme-preview="warm-archive">
      <div class="door-icon">📚</div>
      <h3 class="door-title">Library</h3>
      <p class="door-description">Books, films, archive</p>
      <span class="door-cta">Enter →</span>
    </a>
    
    <a href="/connect" class="door-card" data-theme-preview="digital-neon">
      <div class="door-icon">⚡</div>
      <h3 class="door-title">Connect</h3>
      <p class="door-description">Contact, collaborate</p>
      <span class="door-cta">Enter →</span>
    </a>
  </div>
</section>
```

**Interaction:**
- Each card previews its theme on hover
- Subtle theme-color glow
- Smooth transition on click
- Stagger animation on load

---

## 🌿 PERSONAL PAGE

**Theme:** Nature  
**Subsections:** About, Hall of Flame, Journey

### About Section
```html
<section class="personal-about">
  <div class="about-content">
    <h1>The Person Behind the Work</h1>
    <div class="about-text">
      <p>INFJ 4w5. Existential cyberneticist. Bohemian philosopher...</p>
      <!-- Personal narrative -->
    </div>
  </div>
  <aside class="about-visual">
    <!-- Optional photo or abstract visual -->
  </aside>
</section>
```

### Hall of Flame Layout
```html
<section class="hall-of-flame">
  <header class="hall-header">
    <h1>🔥 The Hall of Flame</h1>
    <p class="hall-intro">
      Where legacy is love, and every chamber beats like a heart.
    </p>
  </header>
  
  <div class="chambers">
    <!-- Chamber of Love -->
    <article class="chamber">
      <div class="chamber-icon">💖</div>
      <h2 class="chamber-title">Chamber of Love</h2>
      <p class="chamber-description">
        For those who met your soul in real life...
      </p>
      <div class="chamber-entries">
        <div class="flame-entry">
          <h3>Parents</h3>
          <p>The first light...</p>
        </div>
        <!-- More entries -->
      </div>
    </article>
    
    <!-- More chambers -->
  </div>
</section>
```

**Design Notes:**
- Ceremonial but accessible
- Warm, reverent spacing
- Organic flow between chambers
- Subtle flame-like glows
- Breathing animations

---

## 🌌 INTELLECTUAL PAGE

**Theme:** Twilight/Systems  
**Subsections:** Philosophical Lineage, Frameworks, Epistemic Work

### Philosophical Lineage
```html
<section class="philosophical-lineage">
  <h1>Philosophical Lineage</h1>
  <p class="intro">The thinkers who shaped how I think...</p>
  
  <div class="lineage-timeline">
    <article class="thinker-card">
      <div class="connection-line"></div>
      <div class="thinker-content">
        <h3>Donella Meadows</h3>
        <p class="influence">Systems Thinking, Leverage Points</p>
        <blockquote>
          "A system is more than the sum of its parts..."
        </blockquote>
        <p class="impact">
          Taught me to see interconnections...
        </p>
      </div>
    </article>
    <!-- More thinkers -->
  </div>
</section>
```

**Visual Elements:**
- Network/connection visualizations
- Fractal patterns (subtle background)
- Topological forms
- Systems diagrams
- Dark, contemplative palette

---

## 🚀 PROFESSIONAL PAGE

**Theme:** Light-Tech  
**Subsections:** Projects, CV

### Projects Grid
```html
<section class="projects-section">
  <header class="section-header">
    <h1>Projects</h1>
    <p class="subtitle">Building transformation ecosystems</p>
  </header>
  
  <div class="projects-grid">
    <article class="project-card featured">
      <div class="project-image">
        <img src="gurudevi-hero.jpg" alt="Gurudevi" />
        <span class="project-status active">Active</span>
      </div>
      <div class="project-content">
        <h2>Gurudevi</h2>
        <p class="project-tagline">
          Teacher wellbeing sanctuary for Sri Lanka
        </p>
        <p class="project-description">
          A sanctuary-first platform...
        </p>
        <div class="project-meta">
          <span class="project-role">Product Design Lead</span>
          <span class="project-timeline">2024 - Present</span>
        </div>
        <div class="project-tags">
          <span class="tag">Product Design</span>
          <span class="tag">Systems Thinking</span>
        </div>
        <a href="/projects/gurudevi" class="project-link">
          View Project →
        </a>
      </div>
    </article>
    
    <!-- More projects -->
  </div>
</section>
```

### CV Layout
```html
<section class="cv-section">
  <header>
    <h1>Curriculum Vitae</h1>
    <button class="btn-download">Download PDF</button>
  </header>
  
  <div class="cv-content">
    <section class="cv-block">
      <h2>Education</h2>
      <div class="cv-timeline">
        <div class="cv-item">
          <h3>BSc in Business Analytics</h3>
          <p class="organization">University of Moratuwa</p>
          <p class="duration">2021 - 2025</p>
        </div>
      </div>
    </section>
    
    <section class="cv-block">
      <h2>Experience</h2>
      <!-- Timeline format -->
    </section>
    
    <section class="cv-block">
      <h2>Leadership</h2>
      <!-- Content -->
    </section>
    
    <section class="cv-block">
      <h2>Skills</h2>
      <div class="skills-grid">
        <!-- Skill categories -->
      </div>
    </section>
  </div>
</section>
```

---

## 📚 LIBRARY PAGE

**Theme:** Warm Archive  
**Subsections:** Books, Films, Papers, Blog

### Books Section
```html
<section class="library-books">
  <header>
    <h1>Books</h1>
    <div class="library-filters">
      <button class="filter active">All</button>
      <button class="filter">Philosophy</button>
      <button class="filter">Systems</button>
      <button class="filter">Design</button>
    </div>
  </header>
  
  <div class="featured-book">
    <div class="book-display">
      <img src="book-cover.jpg" alt="Book title" />
    </div>
    <div class="book-content">
      <span class="category">Currently Reading</span>
      <h2>Thinking in Systems</h2>
      <p class="author">Donella H. Meadows</p>
      <div class="personal-note">
        <p>"This book fundamentally changed..."</p>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 60%"></div>
      </div>
    </div>
  </div>
  
  <div class="books-grid">
    <!-- Book cards -->
  </div>
</section>
```

### Films Section
```html
<section class="library-films">
  <h1>Films</h1>
  <div class="films-grid">
    <article class="film-card">
      <div class="film-poster">
        <img src="poster.jpg" alt="Film title" />
        <div class="film-overlay">
          <button class="info-btn">ⓘ</button>
        </div>
      </div>
      <div class="film-info">
        <h3>The Tree of Life</h3>
        <p class="director">Terrence Malick</p>
        <span class="year">2011</span>
      </div>
    </article>
  </div>
</section>
```

---

## ⚡ CONNECT PAGE

**Theme:** Digital/Neon  
**Subsections:** Contact Info, Form, Social

### Contact Layout
```html
<section class="connect-hero">
  <div class="hero-content">
    <h1 class="glitch-text">Let's Build Together</h1>
    <p class="hero-subtitle">
      Ready to create something meaningful? I'm always open to collaborations...
    </p>
    <div class="availability-status">
      <div class="status-indicator pulse"></div>
      <span>Currently available for projects</span>
    </div>
  </div>
</section>

<section class="contact-methods">
  <div class="contact-grid">
    <div class="contact-card">
      <div class="contact-icon">📧</div>
      <h3>Email</h3>
      <code class="contact-value">neev@edlove.org</code>
      <button class="copy-btn">Copy</button>
    </div>
    
    <div class="contact-card">
      <div class="contact-icon">💼</div>
      <h3>LinkedIn</h3>
      <code class="contact-value">@neevsk</code>
      <a href="#" class="connect-btn">Connect →</a>
    </div>
    
    <!-- More contact methods -->
  </div>
</section>

<section class="contact-form-section">
  <h2>Send a Message</h2>
  <form class="contact-form">
    <!-- Form fields -->
    <button type="submit" class="submit-btn">
      Send Message
      <span class="btn-glow"></span>
    </button>
  </form>
</section>

<section class="social-links-section">
  <h2>Find Me Online</h2>
  <div class="social-grid">
    <!-- Social links with icons -->
  </div>
</section>
```

---

## 📱 Responsive Layouts

### Mobile Adaptations (<640px)

**Home:**
- Single column door cards
- Stacked vertically
- Full-width cards

**All Sections:**
- Single column layouts
- Navigation becomes hamburger
- Reduced spacing
- Larger touch targets
- Simplified animations

**Projects:**
- Full-width cards
- Images above content
- Simplified metadata

**Library:**
- 2-column grid for books/films (small cards)
- 1-column for featured items

---

## 🎯 Layout Best Practices

### Content Width
```css
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.text-content {
  max-width: 65ch; /* Optimal reading width */
}
```

### Vertical Rhythm
```css
/* Consistent spacing between sections */
section {
  padding: var(--section-spacing, 96px) 0;
}

@media (max-width: 768px) {
  section {
    padding: var(--section-spacing-mobile, 64px) 0;
  }
}
```

### Grid Systems
```css
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}
```

---

*These layouts are blueprints. Adapt them to serve the content and the user, always.*
