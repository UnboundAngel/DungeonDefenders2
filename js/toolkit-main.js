/**
 * DD2 Toolkit - Main Orchestrator
 * Handles navigation and tool loading
 */

const DD2Toolkit = {
    currentTool: null,
    tools: {},

    init() {
        // Initialize theme first
        DD2Theme.init();

        // Setup navigation
        this.setupNavigation();

        // Setup modal
        this.setupModal();

        // Check for URL parameter to load specific tool
        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');

        if (toolParam) {
            this.loadTool(toolParam);
            // Set active nav item
            const navItem = document.querySelector(`.nav-item[data-tool="${toolParam}"]`);
            if (navItem) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                navItem.classList.add('active');
            }
        } else {
            // Load default tool
            this.loadTool('totem-counter');
        }

        console.log('%c⚔️ DD2 TOOLKIT LOADED', 'color: #ff6b35; font-size: 20px; font-weight: bold;');
    },

    setupNavigation() {
        const navToggleBtn = document.getElementById('navToggleBtn');
        const navContent = document.getElementById('navContent');
        const navItems = document.querySelectorAll('.nav-item');

        // Mobile toggle
        if (navToggleBtn) {
            navToggleBtn.addEventListener('click', () => {
                navContent.classList.toggle('active');
            });
        }

        // Nav item clicks
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const toolName = item.getAttribute('data-tool');
                this.loadTool(toolName);

                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update URL for bookmarking
                const newUrl = `${window.location.pathname}?tool=${toolName}`;
                window.history.pushState({ tool: toolName }, '', newUrl);

                // Close mobile nav
                if (window.innerWidth < 768) {
                    navContent.classList.remove('active');
                }
            });
        });
    },

    setupModal() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const clearDataBtn = document.getElementById('clearDataBtn');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.classList.add('active');
            });
        }

        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                settingsModal.classList.remove('active');
            });
        }

        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.classList.remove('active');
                }
            });
        }

        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear ALL saved data? This cannot be undone!')) {
                    DD2Storage.clearAll();
                    DD2Utils.showToast('All data cleared!', 'success');
                    setTimeout(() => location.reload(), 1000);
                }
            });
        }
    },

    loadTool(toolName) {
        const container = document.getElementById('toolContainer');
        if (!container) return;

        // Clear current tool
        container.innerHTML = '';

        // Check if tool exists
        const toolModule = this.getToolModule(toolName);
        if (toolModule && toolModule.render) {
            container.innerHTML = toolModule.render();
            if (toolModule.init) {
                toolModule.init();
            }
            this.currentTool = toolName;
        } else {
            container.innerHTML = `
                <div class="tool-header">
                    <h1 class="tool-title">🚧 Coming Soon</h1>
                    <p class="tool-description">This tool is under development!</p>
                </div>
                <div class="neon-panel">
                    <p>The <strong>${toolName}</strong> tool is being built. Check back soon!</p>
                </div>
            `;
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    getToolModule(toolName) {
        // Tool module registry - ALL 20 TOOLS
        const modules = {
            // Browsers & Data
            'mod-browser': ModBrowser,
            'shard-browser': ShardBrowser,
            'enemy-database': EnemyDatabase,
            'resources': ResourcesPage,

            // Calculators
            'gold-calculator': GoldCalculator,
            'dps-benchmark': DPSBenchmark,
            'ancient-power': AncientPowerTool,
            'gear-simulator': GearSimulator,

            // Timers & Counters
            'timers': DD2Timers,
            'totem-counter': TotemCounter,

            // Trackers
            'onslaught-tracker': OnslaughtTracker,
            'material-tracker': MaterialTracker,
            'mission-tracker': MissionTracker,
            'shard-wishlist': ShardWishlist,

            // Builders & Planners
            'hero-builder': HeroBuilder,
            'strategy-planner': StrategyPlanner,

            // Utilities
            'loadout-sharing': LoadoutSharing,
            'pet-evolution': PetEvolution,
            'tower-visualizer': TowerVisualizer,
            'practice-helper': PracticeHelper
        };

        return modules[toolName];
    }
};

// ========================================
// TOTEM REROLL COUNTER
// ========================================
const TotemCounter = {
    count: 0,
    history: [],

    render() {
        this.loadData();
        return `
            <div class="tool-header">
                <h1 class="tool-title">🎲 Totem Reroll Counter</h1>
                <p class="tool-description">Track your totem rerolls. Auto-resets at 286!</p>
            </div>

            <div class="grid-2">
                <div class="neon-panel text-center">
                    <h2 style="color: var(--dd2-orange); font-size: 3rem; margin-bottom: 1rem;">
                        ${this.count} / 286
                    </h2>
                    <div style="background: var(--bg-input); height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 2rem;">
                        <div style="background: linear-gradient(90deg, var(--dd2-orange), var(--dd2-purple));
                                    height: 100%; width: ${(this.count / 286) * 100}%;
                                    transition: width 0.3s ease;"></div>
                    </div>
                    <div class="flex flex-center gap-md">
                        <button class="btn btn-primary" id="totem-add-1">+1</button>
                        <button class="btn btn-secondary" id="totem-add-10">+10</button>
                        <button class="btn btn-danger" id="totem-reset">Reset</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📜 History</h3>
                        <button class="btn btn-danger" id="clear-history" style="padding: 0.5rem 1rem;">Clear</button>
                    </div>
                    <div id="totem-history" style="max-height: 400px; overflow-y: auto;">
                        ${this.renderHistory()}
                    </div>
                </div>
            </div>
        `;
    },

    renderHistory() {
        if (this.history.length === 0) {
            return '<p style="color: var(--text-muted); text-align: center;">No history yet...</p>';
        }
        return this.history.slice().reverse().map(entry => `
            <div style="padding: 0.75rem; border-bottom: 1px solid var(--dd2-purple);">
                <div style="display: flex; justify-content: space-between;">
                    <span>+${entry.amount}</span>
                    <span style="color: var(--text-muted);">${new Date(entry.timestamp).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    },

    init() {
        document.getElementById('totem-add-1')?.addEventListener('click', () => this.addCount(1));
        document.getElementById('totem-add-10')?.addEventListener('click', () => this.addCount(10));
        document.getElementById('totem-reset')?.addEventListener('click', () => this.resetCount());
        document.getElementById('clear-history')?.addEventListener('click', () => this.clearHistory());
    },

    addCount(amount) {
        this.count += amount;

        // Add to history
        this.history.push({
            amount,
            timestamp: Date.now()
        });

        // Auto-reset at 286
        if (this.count >= 286) {
            DD2Utils.showToast('🎉 You hit 286! Counter reset!', 'success');
            this.count = 0;
        }

        this.saveData();
        this.loadData();
        DD2Toolkit.loadTool('totem-counter');
    },

    resetCount() {
        if (confirm('Reset counter to 0?')) {
            this.count = 0;
            this.saveData();
            DD2Toolkit.loadTool('totem-counter');
            DD2Utils.showToast('Counter reset!', 'info');
        }
    },

    clearHistory() {
        if (confirm('Clear all history?')) {
            this.history = [];
            this.saveData();
            DD2Toolkit.loadTool('totem-counter');
            DD2Utils.showToast('History cleared!', 'info');
        }
    },

    loadData() {
        const data = DD2Storage.load('totem_counter', { count: 0, history: [] });
        this.count = data.count;
        this.history = data.history;
    },

    saveData() {
        DD2Storage.save('totem_counter', {
            count: this.count,
            history: this.history
        });
    }
};

// ========================================
// MOD BROWSER
// ========================================
const ModBrowser = {
    mods: [],
    filteredMods: [],
    searchTerm: '',
    filterHero: 'all',

    async render() {
        await this.loadMods();
        this.filteredMods = this.mods;

        return `
            <div class="tool-header">
                <h1 class="tool-title">🔧 Mod Browser</h1>
                <p class="tool-description">Search and filter all defense and hero mods</p>
            </div>

            <div class="card">
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">Search</label>
                        <input type="text" class="input-field" id="mod-search" placeholder="Search mods...">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Filter by Hero</label>
                        <select class="input-field" id="mod-hero-filter">
                            <option value="all">All Heroes</option>
                            ${this.getHeroOptions()}
                        </select>
                    </div>
                </div>
            </div>

            <div id="mod-list" class="grid-3">
                ${this.renderMods()}
            </div>
        `;
    },

    renderMods() {
        if (this.filteredMods.length === 0) {
            return '<p class="text-center" style="grid-column: 1/-1;">No mods found</p>';
        }

        return this.filteredMods.slice(0, 50).map(mod => `
            <div class="card">
                ${mod.image ? `<img src="${mod.image}" alt="${mod.name}" style="width: 64px; height: 64px; object-fit: contain;" onerror="this.style.display='none'">` : ''}
                <h3 style="color: var(--dd2-orange); margin: 0.5rem 0;">${mod.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${mod.description || ''}</p>
                ${mod.hero ? `<p style="color: var(--dd2-purple); font-size: 0.85rem; margin-top: 0.5rem;"><strong>Hero:</strong> ${mod.hero}</p>` : ''}
                ${mod.drop ? `<p style="color: var(--text-muted); font-size: 0.85rem;"><strong>Drop:</strong> ${mod.drop}</p>` : ''}
            </div>
        `).join('');
    },

    getHeroOptions() {
        const heroes = [...new Set(this.mods.map(m => m.hero).filter(Boolean))];
        return heroes.map(hero => `<option value="${hero}">${hero}</option>`).join('');
    },

    init() {
        const searchInput = document.getElementById('mod-search');
        const heroFilter = document.getElementById('mod-hero-filter');

        searchInput?.addEventListener('input', DD2Utils.debounce((e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.applyFilters();
        }, 300));

        heroFilter?.addEventListener('change', (e) => {
            this.filterHero = e.target.value;
            this.applyFilters();
        });
    },

    applyFilters() {
        this.filteredMods = this.mods.filter(mod => {
            const matchesSearch = !this.searchTerm ||
                mod.name.toLowerCase().includes(this.searchTerm) ||
                (mod.description && mod.description.toLowerCase().includes(this.searchTerm));

            const matchesHero = this.filterHero === 'all' || mod.hero === this.filterHero;

            return matchesSearch && matchesHero;
        });

        document.getElementById('mod-list').innerHTML = this.renderMods();
    },

    async loadMods() {
        try {
            const response = await fetch('data/dd2_mods_data.json');
            const data = await response.json();
            this.mods = data.filter(m => m.name && !m.name.startsWith('http'));
        } catch (e) {
            console.error('Failed to load mods:', e);
            this.mods = [];
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    DD2Toolkit.init();
});
