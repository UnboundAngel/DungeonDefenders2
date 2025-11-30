/**
 * DD2 Toolkit - Final Tools Part 2
 * Strategy Planner, Pet Evolution, Tower Visualizer, Enemy DB, Practice Helper
 */

// ========================================
// ENEMY DATABASE
// ========================================
const EnemyDatabase = {
    render() {
        return `
            <div class="tool-header">
                <h1 class="tool-title">👾 Enemy Database</h1>
                <p class="tool-description">Complete enemy information with weaknesses and strategies</p>
            </div>

            <div class="grid-3">
                ${DD2Enemies.map(enemy => `
                    <div class="card">
                        <div style="font-size: 3rem; text-align: center; margin-bottom: 0.5rem;">${enemy.icon}</div>
                        <h3 style="color: var(--dd2-orange); text-align: center; margin-bottom: 0.5rem;">${enemy.name}</h3>
                        <div style="background: var(--bg-input); padding: 1rem; border-radius: 8px;">
                            <p><strong>Type:</strong> ${enemy.type}</p>
                            <p><strong>Health:</strong> <span style="color: var(--dd2-purple);">${enemy.health}</span></p>
                            <p><strong>Damage:</strong> <span style="color: var(--dd2-orange);">${enemy.damage}</span></p>
                            <p><strong>Weakness:</strong> <span style="color: var(--dd2-gold);">${enemy.weakness}</span></p>
                            ${enemy.special ? `<p style="color: #ef4444; font-weight: bold; margin-top: 0.5rem;">⚠ ${enemy.special}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="card mt-md">
                <h3 class="card-title">Enemy Type Guide</h3>
                <div class="grid-2">
                    <div>
                        <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Ground Enemies</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Affected by blockades, ground-based traps, and auras. Most common enemy type.
                        </p>
                    </div>
                    <div>
                        <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Air Enemies</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Bypass ground defenses. Require anti-air towers or hero abilities to counter.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {}
};

// ========================================
// PET EVOLUTION TOOL
// ========================================
const PetEvolution = {
    currentPet: null,

    render() {
        this.loadData();

        return `
            <div class="tool-header">
                <h1 class="tool-title">🐾 Pet Evolution Tool</h1>
                <p class="tool-description">Simulate pet rerolls and evolution progress</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Select Pet</h3>
                    <div class="grid-2" style="gap: 0.75rem;">
                        ${DD2Pets.map(pet => `
                            <button onclick="PetEvolution.selectPet('${pet.id}')"
                                    style="padding: 1rem; background: ${this.currentPet?.id === pet.id ? 'var(--dd2-orange)' : 'var(--bg-card)'};
                                           border: 2px solid var(--dd2-purple); border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                                <div style="color: var(--text-primary); font-weight: bold; margin-bottom: 0.25rem;">${pet.name}</div>
                                <div style="color: var(--text-muted); font-size: 0.85rem;">${pet.rarity}</div>
                            </button>
                        `).join('')}
                    </div>

                    ${this.currentPet ? `
                        <div class="mt-md" style="background: var(--bg-input); padding: 1rem; border-radius: 8px;">
                            <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Pet Stats</h4>
                            <div class="input-group">
                                <label class="input-label">Current Level</label>
                                <input type="number" class="input-field" id="pet-level" value="${this.currentPet.level || 1}" min="1" max="100">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Evolution Stage</label>
                                <select class="input-field" id="pet-evolution">
                                    <option value="1" ${this.currentPet.evolution === 1 ? 'selected' : ''}>Stage 1 (Base)</option>
                                    <option value="2" ${this.currentPet.evolution === 2 ? 'selected' : ''}>Stage 2</option>
                                    <option value="3" ${this.currentPet.evolution === 3 ? 'selected' : ''}>Stage 3 (Max)</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="PetEvolution.updatePet()" style="width: 100%;">Update Stats</button>
                        </div>
                    ` : ''}
                </div>

                <div class="neon-panel">
                    ${this.currentPet ? `
                        <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">${this.currentPet.name}</h3>
                        <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p><strong>Rarity:</strong> <span style="color: var(--dd2-gold);">${this.currentPet.rarity}</span></p>
                            <p><strong>Level:</strong> ${this.currentPet.level || 1} / ${this.currentPet.maxLevel}</p>
                            <p><strong>Evolution:</strong> Stage ${this.currentPet.evolution || 1} / 3</p>
                            <p><strong>Can Evolve:</strong> ${this.currentPet.evolves ? '✅ Yes' : '❌ No'}</p>
                        </div>

                        <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Abilities</h4>
                            ${this.currentPet.abilities.map(ability => `
                                <div style="padding: 0.5rem; background: var(--bg-input); border-radius: 4px; margin-bottom: 0.5rem;">
                                    ${ability}
                                </div>
                            `).join('')}
                        </div>

                        <div style="background: var(--bg-input); padding: 1rem; border-radius: 8px;">
                            <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Reroll Simulator</h4>
                            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">
                                Click to simulate a pet reroll. Results are random!
                            </p>
                            <button class="btn btn-secondary" onclick="PetEvolution.simulateReroll()" style="width: 100%;">
                                🎲 Simulate Reroll
                            </button>
                            <div id="reroll-result" class="mt-sm"></div>
                        </div>
                    ` : '<p style="color: var(--text-muted); text-align: center;">Select a pet to view details</p>'}
                </div>
            </div>
        `;
    },

    init() {},

    selectPet(petId) {
        const pet = DD2Pets.find(p => p.id === petId);
        this.currentPet = { ...pet, level: 1, evolution: 1 };
        this.saveData();
        DD2Toolkit.loadTool('pet-evolution');
    },

    updatePet() {
        const level = parseInt(document.getElementById('pet-level').value);
        const evolution = parseInt(document.getElementById('pet-evolution').value);

        this.currentPet.level = level;
        this.currentPet.evolution = evolution;
        this.saveData();
        DD2Toolkit.loadTool('pet-evolution');
        DD2Utils.showToast('Pet stats updated!', 'success');
    },

    simulateReroll() {
        const results = ['Higher damage', 'Better ability power', 'Increased stats', 'No improvement', 'Slight improvement'];
        const result = results[Math.floor(Math.random() * results.length)];

        const resultDiv = document.getElementById('reroll-result');
        resultDiv.innerHTML = `
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid var(--dd2-gold);">
                <p style="color: var(--dd2-gold); font-weight: bold;">Reroll Result:</p>
                <p style="color: var(--text-primary);">${result}</p>
            </div>
        `;
    },

    loadData() {
        const saved = DD2Storage.load('pet_evolution');
        if (saved) this.currentPet = saved;
    },

    saveData() {
        DD2Storage.save('pet_evolution', this.currentPet);
    }
};

// ========================================
// TOWER SCALING VISUALIZER
// ========================================
const TowerVisualizer = {
    defenses: [],
    dpsEfficiency: [],
    filteredDefenses: [],
    selectedDefense: null,
    filterHero: 'all',
    filterType: 'all',
    sortBy: 'name',

    async render() {
        await this.loadData();
        this.applyFilters();

        const heroes = [...new Set(this.defenses.map(d => d.hero).filter(Boolean))].sort();
        const types = [...new Set(this.defenses.map(d => d.defense_type).filter(Boolean))].sort();

        return `
            <div class="tool-header">
                <h1 class="tool-title">📊 Tower Visualizer</h1>
                <p class="tool-description">Browse all defenses with stats, DPS efficiency, and scaling</p>
            </div>

            <div class="card">
                <div class="grid-3">
                    <div class="input-group">
                        <label class="input-label">Filter by Hero</label>
                        <select class="input-field" id="hero-filter">
                            <option value="all">All Heroes</option>
                            ${heroes.map(hero => `<option value="${hero}">${hero}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Filter by Type</label>
                        <select class="input-field" id="type-filter">
                            <option value="all">All Types</option>
                            ${types.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Sort By</label>
                        <select class="input-field" id="sort-by">
                            <option value="name">Name (A-Z)</option>
                            <option value="hero">Hero</option>
                            <option value="du">DU Cost</option>
                            <option value="eff_t1">Efficiency (T1)</option>
                            <option value="eff_t5">Efficiency (T5)</option>
                        </select>
                    </div>
                </div>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Found ${this.filteredDefenses.length} defenses</p>
            </div>

            <div id="defense-grid" class="grid-3">
                ${this.renderDefenses()}
            </div>

            ${this.selectedDefense ? this.renderDetailsModal() : ''}
        `;
    },

    renderDefenses() {
        if (this.filteredDefenses.length === 0) {
            return '<p class="text-center" style="grid-column: 1/-1;">No defenses found</p>';
        }

        return this.filteredDefenses.map(defense => {
            const efficiency = this.dpsEfficiency.find(e => e.name === defense.name);
            const du = parseInt(defense.mana_cost) || 0;

            return `
                <div class="card" onclick="TowerVisualizer.selectDefense('${defense.name}')" style="cursor: pointer; transition: all 0.3s;"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(230, 126, 34, 0.3)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">

                    ${defense.image_url ? `
                        <div style="text-align: center; margin-bottom: 0.5rem;">
                            <img src="${defense.image_url}" alt="${defense.name}"
                                 style="width: 80px; height: 80px; object-fit: contain;"
                                 onerror="this.style.display='none'">
                        </div>
                    ` : ''}

                    <h3 style="color: var(--dd2-orange); margin-bottom: 0.5rem; font-size: 1.1rem;">${defense.name}</h3>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">Hero</p>
                            <p style="color: var(--dd2-purple); font-weight: bold;">${defense.hero}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">Type</p>
                            <p style="color: var(--dd2-cyan);">${defense.defense_type}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">DU Cost</p>
                            <p style="color: var(--dd2-gold); font-weight: bold;">${du}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">Damage</p>
                            <p style="color: var(--dd2-orange);">${defense.damage_type}</p>
                        </div>
                    </div>

                    ${defense.status_effects && defense.status_effects !== 'None' ? `
                        <p style="color: var(--dd2-purple); font-size: 0.85rem; margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: var(--bg-input); border-radius: 4px;">
                            <strong>Status:</strong> ${defense.status_effects}
                        </p>
                    ` : ''}

                    ${efficiency ? `
                        <div style="margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-input); border-radius: 4px;">
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">DPS Efficiency (per 10 DU)</p>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                                <div>
                                    <span style="color: var(--text-muted);">T1:</span>
                                    <span style="color: var(--dd2-gold); font-weight: bold;">${efficiency.efficiency.t1}</span>
                                </div>
                                <div>
                                    <span style="color: var(--text-muted);">T5:</span>
                                    <span style="color: var(--dd2-gold); font-weight: bold;">${efficiency.efficiency.t5}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },

    renderDetailsModal() {
        const defense = this.selectedDefense;
        if (!defense) return '';

        return `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem;" onclick="TowerVisualizer.closeDetails(event)">
                <div class="card" style="max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation();">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2 style="color: var(--dd2-orange); margin: 0;">${defense.name}</h2>
                        <button onclick="TowerVisualizer.closeDetails()" style="background: #ef4444; border: none; padding: 0.5rem 1rem; border-radius: 4px; color: white; cursor: pointer; font-size: 1.2rem;">✕</button>
                    </div>

                    ${defense.image_url ? `
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <img src="${defense.image_url}" alt="${defense.name}" style="width: 120px; height: 120px; object-fit: contain;" onerror="this.style.display='none'">
                        </div>
                    ` : ''}

                    <div class="grid-2" style="margin-bottom: 1rem;">
                        <div class="neon-panel" style="padding: 1rem;">
                            <h3 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Basic Info</h3>
                            <p><strong>Hero:</strong> ${defense.hero}</p>
                            <p><strong>Type:</strong> ${defense.defense_type}</p>
                            <p><strong>DU Cost:</strong> ${defense.mana_cost}</p>
                            <p><strong>Damage Type:</strong> ${defense.damage_type}</p>
                            <p><strong>Status Effects:</strong> ${defense.status_effects}</p>
                        </div>

                        <div class="neon-panel" style="padding: 1rem;">
                            <h3 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Base Stats</h3>
                            <p><strong>Defense Power:</strong> ${defense.base_def_power}</p>
                            <p><strong>Defense Health:</strong> ${defense.base_def_health}</p>
                            <p><strong>Attack Rate:</strong> ${defense.base_atk_rate}s → ${defense.max_atk_rate}s</p>
                            ${defense.base_range !== '-' ? `<p><strong>Range:</strong> ${defense.base_range} → ${defense.max_range}</p>` : ''}
                        </div>
                    </div>

                    <div class="card" style="background: var(--bg-input); margin-bottom: 1rem;">
                        <h3 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Tier Scaling</h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: var(--bg-card); border-bottom: 2px solid var(--dd2-purple);">
                                        <th style="padding: 0.5rem; text-align: left;">Tier</th>
                                        <th style="padding: 0.5rem; text-align: right;">Atk Scalar</th>
                                        <th style="padding: 0.5rem; text-align: right;">HP Scalar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${[1,2,3,4,5].map(tier => `
                                        <tr style="border-bottom: 1px solid var(--dd2-purple);">
                                            <td style="padding: 0.5rem; color: var(--dd2-gold); font-weight: bold;">Tier ${tier}</td>
                                            <td style="padding: 0.5rem; text-align: right; color: var(--dd2-orange);">${defense[`t${tier}_atk_scalar`]}</td>
                                            <td style="padding: 0.5rem; text-align: right; color: var(--dd2-cyan);">${defense[`t${tier}_hp_scalar`]}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card" style="background: var(--bg-input);">
                        <h3 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Ascension Scaling</h3>
                        <p><strong>Defense Power per Ascension:</strong> ${defense.asc_def_power}</p>
                        <p><strong>Defense Health per Ascension:</strong> ${defense.asc_def_health}</p>
                        ${defense.asc_gambit !== '-' ? `<p><strong>Gambit:</strong> ${defense.asc_gambit}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const heroFilter = document.getElementById('hero-filter');
        const typeFilter = document.getElementById('type-filter');
        const sortBy = document.getElementById('sort-by');

        heroFilter?.addEventListener('change', (e) => {
            this.filterHero = e.target.value;
            this.applyFilters();
        });

        typeFilter?.addEventListener('change', (e) => {
            this.filterType = e.target.value;
            this.applyFilters();
        });

        sortBy?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applyFilters();
        });
    },

    async loadData() {
        try {
            // Load defenses
            const defensesData = await DD2DataCache.load('defenses');
            this.defenses = defensesData?.defenses || [];

            // Load DPS efficiency
            this.dpsEfficiency = await DD2DataCache.load('towerDPS') || [];

            console.log(`✅ Loaded ${this.defenses.length} defenses and ${this.dpsEfficiency.length} efficiency ratings`);
        } catch (e) {
            console.error('Failed to load defense data:', e);
            this.defenses = [];
            this.dpsEfficiency = [];
        }
    },

    applyFilters() {
        this.filteredDefenses = this.defenses.filter(defense => {
            const matchesHero = this.filterHero === 'all' || defense.hero === this.filterHero;
            const matchesType = this.filterType === 'all' || defense.defense_type === this.filterType;
            return matchesHero && matchesType;
        });

        // Sort
        this.filteredDefenses.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'hero':
                    return a.hero.localeCompare(b.hero) || a.name.localeCompare(b.name);
                case 'du':
                    return parseInt(a.mana_cost) - parseInt(b.mana_cost);
                case 'eff_t1': {
                    const effA = this.dpsEfficiency.find(e => e.name === a.name);
                    const effB = this.dpsEfficiency.find(e => e.name === b.name);
                    return (effB?.efficiency?.t1 || 0) - (effA?.efficiency?.t1 || 0);
                }
                case 'eff_t5': {
                    const effA = this.dpsEfficiency.find(e => e.name === a.name);
                    const effB = this.dpsEfficiency.find(e => e.name === b.name);
                    return (effB?.efficiency?.t5 || 0) - (effA?.efficiency?.t5 || 0);
                }
                default:
                    return 0;
            }
        });

        const grid = document.getElementById('defense-grid');
        if (grid) {
            grid.innerHTML = this.renderDefenses();
        }
    },

    selectDefense(defenseName) {
        this.selectedDefense = this.defenses.find(d => d.name === defenseName);
        DD2Toolkit.loadTool('tower-visualizer');
    },

    closeDetails(event) {
        if (event) event.stopPropagation();
        this.selectedDefense = null;
        DD2Toolkit.loadTool('tower-visualizer');
    }
};

// ========================================
// PRACTICE MODE HELPER
// ========================================
const PracticeHelper = {
    render() {
        return `
            <div class="tool-header">
                <h1 class="tool-title">🎯 Practice Mode Helper</h1>
                <p class="tool-description">IHDC practice maps with boss phases and guides</p>
            </div>

            <div class="grid-2">
                ${IHDCMaps.map(map => `
                    <div class="card">
                        <h3 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">${map.name}</h3>

                        <div style="background: var(--bg-input); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Boss Phases</h4>
                            ${map.phases.map(phase => `
                                <div style="padding: 0.5rem; background: var(--bg-card); border-radius: 4px; margin-bottom: 0.5rem;">
                                    ${phase}
                                </div>
                            `).join('')}
                        </div>

                        <a href="${map.url}" target="_blank" class="btn btn-primary" style="width: 100%; text-decoration: none; display: block; text-align: center;">
                            🔗 Open Workshop Page
                        </a>

                        <div class="mt-sm" style="background: var(--bg-input); padding: 0.75rem; border-radius: 8px;">
                            <button class="btn btn-secondary" onclick="PracticeHelper.startTimer('${map.id}')" style="width: 100%;">
                                ⏱️ Start Practice Timer
                            </button>
                            <div id="timer-${map.id}" class="mt-sm" style="font-size: 1.5rem; text-align: center; color: var(--dd2-orange); font-weight: bold; font-family: monospace;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    init() {},

    timers: {},

    startTimer(mapId) {
        if (this.timers[mapId]) {
            clearInterval(this.timers[mapId].interval);
            delete this.timers[mapId];
            document.getElementById(`timer-${mapId}`).textContent = '';
            return;
        }

        this.timers[mapId] = { seconds: 0 };
        this.timers[mapId].interval = setInterval(() => {
            this.timers[mapId].seconds++;
            const display = document.getElementById(`timer-${mapId}`);
            if (display) {
                display.textContent = DD2Utils.formatTime(this.timers[mapId].seconds);
            }
        }, 1000);
    }
};

// ========================================
// STRATEGY PLANNER
// ========================================
const StrategyPlanner = {
    currentStrategy: {
        map: null,
        heroes: [],
        defenses: []
    },

    render() {
        this.loadData();

        return `
            <div class="tool-header">
                <h1 class="tool-title">🗺️ Strategy Planner</h1>
                <p class="tool-description">Plan multi-hero defense strategies with lane assignments</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Select Map</h3>
                    <select class="input-field" id="strategy-map" onchange="StrategyPlanner.selectMap(this.value)">
                        <option value="">-- Select Map --</option>
                        ${DD2Maps.map(map => `
                            <option value="${map.id}" ${this.currentStrategy.map?.id === map.id ? 'selected' : ''}>${map.name}</option>
                        `).join('')}
                    </select>

                    ${this.currentStrategy.map ? `
                        <div class="mt-md" style="background: var(--bg-input); padding: 1rem; border-radius: 8px;">
                            <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Map Info</h4>
                            <p><strong>Difficulty:</strong> ${this.currentStrategy.map.difficulty}</p>
                            <p><strong>Gold/Hour:</strong> ${this.currentStrategy.map.goldPerHour}</p>
                            <p><strong>XP/Hour:</strong> ${this.currentStrategy.map.xpPerHour}</p>
                        </div>

                        <div class="mt-md">
                            <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Add Hero to Strategy</h4>
                            <select class="input-field" id="add-hero-select">
                                <option value="">-- Select Hero --</option>
                                ${DD2Heroes.map(hero => `
                                    <option value="${hero.id}">${hero.icon} ${hero.name}</option>
                                `).join('')}
                            </select>
                            <button class="btn btn-primary mt-sm" onclick="StrategyPlanner.addHero()" style="width: 100%;">
                                Add Hero
                            </button>
                        </div>
                    ` : ''}
                </div>

                <div class="neon-panel">
                    ${this.currentStrategy.map ? `
                        <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Strategy for ${this.currentStrategy.map.name}</h3>

                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Heroes (${this.currentStrategy.heroes.length})</h4>
                            ${this.currentStrategy.heroes.length === 0 ? '<p style="color: var(--text-muted);">No heroes added</p>' : `
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    ${this.currentStrategy.heroes.map((hero, idx) => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-card); border-radius: 8px;">
                                            <div>
                                                <span style="font-size: 1.5rem; margin-right: 0.5rem;">${hero.icon}</span>
                                                <strong>${hero.name}</strong>
                                                <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 0.5rem;">${hero.role}</span>
                                            </div>
                                            <button onclick="StrategyPlanner.removeHero(${idx})" style="background: #ef4444; border: none; padding: 0.5rem 1rem; border-radius: 4px; color: white; cursor: pointer;">
                                                Remove
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Add Lane/Defense Note</h4>
                            <input type="text" class="input-field" id="lane-note" placeholder="e.g., 'Top lane: Flame Auras + Archers'" style="margin-bottom: 0.5rem;">
                            <button class="btn btn-secondary" onclick="StrategyPlanner.addDefenseNote()" style="width: 100%;">
                                Add Note
                            </button>
                        </div>

                        <div>
                            <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Defense Notes (${this.currentStrategy.defenses.length})</h4>
                            ${this.currentStrategy.defenses.length === 0 ? '<p style="color: var(--text-muted);">No notes added</p>' : `
                                ${this.currentStrategy.defenses.map((note, idx) => `
                                    <div style="padding: 0.75rem; background: var(--bg-card); border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                                        <span>${note}</span>
                                        <button onclick="StrategyPlanner.removeDefenseNote(${idx})" style="background: #ef4444; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; color: white; cursor: pointer;">×</button>
                                    </div>
                                `).join('')}
                            `}
                        </div>

                        <div class="flex gap-sm mt-md">
                            <button class="btn btn-primary" onclick="StrategyPlanner.saveStrategy()" style="flex: 1;">Save</button>
                            <button class="btn btn-secondary" onclick="StrategyPlanner.exportStrategy()" style="flex: 1;">Export</button>
                            <button class="btn btn-danger" onclick="StrategyPlanner.clearStrategy()" style="flex: 1;">Clear</button>
                        </div>
                    ` : '<p style="color: var(--text-muted); text-align: center;">Select a map to start planning</p>'}
                </div>
            </div>
        `;
    },

    init() {},

    selectMap(mapId) {
        this.currentStrategy.map = DD2Maps.find(m => m.id === mapId);
        this.saveData();
        DD2Toolkit.loadTool('strategy-planner');
    },

    addHero() {
        const heroId = document.getElementById('add-hero-select').value;
        if (!heroId) return;

        const hero = DD2Heroes.find(h => h.id === heroId);
        if (hero && !this.currentStrategy.heroes.find(h => h.id === heroId)) {
            this.currentStrategy.heroes.push(hero);
            this.saveData();
            DD2Toolkit.loadTool('strategy-planner');
        }
    },

    removeHero(idx) {
        this.currentStrategy.heroes.splice(idx, 1);
        this.saveData();
        DD2Toolkit.loadTool('strategy-planner');
    },

    addDefenseNote() {
        const note = document.getElementById('lane-note').value.trim();
        if (note) {
            this.currentStrategy.defenses.push(note);
            this.saveData();
            DD2Toolkit.loadTool('strategy-planner');
        }
    },

    removeDefenseNote(idx) {
        this.currentStrategy.defenses.splice(idx, 1);
        this.saveData();
        DD2Toolkit.loadTool('strategy-planner');
    },

    clearStrategy() {
        if (confirm('Clear entire strategy?')) {
            this.currentStrategy = { map: null, heroes: [], defenses: [] };
            this.saveData();
            DD2Toolkit.loadTool('strategy-planner');
        }
    },

    exportStrategy() {
        DD2Utils.downloadJSON(this.currentStrategy, `${this.currentStrategy.map?.name || 'strategy'}_plan.json`);
        DD2Utils.showToast('Strategy exported!', 'success');
    },

    saveStrategy() {
        DD2Utils.showToast('Strategy saved!', 'success');
    },

    loadData() {
        const saved = DD2Storage.load('strategy_planner');
        if (saved) this.currentStrategy = saved;
    },

    saveData() {
        DD2Storage.save('strategy_planner', this.currentStrategy);
    }
};
