import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class AnimationController {
    private particleInterval: number | null = null;

    constructor() {
        this.init();
    }

    init() {
        this.initHero();
        this.initScrollAnimations();
        this.initCards();
        this.initParticles();
        this.initMagneticButtons();
        this.initTextReveal();
        this.initCursorFollower();
    }

    // Revolutionary Hero Animations
    initHero() {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        // Parallax scroll with depth
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '.hero-home',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            },
            y: 150,
            opacity: 0,
            scale: 0.95
        });

        // Animate scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            gsap.to('.scroll-indicator .line', {
                scaleY: 1.5,
                duration: 1.5,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true
            });

            gsap.to('.scroll-indicator', {
                y: 10,
                duration: 2,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true
            });
        }
    }

    // Advanced scroll-triggered animations
    initScrollAnimations() {
        // Fade in elements
        const fadeElements = document.querySelectorAll('.scroll-fade-in');
        fadeElements.forEach((element, index) => {
            gsap.fromTo(element,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    delay: index * 0.1
                }
            );
        });

        // Slide from left
        const slideLeftElements = document.querySelectorAll('.scroll-slide-left');
        slideLeftElements.forEach((element) => {
            gsap.fromTo(element,
                { opacity: 0, x: -80 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // Slide from right
        const slideRightElements = document.querySelectorAll('.scroll-slide-right');
        slideRightElements.forEach((element) => {
            gsap.fromTo(element,
                { opacity: 0, x: 80 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // Scale animations
        const scaleElements = document.querySelectorAll('.scroll-scale');
        scaleElements.forEach((element) => {
            gsap.fromTo(element,
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
    }

    // Enhanced card animations with stagger
    initCards() {
        const cardContainers = document.querySelectorAll('.doors-grid, .card-grid');

        cardContainers.forEach((container) => {
            const cards = container.querySelectorAll('.door-card, .card');

            gsap.fromTo(cards,
                {
                    opacity: 0,
                    y: 50,
                    rotationX: -15
                },
                {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: {
                        each: 0.15,
                        from: 'start'
                    },
                    scrollTrigger: {
                        trigger: container,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // Add floating animation to cards
        const cards = document.querySelectorAll('.door-card');
        cards.forEach((card, index) => {
            const delay = index * 0.5;
            gsap.to(card, {
                y: -10,
                duration: 2 + (index * 0.3),
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true,
                delay: delay
            });
        });
    }

    // Particle system for backgrounds
    initParticles() {
        const particleContainers = document.querySelectorAll('.bg-particle-field');

        particleContainers.forEach((container) => {
            this.createParticles(container as HTMLElement);
        });
    }

    createParticles(container: HTMLElement) {
        const particleCount = 30;
        const colors = ['teal', 'coral', 'purple', 'gold'];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${colors[Math.floor(Math.random() * colors.length)]}`;

            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;

            container.appendChild(particle);

            // Animate particle
            gsap.to(particle, {
                x: `${(Math.random() - 0.5) * 200}px`,
                y: `${(Math.random() - 0.5) * 200}px`,
                duration: 10 + Math.random() * 10,
                ease: 'none',
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 5
            });

            // Opacity pulse
            gsap.to(particle, {
                opacity: Math.random() * 0.5 + 0.3,
                duration: 2 + Math.random() * 2,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true
            });
        }
    }

    // Magnetic button effect
    initMagneticButtons() {
        const buttons = document.querySelectorAll('.btn, .nav-link');

        buttons.forEach((button) => {
            button.addEventListener('mouseenter', (e) => {
                gsap.to(button, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            button.addEventListener('mouseleave', (e) => {
                gsap.to(button, {
                    scale: 1,
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.5)'
                });
            });

            button.addEventListener('mousemove', (e: Event) => {
                const mouseEvent = e as MouseEvent;
                const rect = (button as HTMLElement).getBoundingClientRect();
                const x = mouseEvent.clientX - rect.left - rect.width / 2;
                const y = mouseEvent.clientY - rect.top - rect.height / 2;

                gsap.to(button, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }

    // Text reveal animations
    initTextReveal() {
        const headings = document.querySelectorAll('h1, h2, h3');

        headings.forEach((heading) => {
            const text = heading.textContent || '';
            heading.textContent = '';

            const chars = text.split('');
            chars.forEach((char) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                heading.appendChild(span);
            });

            const spans = heading.querySelectorAll('span');

            gsap.to(spans, {
                opacity: 1,
                duration: 0.03,
                stagger: 0.03,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    // Custom cursor follower
    initCursorFollower() {
        if (window.matchMedia('(pointer: fine)').matches) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.innerHTML = '<div class="cursor-inner"></div>';
            document.body.appendChild(cursor);

            let mouseX = 0;
            let mouseY = 0;
            let cursorX = 0;
            let cursorY = 0;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            // Smooth follow animation
            const animateCursor = () => {
                const dx = mouseX - cursorX;
                const dy = mouseY - cursorY;

                cursorX += dx * 0.15;
                cursorY += dy * 0.15;

                cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

                requestAnimationFrame(animateCursor);
            };

            animateCursor();

            // Expand on interactive elements
            const interactiveElements = document.querySelectorAll('a, button, .door-card, .card');
            interactiveElements.forEach((element) => {
                element.addEventListener('mouseenter', () => {
                    cursor.classList.add('expanded');
                });
                element.addEventListener('mouseleave', () => {
                    cursor.classList.remove('expanded');
                });
            });
        }
    }
}

// Initialize on client side
if (typeof window !== 'undefined') {
    setTimeout(() => {
        new AnimationController();
    }, 100);
}
