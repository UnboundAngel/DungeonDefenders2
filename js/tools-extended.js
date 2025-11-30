/**
 * DD2 Toolkit - Extended Tools
 * Additional tool implementations
 */

// ========================================
// SHARD BROWSER
// ========================================
const ShardBrowser = {
    shards: [],
    filteredShards: [],
    searchTerm: '',

    async render() {
        await this.loadShards();
        this.filteredShards = this.shards;

        return `
            <div class="tool-header">
                <h1 class="tool-title">💎 Shard Browser</h1>
                <p class="tool-description">Search and browse all equipment shards</p>
            </div>

            <div class="card">
                <div class="input-group">
                    <label class="input-label">Search Shards</label>
                    <input type="text" class="input-field" id="shard-search" placeholder="Search by name or description...">
                </div>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Found ${this.filteredShards.length} shards</p>
            </div>

            <div id="shard-list" class="grid-3">
                ${this.renderShards()}
            </div>
        `;
    },

    renderShards() {
        if (this.filteredShards.length === 0) {
            return '<p class="text-center" style="grid-column: 1/-1;">No shards found</p>';
        }

        return this.filteredShards.slice(0, 100).map(shard => `
            <div class="card">
                <h3 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">${shard.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${shard.description || ''}</p>
                ${shard.source?.difficulty ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;"><strong>Source:</strong> ${shard.source.difficulty}</p>` : ''}
                ${shard.upgradeLevels ? `<p style="color: var(--dd2-gold); font-size: 0.85rem;"><strong>Max Level:</strong> ${shard.upgradeLevels}</p>` : ''}
            </div>
        `).join('');
    },

    init() {
        const searchInput = document.getElementById('shard-search');
        searchInput?.addEventListener('input', DD2Utils.debounce((e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.applyFilters();
        }, 300));
    },

    applyFilters() {
        this.filteredShards = this.shards.filter(shard => {
            return !this.searchTerm ||
                shard.name.toLowerCase().includes(this.searchTerm) ||
                (shard.description && shard.description.toLowerCase().includes(this.searchTerm));
        });

        const list = document.getElementById('shard-list');
        if (list) {
            list.innerHTML = this.renderShards();
        }
    },

    async loadShards() {
        try {
            const response = await fetch('data/dd2_shards_data.json');
            const data = await response.json();
            this.shards = data.filter(s => s.name && !s.name.startsWith('http'));
        } catch (e) {
            console.error('Failed to load shards:', e);
            this.shards = [];
        }
    }
};

// ========================================
// GOLD/HOUR CALCULATOR
// ========================================
const GoldCalculator = {
    render() {
        return `
            <div class="tool-header">
                <h1 class="tool-title">💰 Gold/Hour Calculator</h1>
                <p class="tool-description">Calculate gold per hour efficiency</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Input Data</h3>
                    <div class="input-group">
                        <label class="input-label">Map Duration (minutes)</label>
                        <input type="number" class="input-field" id="gold-duration" value="5" min="1">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Gold Earned</label>
                        <input type="number" class="input-field" id="gold-earned" value="1000000" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Items Sold Value</label>
                        <input type="number" class="input-field" id="gold-items-sold" value="500000" min="0">
                    </div>
                    <button class="btn btn-primary" id="calculate-gold" style="width: 100%;">Calculate</button>
                </div>

                <div class="neon-panel">
                    <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Results</h3>
                    <div id="gold-results">
                        <p style="color: var(--text-muted);">Enter values and click Calculate</p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('calculate-gold')?.addEventListener('click', () => this.calculate());
    },

    calculate() {
        const duration = parseFloat(document.getElementById('gold-duration').value);
        const earned = parseFloat(document.getElementById('gold-earned').value);
        const itemsSold = parseFloat(document.getElementById('gold-items-sold').value);

        const totalGold = earned + itemsSold;
        const goldPerHour = (totalGold / duration) * 60;

        const resultsDiv = document.getElementById('gold-results');
        resultsDiv.innerHTML = `
            <div style="font-size: 2rem; color: var(--dd2-gold); margin-bottom: 1rem; font-weight: bold;">
                ${DD2Utils.formatGold(goldPerHour)}/hr
            </div>
            <div style="color: var(--text-secondary);">
                <p><strong>Total Gold:</strong> ${DD2Utils.formatGold(totalGold)}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>
                <p><strong>Gold/Minute:</strong> ${DD2Utils.formatGold(totalGold / duration)}</p>
            </div>
        `;
    }
};

// ========================================
// DD2 TIMERS
// ========================================
const DD2Timers = {
    timers: {
        wave: { time: 0, running: false, interval: null },
        map: { time: 0, running: false, interval: null },
        prep: { time: 0, running: false, interval: null }
    },

    render() {
        return `
            <div class="tool-header">
                <h1 class="tool-title">⏱️ DD2 Timers</h1>
                <p class="tool-description">Track wave, map, and prep times</p>
            </div>

            <div class="grid-3">
                ${this.renderTimer('wave', '🌊 Wave Timer')}
                ${this.renderTimer('map', '🗺️ Map Timer')}
                ${this.renderTimer('prep', '⚙️ Prep Timer')}
            </div>
        `;
    },

    renderTimer(type, title) {
        const timer = this.timers[type];
        return `
            <div class="neon-panel">
                <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">${title}</h3>
                <div id="timer-${type}" style="font-size: 3rem; color: var(--dd2-purple); text-align: center; margin: 1.5rem 0; font-weight: bold; font-family: monospace;">
                    ${DD2Utils.formatTime(timer.time)}
                </div>
                <div class="flex gap-sm">
                    <button class="btn btn-primary" id="${type}-start" style="flex: 1;">Start</button>
                    <button class="btn btn-secondary" id="${type}-stop" style="flex: 1;">Stop</button>
                    <button class="btn btn-danger" id="${type}-reset" style="flex: 1;">Reset</button>
                </div>
            </div>
        `;
    },

    init() {
        Object.keys(this.timers).forEach(type => {
            document.getElementById(`${type}-start`)?.addEventListener('click', () => this.start(type));
            document.getElementById(`${type}-stop`)?.addEventListener('click', () => this.stop(type));
            document.getElementById(`${type}-reset`)?.addEventListener('click', () => this.reset(type));
        });
    },

    start(type) {
        const timer = this.timers[type];
        if (timer.running) return;

        timer.running = true;
        timer.interval = setInterval(() => {
            timer.time++;
            this.updateDisplay(type);
        }, 1000);
    },

    stop(type) {
        const timer = this.timers[type];
        if (!timer.running) return;

        timer.running = false;
        clearInterval(timer.interval);
    },

    reset(type) {
        const timer = this.timers[type];
        this.stop(type);
        timer.time = 0;
        this.updateDisplay(type);
    },

    updateDisplay(type) {
        const display = document.getElementById(`timer-${type}`);
        if (display) {
            display.textContent = DD2Utils.formatTime(this.timers[type].time);
        }
    }
};

// ========================================
// ONSLAUGHT PROGRESS TRACKER
// ========================================
const OnslaughtTracker = {
    currentFloor: 1,
    highestFloor: 1,

    render() {
        this.loadData();
        const scaling = DD2Utils.calculateOnslaughtScaling(this.currentFloor);

        return `
            <div class="tool-header">
                <h1 class="tool-title">🏔️ Onslaught Progress Tracker</h1>
                <p class="tool-description">Track your Onslaught floor progress with accurate enemy scaling</p>
            </div>

            <div class="grid-2">
                <div class="neon-panel">
                    <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Floor Input</h3>
                    <div class="input-group">
                        <label class="input-label">Floor Number</label>
                        <input type="number" class="input-field" id="onslaught-floor" value="${this.currentFloor}" min="1" step="1">
                    </div>
                    <button class="btn btn-primary" id="save-floor" style="width: 100%; margin-bottom: 1rem;">Save Current Floor</button>
                    <div style="text-align: center; padding: 1.5rem; background: var(--bg-card); border-radius: 12px; border: 2px solid var(--dd2-gold);">
                        <p style="color: var(--text-muted); margin-bottom: 0.5rem; font-size: 0.9rem;">🏆 Personal Best</p>
                        <p style="font-size: 2.5rem; color: var(--dd2-gold); font-weight: bold; margin: 0;">Floor ${this.highestFloor}</p>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Enemy Scaling</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">
                        Viewing floor: <span id="scaling-floor" style="color: var(--dd2-orange); font-weight: bold;">${this.currentFloor}</span>
                    </p>
                    <div style="padding: 1rem;">
                        <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-input); border-radius: 8px;">
                            <p style="color: var(--dd2-orange); font-weight: bold; margin-bottom: 0.5rem;">💪 Health Multiplier</p>
                            <p id="health-mult" style="font-size: 2rem; color: var(--text-primary); margin: 0;">${scaling.health.toFixed(2)}x</p>
                        </div>
                        <div style="padding: 1rem; background: var(--bg-input); border-radius: 8px;">
                            <p style="color: var(--dd2-purple); font-weight: bold; margin-bottom: 0.5rem;">⚔️ Damage Multiplier</p>
                            <p id="damage-mult" style="font-size: 2rem; color: var(--text-primary); margin: 0;">${scaling.damage.toFixed(2)}x</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const floorInput = document.getElementById('onslaught-floor');

        // Update scaling display in real-time without reloading
        floorInput?.addEventListener('input', (e) => {
            const newFloor = Math.max(1, parseInt(e.target.value) || 1);
            this.currentFloor = newFloor;
            this.updateScalingDisplay(newFloor);
        });

        document.getElementById('save-floor')?.addEventListener('click', () => this.saveFloor());
    },

    updateScalingDisplay(floor) {
        const scaling = DD2Utils.calculateOnslaughtScaling(floor);
        const scalingFloorEl = document.getElementById('scaling-floor');
        const healthMultEl = document.getElementById('health-mult');
        const damageMultEl = document.getElementById('damage-mult');

        if (scalingFloorEl) scalingFloorEl.textContent = floor;
        if (healthMultEl) healthMultEl.textContent = scaling.health.toFixed(2) + 'x';
        if (damageMultEl) damageMultEl.textContent = scaling.damage.toFixed(2) + 'x';
    },

    saveFloor() {
        const floorInput = document.getElementById('onslaught-floor');
        this.currentFloor = Math.max(1, parseInt(floorInput?.value) || 1);

        if (this.currentFloor > this.highestFloor) {
            this.highestFloor = this.currentFloor;
            DD2Utils.showToast(`🎉 New personal best: Floor ${this.highestFloor}!`, 'success');
        } else {
            DD2Utils.showToast(`Floor ${this.currentFloor} saved!`, 'success');
        }

        this.saveData();
        DD2Toolkit.loadTool('onslaught-tracker');
    },

    loadData() {
        const data = DD2Storage.load('onslaught', { currentFloor: 1, highestFloor: 1 });
        this.currentFloor = data.currentFloor;
        this.highestFloor = data.highestFloor;
    },

    saveData() {
        DD2Storage.save('onslaught', {
            currentFloor: this.currentFloor,
            highestFloor: this.highestFloor
        });
    }
};

// ========================================
// MATERIAL TRACKER
// ========================================
const MaterialTracker = {
    materials: {},

    render() {
        this.loadData();
        const materialTypes = [
            { key: 'motes', label: 'Motes', icon: '✨' },
            { key: 'clusters', label: 'Clusters', icon: '💫' },
            { key: 'shards_dusted', label: 'Shard Dust', icon: '💎' },
            { key: 'gold', label: 'Gold', icon: '💰' },
            { key: 'medals', label: 'Medals', icon: '🎖️' }
        ];

        return `
            <div class="tool-header">
                <h1 class="tool-title">📦 Material Tracker</h1>
                <p class="tool-description">Track all your account materials and resources</p>
            </div>

            <div class="grid-3">
                ${materialTypes.map(mat => `
                    <div class="card">
                        <h3 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">${mat.icon} ${mat.label}</h3>
                        <input type="number" class="input-field" id="mat-${mat.key}" value="${this.materials[mat.key] || 0}" min="0" style="margin: 0.5rem 0;">
                        <button class="btn btn-primary" onclick="MaterialTracker.updateMaterial('${mat.key}')" style="width: 100%; padding: 0.5rem;">Update</button>
                    </div>
                `).join('')}
            </div>

            <div class="card mt-md">
                <h3 class="card-title">Quick Summary</h3>
                <div class="grid-2">
                    <div>
                        <p><strong>Total Motes:</strong> ${DD2Utils.formatNumber(this.materials.motes || 0)}</p>
                        <p><strong>Total Clusters:</strong> ${DD2Utils.formatNumber(this.materials.clusters || 0)}</p>
                    </div>
                    <div>
                        <p><strong>Gold:</strong> ${DD2Utils.formatGold(this.materials.gold || 0)}</p>
                        <p><strong>Medals:</strong> ${DD2Utils.formatNumber(this.materials.medals || 0)}</p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Event listeners are attached via onclick in HTML for simplicity
    },

    updateMaterial(key) {
        const input = document.getElementById(`mat-${key}`);
        if (input) {
            this.materials[key] = parseInt(input.value) || 0;
            this.saveData();
            DD2Utils.showToast(`${key} updated!`, 'success');
            DD2Toolkit.loadTool('material-tracker');
        }
    },

    loadData() {
        this.materials = DD2Storage.load('materials', {});
    },

    saveData() {
        DD2Storage.save('materials', this.materials);
    }
};

// ========================================
// MISSION TRACKER
// ========================================
const MissionTracker = {
    dailies: [],
    weeklies: [],

    render() {
        this.loadData();
        return `
            <div class="tool-header">
                <h1 class="tool-title">📋 Daily/Weekly Mission Tracker</h1>
                <p class="tool-description">Track your daily and weekly missions</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Daily Missions</h3>
                        <button class="btn btn-primary" id="add-daily" style="padding: 0.5rem 1rem;">+ Add</button>
                    </div>
                    <div id="daily-list">
                        ${this.renderMissions(this.dailies, 'daily')}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Weekly Missions</h3>
                        <button class="btn btn-secondary" id="add-weekly" style="padding: 0.5rem 1rem;">+ Add</button>
                    </div>
                    <div id="weekly-list">
                        ${this.renderMissions(this.weeklies, 'weekly')}
                    </div>
                </div>
            </div>
        `;
    },

    renderMissions(missions, type) {
        if (missions.length === 0) {
            return '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No missions yet</p>';
        }

        return missions.map((mission, idx) => `
            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border-bottom: 1px solid var(--dd2-purple);">
                <input type="checkbox" ${mission.completed ? 'checked' : ''} onchange="MissionTracker.toggleMission('${type}', ${idx})" style="width: 20px; height: 20px;">
                <span style="flex: 1; ${mission.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${mission.name}</span>
                <button onclick="MissionTracker.deleteMission('${type}', ${idx})" style="background: var(--dd2-orange); border: none; padding: 0.25rem 0.5rem; border-radius: 4px; color: white; cursor: pointer;">×</button>
            </div>
        `).join('');
    },

    init() {
        document.getElementById('add-daily')?.addEventListener('click', () => this.addMission('daily'));
        document.getElementById('add-weekly')?.addEventListener('click', () => this.addMission('weekly'));
    },

    addMission(type) {
        const name = prompt(`Enter ${type} mission name:`);
        if (name && name.trim()) {
            const list = type === 'daily' ? this.dailies : this.weeklies;
            list.push({ name: name.trim(), completed: false });
            this.saveData();
            DD2Toolkit.loadTool('mission-tracker');
        }
    },

    toggleMission(type, idx) {
        const list = type === 'daily' ? this.dailies : this.weeklies;
        list[idx].completed = !list[idx].completed;
        this.saveData();
    },

    deleteMission(type, idx) {
        const list = type === 'daily' ? this.dailies : this.weeklies;
        list.splice(idx, 1);
        this.saveData();
        DD2Toolkit.loadTool('mission-tracker');
    },

    loadData() {
        const data = DD2Storage.load('missions', { dailies: [], weeklies: [] });
        this.dailies = data.dailies;
        this.weeklies = data.weeklies;
    },

    saveData() {
        DD2Storage.save('missions', {
            dailies: this.dailies,
            weeklies: this.weeklies
        });
    }
};

// ========================================
// RESOURCES PAGE (from original)
// ========================================
const ResourcesPage = {
    render() {
        return `
            <div class="tool-header">
                <h1 class="tool-title">📚 Community Resources</h1>
                <p class="tool-description">Essential DD2 community tools and guides</p>
            </div>

            <div class="grid-3">
                <a href="https://bit.ly/Protobot" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">🔗 Protobot Database</h3>
                    <p style="color: var(--text-secondary);">Mod/shard info, drop tables, and more</p>
                </a>

                <a href="http://bit.ly/dd2market" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">💰 DD2 Market Prices</h3>
                    <p style="color: var(--text-secondary);">Community price estimates (very volatile!)</p>
                </a>

                <a href="https://docs.google.com/spreadsheets/d/14eqaz9FgWAM9jBZagH3araTz0509KvO3x2FssmdHvoA" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">⚔️ DPS Build Guides</h3>
                    <p style="color: var(--text-secondary);">Community DPS hero builds</p>
                </a>

                <a href="https://docs.google.com/spreadsheets/d/1sjBA60Fr9ryVnw4FUIMU2AVXbKw395Tdz7j--EAUA1A" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">🛡 Defense Build Guides</h3>
                    <p style="color: var(--text-secondary);">Tower setups for every hero</p>
                </a>

                <a href="https://docs.google.com/spreadsheets/d/1Grd0H2iaNy1I-CPDKjE1uo5_qHNCf9WyQlnEB4u-yOg/edit?gid=1808764212" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">📄 Master Spreadsheet</h3>
                    <p style="color: var(--text-secondary);">LichtAbzeichen8's comprehensive guide</p>
                </a>

                <a href="https://www.youtube.com/user/MrJuicebags" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">🎥 Juicebags' YouTube</h3>
                    <p style="color: var(--text-secondary);">Video guides and builds</p>
                </a>

                <a href="https://wiki.dungeondefenders2.com/wiki/Main_Page" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">📘 DD2 Wiki</h3>
                    <p style="color: var(--text-secondary);">General game reference</p>
                </a>

                <a href="https://chromatic.zendesk.com/hc/en-us/requests/new" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">🧩 Support</h3>
                    <p style="color: var(--text-secondary);">Chromatic Games support tickets</p>
                </a>

                <a href="https://builds.dundef.com/builds" target="_blank" class="card" style="text-decoration: none;">
                    <h3 style="color: var(--dd2-orange);">🧱 Community Builds</h3>
                    <p style="color: var(--text-secondary);">Player-submitted defense layouts</p>
                </a>
            </div>
        `;
    },

    init() {}
};

// ========================================
// MAP EFFICIENCY TRACKER
// Track map runs with build data, calculate optimal farming
// ========================================
const MapEfficiency = {
    mapRuns: [],
    currentRun: {},

    render() {
        this.loadData();

        const stats = this.calculateStatistics();

        return `
            <div class="tool-header">
                <h1 class="tool-title">📊 Map Efficiency Tracker</h1>
                <p class="tool-description">Track map runs with build data to find optimal farming routes</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Add New Map Run</h3>
                    <div class="input-group">
                        <label class="input-label">Map Name</label>
                        <input type="text" class="input-field" id="map-name" placeholder="e.g., Dead Road, Harbinger">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Hero Used</label>
                        <input type="text" class="input-field" id="map-hero" placeholder="e.g., Gunwitch, Monk">
                    </div>
                    <div class="grid-2">
                        <div class="input-group">
                            <label class="input-label">Time Completed (minutes)</label>
                            <input type="number" class="input-field" id="map-time" placeholder="15" min="0" step="0.1">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Ancient Power (AP)</label>
                            <input type="number" class="input-field" id="map-ap" placeholder="50" min="0">
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="input-group">
                            <label class="input-label">Gold Earned (base)</label>
                            <input type="number" class="input-field" id="map-gold" placeholder="1000000" min="0">
                        </div>
                        <div class="input-group">
                            <label class="input-label">EXP Earned (base)</label>
                            <input type="number" class="input-field" id="map-exp" placeholder="500000" min="0">
                        </div>
                    </div>

                    <h4 style="color: var(--dd2-purple); margin-top: 1rem; margin-bottom: 0.5rem;">Build Details (Optional)</h4>
                    <div class="input-group">
                        <label class="input-label">Mods Used</label>
                        <textarea class="input-field" id="map-mods" rows="2" placeholder="List mods (one per line)"></textarea>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Shards Used</label>
                        <textarea class="input-field" id="map-shards" rows="2" placeholder="List shards (one per line)"></textarea>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Notes</label>
                        <textarea class="input-field" id="map-notes" rows="2" placeholder="Strategy, tips, etc."></textarea>
                    </div>

                    <button class="btn btn-primary mt-md" id="add-map-run" style="width: 100%;">Add Map Run</button>
                </div>

                <div class="neon-panel">
                    <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Farming Statistics</h3>
                    <div id="map-stats">
                        ${this.renderStatistics(stats)}
                    </div>
                </div>
            </div>

            <div class="card mt-md">
                <div class="flex-between mb-md">
                    <h3 class="card-title">All Map Runs (${this.mapRuns.length})</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" id="export-maps" style="padding: 0.5rem 1rem;">Export JSON</button>
                        <button class="btn btn-secondary" id="import-maps" style="padding: 0.5rem 1rem;">Import JSON</button>
                        <button class="btn btn-danger" id="clear-maps" style="padding: 0.5rem 1rem;">Clear All</button>
                    </div>
                </div>
                <div id="map-runs-list">
                    ${this.renderMapRuns()}
                </div>
            </div>

            <input type="file" id="import-file-input" accept=".json" style="display: none;">
        `;
    },

    renderStatistics(stats) {
        if (!stats || stats.totalRuns === 0) {
            return '<p style="color: var(--text-muted);">No map runs recorded yet</p>';
        }

        return `
            <div class="grid-2" style="margin-bottom: 1.5rem;">
                <div style="padding: 1rem; background: var(--bg-card); border-radius: 8px;">
                    <p style="color: var(--dd2-gold); font-weight: bold; font-size: 0.9rem;">💰 Best Gold/Min</p>
                    <p style="font-size: 1.5rem; color: var(--text-primary); margin: 0.5rem 0;">${DD2Utils.formatGold(stats.bestGoldPerMin)}/min</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${stats.bestGoldMap}</p>
                </div>
                <div style="padding: 1rem; background: var(--bg-card); border-radius: 8px;">
                    <p style="color: var(--dd2-purple); font-weight: bold; font-size: 0.9rem;">⭐ Best EXP/Min</p>
                    <p style="font-size: 1.5rem; color: var(--text-primary); margin: 0.5rem 0;">${DD2Utils.formatNumber(Math.floor(stats.bestExpPerMin))}/min</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${stats.bestExpMap}</p>
                </div>
            </div>

            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Overall Stats</h4>
                <p><strong>Total Runs:</strong> ${stats.totalRuns}</p>
                <p><strong>Total Time:</strong> ${(stats.totalTime / 60).toFixed(1)} hours</p>
                <p><strong>Total Gold Earned:</strong> ${DD2Utils.formatGold(stats.totalGold)}</p>
                <p><strong>Total EXP Earned:</strong> ${DD2Utils.formatGold(stats.totalExp)}</p>
            </div>

            <div style="background: var(--bg-input); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--dd2-orange);">
                <h4 style="color: var(--dd2-cyan); margin-bottom: 0.5rem;">💡 Farming Recommendation</h4>
                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>For Gold:</strong> ${stats.bestGoldMap} (${DD2Utils.formatGold(stats.bestGoldPerMin)}/min)</p>
                <p style="color: var(--text-secondary);"><strong>For EXP:</strong> ${stats.bestExpMap} (${DD2Utils.formatNumber(Math.floor(stats.bestExpPerMin))}/min)</p>
            </div>
        `;
    },

    renderMapRuns() {
        if (this.mapRuns.length === 0) {
            return '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No map runs yet. Add your first run above!</p>';
        }

        return `
            <div class="grid-3">
                ${this.mapRuns.map((run, idx) => {
                    const goldWithAP = run.gold * (1 + (run.ap * 0.05));
                    const expWithAP = run.exp * (1 + (run.ap * 0.05));
                    const goldPerMin = goldWithAP / run.time;
                    const expPerMin = expWithAP / run.time;

                    return `
                        <div class="card" style="background: var(--bg-input);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <h4 style="color: var(--dd2-orange);">${run.map}</h4>
                                <button onclick="MapEfficiency.deleteRun(${idx})" style="background: #ef4444; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; color: white; cursor: pointer;">×</button>
                            </div>
                            <p style="color: var(--dd2-purple); font-size: 0.9rem; margin-bottom: 0.5rem;">🦸 ${run.hero}</p>
                            <div style="padding: 0.75rem; background: var(--bg-card); border-radius: 6px; margin-bottom: 0.5rem;">
                                <p style="font-size: 0.85rem; margin-bottom: 0.25rem;"><strong>⏱️ Time:</strong> ${run.time} min</p>
                                <p style="font-size: 0.85rem; margin-bottom: 0.25rem;"><strong>💰 Gold/min:</strong> ${DD2Utils.formatGold(goldPerMin)}</p>
                                <p style="font-size: 0.85rem;"><strong>⭐ EXP/min:</strong> ${DD2Utils.formatNumber(Math.floor(expPerMin))}</p>
                            </div>
                            ${run.mods ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">🔧 ${run.mods.split('\\n').length} mods</p>` : ''}
                            ${run.shards ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">💎 ${run.shards.split('\\n').length} shards</p>` : ''}
                            ${run.notes ? `<p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; font-style: italic;">"${run.notes}"</p>` : ''}
                            <button onclick="MapEfficiency.viewDetails(${idx})" class="btn btn-secondary mt-sm" style="width: 100%; padding: 0.5rem;">View Details</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    init() {
        document.getElementById('add-map-run')?.addEventListener('click', () => this.addMapRun());
        document.getElementById('export-maps')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-maps')?.addEventListener('click', () => this.triggerImport());
        document.getElementById('clear-maps')?.addEventListener('click', () => this.clearAll());

        const fileInput = document.getElementById('import-file-input');
        fileInput?.addEventListener('change', (e) => this.importData(e));
    },

    addMapRun() {
        const mapName = document.getElementById('map-name').value.trim();
        const hero = document.getElementById('map-hero').value.trim();
        const time = parseFloat(document.getElementById('map-time').value) || 0;
        const ap = parseInt(document.getElementById('map-ap').value) || 0;
        const gold = parseInt(document.getElementById('map-gold').value) || 0;
        const exp = parseInt(document.getElementById('map-exp').value) || 0;
        const mods = document.getElementById('map-mods').value.trim();
        const shards = document.getElementById('map-shards').value.trim();
        const notes = document.getElementById('map-notes').value.trim();

        if (!mapName || !hero || time <= 0 || gold <= 0 || exp <= 0) {
            DD2Utils.showToast('Please fill in all required fields!', 'error');
            return;
        }

        const run = {
            id: DD2Utils.generateId(),
            map: mapName,
            hero,
            time,
            ap,
            gold,
            exp,
            mods,
            shards,
            notes,
            timestamp: Date.now()
        };

        this.mapRuns.push(run);
        this.saveData();

        // Clear inputs
        document.getElementById('map-name').value = '';
        document.getElementById('map-hero').value = '';
        document.getElementById('map-time').value = '';
        document.getElementById('map-gold').value = '';
        document.getElementById('map-exp').value = '';
        document.getElementById('map-mods').value = '';
        document.getElementById('map-shards').value = '';
        document.getElementById('map-notes').value = '';

        DD2Utils.showToast(`✅ Added: ${mapName}`, 'success');
        DD2Toolkit.loadTool('map-efficiency');
    },

    calculateStatistics() {
        if (this.mapRuns.length === 0) {
            return null;
        }

        let bestGoldPerMin = 0;
        let bestGoldMap = '';
        let bestExpPerMin = 0;
        let bestExpMap = '';
        let totalTime = 0;
        let totalGold = 0;
        let totalExp = 0;

        this.mapRuns.forEach(run => {
            const goldWithAP = run.gold * (1 + (run.ap * 0.05));
            const expWithAP = run.exp * (1 + (run.ap * 0.05));
            const goldPerMin = goldWithAP / run.time;
            const expPerMin = expWithAP / run.time;

            if (goldPerMin > bestGoldPerMin) {
                bestGoldPerMin = goldPerMin;
                bestGoldMap = run.map;
            }

            if (expPerMin > bestExpPerMin) {
                bestExpPerMin = expPerMin;
                bestExpMap = run.map;
            }

            totalTime += run.time;
            totalGold += goldWithAP;
            totalExp += expWithAP;
        });

        return {
            totalRuns: this.mapRuns.length,
            bestGoldPerMin,
            bestGoldMap,
            bestExpPerMin,
            bestExpMap,
            totalTime,
            totalGold,
            totalExp
        };
    },

    viewDetails(idx) {
        const run = this.mapRuns[idx];
        if (!run) return;

        const goldWithAP = run.gold * (1 + (run.ap * 0.05));
        const expWithAP = run.exp * (1 + (run.ap * 0.05));

        const details = `
📍 Map: ${run.map}
🦸 Hero: ${run.hero}
⏱️ Time: ${run.time} minutes
🌟 AP: ${run.ap} (+${run.ap * 5}% bonus)

💰 Gold Earned: ${DD2Utils.formatGold(run.gold)} (base)
💰 Gold with AP: ${DD2Utils.formatGold(goldWithAP)}
💰 Gold/min: ${DD2Utils.formatGold(goldWithAP / run.time)}

⭐ EXP Earned: ${DD2Utils.formatNumber(run.exp)} (base)
⭐ EXP with AP: ${DD2Utils.formatNumber(Math.floor(expWithAP))}
⭐ EXP/min: ${DD2Utils.formatNumber(Math.floor(expWithAP / run.time))}

${run.mods ? `🔧 Mods:\n${run.mods}\n` : ''}
${run.shards ? `💎 Shards:\n${run.shards}\n` : ''}
${run.notes ? `📝 Notes: ${run.notes}` : ''}

Added: ${DD2Utils.formatDate(run.timestamp)}
        `.trim();

        alert(details);
    },

    deleteRun(idx) {
        if (!confirm(`Delete this map run: ${this.mapRuns[idx].map}?`)) return;

        this.mapRuns.splice(idx, 1);
        this.saveData();
        DD2Utils.showToast('Map run deleted', 'info');
        DD2Toolkit.loadTool('map-efficiency');
    },

    exportData() {
        if (this.mapRuns.length === 0) {
            DD2Utils.showToast('No data to export!', 'error');
            return;
        }

        const exportData = {
            version: '1.0',
            exportDate: Date.now(),
            mapRuns: this.mapRuns
        };

        DD2Utils.downloadJSON(exportData, 'dd2_map_efficiency.json');
        DD2Utils.showToast('✅ Exported map data!', 'success');
    },

    triggerImport() {
        document.getElementById('import-file-input')?.click();
    },

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.mapRuns || !Array.isArray(data.mapRuns)) {
                    throw new Error('Invalid format');
                }

                const currentCount = this.mapRuns.length;
                this.mapRuns = [...this.mapRuns, ...data.mapRuns];
                this.saveData();

                DD2Utils.showToast(`✅ Imported ${data.mapRuns.length} runs!`, 'success');
                DD2Toolkit.loadTool('map-efficiency');
            } catch (e) {
                DD2Utils.showToast('Invalid import file!', 'error');
            }
        };
        reader.readAsText(file);
    },

    clearAll() {
        if (!confirm(`Delete all ${this.mapRuns.length} map runs? This cannot be undone!`)) return;

        this.mapRuns = [];
        this.saveData();
        DD2Utils.showToast('All map runs cleared', 'info');
        DD2Toolkit.loadTool('map-efficiency');
    },

    loadData() {
        const data = DD2Storage.load('map_efficiency', { mapRuns: [] });
        this.mapRuns = data.mapRuns;
    },

    saveData() {
        DD2Storage.save('map_efficiency', { mapRuns: this.mapRuns });
    }
};
