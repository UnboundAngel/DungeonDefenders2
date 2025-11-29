/**
 * DD2 Toolkit - Theme Manager
 * Handles dark/light theme and settings
 */

const DD2Theme = {
    settings: {
        theme: 'dark',
        animations: true,
        particles: true,
        neonEffects: true,
        fontScale: 100
    },

    init() {
        // Load saved settings
        const saved = DD2Storage.load('settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }

        this.apply();
        this.setupListeners();
    },

    apply() {
        // Apply theme
        document.body.className = `${this.settings.theme}-theme`;

        // Apply font scaling
        document.documentElement.style.fontSize = `${this.settings.fontScale}%`;

        // Apply animations
        if (!this.settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }

        // Apply particle effects
        if (!this.settings.particles) {
            document.body.classList.add('no-particles');
        } else {
            document.body.classList.remove('no-particles');
        }

        // Apply neon effects
        if (!this.settings.neonEffects) {
            document.body.classList.add('no-neon');
        } else {
            document.body.classList.remove('no-neon');
        }

        // Update UI elements
        this.updateUI();
    },

    updateUI() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = this.settings.theme === 'dark' ? '🌙' : '☀️';
            }
        }

        const animToggle = document.getElementById('animationsToggle');
        if (animToggle) animToggle.checked = this.settings.animations;

        const particlesToggle = document.getElementById('particlesToggle');
        if (particlesToggle) particlesToggle.checked = this.settings.particles;

        const neonToggle = document.getElementById('neonToggle');
        if (neonToggle) neonToggle.checked = this.settings.neonEffects;

        const fontScale = document.getElementById('fontScale');
        if (fontScale) fontScale.value = this.settings.fontScale;

        const fontScaleValue = document.getElementById('fontScaleValue');
        if (fontScaleValue) fontScaleValue.textContent = `${this.settings.fontScale}%`;
    },

    setupListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Settings controls
        const animToggle = document.getElementById('animationsToggle');
        if (animToggle) {
            animToggle.addEventListener('change', (e) => {
                this.setSetting('animations', e.target.checked);
            });
        }

        const particlesToggle = document.getElementById('particlesToggle');
        if (particlesToggle) {
            particlesToggle.addEventListener('change', (e) => {
                this.setSetting('particles', e.target.checked);
            });
        }

        const neonToggle = document.getElementById('neonToggle');
        if (neonToggle) {
            neonToggle.addEventListener('change', (e) => {
                this.setSetting('neonEffects', e.target.checked);
            });
        }

        const fontScale = document.getElementById('fontScale');
        if (fontScale) {
            fontScale.addEventListener('input', (e) => {
                this.setSetting('fontScale', parseInt(e.target.value));
            });
        }
    },

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.save();
        this.apply();
    },

    setSetting(key, value) {
        this.settings[key] = value;
        this.save();
        this.apply();
    },

    save() {
        DD2Storage.save('settings', this.settings);
    }
};

// Export
window.DD2Theme = DD2Theme;
