# Animation & Interaction Patterns
## Motion Design System

**Version:** 1.0  
**For:** NeevSK Digital Home

---

## 🎬 Animation Philosophy

**"Alive" doesn't mean constant movement. It means:**
- **Purposeful motion** - every animation has a reason
- **Theme-appropriate expression** - each theme has its own motion language
- **Performance-first** - 60fps minimum, respect reduced motion
- **Enhancing, not distracting** - motion supports content

---

## ⚙️ Core Animation Principles

### 1. Easing Functions

**Natural Easing (Nature theme):**
```css
--ease-natural: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy, organic */
--ease-breathe: cubic-bezier(0.4, 0, 0.2, 1); /* Smooth in/out */
```

**Precise Easing (Systems/Light-Tech):**
```css
--ease-precise: cubic-bezier(0.4, 0, 0.2, 1); /* Standard material */
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1); /* Quick start, smooth end */
```

**Electric Easing (Digital/Neon):**
```css
--ease-electric: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Snappy, energetic */
--ease-pulse: cubic-bezier(0.45, 0.05, 0.55, 0.95); /* Rhythmic */
```

**Warm Easing (Archive):**
```css
--ease-warm: cubic-bezier(0.33, 0, 0.2, 1); /* Gentle, comfortable */
--ease-page: cubic-bezier(0.6, 0, 0.4, 1); /* Like turning a page */
```

### 2. Duration Guidelines

**Quick (100-200ms):**
- Hover states
- Focus indicators
- Small UI changes
- Button presses

**Medium (300-400ms):**
- Card animations
- Modal open/close
- Dropdown menus
- Content reveals

**Slow (500-800ms):**
- Page transitions
- Large layout shifts
- Theme changes
- Section reveals

**Very Slow (1000ms+):**
- Background animations
- Ambient effects
- Decorative patterns

### 3. Stagger Patterns

```css
/* Stagger child elements */
.stagger-item {
  animation-delay: calc(var(--index) * 100ms);
}

/* For lists, cards, etc. */
```

---

## 🎨 Theme-Specific Motion Languages

### Nature Theme Motion

**Philosophy:** Organic flow, breathing, natural rhythm

**Entrance:**
```css
@keyframes fadeInUp-natural {
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
  animation: fadeInUp-natural 0.6s var(--ease-natural) forwards;
}
```

**Breathing Effect:**
```css
@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
}

.background-element {
  animation: breathe 8s var(--ease-breathe) infinite;
}
```

**Organic Hover:**
```css
.card:hover {
  transform: translateY(-4px) scale(1.01);
  transition: all 0.4s var(--ease-natural);
}
```

---

### Twilight/Systems Theme Motion

**Philosophy:** Emergence, connection forming, patterns revealing

**Emergence:**
```css
@keyframes emerge {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

.element {
  animation: emerge 0.8s var(--ease-precise) forwards;
}
```

**Network Pulse:**
```css
@keyframes networkPulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(108, 142, 173, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 16px rgba(108, 142, 173, 0.6);
    transform: scale(1.05);
  }
}

.connection-node {
  animation: networkPulse 3s ease-in-out infinite;
}
```

**Fractal Reveal:**
```css
@keyframes fractalReveal {
  from {
    opacity: 0;
    clip-path: circle(0% at 50% 50%);
  }
  to {
    opacity: 0.15;
    clip-path: circle(100% at 50% 50%);
  }
}

.fractal-background {
  animation: fractalReveal 2s ease-out forwards;
}
```

---

### Light-Tech Theme Motion

**Philosophy:** Smooth precision, confident movement, purposeful

**Smooth Entrance:**
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
  animation: smoothIn 0.5s var(--ease-precise) forwards;
}
```

**Card Float:**
```css
.card:hover {
  transform: translateY(-4px);
  transition: transform 0.3s var(--ease-precise);
}
```

**Progress Indicator:**
```css
@keyframes progress {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.loading-bar::after {
  animation: progress 1.5s ease-in-out infinite;
}
```

---

### Warm Archive Theme Motion

**Philosophy:** Gentle, page-turning, warm transitions

**Gentle Fade In:**
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
  animation: gentleFadeIn 0.7s var(--ease-warm) forwards;
}
```

**Warm Glow:**
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

**Page Turn:**
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

---

### Digital/Neon Theme Motion

**Philosophy:** Electric energy, snappy, glowing

**Electric Entry:**
```css
@keyframes electricIn {
  from {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.element {
  animation: electricIn 0.6s var(--ease-electric) forwards;
}
```

**Neon Pulse:**
```css
@keyframes neonPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 217, 255, 0.4);
    border-color: rgba(0, 217, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
    border-color: rgba(0, 217, 255, 1);
  }
}

.neon-element {
  animation: neonPulse 2s ease-in-out infinite;
}
```

**Glitch Effect:**
```css
@keyframes glitch {
  0%, 90%, 100% {
    transform: translate(0);
    opacity: 1;
  }
  91% { transform: translate(-2px, 1px); opacity: 0.8; }
  92% { transform: translate(2px, -1px); opacity: 0.9; }
  93% { transform: translate(-1px, 2px); opacity: 0.85; }
  94% { transform: translate(1px, -2px); opacity: 0.95; }
}

.glitch-text {
  animation: glitch 8s infinite;
}
```

---

## 🎯 Common Interaction Patterns

### Page Load Sequence

```javascript
// 1. Navigation fades in
gsap.from('.site-nav', { opacity: 0, y: -20, duration: 0.6 });

// 2. Hero content stagger
gsap.from('.hero > *', { 
  opacity: 0, 
  y: 30, 
  stagger: 0.15, 
  duration: 0.8 
});

// 3. Background elements subtle
gsap.from('.bg-decorative', { 
  opacity: 0, 
  scale: 0.9, 
  duration: 1.5, 
  delay: 0.3 
});
```

### Scroll Interactions

**Fade In On Scroll:**
```javascript
// Using Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-scroll').forEach(el => {
  observer.observe(el);
});
```

**Parallax (Subtle):**
```javascript
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.parallax');
  
  parallaxElements.forEach(el => {
    const speed = el.dataset.speed || 0.5;
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
});
```

### Hover Interactions

**Card Lift:**
```css
.card {
  transition: transform 0.3s var(--ease-precise);
}

.card:hover {
  transform: translateY(-4px);
}
```

**Button Glow (Neon):**
```css
.btn-neon {
  transition: all 0.3s ease;
}

.btn-neon:hover {
  box-shadow: 0 0 30px var(--color-neon);
}
```

**Link Underline:**
```css
.text-link {
  position: relative;
}

.text-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.text-link:hover::after {
  width: 100%;
}
```

### Click Feedback

**Ripple Effect:**
```javascript
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}
```

```css
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

---

## 🔄 Page Transitions

### Between Sections (Theme Changes)

```javascript
function transitionToSection(fromTheme, toTheme) {
  // 1. Fade out current content
  gsap.to('.content', { 
    opacity: 0, 
    y: -20, 
    duration: 0.3 
  });
  
  // 2. Change theme
  setTimeout(() => {
    document.documentElement.setAttribute('data-theme', toTheme);
  }, 300);
  
  // 3. Fade in new content
  setTimeout(() => {
    gsap.to('.content', { 
      opacity: 1, 
      y: 0, 
      duration: 0.5 
    });
  }, 400);
}
```

### Modal Open/Close

**Open:**
```css
@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-overlay {
  animation: modalFadeIn 0.3s ease;
}

.modal-content {
  animation: modalSlideUp 0.4s var(--ease-precise);
}
```

---

## 📱 Mobile-Specific Interactions

### Touch Feedback
```css
.btn:active {
  transform: scale(0.96);
  transition: transform 0.1s ease;
}
```

### Swipe Gestures
```javascript
let touchStartX = 0;
let touchEndX = 0;

element.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

element.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) {
    // Swipe left
  }
  if (touchEndX > touchStartX + 50) {
    // Swipe right
  }
}
```

---

## ♿ Accessibility Considerations

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Focus Indicators (No Animation Override)
```css
:focus-visible {
  /* Ensure focus indicators are never animated away */
  animation: none !important;
}
```

---

## 🎭 Special Effects

### Loading States

**Skeleton Screen:**
```css
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #e0e0e0 40px,
    #f0f0f0 80px
  );
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
```

**Spinner:**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
}
```

### Success Animations

**Checkmark:**
```css
@keyframes checkmark {
  0% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.checkmark-path {
  stroke-dasharray: 50;
  animation: checkmark 0.5s ease-in-out forwards;
}
```

---

## 🔧 Performance Guidelines

### GPU Acceleration
```css
/* Use transform and opacity for animations */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU */
}

/* Avoid animating: */
/* - width, height */
/* - top, left, right, bottom */
/* - margin, padding */
```

### Debounce Scroll Events
```javascript
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    // Handle scroll
  }, 100);
});
```

### RequestAnimationFrame
```javascript
function animate() {
  // Animation logic
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

---

## 📊 Animation Testing Checklist

- [ ] Runs at 60fps on target devices
- [ ] Respects prefers-reduced-motion
- [ ] Focus states never obscured
- [ ] Works on slow connections
- [ ] Mobile performance acceptable
- [ ] No layout shifts (CLS)
- [ ] Purposeful, not decorative
- [ ] Theme-appropriate
- [ ] Enhances understanding
- [ ] Smooth, not janky

---

*Motion brings your digital home to life. Use it wisely, purposefully, beautifully.*
