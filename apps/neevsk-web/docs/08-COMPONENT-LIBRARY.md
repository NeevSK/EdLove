# Component Library
## Shared UI Components Across Themes

**Version:** 1.0  
**For:** NeevSK Digital Home

---

## 📦 Component Philosophy

This library contains **theme-agnostic component structures** that adapt to each theme's visual language. Each component has:
- **Structure** (HTML/semantic)
- **Behavior** (interactions)
- **Theme Variables** (styling applied per theme)

---

## 🎨 How Themes Apply to Components

Each theme document contains specific styling for these components. This document provides the **base structure and behavior**.

---

## 🧩 Core Components

### 1. Button Component

**Structure:**
```html
<button class="btn btn-{variant}" data-theme="{theme-name}">
  <span class="btn-content">Button Text</span>
  <span class="btn-icon">→</span> <!-- Optional -->
</button>
```

**Variants:**
- `btn-primary` - Main CTAs
- `btn-secondary` - Secondary actions
- `btn-ghost` - Subtle actions
- `btn-icon` - Icon-only

**States:**
- Default
- Hover
- Active/Pressed
- Focus
- Disabled
- Loading

**Behavior:**
```javascript
// Ripple effect on click (optional per theme)
// Loading state management
// Disabled state handling
```

**Theme-Specific Styling:**
- Nature: Organic shapes, warm colors, soft shadows
- Twilight/Systems: Structured, network-inspired
- Light-Tech: Clean gradients, precise shadows
- Warm Archive: Classic button with warm tones
- Digital/Neon: Glow effects, electric colors

---

### 2. Card Component

**Structure:**
```html
<article class="card card-{variant}" data-theme="{theme-name}">
  <div class="card-image">
    <!-- Optional image/visual -->
  </div>
  <div class="card-content">
    <div class="card-meta">
      <!-- Tags, date, status -->
    </div>
    <h3 class="card-title">Title</h3>
    <p class="card-description">Description...</p>
    <div class="card-footer">
      <!-- Actions, links -->
    </div>
  </div>
</article>
```

**Variants:**
- `card-default` - Standard card
- `card-feature` - Highlighted/featured content
- `card-minimal` - Reduced styling
- `card-interactive` - With hover states

**States:**
- Default
- Hover
- Active
- Loading
- Empty

---

### 3. Navigation Component

**Structure:**
```html
<nav class="site-nav" data-theme="{current-theme}">
  <div class="nav-container">
    <div class="nav-brand">
      <a href="/">Neev SK</a>
    </div>
    <div class="nav-links">
      <a href="/personal" class="nav-link" data-theme-hint="nature">Personal</a>
      <a href="/intellectual" class="nav-link" data-theme-hint="twilight">Intellectual</a>
      <a href="/professional" class="nav-link" data-theme-hint="light-tech">Professional</a>
      <a href="/library" class="nav-link" data-theme-hint="warm-archive">Library</a>
      <a href="/connect" class="nav-link" data-theme-hint="digital-neon">Connect</a>
    </div>
    <button class="nav-toggle" aria-label="Menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</nav>
```

**Behavior:**
- Sticky on scroll
- Mobile hamburger menu
- Theme transition hints on hover
- Active state shows current section
- Smooth theme transitions

---

### 4. Form Components

#### Input Field
```html
<div class="form-group">
  <label for="input-id" class="form-label">Label</label>
  <input 
    type="text" 
    id="input-id" 
    class="form-input"
    placeholder="Placeholder..."
    data-theme="{theme-name}"
  />
  <span class="form-hint">Helper text</span>
  <span class="form-error">Error message</span>
</div>
```

#### Text Area
```html
<div class="form-group">
  <label for="textarea-id" class="form-label">Label</label>
  <textarea 
    id="textarea-id" 
    class="form-textarea"
    rows="4"
    placeholder="Placeholder..."
    data-theme="{theme-name}"
  ></textarea>
</div>
```

#### Select/Dropdown
```html
<div class="form-group">
  <label for="select-id" class="form-label">Label</label>
  <select id="select-id" class="form-select" data-theme="{theme-name}">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</div>
```

**States:**
- Default
- Focus
- Filled
- Error
- Disabled
- Success

---

### 5. Tag/Badge Component

**Structure:**
```html
<span class="tag tag-{variant}" data-theme="{theme-name}">
  Tag Text
</span>
```

**Variants:**
- `tag-category` - Content categories
- `tag-status` - Status indicators
- `tag-skill` - Skills/competencies
- `tag-year` - Dates/years

---

### 6. Divider Component

**Structure:**
```html
<hr class="divider divider-{variant}" data-theme="{theme-name}" />
```

**Variants:**
- `divider-default` - Simple line
- `divider-gradient` - Gradient fade
- `divider-ornamental` - Decorative
- `divider-thick` - Emphasis

---

### 7. Modal/Dialog Component

**Structure:**
```html
<div class="modal" data-theme="{theme-name}">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">Title</h2>
      <button class="modal-close" aria-label="Close">×</button>
    </div>
    <div class="modal-body">
      <!-- Content -->
    </div>
    <div class="modal-footer">
      <!-- Actions -->
    </div>
  </div>
</div>
```

**Behavior:**
- Smooth fade in/out
- Focus trap
- Escape key to close
- Click overlay to close
- Scroll lock on body

---

### 8. Image Component

**Structure:**
```html
<figure class="image-container" data-theme="{theme-name}">
  <img 
    src="image.jpg" 
    alt="Description"
    class="responsive-image"
    loading="lazy"
  />
  <figcaption class="image-caption">Caption text</figcaption>
</figure>
```

**Variants:**
- `image-full` - Full width
- `image-contained` - Constrained size
- `image-rounded` - Rounded corners
- `image-circular` - Circular crop

---

### 9. List Component

**Structure:**
```html
<ul class="styled-list styled-list-{variant}" data-theme="{theme-name}">
  <li class="list-item">
    <span class="list-marker">•</span>
    <span class="list-content">List item</span>
  </li>
</ul>
```

**Variants:**
- `styled-list-default` - Standard bullets
- `styled-list-icons` - Icon markers
- `styled-list-numbered` - Numbered
- `styled-list-checklist` - Checkmarks

---

### 10. Alert/Notification Component

**Structure:**
```html
<div class="alert alert-{type}" data-theme="{theme-name}">
  <div class="alert-icon">
    <!-- Icon based on type -->
  </div>
  <div class="alert-content">
    <h4 class="alert-title">Title</h4>
    <p class="alert-message">Message</p>
  </div>
  <button class="alert-close">×</button>
</div>
```

**Types:**
- `alert-info` - Information
- `alert-success` - Success message
- `alert-warning` - Warning
- `alert-error` - Error

---

## 🎭 Interaction Patterns

### Hover States
All interactive elements should have hover states that:
- Provide clear feedback
- Are theme-appropriate
- Respond within 200ms
- Use hardware-accelerated properties (transform, opacity)

### Focus States
All focusable elements must:
- Have visible focus indicator
- Meet contrast requirements
- Use consistent focus styling per theme
- Support keyboard navigation

### Loading States
Components should handle loading:
- Skeleton screens for content
- Spinners for actions
- Progress indicators where appropriate
- Maintain layout (no jumping)

### Empty States
When no content exists:
- Show helpful empty state message
- Provide action to add content
- Maintain visual consistency
- Be theme-appropriate

---

## 📱 Responsive Patterns

### Breakpoint Behavior

**Mobile (< 640px):**
- Single column layouts
- Larger touch targets (48px minimum)
- Simplified interactions
- Bottom sheets instead of modals
- Collapsible sections

**Tablet (640px - 1024px):**
- 2-column layouts where appropriate
- Standard interactions
- Modals work normally
- Optimized for both orientations

**Desktop (> 1024px):**
- Multi-column layouts
- Rich interactions
- Hover states fully expressed
- Maximum readability width maintained

---

## ♿ Accessibility Requirements

### ARIA Labels
- All interactive elements have appropriate ARIA labels
- Role attributes where needed
- Live regions for dynamic content
- Hidden decorative elements

### Keyboard Navigation
- Tab order is logical
- All interactions keyboard-accessible
- Focus visible
- Escape key behavior consistent

### Screen Readers
- Semantic HTML used
- Alt text for images
- Labels for form fields
- Status announcements

### Color & Contrast
- Text meets WCAG AA (4.5:1)
- Large text meets 3:1
- Interactive elements distinguishable without color alone
- Focus indicators meet 3:1 against background

---

## 🔧 Implementation Notes

### CSS Custom Properties (Variables)

Each theme sets these variables:
```css
:root[data-theme="nature"] {
  --color-primary: #4A9B9B;
  --color-secondary: #5C7C5D;
  --color-accent: #F4A460;
  --color-background: #FAF8F3;
  --color-text: #2C2C2C;
  --spacing-unit: 8px;
  --border-radius: 8px;
  --transition-speed: 0.3s;
  /* etc. */
}
```

### Theme Switching
```javascript
function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  // Store preference
  localStorage.setItem('theme-preference', themeName);
}
```

### Component State Management
```javascript
// Example: Button loading state
class Button {
  setLoading(isLoading) {
    this.element.classList.toggle('is-loading', isLoading);
    this.element.disabled = isLoading;
  }
}
```

---

## 📊 Component Checklist

For each component implementation:

- [ ] HTML structure defined
- [ ] Base styles applied
- [ ] Theme variants styled
- [ ] All states handled
- [ ] Responsive behavior implemented
- [ ] Accessibility requirements met
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Loading states implemented
- [ ] Empty states designed
- [ ] Error states handled
- [ ] Animation smooth (60fps)
- [ ] Mobile optimized
- [ ] Cross-browser tested

---

## 🎨 Theme Integration Example

**Button in Nature Theme:**
```css
.btn[data-theme="nature"] {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: var(--color-background);
  border-radius: var(--border-radius);
  padding: 12px 24px;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 2px 8px rgba(74, 155, 155, 0.2);
}

.btn[data-theme="nature"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 155, 155, 0.3);
}
```

**Same Button in Digital/Neon Theme:**
```css
.btn[data-theme="digital-neon"] {
  background: linear-gradient(135deg, #FF3D9A 0%, #FF8A3D 100%);
  color: #FFFFFF;
  border-radius: 8px;
  padding: 14px 32px;
  border: none;
  box-shadow: 
    0 4px 16px rgba(255, 61, 154, 0.4),
    0 0 20px rgba(255, 61, 154, 0.2);
}

.btn[data-theme="digital-neon"]:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 24px rgba(255, 61, 154, 0.5),
    0 0 30px rgba(255, 61, 154, 0.3);
}
```

---

*These components are your building blocks. They adapt to each theme while maintaining structural consistency.*
