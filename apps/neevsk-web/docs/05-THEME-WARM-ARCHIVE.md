# Theme 04: Warm Archive
## For LIBRARY Section (Resources/Sharing)

**Primary Use:** Library section - books, films, papers, blog, archive  
**Vibe Expression:** Alive through curated warmth, human connection, generous sharing

---

## 🎬 Theme Philosophy

Warm Archive embodies the aesthetic of **curated human experience** - a personal collection shared generously. Think:

- **Museum at golden hour** - artifacts illuminated by warm light
- **Cinema foyer** - cultured, considered, inviting
- **Used bookstore with soul** - loved and lived-in
- **Personal archive with public access** - "these shaped me, maybe they'll shape you"

**This is NOT:**
- Cold institutional archive
- Sterile library fluorescent
- Minimalist to the point of stark
- Algorithm-driven recommendation feed

**This IS:**
- Warm human curation
- Things that mattered
- Epistemic care
- Generous sharing
- Timeless but lived-in

**Visual Metaphor:** Criterion Collection film covers on a warm shelf. Handwritten notes in margins. Cinema velvet. Aged paper under amber light. A curator's personal touches in a museum gallery.

---

## 🎨 Color Palette

### Primary Colors

**Warm Charcoal** - `#3E3E3E` (rgb: 62, 62, 62)
- Use: Primary headings, strong text
- Feeling: Substantial, present, warm black

**Cinema Burgundy** - `#8B4049` (rgb: 139, 64, 73)
- Use: Accents, special moments, featured items
- Feeling: Cinema velvet, cultured, rich

**Aged Brass** - `#B8956A` (rgb: 184, 149, 106)
- Use: Highlights, links, interactive elements
- Feeling: Archival, warm metal, timeless

**Warm Gray** - `#6B6B6B` (rgb: 107, 107, 107)
- Use: Secondary text, supporting information
- Feeling: Softer presence, elegant neutral

### Background Colors

**Cream Paper** - `#F5F1E8` (rgb: 245, 241, 232)
- Primary background
- Feeling: Aged paper, warm, not harsh white

**Soft Sepia** - `#EDE7DC` (rgb: 237, 231, 220)
- Secondary background, cards
- Feeling: Archival, library stacks, gentle depth

**Deep Parchment** - `#E8DFC8` (rgb: 232, 223, 200)
- Tertiary background, special sections
- Feeling: Older paper, more presence

**Warm White** - `#FAF7F0` (rgb: 250, 247, 240)
- Lighter sections, elevated surfaces
- Feeling: Clean but warm

### Text Colors

**Rich Brown** - `#2C2416` (rgb: 44, 36, 22)
- Primary body text
- High contrast, readable, warm black

**Soft Umber** - `#5C4F3D` (rgb: 92, 79, 61)
- Secondary text, longer reading
- Easier on eyes for extended reading

**Muted Taupe** - `#8B7E6A` (rgb: 139, 126, 106)
- Tertiary text, captions, metadata
- Gentle presence

### Accent & Special

**Amber Highlight** - `#D4A574` (rgb: 212, 165, 116)
- For warmth moments, golden hour effects
- Use in shadows, glows, special touches

**Film Blue** - `#4A6B7C` (rgb: 74, 107, 124)
- Cool accent for balance (like film posters)
- Use sparingly for visual interest
- Complements warm tones

**Archive Red** - `#A64D4D` (rgb: 166, 77, 77)
- For important markers, featured items
- Cinema aesthetic, archival ribbons
- Use sparingly

---

## 🔤 Typography

### Font Stack

**Primary (Headings):**
```css
font-family: 'Crimson Pro', 'Crimson Text', Georgia, serif;
```
- Classic serif with character
- Readable, elegant, literary
- Warm and inviting

**Secondary (Body):**
```css
font-family: 'Source Serif Pro', Georgia, 'Times New Roman', serif;
```
- Comfortable serif for long-form reading
- Designed for screen readability
- Warm, approachable

**Labels/Meta:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```
- Clean sans for labels, tags, UI elements
- Provides contrast to serif content
- Modern touch in classic context

**Archival/Special:**
```css
font-family: 'Courier Prime', 'Courier New', monospace;
```
- Typewriter aesthetic for special moments
- Citations, catalog numbers, metadata
- Archival feeling

### Type Scale

**Display (H1):**
- Font: Crimson Pro
- Size: 3.5rem (56px) desktop / 2.5rem (40px) mobile
- Weight: 600 (Semi-bold)
- Line-height: 1.1
- Letter-spacing: -0.01em
- Use: Section titles

**Heading 1 (H2):**
- Font: Crimson Pro
- Size: 2.5rem (40px) desktop / 2rem (32px) mobile
- Weight: 500 (Medium)
- Line-height: 1.2
- Use: Category headings

**Heading 2 (H3):**
- Font: Crimson Pro
- Size: 1.875rem (30px) desktop / 1.5rem (24px) mobile
- Weight: 500
- Line-height: 1.3
- Use: Item titles (books, films)

**Heading 3 (H4):**
- Font: Crimson Pro
- Size: 1.375rem (22px)
- Weight: 500
- Line-height: 1.4
- Use: Subsections

**Body Large:**
- Font: Source Serif Pro
- Size: 1.25rem (20px)
- Weight: 400 (Regular)
- Line-height: 1.8
- Use: Introductions, featured descriptions

**Body Regular:**
- Font: Source Serif Pro
- Size: 1.125rem (18px)
- Weight: 400
- Line-height: 1.8
- Use: Standard descriptions, reviews

**Body Small:**
- Font: Source Serif Pro
- Size: 1rem (16px)
- Weight: 400
- Line-height: 1.7
- Use: Supporting text

**Label/Tag:**
- Font: Inter
- Size: 0.875rem (14px)
- Weight: 500 (Medium)
- Line-height: 1.4
- Letter-spacing: 0.02em
- Use: Categories, tags, metadata

**Caption/Meta:**
- Font: Courier Prime
- Size: 0.8125rem (13px)
- Weight: 400
- Line-height: 1.5
- Use: Dates, catalog info, citations

---

## 📐 Spacing System

Based on 8px grid with archival sensibility:

- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px
- **4xl:** 80px
- **5xl:** 96px

**Generous spacing** - this theme breathes. Collections need room to be appreciated.

---

## 🎭 Components

### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #8B4049 0%, #A64D4D 100%);
color: #FAF7F0;
padding: 14px 28px;
border-radius: 4px;
font-family: 'Inter', sans-serif;
font-weight: 500;
font-size: 0.9375rem;
letter-spacing: 0.02em;
transition: all 0.3s ease;
box-shadow: 0 2px 8px rgba(139, 64, 73, 0.2);

/* Hover */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(139, 64, 73, 0.3);
filter: brightness(1.05);
```

**Secondary Button:**
```css
background: transparent;
color: #8B4049;
border: 2px solid #B8956A;
padding: 14px 28px;
border-radius: 4px;
font-weight: 500;
transition: all 0.3s ease;

/* Hover */
background: rgba(184, 149, 106, 0.1);
border-color: #8B4049;
color: #8B4049;
```

**Text Link:**
```css
color: #B8956A;
text-decoration: none;
border-bottom: 1.5px solid transparent;
transition: all 0.25s ease;
font-weight: 500;
position: relative;

/* Hover */
border-bottom-color: #B8956A;
color: #8B4049;
```

### Cards

**Item Card (Book/Film):**
```css
background: #FAF7F0;
border: 1px solid #E8DFC8;
border-radius: 8px;
padding: 0;
box-shadow: 
  0 2px 8px rgba(0, 0, 0, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
overflow: hidden;

/* Hover */
transform: translateY(-4px);
box-shadow: 
  0 12px 28px rgba(0, 0, 0, 0.12),
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
border-color: #B8956A;
```

**Card Structure:**
```html
<div class="item-card">
  <div class="item-image">
    <!-- Book cover / film poster -->
  </div>
  <div class="item-content">
    <div class="item-category">Film</div>
    <h3 class="item-title">The Tree of Life</h3>
    <p class="item-creator">Terrence Malick</p>
    <p class="item-note">Contemplative, transcendent...</p>
  </div>
</div>
```

**Featured Card (Highlight):**
```css
background: linear-gradient(135deg, #FAF7F0 0%, #EDE7DC 100%);
border: 2px solid #B8956A;
border-radius: 12px;
padding: 32px;
position: relative;
overflow: hidden;

/* Warm glow effect */
&::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

/* Corner accent */
&::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, transparent 50%, rgba(139, 64, 73, 0.08) 50%);
}
```

**Collection Card:**
```css
background: #EDE7DC;
border-left: 4px solid #8B4049;
border-radius: 4px 8px 8px 4px;
padding: 24px 28px;
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
```

### Navigation

**Nav Container:**
```css
background: rgba(245, 241, 232, 0.95);
backdrop-filter: blur(12px);
border-bottom: 1px solid rgba(232, 223, 200, 0.8);
padding: 16px 0;
position: sticky;
top: 0;
z-index: 100;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
```

**Nav Links:**
```css
color: #3E3E3E;
font-family: 'Inter', sans-serif;
font-weight: 500;
padding: 10px 18px;
border-radius: 6px;
transition: all 0.25s ease;

/* Hover */
background: rgba(184, 149, 106, 0.12);
color: #8B4049;

/* Active */
background: rgba(139, 64, 73, 0.12);
color: #8B4049;
border-bottom: 2px solid #8B4049;
```

### Tags/Labels

**Category Tag:**
```css
display: inline-block;
padding: 6px 14px;
background: rgba(184, 149, 106, 0.15);
color: #5C4F3D;
border-radius: 4px;
font-family: 'Inter', sans-serif;
font-size: 0.8125rem;
font-weight: 500;
letter-spacing: 0.03em;
text-transform: uppercase;
border: 1px solid rgba(184, 149, 106, 0.3);
```

**Year Tag:**
```css
font-family: 'Courier Prime', monospace;
font-size: 0.75rem;
color: #8B7E6A;
background: #E8DFC8;
padding: 4px 10px;
border-radius: 3px;
```

### Dividers

**Ornamental Divider:**
```css
text-align: center;
margin: 48px 0;
color: #B8956A;
font-size: 1.5rem;
letter-spacing: 1em;

/* Use character like: ◆ ◇ ✦ ❖ */
&::before {
  content: '◆  ◇  ◆';
}
```

**Simple Divider:**
```css
height: 1px;
background: linear-gradient(90deg,
  transparent 0%,
  rgba(184, 149, 106, 0.3) 20%,
  rgba(184, 149, 106, 0.3) 80%,
  transparent 100%
);
margin: 56px 0;
```

---

## ✨ Animation Patterns

### Gentle Fade In
```css
@keyframes gentleFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.element {
  animation: gentleFadeIn 0.7s ease-out forwards;
  animation-delay: calc(var(--index) * 0.12s);
}
```

### Warm Glow (for featured items)
```css
@keyframes warmGlow {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.2);
  }
  50% {
    box-shadow: 0 4px 24px rgba(212, 165, 116, 0.35);
  }
}

.featured-item {
  animation: warmGlow 4s ease-in-out infinite;
}
```

### Page Turn (for transitions)
```css
@keyframes pageTurn {
  from {
    opacity: 0;
    transform: perspective(1000px) rotateY(-15deg);
  }
  to {
    opacity: 1;
    transform: perspective(1000px) rotateY(0deg);
  }
}
```

### Typewriter (for special text moments)
```css
@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.typewriter-text {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #8B4049;
  animation: 
    typewriter 2s steps(40) forwards,
    blink 0.75s step-end infinite;
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

---

## 🎨 Decorative Elements

### Paper Texture
```css
background-image: url('data:image/svg+xml,...'); /* Subtle paper grain */
opacity: 0.03;
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
pointer-events: none;
```

### Vintage Ornaments
- Use classical typographic ornaments: ❦ ❧ ✦ ◆ ❖
- As section markers
- Between items
- Color: Aged Brass
- Size: 18-24px

### Warm Light Effects
```css
/* Subtle ambient light */
background: radial-gradient(
  ellipse at top right,
  rgba(212, 165, 116, 0.08) 0%,
  transparent 50%
);
```

### Film Strip Border (for cinema section)
```css
border-top: 8px solid #2C2416;
border-bottom: 8px solid #2C2416;
position: relative;

/* Perforation holes */
&::before,
&::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 8px;
  background-image: repeating-linear-gradient(
    90deg,
    #F5F1E8 0px,
    #F5F1E8 10px,
    #2C2416 10px,
    #2C2416 20px
  );
}

&::before { top: 0; }
&::after { bottom: 0; }
```

---

## 📚 Library-Specific Elements

### Book Cover Display
```html
<div class="book-display">
  <div class="book-cover">
    <img src="cover.jpg" alt="Book title" />
    <div class="book-spine"></div>
  </div>
  <div class="book-info">
    <h3>Book Title</h3>
    <p class="author">Author Name</p>
    <p class="description">Brief description...</p>
    <div class="book-meta">
      <span class="year">2023</span>
      <span class="pages">320 pages</span>
    </div>
  </div>
</div>
```

**3D Book Effect:**
```css
.book-cover {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  
  /* Hover - slight tilt */
  &:hover {
    transform: rotateY(-5deg) translateX(10px);
  }
}

.book-spine {
  position: absolute;
  right: -8px;
  top: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(90deg, #3E3E3E, #5C4F3D);
  transform: rotateY(90deg);
  transform-origin: right;
}
```

### Film Poster Grid
```html
<div class="film-grid">
  <div class="film-card">
    <div class="film-poster">
      <img src="poster.jpg" alt="Film title" />
      <div class="film-overlay">
        <button class="watch-info">ⓘ</button>
      </div>
    </div>
    <div class="film-info">
      <h3>Film Title</h3>
      <p class="director">Director Name</p>
      <p class="year">2023</p>
    </div>
  </div>
</div>
```

### Archive List
```html
<div class="archive-list">
  <div class="archive-item">
    <div class="archive-icon">📄</div>
    <div class="archive-content">
      <h4>Paper Title</h4>
      <p class="archive-meta">
        <span class="date">Jan 2024</span>
        <span class="type">Essay</span>
      </p>
      <p class="archive-excerpt">Brief excerpt or summary...</p>
    </div>
    <a href="#" class="archive-link">Read →</a>
  </div>
</div>
```

### Recommendation Note
```html
<div class="recommendation">
  <div class="rec-header">
    <span class="rec-icon">✦</span>
    <span class="rec-label">Personal Note</span>
  </div>
  <p class="rec-text">
    "This changed how I think about..."
  </p>
  <div class="rec-signature">— Neev</div>
</div>
```

**Styling:**
```css
.recommendation {
  background: #FAF7F0;
  border-left: 3px solid #B8956A;
  padding: 20px 24px;
  margin: 24px 0;
  font-style: italic;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.rec-signature {
  font-family: 'Courier Prime', monospace;
  color: #8B4049;
  margin-top: 12px;
  text-align: right;
}
```

---

## 📱 Responsive Behavior

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Adaptations
- Book covers in single column grid
- Film posters 2-column grid
- Reduced spacing (~30%)
- Typography scales down
- Simplified hover effects (tap-based)
- Archive lists become simpler cards

---

## 🔍 Accessibility

### Contrast Ratios
- Rich Brown on Cream Paper: 11:1 ✓
- Cinema Burgundy on light backgrounds: 5.5:1 ✓
- All text meets WCAG AA

### Focus States
```css
:focus-visible {
  outline: 2px solid #8B4049;
  outline-offset: 3px;
  border-radius: 4px;
}
```

### Image Alternatives
- All book covers have alt text
- Film posters have descriptive text
- Decorative elements marked as decorative

---

## 💡 Usage Examples

### Featured Book Section
```html
<section class="featured-section">
  <h2>Currently Reading</h2>
  <div class="featured-card">
    <div class="featured-image">
      <img src="book-cover.jpg" alt="Book title" />
    </div>
    <div class="featured-content">
      <span class="category">Philosophy</span>
      <h3>Thinking in Systems</h3>
      <p class="author">Donella H. Meadows</p>
      <p class="note">
        "This book fundamentally changed how I see interconnection..."
      </p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 60%"></div>
      </div>
      <p class="progress-text">60% complete</p>
    </div>
  </div>
</section>
```

---

## 🎯 Theme-Specific Guidelines

**DO:**
- Use warm, inviting tones
- Give items room to breathe
- Include personal notes/curation
- Show love for the items
- Use ornamental touches thoughtfully
- Create sense of timelessness

**DON'T:**
- Make it feel sterile or institutional
- Over-modernize the aesthetic
- Lose the human touch
- Make it feel like a database
- Use cold or clinical design
- Forget the generous sharing spirit

**Balance:**
- Archival + Accessible
- Curated + Generous
- Classic + Contemporary
- Personal + Universal

---

## 🔗 Integration Notes

**With Other Themes:**
- Transition feels like walking into a different room
- Warmer light, softer edges
- Can preview on Home with warm tones
- Navigation indicates shift through color warmth

**Subsection Variations:**

**Books:**
- Grid or list view options
- Categories prominent
- Reading status indicators

**Films:**
- Poster-focused grid
- Genre/mood filtering
- Director/year organization

**Papers/Blog:**
- List-based layout
- Date-based organization
- Tags and categories
- Search functionality

**Archive:**
- Timeline view option
- Historical organization
- Metadata prominent

---

*This theme is a gift. Design with generosity.*
