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
                <p class="tool-description">Track your Onslaught floor progress and scaling</p>
            </div>

            <div class="grid-2">
                <div class="neon-panel">
                    <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Current Floor</h3>
                    <div class="input-group">
                        <label class="input-label">Floor Number</label>
                        <input type="number" class="input-field" id="onslaught-floor" value="${this.currentFloor}" min="1">
                    </div>
                    <button class="btn btn-primary" id="save-floor" style="width: 100%; margin-bottom: 1rem;">Save Floor</button>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-card); border-radius: 8px;">
                        <p style="color: var(--text-muted); margin-bottom: 0.5rem;">Personal Best</p>
                        <p style="font-size: 2rem; color: var(--dd2-gold); font-weight: bold;">Floor ${this.highestFloor}</p>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Enemy Scaling (Floor ${this.currentFloor})</h3>
                    <div style="padding: 1rem;">
                        <div style="margin-bottom: 1rem;">
                            <p style="color: var(--dd2-orange); font-weight: bold;">Health Multiplier</p>
                            <p style="font-size: 1.5rem; color: var(--text-primary);">${scaling.health.toFixed(2)}x</p>
                        </div>
                        <div>
                            <p style="color: var(--dd2-purple); font-weight: bold;">Damage Multiplier</p>
                            <p style="font-size: 1.5rem; color: var(--text-primary);">${scaling.damage.toFixed(2)}x</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const floorInput = document.getElementById('onslaught-floor');
        floorInput?.addEventListener('input', (e) => {
            this.currentFloor = Math.max(1, parseInt(e.target.value) || 1);
            DD2Toolkit.loadTool('onslaught-tracker');
        });

        document.getElementById('save-floor')?.addEventListener('click', () => this.saveFloor());
    },

    saveFloor() {
        if (this.currentFloor > this.highestFloor) {
            this.highestFloor = this.currentFloor;
            DD2Utils.showToast(`New personal best: Floor ${this.highestFloor}!`, 'success');
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
