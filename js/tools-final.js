/**
 * DD2 Toolkit - Final Tools Suite
 * Hero Builder and remaining tools using existing data + scaffolds
 */

// ========================================
// MINIMAL DATA DEFINITIONS
// ========================================

const DD2Heroes = [
    { id: 'squire', name: 'Squire', icon: '🗡️', role: 'Melee DPS', defenses: ['Spike Blockade', 'Cannonball Tower', 'Bowling Ball'] },
    { id: 'huntress', name: 'Huntress', icon: '🏹', role: 'Ranged DPS', defenses: ['Poison Dart Tower', 'Explosive Trap', 'Geyser Trap'] },
    { id: 'apprentice', name: 'Apprentice', icon: '🔮', role: 'Magic DPS', defenses: ['Flameburst Tower', 'Earthshatter Tower', 'Arcane Barrier'] },
    { id: 'monk', name: 'Monk', icon: '☯️', role: 'Melee DPS', defenses: ['Lightning Aura', 'Boost Aura', 'Sky Guard Tower'] },
    { id: 'abyss_lord', name: 'Abyss Lord', icon: '👹', role: 'Tank', defenses: ['Skeletal Ramster', 'Skeletal Archer', 'Colossus'] },
    { id: 'lavamancer', name: 'Lavamancer', icon: '🌋', role: 'Area Control', defenses: ['Volcano', 'Fissure of Embermount', 'Maw of the Earth Drake'] },
    { id: 'mystic', name: 'Mystic', icon: '🐍', role: 'Support', defenses: ['Viper Fangs', 'Serpent God', 'Obelisk'] },
    { id: 'gunwitch', name: 'Gunwitch', icon: '🔫', role: 'Ranged DPS', defenses: [] },
    { id: 'dryad', name: 'Dryad', icon: '🌿', role: 'Support', defenses: ['Harpy', 'Hornet', 'Moss Hornet'] },
    { id: 'barbarian', name: 'Barbarian', icon: '⚔️', role: 'Melee DPS', defenses: [] },
    { id: 'initiate', name: 'Initiate', icon: '🥋', role: 'Balanced', defenses: ['World Tree', 'Boost Aura', 'Lightning Aura'] }
];

const DD2Enemies = [
    { id: 'goblin', name: 'Goblin', icon: '👺', type: 'Ground', health: 'Low', damage: 'Low', weakness: 'Area damage' },
    { id: 'orc', name: 'Orc', icon: '🗡️', type: 'Ground', health: 'Medium', damage: 'Medium', weakness: 'Single target' },
    { id: 'dark_mage', name: 'Dark Mage', icon: '🧙', type: 'Ground', health: 'Low', damage: 'Medium', weakness: 'Fast attacks' },
    { id: 'wyvern', name: 'Wyvern', icon: '🐲', type: 'Air', health: 'Medium', damage: 'Medium', weakness: 'Anti-air towers' },
    { id: 'kobold', name: 'Kobold', icon: '🦎', type: 'Ground', health: 'Very Low', damage: 'Low', weakness: 'Area damage' },
    { id: 'cybork', name: 'Cybork', icon: '🤖', type: 'Ground', health: 'High', damage: 'High', weakness: 'Burst damage', special: 'EMP (disables defenses)' },
    { id: 'siege_roller', name: 'Siege Roller', icon: '🛡️', type: 'Ground', health: 'Very High', damage: 'High', weakness: 'High DPS', special: 'Armored' },
    { id: 'lady_orc', name: 'Lady Orc', icon: '⚔️', type: 'Ground', health: 'High', damage: 'High', weakness: 'CC abilities' },
    { id: 'skeleton', name: 'Skeleton', icon: '💀', type: 'Ground', health: 'Low', damage: 'Low', weakness: 'Area damage' },
    { id: 'zombie', name: 'Zombie', icon: '🧟', type: 'Ground', health: 'Medium', damage: 'Low', weakness: 'Slow attacks' }
];

const DD2Pets = [
    { id: 'dragon', name: 'Dragon', rarity: 'Legendary', maxLevel: 100, evolves: true, abilities: ['Fireball', 'Wing Gust'] },
    { id: 'gato', name: 'Gato Ballista', rarity: 'Mythical', maxLevel: 100, evolves: false, abilities: ['Piercing Shot'] },
    { id: 'creeper', name: 'Creeper', rarity: 'Epic', maxLevel: 100, evolves: true, abilities: ['Explosion'] },
    { id: 'propeller', name: 'Propeller Cat', rarity: 'Mythical', maxLevel: 100, evolves: false, abilities: ['Speed Boost'] },
    { id: 'demon', name: 'Demon Lord', rarity: 'Legendary', maxLevel: 100, evolves: true, abilities: ['Dark Burst'] }
];

const DD2Maps = [
    { id: 'forgotten_ruins', name: 'Forgotten Ruins', difficulty: 'Easy', goldPerHour: 'Medium', xpPerHour: 'Low' },
    { id: 'dragonfall', name: 'Dragonfall Bazaar', difficulty: 'Medium', goldPerHour: 'High', xpPerHour: 'Medium' },
    { id: 'harbinger', name: "Harbinger's Warship", difficulty: 'Hard', goldPerHour: 'High', xpPerHour: 'High' },
    { id: 'temple', name: 'Temple of the Necrotic', difficulty: 'Hard', goldPerHour: 'Very High', xpPerHour: 'High' },
    { id: 'sky_city', name: 'Sky City', difficulty: 'Very Hard', goldPerHour: 'Very High', xpPerHour: 'Very High' }
];

const IHDCMaps = [
    { id: 'poly', name: 'Poly Practice Map', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1962358255', phases: ['Phase 1', 'Phase 2', 'Phase 3'] },
    { id: 'tbr_cp1', name: 'TBR CP1-CP2', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1962445845', phases: ['CP1', 'CP2'] },
    { id: 'tbr_cp3', name: 'TBR CP3 (Sky City)', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1962465961', phases: ['Sky City Boss'] },
    { id: 'tbr_cp4', name: 'TBR CP4 (Poly)', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1962508653', phases: ['Polybius'] },
    { id: 'old_one', name: 'Old One Practice', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1963194874', phases: ['Old One Fight'] }
];

// ========================================
// HERO BUILDER
// ========================================
const HeroBuilder = {
    currentBuild: {
        hero: null,
        gear: {
            weapon: null,
            helmet: null,
            chest: null,
            gloves: null,
            boots: null,
            relic: null
        },
        mods: [],
        shards: []
    },
    availableMods: [],
    availableShards: [],

    async render() {
        await this.loadData();
        this.loadBuild();

        return `
            <div class="tool-header">
                <h1 class="tool-title">🏗️ Hero Builder</h1>
                <p class="tool-description">Build your hero with gear, mods, and shards</p>
            </div>

            <div class="grid-2">
                <!-- Hero Selection -->
                <div class="card">
                    <h3 class="card-title">Select Hero</h3>
                    <div class="grid-3" style="gap: 0.5rem;">
                        ${DD2Heroes.map(hero => `
                            <button class="hero-select-btn ${this.currentBuild.hero?.id === hero.id ? 'active' : ''}"
                                    onclick="HeroBuilder.selectHero('${hero.id}')"
                                    style="padding: 1rem; background: var(--bg-card); border: 2px solid ${this.currentBuild.hero?.id === hero.id ? 'var(--dd2-orange)' : 'var(--dd2-purple)'};
                                           border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.3s;">
                                <div style="font-size: 2rem;">${hero.icon}</div>
                                <div style="font-size: 0.9rem; color: var(--text-primary); margin-top: 0.25rem;">${hero.name}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${hero.role}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Gear Slots -->
                <div class="card">
                    <h3 class="card-title">Gear Slots</h3>
                    ${!this.currentBuild.hero ? '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Select a hero first</p>' : `
                        <div class="grid-2" style="gap: 0.75rem;">
                            ${this.renderGearSlot('weapon', '⚔️', 'Weapon')}
                            ${this.renderGearSlot('helmet', '🪖', 'Helmet')}
                            ${this.renderGearSlot('chest', '🛡️', 'Chest')}
                            ${this.renderGearSlot('gloves', '🧤', 'Gloves')}
                            ${this.renderGearSlot('boots', '👢', 'Boots')}
                            ${this.renderGearSlot('relic', '💎', 'Relic')}
                        </div>
                    `}
                </div>
            </div>

            ${this.currentBuild.hero ? `
                <div class="grid-2 mt-md">
                    <!-- Mods & Shards -->
                    <div class="card">
                        <h3 class="card-title">Add Mods & Shards</h3>
                        <div class="input-group">
                            <label class="input-label">Search Mods</label>
                            <input type="text" class="input-field" id="hero-mod-search" placeholder="Search mods...">
                        </div>
                        <div id="mod-select-list" style="max-height: 300px; overflow-y: auto;">
                            ${this.renderModList()}
                        </div>

                        <div class="input-group mt-md">
                            <label class="input-label">Search Shards</label>
                            <input type="text" class="input-field" id="hero-shard-search" placeholder="Search shards...">
                        </div>
                        <div id="shard-select-list" style="max-height: 300px; overflow-y: auto;">
                            ${this.renderShardList()}
                        </div>
                    </div>

                    <!-- Build Summary -->
                    <div class="neon-panel">
                        <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Build Summary</h3>
                        <div style="margin-bottom: 1rem;">
                            <h4 style="color: var(--dd2-purple);">Selected Mods (${this.currentBuild.mods.length})</h4>
                            <div id="selected-mods">
                                ${this.renderSelectedMods()}
                            </div>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <h4 style="color: var(--dd2-purple);">Selected Shards (${this.currentBuild.shards.length})</h4>
                            <div id="selected-shards">
                                ${this.renderSelectedShards()}
                            </div>
                        </div>

                        <div class="flex gap-sm mt-md">
                            <button class="btn btn-primary" onclick="HeroBuilder.saveBuild()" style="flex: 1;">Save Build</button>
                            <button class="btn btn-secondary" onclick="HeroBuilder.exportBuild()" style="flex: 1;">Export</button>
                            <button class="btn btn-danger" onclick="HeroBuilder.clearBuild()" style="flex: 1;">Clear</button>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    },

    renderGearSlot(slot, icon, label) {
        const gear = this.currentBuild.gear[slot];
        return `
            <div style="background: var(--bg-input); padding: 1rem; border-radius: 8px; border: 1px solid var(--dd2-purple);">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <strong style="color: var(--dd2-orange);">${label}</strong>
                </div>
                ${gear ? `
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">${gear.name || 'Equipped'}</p>
                    <button onclick="HeroBuilder.removeGear('${slot}')" style="background: #ef4444; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; color: white; cursor: pointer; font-size: 0.85rem; margin-top: 0.5rem;">Remove</button>
                ` : `
                    <button onclick="HeroBuilder.equipGear('${slot}')" style="background: var(--dd2-purple); border: none; padding: 0.5rem; border-radius: 4px; color: white; cursor: pointer; width: 100%;">+ Equip</button>
                `}
            </div>
        `;
    },

    renderModList() {
        const searchTerm = document.getElementById('hero-mod-search')?.value.toLowerCase() || '';
        const filtered = this.availableMods.filter(m =>
            m.name.toLowerCase().includes(searchTerm) ||
            (m.description && m.description.toLowerCase().includes(searchTerm))
        ).slice(0, 20);

        if (filtered.length === 0) {
            return '<p style="color: var(--text-muted); padding: 1rem; text-align: center;">No mods found</p>';
        }

        return filtered.map(mod => {
            const isSelected = this.currentBuild.mods.some(m => m.name === mod.name);
            return `
                <div style="padding: 0.75rem; border-bottom: 1px solid var(--dd2-purple); display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <strong style="color: var(--dd2-purple);">${mod.name}</strong>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">${mod.description || ''}</p>
                    </div>
                    <button onclick="HeroBuilder.toggleMod('${mod.name.replace(/'/g, "\\'")}', event)"
                            style="background: ${isSelected ? '#ef4444' : 'var(--dd2-orange)'}; border: none; padding: 0.5rem 1rem; border-radius: 4px; color: white; cursor: pointer;">
                        ${isSelected ? 'Remove' : 'Add'}
                    </button>
                </div>
            `;
        }).join('');
    },

    renderShardList() {
        const searchTerm = document.getElementById('hero-shard-search')?.value.toLowerCase() || '';
        const filtered = this.availableShards.filter(s =>
            s.name.toLowerCase().includes(searchTerm) ||
            (s.description && s.description.toLowerCase().includes(searchTerm))
        ).slice(0, 20);

        if (filtered.length === 0) {
            return '<p style="color: var(--text-muted); padding: 1rem; text-align: center;">No shards found</p>';
        }

        return filtered.map(shard => {
            const isSelected = this.currentBuild.shards.some(s => s.name === shard.name);
            return `
                <div style="padding: 0.75rem; border-bottom: 1px solid var(--dd2-purple); display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <strong style="color: var(--dd2-purple);">${shard.name}</strong>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">${shard.description || ''}</p>
                    </div>
                    <button onclick="HeroBuilder.toggleShard('${shard.name.replace(/'/g, "\\'")}', event)"
                            style="background: ${isSelected ? '#ef4444' : 'var(--dd2-orange)'}; border: none; padding: 0.5rem 1rem; border-radius: 4px; color: white; cursor: pointer;">
                        ${isSelected ? 'Remove' : 'Add'}
                    </button>
                </div>
            `;
        }).join('');
    },

    renderSelectedMods() {
        if (this.currentBuild.mods.length === 0) {
            return '<p style="color: var(--text-muted); font-size: 0.9rem;">No mods selected</p>';
        }
        return this.currentBuild.mods.map(mod => `
            <div style="padding: 0.5rem; background: var(--bg-card); border-radius: 4px; margin-bottom: 0.5rem;">
                <strong style="color: var(--dd2-orange); font-size: 0.9rem;">${mod.name}</strong>
            </div>
        `).join('');
    },

    renderSelectedShards() {
        if (this.currentBuild.shards.length === 0) {
            return '<p style="color: var(--text-muted); font-size: 0.9rem;">No shards selected</p>';
        }
        return this.currentBuild.shards.map(shard => `
            <div style="padding: 0.5rem; background: var(--bg-card); border-radius: 4px; margin-bottom: 0.5rem;">
                <strong style="color: var(--dd2-purple); font-size: 0.9rem;">${shard.name}</strong>
            </div>
        `).join('');
    },

    init() {
        const modSearch = document.getElementById('hero-mod-search');
        const shardSearch = document.getElementById('hero-shard-search');

        modSearch?.addEventListener('input', DD2Utils.debounce(() => {
            document.getElementById('mod-select-list').innerHTML = this.renderModList();
        }, 300));

        shardSearch?.addEventListener('input', DD2Utils.debounce(() => {
            document.getElementById('shard-select-list').innerHTML = this.renderShardList();
        }, 300));
    },

    selectHero(heroId) {
        this.currentBuild.hero = DD2Heroes.find(h => h.id === heroId);
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder');
    },

    equipGear(slot) {
        const name = prompt(`Enter ${slot} name (optional):`);
        this.currentBuild.gear[slot] = { name: name || 'Equipped' };
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder');
    },

    removeGear(slot) {
        this.currentBuild.gear[slot] = null;
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder');
    },

    toggleMod(modName, event) {
        event?.stopPropagation();
        const index = this.currentBuild.mods.findIndex(m => m.name === modName);
        if (index > -1) {
            this.currentBuild.mods.splice(index, 1);
        } else {
            const mod = this.availableMods.find(m => m.name === modName);
            if (mod) this.currentBuild.mods.push(mod);
        }
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder');
    },

    toggleShard(shardName, event) {
        event?.stopPropagation();
        const index = this.currentBuild.shards.findIndex(s => s.name === shardName);
        if (index > -1) {
            this.currentBuild.shards.splice(index, 1);
        } else {
            const shard = this.availableShards.find(s => s.name === shardName);
            if (shard) this.currentBuild.shards.push(shard);
        }
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder');
    },

    clearBuild() {
        if (confirm('Clear entire build?')) {
            this.currentBuild = {
                hero: null,
                gear: { weapon: null, helmet: null, chest: null, gloves: null, boots: null, relic: null },
                mods: [],
                shards: []
            };
            this.saveBuild();
            DD2Toolkit.loadTool('hero-builder');
        }
    },

    exportBuild() {
        const buildData = {
            hero: this.currentBuild.hero?.name,
            gear: this.currentBuild.gear,
            mods: this.currentBuild.mods.map(m => m.name),
            shards: this.currentBuild.shards.map(s => s.name)
        };
        DD2Utils.downloadJSON(buildData, `${this.currentBuild.hero?.name || 'hero'}_build.json`);
        DD2Utils.showToast('Build exported!', 'success');
    },

    async loadData() {
        try {
            const [modsRes, shardsRes] = await Promise.all([
                fetch('data/dd2_mods_data.json'),
                fetch('data/dd2_shards_data.json')
            ]);
            const mods = await modsRes.json();
            const shards = await shardsRes.json();

            this.availableMods = mods.filter(m => m.name && !m.name.startsWith('http'));
            this.availableShards = shards.filter(s => s.name && !s.name.startsWith('http'));
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    },

    loadBuild() {
        const saved = DD2Storage.load('hero_builder');
        if (saved) {
            this.currentBuild = saved;
        }
    },

    saveBuild() {
        DD2Storage.save('hero_builder', this.currentBuild);
    }
};

// Continue in next file due to length...
