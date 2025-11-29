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
    selectedDefense: null,

    render() {
        const defenseList = [
            'Spike Blockade', 'Cannonball Tower', 'Flame Aura', 'Lightning Aura',
            'Flameburst Tower', 'Skeletal Ramster', 'Poison Dart Tower'
        ];

        return `
            <div class="tool-header">
                <h1 class="tool-title">📊 Tower Scaling Visualizer</h1>
                <p class="tool-description">View tower stats across upgrade levels</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Select Defense</h3>
                    <select class="input-field" id="defense-select" onchange="TowerVisualizer.selectDefense(this.value)">
                        <option value="">-- Select Defense --</option>
                        ${defenseList.map(def => `
                            <option value="${def}" ${this.selectedDefense === def ? 'selected' : ''}>${def}</option>
                        `).join('')}
                    </select>

                    ${this.selectedDefense ? `
                        <div class="mt-md" style="background: var(--bg-input); padding: 1rem; border-radius: 8px;">
                            <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Manual Stat Input</h4>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                                Enter base stats to see scaling across levels 1-5
                            </p>
                            <div class="input-group">
                                <label class="input-label">Base Damage</label>
                                <input type="number" class="input-field" id="tower-base-damage" value="1000" min="0">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Base Range</label>
                                <input type="number" class="input-field" id="tower-base-range" value="500" min="0">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Base Attack Rate</label>
                                <input type="number" class="input-field" id="tower-base-rate" value="1.5" min="0.1" step="0.1">
                            </div>
                            <button class="btn btn-primary" onclick="TowerVisualizer.calculate()" style="width: 100%;">
                                Calculate Scaling
                            </button>
                        </div>
                    ` : ''}
                </div>

                <div class="neon-panel">
                    ${this.selectedDefense ? `
                        <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">${this.selectedDefense} - Stat Scaling</h3>
                        <div id="tower-stats-display">
                            <p style="color: var(--text-muted); text-align: center;">Enter stats and calculate</p>
                        </div>
                    ` : '<p style="color: var(--text-muted); text-align: center;">Select a defense to view scaling</p>'}
                </div>
            </div>
        `;
    },

    init() {},

    selectDefense(defense) {
        this.selectedDefense = defense || null;
        DD2Toolkit.loadTool('tower-visualizer');
    },

    calculate() {
        const baseDamage = parseFloat(document.getElementById('tower-base-damage').value) || 1000;
        const baseRange = parseFloat(document.getElementById('tower-base-range').value) || 500;
        const baseRate = parseFloat(document.getElementById('tower-base-rate').value) || 1.5;

        const scalingPerLevel = 1.15; // 15% increase per level

        const levels = [];
        for (let i = 1; i <= 5; i++) {
            const multiplier = Math.pow(scalingPerLevel, i - 1);
            levels.push({
                level: i,
                damage: Math.floor(baseDamage * multiplier),
                range: Math.floor(baseRange * multiplier),
                rate: (baseRate * multiplier).toFixed(2)
            });
        }

        const displayDiv = document.getElementById('tower-stats-display');
        displayDiv.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--bg-card); border-bottom: 2px solid var(--dd2-orange);">
                            <th style="padding: 0.75rem; text-align: left;">Level</th>
                            <th style="padding: 0.75rem; text-align: right;">Damage</th>
                            <th style="padding: 0.75rem; text-align: right;">Range</th>
                            <th style="padding: 0.75rem; text-align: right;">Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${levels.map(lvl => `
                            <tr style="border-bottom: 1px solid var(--dd2-purple);">
                                <td style="padding: 0.75rem; color: var(--dd2-gold); font-weight: bold;">Level ${lvl.level}</td>
                                <td style="padding: 0.75rem; text-align: right; color: var(--dd2-orange);">${DD2Utils.formatNumber(lvl.damage)}</td>
                                <td style="padding: 0.75rem; text-align: right; color: var(--dd2-purple);">${DD2Utils.formatNumber(lvl.range)}</td>
                                <td style="padding: 0.75rem; text-align: right; color: var(--dd2-cyan);">${lvl.rate}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-card); border-radius: 8px;">
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                    <strong>Note:</strong> Scaling assumes 15% increase per level. Actual game values may vary.
                </p>
            </div>
        `;
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
