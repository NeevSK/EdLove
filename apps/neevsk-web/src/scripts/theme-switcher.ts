export class ThemeSwitcher {
    private currentTheme: string = 'home';

    constructor() {
        this.init();
    }

    init() {
        // Check for saved theme preference
        const saved = localStorage.getItem('theme-preference');
        if (saved) {
            this.setTheme(saved);
        }

        // Listen for section changes
        this.observeSections();
    }

    setTheme(themeName: string) {
        document.documentElement.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;
        localStorage.setItem('theme-preference', themeName);
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
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    new ThemeSwitcher();
}
