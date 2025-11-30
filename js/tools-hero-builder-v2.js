/**
 * DD2 Hero Builder V2 - Complete Rebuild
 * Mimics DD2's in-game "My Deck → Hero Gear" UI
 *
 * Features:
 * - Hero deck row (horizontal scrollable cards)
 * - Gear silhouette with clickable slots
 * - Item detail panel
 * - Shard/Mod equip popup overlays
 * - Full JSON integration
 */

const HeroBuilderV2 = {
    // Data
    heroes: [],
    abilities: [],
    hypershards: [],
    allShards: [],
    allMods: [],

    // State
    selectedHero: null,
    selectedSlot: null,
    selectedGearItem: null,
    builds: {},
    currentBuildId: null,
    modalOpen: false,
    modalType: null, // 'shard', 'mod', 'gear'
    modalSlotIndex: null,

    // Gear slots definition
    gearSlots: [
        { id: 'helmet', name: 'HELMET', icon: '🪖', type: 'armor', maxMods: 3, maxShards: 3, position: { top: '10%', left: '60%' } },
        { id: 'chest', name: 'CHEST', icon: '🛡️', type: 'armor', maxMods: 3, maxShards: 3, position: { top: '30%', left: '62%' } },
        { id: 'gloves', name: 'GLOVES', icon: '🧤', type: 'armor', maxMods: 3, maxShards: 3, position: { top: '35%', left: '45%' } },
        { id: 'boots', name: 'BOOTS', icon: '👢', type: 'armor', maxMods: 3, maxShards: 3, position: { top: '60%', left: '58%' } },
        { id: 'weapon', name: 'WEAPON', icon: '⚔️', type: 'weapon', maxMods: 3, maxShards: 3, position: { top: '40%', left: '75%' } },
        { id: 'relic', name: 'RELIC', icon: '💎', type: 'relic', maxMods: 3, maxShards: 3, position: { top: '25%', left: '85%' } },
        { id: 'ring', name: 'RING', icon: '💍', type: 'accessory', maxMods: 0, maxShards: 0, position: { top: '70%', left: '45%' } },
        { id: 'pet', name: 'PET', icon: '🐾', type: 'pet', maxMods: 0, maxShards: 0, position: { top: '5%', left: '85%' } }
    ],

    async init() {
        await this.loadAllData();
        this.loadBuilds();
        this.ensureCurrentBuild();
    },

    async loadAllData() {
        try {
            // Load abilities and extract heroes
            const abilitiesData = await DD2DataCache.load('abilities');
            if (abilitiesData && Array.isArray(abilitiesData)) {
                this.abilities = abilitiesData;

                // Extract unique heroes from abilities
                const heroNames = new Set();
                abilitiesData.forEach(ability => {
                    if (ability.heroes && Array.isArray(ability.heroes)) {
                        ability.heroes.forEach(h => heroNames.add(h));
                    }
                });

                // Create hero objects with icons
                this.heroes = Array.from(heroNames).sort().map((name, idx) => ({
                    id: name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                    name: name,
                    icon: this.getHeroIcon(name),
                    role: this.getHeroRole(name),
                    itemPower: 0,
                    ascension: 0
                }));

                console.log('✅ Loaded', this.heroes.length, 'heroes from abilities data');
            }

            // Load hypershards
            const hypershardsData = await DD2DataCache.load('hypershards');
            if (hypershardsData?.hypershards) {
                this.hypershards = hypershardsData.hypershards;
                console.log('✅ Loaded', this.hypershards.length, 'hypershards');
            }

            // Load all shards
            const shardsData = await DD2DataCache.load('shards');
            if (shardsData && Array.isArray(shardsData)) {
                this.allShards = shardsData.filter(s =>
                    s.name && !s.name.startsWith('http') && s.description
                );
                console.log('✅ Loaded', this.allShards.length, 'shards');
            }

            // Load all mods
            const modsData = await DD2DataCache.load('mods');
            if (modsData && Array.isArray(modsData)) {
                this.allMods = modsData.filter(m =>
                    m.name && !m.name.startsWith('http') && m.description
                );
                console.log('✅ Loaded', this.allMods.length, 'mods');
            }
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    },

    getHeroIcon(name) {
        const icons = {
            'Squire': '🗡️', 'Huntress': '🏹', 'Apprentice': '🔮', 'Monk': '☯️',
            'Abyss Lord': '👹', 'Lavamancer': '🌋', 'Mystic': '🐍', 'Gunwitch': '🔫',
            'Dryad': '🌿', 'Barbarian': '⚔️', 'Initiate': '🥋', 'Ev2': '🤖',
            'Adept': '✨', 'Countess': '👑', 'Engineer': '🔧', 'Frostweaver': '❄️',
            'Hunter': '🩸', 'Mercenary': '🗡️'
        };
        return icons[name] || '🎮';
    },

    getHeroRole(name) {
        const roles = {
            'Squire': 'Tank', 'Huntress': 'Ranged DPS', 'Apprentice': 'Magic DPS',
            'Monk': 'Melee DPS', 'Abyss Lord': 'Tank', 'Lavamancer': 'Area Control',
            'Mystic': 'Support', 'Gunwitch': 'Ranged DPS', 'Dryad': 'Support',
            'Barbarian': 'Melee DPS', 'Initiate': 'Balanced', 'Ev2': 'Defense',
            'Adept': 'Magic DPS', 'Countess': 'DPS', 'Engineer': 'Builder',
            'Frostweaver': 'Crowd Control', 'Hunter': 'DPS', 'Mercenary': 'Melee DPS'
        };
        return roles[name] || 'Hero';
    },

    async render() {
        if (!this.selectedHero && this.heroes.length > 0) {
            this.selectedHero = this.heroes[0];
        }

        const build = this.getCurrentBuild();

        return `
            <div class="hero-builder-v2">
                ${this.renderHeader()}
                ${this.renderHeroDeck()}

                <div class="hero-builder-main">
                    ${this.renderGearPanel()}
                    ${this.renderItemDetailPanel()}
                </div>

                ${this.renderAbilityHypershardPanel()}
                ${this.renderStatsBar()}
                ${this.modalOpen ? this.renderModal() : ''}
            </div>

            <style>
                .hero-builder-v2 {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    min-height: 100vh;
                    padding: 1rem;
                    color: #fff;
                }

                /* Header */
                .hero-builder-header {
                    text-align: center;
                    padding: 1.5rem;
                    background: rgba(255, 215, 0, 0.1);
                    border: 2px solid #ffd700;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }

                .hero-builder-header h1 {
                    font-size: 2.5rem;
                    color: #ffd700;
                    text-transform: uppercase;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                }

                /* Hero Deck Row */
                .hero-deck-container {
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                }

                .hero-deck-title {
                    color: #ffd700;
                    font-size: 1.2rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    padding-left: 0.5rem;
                    border-left: 4px solid #ffd700;
                }

                .hero-deck-scroll {
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }

                .hero-deck-row {
                    display: flex;
                    gap: 1rem;
                    min-width: min-content;
                }

                .hero-card {
                    min-width: 180px;
                    background: linear-gradient(135deg, #2a2a40 0%, #1a1a2e 100%);
                    border: 3px solid #555;
                    border-radius: 12px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .hero-card:hover {
                    transform: translateY(-5px);
                    border-color: #ffd700;
                    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
                }

                .hero-card.selected {
                    border: 4px solid #ffd700;
                    transform: scale(1.05);
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
                }

                .hero-card-icon {
                    font-size: 3rem;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }

                .hero-card-name {
                    text-align: center;
                    font-weight: bold;
                    color: #ffd700;
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                }

                .hero-card-role {
                    text-align: center;
                    font-size: 0.85rem;
                    color: #aaa;
                }

                .hero-card-stats {
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid #444;
                    font-size: 0.8rem;
                    color: #bbb;
                }

                /* Main Layout */
                .hero-builder-main {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                /* Gear Panel */
                .gear-panel {
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid #ffd700;
                    border-radius: 12px;
                    padding: 2rem;
                    position: relative;
                    min-height: 600px;
                }

                .gear-panel-title {
                    color: #ffd700;
                    font-size: 1.5rem;
                    text-transform: uppercase;
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .gear-silhouette {
                    position: relative;
                    width: 100%;
                    height: 500px;
                    background: radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
                    border-radius: 12px;
                }

                .gear-slot {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #2a2a40, #1a1a2e);
                    border: 3px solid #555;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .gear-slot:hover {
                    border-color: #ffd700;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                    transform: scale(1.1);
                }

                .gear-slot.selected {
                    border: 3px solid #ffd700;
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
                }

                .gear-slot-icon {
                    font-size: 2rem;
                    margin-bottom: 0.25rem;
                }

                .gear-slot-name {
                    font-size: 0.65rem;
                    color: #ffd700;
                    text-transform: uppercase;
                }

                .gear-slot-diamonds {
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    display: flex;
                    gap: 2px;
                }

                .gear-diamond {
                    width: 8px;
                    height: 8px;
                    background: #4a9eff;
                    transform: rotate(45deg);
                    border: 1px solid #2a7fd4;
                }

                .gear-diamond.empty {
                    background: #333;
                    border-color: #555;
                }

                /* Item Detail Panel */
                .item-detail-panel {
                    background: linear-gradient(135deg, #2a2a40 0%, #1a1a2e 100%);
                    border: 3px solid #ffd700;
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .item-detail-title {
                    color: #ff8c00;
                    font-size: 1.3rem;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }

                .item-detail-rarity {
                    color: #ffd700;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .item-detail-stats {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .item-stat-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #333;
                }

                .item-stat-row:last-child {
                    border-bottom: none;
                }

                .item-mods-section {
                    margin-top: 1rem;
                }

                .item-mod-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid #444;
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .item-mod-row:hover {
                    border-color: #ffd700;
                    background: rgba(255, 215, 0, 0.1);
                }

                .mod-tier-badge {
                    background: #4a9eff;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }

                .item-shard-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(74, 158, 255, 0.1);
                    border: 1px solid #4a9eff;
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .item-shard-row:hover {
                    border-color: #ffd700;
                    background: rgba(255, 215, 0, 0.1);
                }

                /* Ability/Hypershard Panel */
                .ability-panel {
                    background: rgba(0, 0, 0, 0.3);
                    border: 2px solid #4a9eff;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .ability-panel-title {
                    color: #4a9eff;
                    font-size: 1.3rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }

                .ability-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 0.75rem;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .ability-card {
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid #444;
                    border-radius: 8px;
                    padding: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .ability-card:hover {
                    border-color: #4a9eff;
                    transform: translateY(-2px);
                }

                .ability-card.selected {
                    border-color: #ffd700;
                    background: rgba(255, 215, 0, 0.1);
                }

                /* Stats Bar */
                .stats-bar {
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #ffd700;
                    border-radius: 12px;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-value {
                    font-size: 1.5rem;
                    color: #ffd700;
                    font-weight: bold;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: #aaa;
                    text-transform: uppercase;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-content {
                    background: linear-gradient(135deg, #2a2a40 0%, #1a1a2e 100%);
                    border: 3px solid #ffd700;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 900px;
                    max-height: 80vh;
                    overflow-y: auto;
                    width: 90%;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .modal-title {
                    color: #ffd700;
                    font-size: 1.8rem;
                    text-transform: uppercase;
                }

                .modal-close {
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: #ff6666;
                    transform: scale(1.1);
                }

                .modal-subtitle {
                    color: #aaa;
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                }

                .modal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .modal-item {
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid #444;
                    border-radius: 8px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }

                .modal-item:hover {
                    border-color: #ffd700;
                    transform: scale(1.05);
                }

                .modal-item.selected {
                    border-color: #ffd700;
                    background: rgba(255, 215, 0, 0.2);
                }

                /* Buttons */
                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #ffd700, #ff8c00);
                    color: #000;
                }

                .btn-primary:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
                }

                .btn-secondary {
                    background: #4a9eff;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #6ab0ff;
                }

                .btn-danger {
                    background: #ff4444;
                    color: white;
                }

                .btn-danger:hover {
                    background: #ff6666;
                }

                /* Scrollbar Styling */
                .hero-deck-scroll::-webkit-scrollbar,
                .ability-grid::-webkit-scrollbar,
                .modal-content::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }

                .hero-deck-scroll::-webkit-scrollbar-track,
                .ability-grid::-webkit-scrollbar-track,
                .modal-content::-webkit-scrollbar-track {
                    background: #1a1a2e;
                }

                .hero-deck-scroll::-webkit-scrollbar-thumb,
                .ability-grid::-webkit-scrollbar-thumb,
                .modal-content::-webkit-scrollbar-thumb {
                    background: #ffd700;
                    border-radius: 4px;
                }

                @media (max-width: 1200px) {
                    .hero-builder-main {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    },

    renderHeader() {
        return `
            <div class="hero-builder-header">
                <h1>⚔️ Hero Builder ⚔️</h1>
                <p style="color: #aaa; margin-top: 0.5rem;">Build and customize your heroes</p>
            </div>
        `;
    },

    renderHeroDeck() {
        return `
            <div class="hero-deck-container">
                <div class="hero-deck-title">👥 MY DECK</div>
                <div class="hero-deck-scroll">
                    <div class="hero-deck-row">
                        ${this.heroes.map(hero => `
                            <div class="hero-card ${this.selectedHero?.id === hero.id ? 'selected' : ''}"
                                 onclick="HeroBuilderV2.selectHero('${hero.id}')">
                                <div class="hero-card-icon">${hero.icon}</div>
                                <div class="hero-card-name">${hero.name}</div>
                                <div class="hero-card-role">${hero.role}</div>
                                <div class="hero-card-stats">
                                    <div>Item Power: ${this.getHeroItemPower(hero.id)}</div>
                                    <div>Ascension: ${this.getHeroAscension(hero.id)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderGearPanel() {
        const build = this.getCurrentBuild();

        return `
            <div class="gear-panel">
                <div class="gear-panel-title">⚔️ ${this.selectedHero?.name || 'Hero'} GEAR</div>
                <div class="gear-silhouette">
                    ${this.gearSlots.map(slot => {
                        const gearItem = build.gear[slot.id];
                        const isSelected = this.selectedSlot === slot.id;

                        return `
                            <div class="gear-slot ${isSelected ? 'selected' : ''}"
                                 style="top: ${slot.position.top}; left: ${slot.position.left};"
                                 onclick="HeroBuilderV2.selectSlot('${slot.id}')">
                                <div class="gear-slot-icon">${slot.icon}</div>
                                <div class="gear-slot-name">${slot.name}</div>
                                ${gearItem && slot.maxShards > 0 ? `
                                    <div class="gear-slot-diamonds">
                                        ${Array(slot.maxShards).fill(0).map((_, i) => `
                                            <div class="gear-diamond ${gearItem.shards && gearItem.shards[i] ? '' : 'empty'}"></div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="margin-top: 2rem; text-align: center;">
                    <button class="btn btn-primary" onclick="HeroBuilderV2.saveBuild()">💾 Save Build</button>
                    <button class="btn btn-secondary" onclick="HeroBuilderV2.exportBuild()">📤 Export</button>
                    <button class="btn btn-danger" onclick="HeroBuilderV2.clearBuild()">🗑️ Clear</button>
                </div>
            </div>
        `;
    },

    renderItemDetailPanel() {
        if (!this.selectedSlot) {
            return `
                <div class="item-detail-panel">
                    <div style="text-align: center; padding: 3rem; color: #aaa;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⚔️</div>
                        <p>Select a gear slot to view details</p>
                    </div>
                </div>
            `;
        }

        const build = this.getCurrentBuild();
        const slot = this.gearSlots.find(s => s.id === this.selectedSlot);
        const gearItem = build.gear[this.selectedSlot];

        if (!gearItem) {
            return `
                <div class="item-detail-panel">
                    <div class="item-detail-title">${slot.name}</div>
                    <div class="item-detail-rarity">Empty Slot</div>
                    <div style="text-align: center; padding: 2rem; color: #aaa;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">${slot.icon}</div>
                        <p>No item equipped</p>
                        <button class="btn btn-primary" style="margin-top: 1rem;"
                                onclick="HeroBuilderV2.equipGear('${slot.id}')">
                            + Equip Item
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="item-detail-panel">
                <div class="item-detail-title">${gearItem.label || slot.name}</div>
                <div class="item-detail-rarity">${gearItem.rarity || 'Legendary'} Item</div>

                <div class="item-detail-stats">
                    ${gearItem.baseStats ? Object.entries(gearItem.baseStats).map(([stat, value]) => `
                        <div class="item-stat-row">
                            <span style="color: #aaa;">${this.formatStatName(stat)}</span>
                            <span style="color: #ffd700; font-weight: bold;">${value.toLocaleString()}</span>
                        </div>
                    `).join('') : '<p style="color: #666;">No stats</p>'}
                </div>

                ${slot.maxMods > 0 ? `
                    <div class="item-mods-section">
                        <h4 style="color: #4a9eff; margin-bottom: 0.75rem;">MODS (${gearItem.mods?.length || 0}/${slot.maxMods})</h4>
                        ${Array(slot.maxMods).fill(0).map((_, i) => {
                            const mod = gearItem.mods ? gearItem.mods[i] : null;
                            if (mod) {
                                return `
                                    <div class="item-mod-row" onclick="HeroBuilderV2.openModModal('${slot.id}', ${i})">
                                        <div class="mod-tier-badge">${mod.tier || 10}</div>
                                        <div style="flex: 1;">
                                            <div style="color: #ffd700; font-weight: bold; font-size: 0.9rem;">${mod.name}</div>
                                            <div style="color: #aaa; font-size: 0.8rem;">${mod.description?.substring(0, 60)}...</div>
                                        </div>
                                        <div style="color: #4a9eff; font-weight: bold;">${mod.value || ''}</div>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="item-mod-row" onclick="HeroBuilderV2.openModModal('${slot.id}', ${i})">
                                        <div style="color: #666; text-align: center; width: 100%;">+ Add Mod</div>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                ` : ''}

                ${slot.maxShards > 0 ? `
                    <div class="item-mods-section" style="margin-top: 1.5rem;">
                        <h4 style="color: #4a9eff; margin-bottom: 0.75rem;">SHARDS (${gearItem.shards?.length || 0}/${slot.maxShards})</h4>
                        ${Array(slot.maxShards).fill(0).map((_, i) => {
                            const shard = gearItem.shards ? gearItem.shards[i] : null;
                            if (shard) {
                                return `
                                    <div class="item-shard-row" onclick="HeroBuilderV2.openShardModal('${slot.id}', ${i})">
                                        <div style="flex: 1;">
                                            <div style="color: #ffd700; font-weight: bold; font-size: 0.9rem;">${shard.name}</div>
                                            <div style="color: #aaa; font-size: 0.8rem;">${shard.description?.substring(0, 60)}...</div>
                                        </div>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="item-shard-row" onclick="HeroBuilderV2.openShardModal('${slot.id}', ${i})">
                                        <div style="color: #666; text-align: center; width: 100%;">+ Add Shard</div>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                ` : ''}

                <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="HeroBuilderV2.equipGear('${slot.id}')">
                        Change Item
                    </button>
                    <button class="btn btn-danger" onclick="HeroBuilderV2.removeGear('${slot.id}')">
                        Remove
                    </button>
                </div>
            </div>
        `;
    },

    renderAbilityHypershardPanel() {
        const build = this.getCurrentBuild();
        const heroAbilities = this.abilities.filter(a =>
            !a.heroes || a.heroes.length === 0 || a.heroes.includes(this.selectedHero?.name)
        );

        return `
            <div class="ability-panel">
                <div class="ability-panel-title">⚡ ${this.selectedHero?.name || 'Hero'} ABILITIES</div>
                <div class="ability-grid">
                    ${heroAbilities.slice(0, 12).map(ability => {
                        const isSelected = build.abilities.some(a => a.name === ability.name);
                        return `
                            <div class="ability-card ${isSelected ? 'selected' : ''}"
                                 onclick="HeroBuilderV2.toggleAbility('${ability.name.replace(/'/g, "\\'")}')">
                                <div style="font-weight: bold; color: #ffd700; margin-bottom: 0.5rem;">${ability.name}</div>
                                <div style="font-size: 0.8rem; color: #aaa;">${ability.abilityType || 'Ability'}</div>
                                ${ability.damageScalar ? `<div style="font-size: 0.75rem; color: #4a9eff;">Scalar: ${ability.damageScalar}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="margin-top: 2rem;">
                    <div class="ability-panel-title">💎 HYPERSHARDS</div>
                    <div class="ability-grid">
                        ${this.hypershards.map(shard => {
                            const isSelected = build.hypershards.some(h => h.name === shard.name);
                            return `
                                <div class="ability-card ${isSelected ? 'selected' : ''}"
                                     onclick="HeroBuilderV2.toggleHypershard('${shard.name.replace(/'/g, "\\'")}')">
                                    ${shard.iconUrl ? `<img src="${shard.iconUrl}" style="width: 40px; height: 40px; margin-bottom: 0.5rem;" onerror="this.style.display='none'">` : ''}
                                    <div style="font-weight: bold; color: #ffd700; font-size: 0.9rem;">${shard.name}</div>
                                    <div style="font-size: 0.75rem; color: #aaa; margin-top: 0.25rem;">${shard.acquisition?.fromPrimes || ''}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderStatsBar() {
        const build = this.getCurrentBuild();
        const stats = this.calculateTotalStats(build);

        return `
            <div class="stats-bar">
                <div class="stat-item">
                    <div class="stat-value">${stats.health.toLocaleString()}</div>
                    <div class="stat-label">Health</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.damage.toLocaleString()}</div>
                    <div class="stat-label">Damage</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.abilityPower.toLocaleString()}</div>
                    <div class="stat-label">Ability Power</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.armor.toLocaleString()}</div>
                    <div class="stat-label">Armor</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.critChance}%</div>
                    <div class="stat-label">Crit Chance</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.critDamage}%</div>
                    <div class="stat-label">Crit Damage</div>
                </div>
            </div>
        `;
    },

    renderModal() {
        if (this.modalType === 'shard') {
            return this.renderShardModal();
        } else if (this.modalType === 'mod') {
            return this.renderModModal();
        } else if (this.modalType === 'gear') {
            return this.renderGearModal();
        }
        return '';
    },

    renderShardModal() {
        const slot = this.gearSlots.find(s => s.id === this.selectedSlot);

        // Filter shards based on slot type
        let filteredShards = this.allShards.filter(s => {
            if (slot.type === 'weapon') return !s.heroes || s.heroes.length === 0 || s.heroes.includes(this.selectedHero?.name);
            if (slot.type === 'armor') return true; // All shards work on armor
            if (slot.type === 'relic') return true;
            return false;
        });

        return `
            <div class="modal-overlay" onclick="HeroBuilderV2.closeModal(event)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div>
                            <div class="modal-title">EQUIP SHARDS</div>
                            <div class="modal-subtitle">Select a shard to equip to ${slot.name} (Slot ${this.modalSlotIndex + 1})</div>
                        </div>
                        <button class="modal-close" onclick="HeroBuilderV2.closeModal()">×</button>
                    </div>

                    <div class="modal-grid">
                        ${filteredShards.slice(0, 50).map(shard => `
                            <div class="modal-item" onclick="HeroBuilderV2.equipShard('${shard.name.replace(/'/g, "\\'")}')">
                                <div style="font-weight: bold; color: #4a9eff; margin-bottom: 0.5rem; font-size: 0.9rem;">${shard.name}</div>
                                <div style="font-size: 0.75rem; color: #aaa; line-height: 1.3;">${(shard.description || '').substring(0, 80)}...</div>
                                ${shard.source?.difficulty ? `<div style="margin-top: 0.5rem; font-size: 0.7rem; color: #ffd700;">${shard.source.difficulty}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderModModal() {
        const slot = this.gearSlots.find(s => s.id === this.selectedSlot);

        // Filter mods based on slot type
        let filteredMods = this.allMods.filter(m => {
            if (slot.type === 'weapon') return m.type && m.type.toLowerCase().includes('weapon');
            if (slot.type === 'armor') return m.type && m.type.toLowerCase().includes('armor');
            if (slot.type === 'relic') return m.type && m.type.toLowerCase().includes('relic');
            return true;
        });

        return `
            <div class="modal-overlay" onclick="HeroBuilderV2.closeModal(event)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div>
                            <div class="modal-title">EQUIP MODS</div>
                            <div class="modal-subtitle">Select a mod to equip to ${slot.name} (Slot ${this.modalSlotIndex + 1})</div>
                        </div>
                        <button class="modal-close" onclick="HeroBuilderV2.closeModal()">×</button>
                    </div>

                    <div class="modal-grid">
                        ${filteredMods.slice(0, 50).map(mod => `
                            <div class="modal-item" onclick="HeroBuilderV2.equipMod('${mod.name.replace(/'/g, "\\'")}')">
                                <div style="font-weight: bold; color: #ffd700; margin-bottom: 0.5rem; font-size: 0.9rem;">${mod.name}</div>
                                <div style="font-size: 0.75rem; color: #aaa; line-height: 1.3;">${(mod.description || '').substring(0, 80)}...</div>
                                <div style="margin-top: 0.5rem; font-size: 0.7rem; color: #4a9eff;">${mod.drop || ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderGearModal() {
        // Simple gear equip - create a new item
        const slot = this.gearSlots.find(s => s.id === this.selectedSlot);

        return `
            <div class="modal-overlay" onclick="HeroBuilderV2.closeModal(event)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div>
                            <div class="modal-title">EQUIP ${slot.name}</div>
                            <div class="modal-subtitle">Create or select an item for this slot</div>
                        </div>
                        <button class="modal-close" onclick="HeroBuilderV2.closeModal()">×</button>
                    </div>

                    <div style="padding: 2rem; text-align: center;">
                        <p style="color: #aaa; margin-bottom: 2rem;">Quick Equip: Create a placeholder item for this slot</p>
                        <button class="btn btn-primary" onclick="HeroBuilderV2.createPlaceholderGear()">
                            + Create C10 Legendary ${slot.name}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Helper Methods
    formatStatName(stat) {
        return stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    },

    getHeroItemPower(heroId) {
        const build = this.builds[heroId];
        if (!build) return 0;

        let total = 0;
        Object.values(build.gear).forEach(item => {
            if (item && item.itemPower) total += item.itemPower;
        });
        return total;
    },

    getHeroAscension(heroId) {
        const build = this.builds[heroId];
        return build?.ascension || 0;
    },

    calculateTotalStats(build) {
        const stats = {
            health: 0,
            damage: 0,
            abilityPower: 0,
            armor: 0,
            critChance: 0,
            critDamage: 50
        };

        Object.values(build.gear).forEach(item => {
            if (item && item.baseStats) {
                stats.health += item.baseStats.heroHealth || 0;
                stats.damage += item.baseStats.heroDamage || 0;
                stats.abilityPower += item.baseStats.abilityPower || 0;
                stats.armor += item.baseStats.armor || 0;
            }
        });

        return stats;
    },

    getCurrentBuild() {
        if (!this.selectedHero) return this.createEmptyBuild();

        const buildKey = this.selectedHero.id;
        if (!this.builds[buildKey]) {
            this.builds[buildKey] = this.createEmptyBuild();
        }
        return this.builds[buildKey];
    },

    createEmptyBuild() {
        return {
            id: Date.now().toString(),
            heroId: this.selectedHero?.id || '',
            heroName: this.selectedHero?.name || '',
            ascension: 0,
            gear: {},
            abilities: [],
            hypershards: [],
            notes: ''
        };
    },

    // Event Handlers
    selectHero(heroId) {
        this.selectedHero = this.heroes.find(h => h.id === heroId);
        this.selectedSlot = null;
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    selectSlot(slotId) {
        this.selectedSlot = slotId;
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    openShardModal(slotId, slotIndex) {
        this.selectedSlot = slotId;
        this.modalSlotIndex = slotIndex;
        this.modalType = 'shard';
        this.modalOpen = true;
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    openModModal(slotId, slotIndex) {
        this.selectedSlot = slotId;
        this.modalSlotIndex = slotIndex;
        this.modalType = 'mod';
        this.modalOpen = true;
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    equipGear(slotId) {
        this.selectedSlot = slotId;
        this.modalType = 'gear';
        this.modalOpen = true;
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    createPlaceholderGear() {
        const slot = this.gearSlots.find(s => s.id === this.selectedSlot);
        const build = this.getCurrentBuild();

        build.gear[this.selectedSlot] = {
            id: Date.now().toString(),
            label: `C10 Legendary ${slot.name}`,
            slotId: slot.id,
            rarity: 'Legendary',
            itemPower: 8500,
            baseStats: {
                armor: slot.type === 'armor' ? 50000 : 0,
                heroHealth: slot.type === 'armor' ? 40000 : 0,
                heroDamage: slot.type === 'weapon' ? 60000 : 0,
                abilityPower: slot.type === 'relic' ? 50000 : 0
            },
            mods: [],
            shards: []
        };

        this.closeModal();
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    equipShard(shardName) {
        const build = this.getCurrentBuild();
        const shard = this.allShards.find(s => s.name === shardName);

        if (!build.gear[this.selectedSlot]) return;
        if (!build.gear[this.selectedSlot].shards) build.gear[this.selectedSlot].shards = [];

        build.gear[this.selectedSlot].shards[this.modalSlotIndex] = {
            name: shard.name,
            description: shard.description,
            source: shard.source
        };

        this.closeModal();
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    equipMod(modName) {
        const build = this.getCurrentBuild();
        const mod = this.allMods.find(m => m.name === modName);

        if (!build.gear[this.selectedSlot]) return;
        if (!build.gear[this.selectedSlot].mods) build.gear[this.selectedSlot].mods = [];

        build.gear[this.selectedSlot].mods[this.modalSlotIndex] = {
            name: mod.name,
            description: mod.description,
            tier: 10,
            value: mod.drop
        };

        this.closeModal();
        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    removeGear(slotId) {
        if (confirm('Remove this item?')) {
            const build = this.getCurrentBuild();
            delete build.gear[slotId];
            this.saveBuild();
            DD2Toolkit.loadTool('hero-builder-v2');
        }
    },

    toggleAbility(abilityName) {
        const build = this.getCurrentBuild();
        const index = build.abilities.findIndex(a => a.name === abilityName);

        if (index > -1) {
            build.abilities.splice(index, 1);
        } else {
            const ability = this.abilities.find(a => a.name === abilityName);
            if (ability) {
                build.abilities.push({
                    name: ability.name,
                    type: ability.abilityType,
                    damageScalar: ability.damageScalar
                });
            }
        }

        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    toggleHypershard(shardName) {
        const build = this.getCurrentBuild();
        const index = build.hypershards.findIndex(h => h.name === shardName);

        if (index > -1) {
            build.hypershards.splice(index, 1);
        } else {
            const shard = this.hypershards.find(s => s.name === shardName);
            if (shard && build.hypershards.length < 4) {
                build.hypershards.push({
                    name: shard.name,
                    acquisition: shard.acquisition
                });
            }
        }

        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    closeModal(event) {
        if (event && event.target !== event.currentTarget) return;
        this.modalOpen = false;
        this.modalType = null;
        this.modalSlotIndex = null;
        DD2Toolkit.loadTool('hero-builder-v2');
    },

    // Persistence
    loadBuilds() {
        const saved = DD2Storage.load('hero_builds_v2', {});
        this.builds = saved;
    },

    saveBuild() {
        DD2Storage.save('hero_builds_v2', this.builds);
    },

    clearBuild() {
        if (confirm('Clear entire build for this hero?')) {
            const build = this.getCurrentBuild();
            build.gear = {};
            build.abilities = [];
            build.hypershards = [];
            this.saveBuild();
            DD2Toolkit.loadTool('hero-builder-v2');
        }
    },

    exportBuild() {
        const build = this.getCurrentBuild();
        const exportData = {
            version: '2.0',
            hero: this.selectedHero,
            build: build,
            exportDate: new Date().toISOString()
        };

        DD2Utils.downloadJSON(exportData, `${this.selectedHero.name}_build_v2.json`);
        DD2Utils.showToast('Build exported!', 'success');
    }
};

// Register tool
window.HeroBuilderV2 = HeroBuilderV2;
