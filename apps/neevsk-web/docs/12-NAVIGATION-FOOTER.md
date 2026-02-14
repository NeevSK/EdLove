# Navigation & Footer System
## Theme-Aware, Liquid, Magical

**Version:** 1.0  
**For:** NeevSK Digital Home  
**Philosophy:** Navigation that **transforms** with each theme, revealing subsections like water flowing

---

## 🧭 Navigation Philosophy

Navigation isn't just a menu. It's a **living element** that:
- **Morphs** with each theme (color, physics, behavior)
- **Reveals** subsections fluidly on hover
- **Responds** to user presence magnetically
- **Breathes** with the section you're in
- **Remembers** where you came from

**The Principle:** Navigation should feel like **part of the theme**, not separate from it.

---

## 🎨 Top Navigation System

### Base Structure

```html
<nav class="site-nav" data-current-theme="nature">
  <div class="nav-container">
    <!-- Logo/Name -->
    <a href="/" class="nav-brand">
      <span class="brand-name">Neev SK</span>
      <span class="brand-pulse"></span>
    </a>
    
    <!-- Main Navigation -->
    <ul class="nav-menu">
      <li class="nav-item" data-theme="nature">
        <a href="/personal" class="nav-link">
          <span class="link-text">Personal</span>
          <span class="link-glow"></span>
        </a>
        <!-- Liquid Dropdown -->
        <div class="nav-dropdown">
          <a href="/personal/hall-of-flame" class="dropdown-item">
            <span class="item-icon">🔥</span>
            <span class="item-text">Hall of Flame</span>
          </a>
          <a href="/personal/journey" class="dropdown-item">
            <span class="item-icon">🌱</span>
            <span class="item-text">Journey</span>
          </a>
        </div>
      </li>
      
      <li class="nav-item" data-theme="twilight">
        <a href="/intellectual" class="nav-link">
          <span class="link-text">Intellectual</span>
          <span class="link-glow"></span>
        </a>
        <div class="nav-dropdown">
          <a href="/intellectual/lineage" class="dropdown-item">
            <span class="item-icon">🌌</span>
            <span class="item-text">Philosophical Lineage</span>
          </a>
          <a href="/intellectual/frameworks" class="dropdown-item">
            <span class="item-icon">🔄</span>
            <span class="item-text">Frameworks</span>
          </a>
          <a href="/intellectual/epistemic" class="dropdown-item">
            <span class="item-icon">💭</span>
            <span class="item-text">Epistemic Work</span>
          </a>
        </div>
      </li>
      
      <li class="nav-item" data-theme="light-tech">
        <a href="/professional" class="nav-link">
          <span class="link-text">Professional</span>
          <span class="link-glow"></span>
        </a>
        <div class="nav-dropdown">
          <a href="/professional/projects" class="dropdown-item">
            <span class="item-icon">🚀</span>
            <span class="item-text">Projects</span>
          </a>
          <a href="/professional/cv" class="dropdown-item">
            <span class="item-icon">📄</span>
            <span class="item-text">CV</span>
          </a>
        </div>
      </li>
      
      <li class="nav-item" data-theme="warm-archive">
        <a href="/library" class="nav-link">
          <span class="link-text">Library</span>
          <span class="link-glow"></span>
        </a>
        <div class="nav-dropdown">
          <a href="/library/books" class="dropdown-item">
            <span class="item-icon">📚</span>
            <span class="item-text">Books</span>
          </a>
          <a href="/library/films" class="dropdown-item">
            <span class="item-icon">🎬</span>
            <span class="item-text">Films</span>
          </a>
          <a href="/library/writing" class="dropdown-item">
            <span class="item-icon">✍️</span>
            <span class="item-text">Writing</span>
          </a>
          <a href="/library/archive" class="dropdown-item">
            <span class="item-icon">📜</span>
            <span class="item-text">Archive</span>
          </a>
        </div>
      </li>
      
      <li class="nav-item" data-theme="digital-neon">
        <a href="/connect" class="nav-link">
          <span class="link-text">Connect</span>
          <span class="link-glow"></span>
        </a>
        <div class="nav-dropdown">
          <a href="/connect#contact" class="dropdown-item">
            <span class="item-icon">📧</span>
            <span class="item-text">Contact</span>
          </a>
          <a href="/connect#collaborate" class="dropdown-item">
            <span class="item-icon">🤝</span>
            <span class="item-text">Collaborate</span>
          </a>
        </div>
      </li>
    </ul>
    
    <!-- Mobile Toggle -->
    <button class="nav-toggle" aria-label="Menu">
      <span class="toggle-line"></span>
      <span class="toggle-line"></span>
      <span class="toggle-line"></span>
    </button>
  </div>
  
  <!-- Theme Indicator (subtle) -->
  <div class="theme-indicator"></div>
</nav>
```

---

## 🎨 Theme-Morphing Styles

### Base Navigation (All Themes)

```css
.site-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid transparent;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.nav-menu {
  display: flex;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.link-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
```

### Nature Theme Nav

```css
.site-nav[data-current-theme="nature"] {
  background: rgba(250, 248, 243, 0.95);
  border-bottom-color: rgba(232, 237, 231, 0.8);
}

.site-nav[data-current-theme="nature"] .nav-link {
  color: #2C2C2C;
}

.site-nav[data-current-theme="nature"] .nav-link:hover {
  background: rgba(74, 155, 155, 0.1);
  color: #4A9B9B;
  transform: translateY(-2px);
}

.site-nav[data-current-theme="nature"] .nav-link:hover .link-glow {
  opacity: 1;
  background: radial-gradient(circle, rgba(74, 155, 155, 0.15), transparent);
}

.site-nav[data-current-theme="nature"] .nav-link.active {
  background: rgba(74, 155, 155, 0.15);
  color: #4A9B9B;
}

/* Organic pulse on brand */
.site-nav[data-current-theme="nature"] .brand-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #4A9B9B;
  border-radius: 50%;
  animation: organicPulse 3s ease-in-out infinite;
}

@keyframes organicPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(74, 155, 155, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(74, 155, 155, 0);
  }
}
```

### Twilight/Systems Theme Nav

```css
.site-nav[data-current-theme="twilight"] {
  background: rgba(30, 33, 40, 0.95);
  border-bottom-color: rgba(92, 82, 127, 0.3);
}

.site-nav[data-current-theme="twilight"] .nav-link {
  color: #F5F3ED;
}

.site-nav[data-current-theme="twilight"] .nav-link:hover {
  background: rgba(92, 82, 127, 0.2);
  color: #6C8EAD;
}

.site-nav[data-current-theme="twilight"] .nav-link:hover .link-glow {
  opacity: 1;
  background: radial-gradient(circle, rgba(108, 142, 173, 0.2), transparent);
}

/* Network connection effect */
.site-nav[data-current-theme="twilight"] .nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #5C527F, #6C8EAD);
  transition: width 0.4s ease;
}

.site-nav[data-current-theme="twilight"] .nav-link:hover::before {
  width: 100%;
}
```

### Light-Tech Theme Nav

```css
.site-nav[data-current-theme="light-tech"] {
  background: rgba(255, 255, 255, 0.95);
  border-bottom-color: rgba(229, 231, 235, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.site-nav[data-current-theme="light-tech"] .nav-link {
  color: #374151;
}

.site-nav[data-current-theme="light-tech"] .nav-link:hover {
  background: #F0F7FF;
  color: #4F7CAC;
  transform: translateY(-1px);
}

.site-nav[data-current-theme="light-tech"] .nav-link.active {
  background: #F0F7FF;
  color: #4F7CAC;
  font-weight: 600;
}
```

### Warm Archive Theme Nav

```css
.site-nav[data-current-theme="warm-archive"] {
  background: rgba(245, 241, 232, 0.95);
  border-bottom-color: rgba(232, 223, 200, 0.8);
}

.site-nav[data-current-theme="warm-archive"] .nav-link {
  color: #3E3E3E;
  font-family: 'Inter', sans-serif;
}

.site-nav[data-current-theme="warm-archive"] .nav-link:hover {
  background: rgba(184, 149, 106, 0.12);
  color: #8B4049;
}

/* Vintage underline */
.site-nav[data-current-theme="warm-archive"] .nav-link::after {
  content: '';
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 8px;
  height: 1px;
  background: #B8956A;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.site-nav[data-current-theme="warm-archive"] .nav-link:hover::after {
  transform: scaleX(1);
}
```

### Digital/Neon Theme Nav

```css
.site-nav[data-current-theme="digital-neon"] {
  background: rgba(10, 14, 26, 0.95);
  border-bottom-color: rgba(0, 217, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.site-nav[data-current-theme="digital-neon"] .nav-link {
  color: #E4E4E7;
}

.site-nav[data-current-theme="digital-neon"] .nav-link:hover {
  color: #00D9FF;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.5);
}

.site-nav[data-current-theme="digital-neon"] .nav-link.active {
  background: rgba(0, 217, 255, 0.1);
  color: #00D9FF;
}

/* Neon glow effect */
.site-nav[data-current-theme="digital-neon"] .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #00D9FF;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.8);
}
```

---

## 💧 Liquid Dropdown Menus

### Dropdown Structure & Behavior

```css
.nav-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  padding: 12px;
  border-radius: 12px;
  opacity: 0;
  visibility: hidden;
  transform-origin: top center;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  pointer-events: none;
  z-index: 100;
}

/* Liquid reveal on hover */
.nav-item:hover .nav-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  pointer-events: all;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  transition: left 0.3s ease;
  pointer-events: none;
}

.dropdown-item:hover::before {
  left: 0;
}

.item-icon {
  font-size: 1.25rem;
  transition: transform 0.25s ease;
}

.dropdown-item:hover .item-icon {
  transform: scale(1.1) rotate(5deg);
}
```

### Theme-Specific Dropdowns

**Nature:**
```css
.site-nav[data-current-theme="nature"] .nav-dropdown {
  background: linear-gradient(135deg, #FAF8F3 0%, #E8EDE7 100%);
  border: 1px solid #E8EDE7;
  box-shadow: 
    0 12px 32px rgba(74, 155, 155, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.site-nav[data-current-theme="nature"] .dropdown-item {
  color: #2C2C2C;
}

.site-nav[data-current-theme="nature"] .dropdown-item:hover {
  background: rgba(74, 155, 155, 0.1);
  color: #4A9B9B;
}

.site-nav[data-current-theme="nature"] .dropdown-item::before {
  background: linear-gradient(90deg, transparent, rgba(74, 155, 155, 0.15), transparent);
}
```

**Twilight:**
```css
.site-nav[data-current-theme="twilight"] .nav-dropdown {
  background: linear-gradient(135deg, #2A2F3A 0%, #1E2128 100%);
  border: 1px solid rgba(92, 82, 127, 0.3);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(108, 142, 173, 0.1);
}

.site-nav[data-current-theme="twilight"] .dropdown-item {
  color: #F5F3ED;
}

.site-nav[data-current-theme="twilight"] .dropdown-item:hover {
  background: rgba(108, 142, 173, 0.15);
  color: #6C8EAD;
}
```

**Light-Tech:**
```css
.site-nav[data-current-theme="light-tech"] .nav-dropdown {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.site-nav[data-current-theme="light-tech"] .dropdown-item {
  color: #374151;
}

.site-nav[data-current-theme="light-tech"] .dropdown-item:hover {
  background: #F0F7FF;
  color: #4F7CAC;
}
```

**Warm Archive:**
```css
.site-nav[data-current-theme="warm-archive"] .nav-dropdown {
  background: linear-gradient(135deg, #FAF7F0 0%, #EDE7DC 100%);
  border: 2px solid #E8DFC8;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.site-nav[data-current-theme="warm-archive"] .dropdown-item {
  color: #2C2416;
}

.site-nav[data-current-theme="warm-archive"] .dropdown-item:hover {
  background: rgba(184, 149, 106, 0.15);
  color: #8B4049;
}
```

**Digital/Neon:**
```css
.site-nav[data-current-theme="digital-neon"] .nav-dropdown {
  background: linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  box-shadow: 
    0 12px 32px rgba(0, 217, 255, 0.2),
    inset 0 1px 0 rgba(0, 217, 255, 0.1);
}

.site-nav[data-current-theme="digital-neon"] .dropdown-item {
  color: #E4E4E7;
}

.site-nav[data-current-theme="digital-neon"] .dropdown-item:hover {
  background: rgba(0, 217, 255, 0.15);
  color: #00D9FF;
  box-shadow: 0 0 16px rgba(0, 217, 255, 0.2);
}
```

---

## 🧲 Magnetic Cursor Effect

```javascript
class MagneticNav {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-link');
    this.init();
  }
  
  init() {
    this.navLinks.forEach(link => {
      link.addEventListener('mousemove', (e) => this.magnetize(e, link));
      link.addEventListener('mouseleave', (e) => this.reset(link));
    });
  }
  
  magnetize(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const strength = 0.3; // Magnetic strength
    
    element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }
  
  reset(element) {
    element.style.transform = 'translate(0, 0)';
  }
}

// Initialize
new MagneticNav();
```

---

## 📱 Mobile Navigation

### Mobile Menu Structure

```html
<div class="mobile-menu" data-open="false">
  <div class="mobile-menu-overlay"></div>
  <div class="mobile-menu-content">
    <div class="mobile-menu-header">
      <span class="mobile-brand">Neev SK</span>
      <button class="mobile-close">×</button>
    </div>
    
    <nav class="mobile-nav">
      <!-- Accordion-style menu -->
      <div class="mobile-section">
        <button class="mobile-section-btn" data-theme="nature">
          <span>Personal</span>
          <span class="chevron">›</span>
        </button>
        <div class="mobile-subsections">
          <a href="/personal/hall-of-flame">🔥 Hall of Flame</a>
          <a href="/personal/journey">🌱 Journey</a>
        </div>
      </div>
      
      <!-- Repeat for other sections -->
    </nav>
  </div>
</div>
```

### Mobile Menu Behavior

```javascript
class MobileMenu {
  constructor() {
    this.menu = document.querySelector('.mobile-menu');
    this.toggle = document.querySelector('.nav-toggle');
    this.close = document.querySelector('.mobile-close');
    this.overlay = document.querySelector('.mobile-menu-overlay');
    this.sections = document.querySelectorAll('.mobile-section-btn');
    
    this.init();
  }
  
  init() {
    this.toggle.addEventListener('click', () => this.open());
    this.close.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    
    this.sections.forEach(btn => {
      btn.addEventListener('click', () => this.toggleSection(btn));
    });
  }
  
  open() {
    this.menu.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    
    // Animate in
    gsap.to('.mobile-menu-content', {
      x: 0,
      duration: 0.4,
      ease: 'power3.out'
    });
  }
  
  close() {
    gsap.to('.mobile-menu-content', {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in',
      onComplete: () => {
        this.menu.setAttribute('data-open', 'false');
        document.body.style.overflow = '';
      }
    });
  }
  
  toggleSection(btn) {
    const subsections = btn.nextElementSibling;
    const isOpen = subsections.getAttribute('data-open') === 'true';
    
    // Close all others
    document.querySelectorAll('.mobile-subsections').forEach(s => {
      if (s !== subsections) {
        s.setAttribute('data-open', 'false');
        gsap.to(s, { height: 0, duration: 0.3 });
      }
    });
    
    // Toggle this one
    if (isOpen) {
      gsap.to(subsections, { height: 0, duration: 0.3 });
      subsections.setAttribute('data-open', 'false');
    } else {
      gsap.set(subsections, { height: 'auto' });
      gsap.from(subsections, { height: 0, duration: 0.3 });
      subsections.setAttribute('data-open', 'true');
    }
  }
}
```

---

## 🦶 Footer System

### Footer Structure

```html
<footer class="site-footer" data-current-theme="nature">
  <div class="footer-container">
    <!-- Main Footer Content -->
    <div class="footer-main">
      <div class="footer-brand">
        <h3>Neev SK</h3>
        <p class="footer-tagline">Existential Cyberneticist</p>
        <p class="footer-mission">
          Building education transformation ecosystems through systems thinking and human-centered design.
        </p>
      </div>
      
      <div class="footer-links">
        <div class="footer-column">
          <h4>Explore</h4>
          <a href="/personal">Personal</a>
          <a href="/intellectual">Intellectual</a>
          <a href="/professional">Professional</a>
        </div>
        
        <div class="footer-column">
          <h4>Discover</h4>
          <a href="/library">Library</a>
          <a href="/connect">Connect</a>
        </div>
        
        <div class="footer-column">
          <h4>Projects</h4>
          <a href="/professional/projects/gurudevi">Gurudevi</a>
          <a href="/professional/projects/edlove">EdLove</a>
          <a href="/professional/projects/intuitui">Intuitui Labs</a>
        </div>
      </div>
      
      <div class="footer-social">
        <h4>Connect</h4>
        <div class="social-links">
          <a href="#" class="social-link" aria-label="LinkedIn">in</a>
          <a href="#" class="social-link" aria-label="GitHub">gh</a>
          <a href="#" class="social-link" aria-label="Twitter">𝕏</a>
        </div>
      </div>
    </div>
    
    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <p class="footer-copyright">
        © 2026 Neev SK. Built with love and systems thinking.
      </p>
      <div class="footer-meta">
        <a href="#" class="footer-meta-link">Privacy</a>
        <a href="#" class="footer-meta-link">Accessibility</a>
        <button class="theme-reset">Reset Theme</button>
      </div>
    </div>
  </div>
  
  <!-- Theme Decoration -->
  <div class="footer-decoration"></div>
</footer>
```

### Theme-Aware Footer Styles

**Nature Footer:**
```css
.site-footer[data-current-theme="nature"] {
  background: linear-gradient(180deg, #FAF8F3 0%, #E8EDE7 100%);
  border-top: 2px solid rgba(74, 155, 155, 0.2);
  color: #2C2C2C;
}

.site-footer[data-current-theme="nature"] .footer-decoration {
  height: 4px;
  background: linear-gradient(90deg, 
    #4A9B9B 0%, 
    #5C7C5D 50%, 
    #4A9B9B 100%
  );
  animation: flowNature 8s ease-in-out infinite;
}

@keyframes flowNature {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

**Twilight Footer:**
```css
.site-footer[data-current-theme="twilight"] {
  background: linear-gradient(180deg, #1E2128 0%, #0F1419 100%);
  border-top: 1px solid rgba(92, 82, 127, 0.3);
  color: #F5F3ED;
}

.site-footer[data-current-theme="twilight"] .footer-decoration {
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    rgba(108, 142, 173, 0.5),
    transparent
  );
  box-shadow: 0 0 20px rgba(108, 142, 173, 0.3);
}
```

**Light-Tech Footer:**
```css
.site-footer[data-current-theme="light-tech"] {
  background: #FFFFFF;
  border-top: 1px solid #E5E7EB;
  color: #374151;
}

.site-footer[data-current-theme="light-tech"] .footer-decoration {
  height: 3px;
  background: linear-gradient(90deg, #4F7CAC, #5DADE2, #4F7CAC);
  background-size: 200% 100%;
  animation: flowTech 3s linear infinite;
}

@keyframes flowTech {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
```

**Warm Archive Footer:**
```css
.site-footer[data-current-theme="warm-archive"] {
  background: linear-gradient(180deg, #F5F1E8 0%, #EDE7DC 100%);
  border-top: 2px solid #E8DFC8;
  color: #2C2416;
}

.site-footer[data-current-theme="warm-archive"] .footer-decoration {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    #B8956A,
    #B8956A 10px,
    transparent 10px,
    transparent 20px
  );
  opacity: 0.4;
}
```

**Digital/Neon Footer:**
```css
.site-footer[data-current-theme="digital-neon"] {
  background: linear-gradient(180deg, #0F1419 0%, #0A0E1A 100%);
  border-top: 1px solid rgba(0, 217, 255, 0.2);
  color: #E4E4E7;
}

.site-footer[data-current-theme="digital-neon"] .footer-decoration {
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    #00D9FF,
    #B794F6,
    #FF3D9A,
    transparent
  );
  animation: neonScan 4s linear infinite;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
}

@keyframes neonScan {
  0% { background-position: -200% 50%; }
  100% { background-position: 200% 50%; }
}
```

---

## 🎯 Breadcrumb Navigation (Optional)

```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    <li class="breadcrumb-item">
      <a href="/">Home</a>
    </li>
    <li class="breadcrumb-separator">›</li>
    <li class="breadcrumb-item">
      <a href="/personal">Personal</a>
    </li>
    <li class="breadcrumb-separator">›</li>
    <li class="breadcrumb-item active" aria-current="page">
      Hall of Flame
    </li>
  </ol>
</nav>
```

```css
.breadcrumbs {
  padding: 16px 24px;
  background: rgba(var(--color-background-rgb), 0.5);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  font-size: 0.875rem;
}

.breadcrumb-item a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-item a:hover {
  color: var(--color-primary);
}

.breadcrumb-item.active {
  color: var(--color-text);
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--color-text-tertiary);
}
```

---

## ⚡ JavaScript - Theme-Aware Navigation

```javascript
class ThemeAwareNav {
  constructor() {
    this.nav = document.querySelector('.site-nav');
    this.footer = document.querySelector('.site-footer');
    this.currentTheme = 'home';
    
    this.init();
  }
  
  init() {
    // Detect current section
    this.detectTheme();
    
    // Update on scroll
    this.observeSections();
    
    // Update active links
    this.updateActiveLinks();
  }
  
  detectTheme() {
    const path = window.location.pathname;
    
    if (path.includes('/personal')) this.setTheme('nature');
    else if (path.includes('/intellectual')) this.setTheme('twilight');
    else if (path.includes('/professional')) this.setTheme('light-tech');
    else if (path.includes('/library')) this.setTheme('warm-archive');
    else if (path.includes('/connect')) this.setTheme('digital-neon');
    else this.setTheme('home');
  }
  
  setTheme(theme) {
    this.currentTheme = theme;
    this.nav.setAttribute('data-current-theme', theme);
    this.footer.setAttribute('data-current-theme', theme);
    
    // Smooth transition
    this.nav.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  }
  
  observeSections() {
    const sections = document.querySelectorAll('[data-theme-section]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const theme = entry.target.getAttribute('data-theme-section');
          if (theme) this.setTheme(theme);
        }
      });
    }, { threshold: 0.3 });
    
    sections.forEach(section => observer.observe(section));
  }
  
  updateActiveLinks() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  }
}

// Initialize
new ThemeAwareNav();
```

---

*Navigation and footer complete. Now let's create THE MAGIC...*
