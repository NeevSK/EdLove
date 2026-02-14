import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class AnimationController {
    constructor() {
        this.init();
    }

    init() {
        this.initHero();
        this.initScrollFade();
        this.initCards();
    }

    initHero() {
        // Only run if we're on the home page with hero content
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        // Elements are already animated via CSS for immediate feedback, 
        // but we can add parallax here
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '.hero-home',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: 100,
            opacity: 0.5
        });
    }

    initScrollFade() {
        const fadeElements = document.querySelectorAll('.fade-in-scroll');

        fadeElements.forEach((element) => {
            gsap.fromTo(element,
                {
                    opacity: 0,
                    y: 50
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 80%',
                        end: 'top 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
    }

    initCards() {
        const cards = document.querySelectorAll('.card, .door-card');

        cards.forEach((card) => {
            // Subtle hover effect managed by CSS, 
            // but we can add entrance animations
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%'
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    }
}

// Initialize on client side
if (typeof window !== 'undefined') {
    // Use a small timeout to ensure DOM is ready and styles applied
    setTimeout(() => {
        new AnimationController();
    }, 100);
}
