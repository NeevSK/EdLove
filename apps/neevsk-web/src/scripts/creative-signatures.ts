export class SeedCursor {
  private trail: HTMLElement;
  private seeds: HTMLElement[] = [];
  private lastSeedTime: number = 0;
  private seedInterval: number = 100; // Plant seed every 100ms for smoother trail

  constructor() {
    this.trail = document.createElement('div');
    this.trail.id = 'seed-trail';
    document.body.appendChild(this.trail);
    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => this.plantSeed(e));
    this.animate();
  }

  plantSeed(e: MouseEvent) {
    const now = Date.now();
    if (now - this.lastSeedTime < this.seedInterval) return;

    const seed = document.createElement('div');
    seed.className = 'seed';
    seed.style.left = `${e.clientX}px`;
    seed.style.top = `${e.clientY}px`;

    // Random seed type
    const types = ['idea', 'connection', 'insight'];
    const type = types[Math.floor(Math.random() * types.length)];
    seed.setAttribute('data-seed-type', type);

    this.trail.appendChild(seed);
    this.seeds.push(seed);

    // Grow the seed
    setTimeout(() => this.growSeed(seed), 50);

    // Remove after lifecycle
    setTimeout(() => this.removeSeed(seed), 2000);

    this.lastSeedTime = now;
  }

  growSeed(seed: HTMLElement) {
    seed.classList.add('growing');
  }

  removeSeed(seed: HTMLElement) {
    seed.classList.add('fading');
    setTimeout(() => {
      seed.remove();
      const index = this.seeds.indexOf(seed);
      if (index > -1) this.seeds.splice(index, 1);
    }, 500);
  }

  animate() {
    this.seeds.forEach((_seed) => {
      // Subtle rotation or movement can be added here
    });

    requestAnimationFrame(() => this.animate());
  }
}

export class CoherenceMeter {
  private fill: HTMLElement | null;
  constructor() {
    this.fill = document.querySelector('.meter-fill');
    if (this.fill) this.init();
  }

  init() {
    // Initial animation
    setTimeout(() => {
      const target = parseInt(this.fill?.getAttribute('data-coherence') || '85');
      this.animateTo(target);
    }, 1000);

    // Subtle fluctuation
    setInterval(() => this.fluctuate(), 4000);
  }

  animateTo(target: number) {
    if (!this.fill) return;
    this.fill.style.width = `${target}%`;
    this.fill.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  fluctuate() {
    if (!this.fill) return;
    const current = parseInt(this.fill.style.width || '85');
    const variance = Math.random() * 6 - 3;
    const next = Math.max(70, Math.min(95, current + variance));
    this.animateTo(next);
  }
}

// Initialize on client side
if (typeof window !== 'undefined') {
  new SeedCursor();
  new CoherenceMeter();
}
