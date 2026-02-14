export class ThemeSwitcher {
    private currentTheme: string = 'home';

    constructor() {
        this.init();
    }

    init() {
        // We no longer force a 'saved' theme on every page load.
        // This prevents the 'flicker' issue where a previous page's 
        // theme would override the current page's intended design.

        // Listen for section changes as the user scrolls
        this.observeSections();
    }

    setTheme(themeName: string) {
        // Only update if the theme is actually different
        if (this.currentTheme === themeName) return;

        document.documentElement.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;
    }

    observeSections() {
        const sections = document.querySelectorAll('[data-theme-section]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const theme = entry.target.getAttribute('data-theme-section');
                    if (theme) {
                        this.setTheme(theme);
                    }
                }
            });
        }, {
            threshold: 0.3, // Earlier trigger for smoother transition
            rootMargin: '-80px 0px 0px 0px' // Offset for sticky headers
        });

        sections.forEach(section => observer.observe(section));
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    // Wait for the DOM to be fully ready
    window.addEventListener('load', () => {
        new ThemeSwitcher();
    });
}
