/**
 * DD2 Hero Builder V2 - Complete Rebuild
 * Mimics DD2's in-game "My Deck → Hero Gear" UI
 *
 * Features:
 * - Hero deck row (horizontal scrollable cards)
 * - Gear silhouette with clickable slots
 * - Item detail panel
 * - Shard/Mod equip popup overlays
 * - Build Cost calculator with platform pricing
 * - Full JSON integration
 */

const HeroBuilderV2 = {
    // Data
    heroes: [],
    abilities: [],
    allShards: [], // Includes both normal shards and hypershards with isHyper flag
    allMods: [],
    prices: [],
    selectedPlatform: 'pc', // pc, ps, xbox

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
        this.setupScrollListener();
    },

    setupScrollListener() {
        // Add header shrinking behavior on scroll
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', () => {
                const header = document.querySelector('.toolkit-header');
                if (!header) return;
                if (window.scrollY > 80) {
                    header.classList.add('header--compact');
                } else {
                    header.classList.remove('header--compact');
                }
            });
        }
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

            // Load hypershards and merge with regular shards
            const hypershardsData = await DD2DataCache.load('hypershards');
            let hypershards = [];
            if (hypershardsData?.hypershards) {
                hypershards = hypershardsData.hypershards.map(hs => ({
                    name: hs.name,
                    description: hs.description || '',
                    iconUrl: hs.iconUrl || '',
                    isHyper: true,
                    rarity: 'Hypershard',
                    heroes: hs.acquisition?.fromPrimes ? ['ALL'] : []
                }));
                console.log('✅ Loaded', hypershards.length, 'hypershards');
            }

            // Load all shards
            const shardsData = await DD2DataCache.load('shards');
            let regularShards = [];
            if (shardsData && Array.isArray(shardsData)) {
                regularShards = shardsData.filter(s =>
                    s.name && !s.name.startsWith('http') && s.description
                ).map(s => ({
                    ...s,
                    isHyper: false
                }));
                console.log('✅ Loaded', regularShards.length, 'regular shards');
            }

            // Merge hypershards and regular shards
            this.allShards = [...hypershards, ...regularShards];
            console.log('✅ Total shards (including hypershards):', this.allShards.length);

            // Load all mods
            const modsData = await DD2DataCache.load('mods');
            if (modsData && Array.isArray(modsData)) {
                this.allMods = modsData.filter(m =>
                    m.name && !m.name.startsWith('http') && m.description
                );
                console.log('✅ Loaded', this.allMods.length, 'mods');
            }

            // Load prices
            const pricesData = await DD2DataCache.load('prices');
            if (pricesData && Array.isArray(pricesData)) {
                this.prices = pricesData;
                console.log('✅ Loaded', this.prices.length, 'price entries');
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

                <div class="hero-builder-bottom">
                    ${this.renderAbilityPanel()}
                    ${this.renderBuildCostPanel()}
                </div>

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

                /* Header shrinking behavior */
                .toolkit-header {
                    transition: height 0.2s ease, padding 0.2s ease;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .toolkit-header.header--compact {
                    padding: 0.5rem 1rem !important;
                }

                .toolkit-header.header--compact .neon-text {
                    font-size: 1.2rem !important;
                }

                .toolkit-header.header--compact .header-subtitle {
                    display: none;
                }

                /* Header */
                .hero-builder-header {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(255, 215, 0, 0.1);
                    border: 2px solid #ffd700;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                }

                .hero-builder-header h1 {
                    font-size: 2rem;
                    color: #ffd700;
                    text-transform: uppercase;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                }

                /* Hero Deck Row */
                .hero-deck-container {
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 12px;
                    border: 2px solid rgba(255, 215, 0, 0.3);
                }

                .hero-deck-title {
                    color: #ffd700;
                    font-size: 1rem;
                    text-transform: uppercase;
                    margin-bottom: 0.75rem;
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
                    min-width: max-content;
                }

                .hero-card {
                    background: linear-gradient(135deg, #2a2a40 0%, #1f1f30 100%);
                    border: 3px solid #444;
                    border-radius: 12px;
                    padding: 1rem;
                    min-width: 140px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .hero-card:hover {
                    border-color: #ffd700;
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
                }

                .hero-card.selected {
                    border: 3px solid #ffd700;
                    transform: scale(1.05) translateY(-8px);
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
                    background: linear-gradient(135deg, #3a3a50 0%, #2f2f40 100%);
                }

                .hero-card-icon {
                    font-size: 2.5rem;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }

                .hero-card-name {
                    font-weight: bold;
                    color: #ffd700;
                    text-align: center;
                    margin-bottom: 0.25rem;
                    font-size: 0.9rem;
                }

                .hero-card-role {
                    font-size: 0.75rem;
                    color: #4a9eff;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }

                .hero-card-stats {
                    font-size: 0.7rem;
                    color: #aaa;
                    text-align: center;
                    border-top: 1px solid rgba(255, 215, 0, 0.2);
                    padding-top: 0.5rem;
                }

                /* Main Layout */
                .hero-builder-main {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 1024px) {
                    .hero-builder-main {
                        grid-template-columns: 1fr;
                    }
                }

                /* Gear Panel */
                .gear-panel {
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .gear-panel-title {
                    color: #ffd700;
                    font-size: 1.2rem;
                    text-transform: uppercase;
                    margin-bottom: 1.5rem;
                    padding-left: 0.5rem;
                    border-left: 4px solid #ffd700;
                }

                .gear-silhouette {
                    position: relative;
                    height: 400px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }

                .gear-slot {
                    position: absolute;
                    background: rgba(42, 42, 64, 0.9);
                    border: 2px solid #444;
                    border-radius: 8px;
                    padding: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 100px;
                    text-align: center;
                }

                .gear-slot:hover {
                    border-color: #ffd700;
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
                }

                .gear-slot.selected {
                    border-color: #ffd700;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
                }

                .gear-slot-icon {
                    font-size: 1.8rem;
                    margin-bottom: 0.25rem;
                }

                .gear-slot-name {
                    font-size: 0.7rem;
                    color: #aaa;
                    font-weight: bold;
                }

                .gear-slot-diamonds {
                    display: flex;
                    gap: 3px;
                    justify-content: center;
                    margin-top: 0.5rem;
                }

                .gear-diamond {
                    width: 8px;
                    height: 8px;
                    background: #4a9eff;
                    transform: rotate(45deg);
                    border: 1px solid #2a7fd4;
                }

                .gear-diamond.empty {
                    background: rgba(74, 158, 255, 0.2);
                    border: 1px solid rgba(42, 127, 212, 0.3);
                }

                /* Item Detail Panel */
                .item-detail-panel {
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .item-detail-title {
                    color: #ffd700;
                    font-size: 1.2rem;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }

                .item-detail-rarity {
                    color: #4a9eff;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .item-detail-section {
                    margin-bottom: 1.5rem;
                }

                .item-detail-section-title {
                    color: #ffd700;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    margin-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(255, 215, 0, 0.3);
                    padding-bottom: 0.25rem;
                }

                .mod-row, .shard-row {
                    background: rgba(42, 42, 64, 0.5);
                    border: 1px solid #444;
                    border-radius: 6px;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .mod-row:hover, .shard-row:hover {
                    border-color: #ffd700;
                    background: rgba(42, 42, 64, 0.8);
                }

                .mod-row.empty, .shard-row.empty {
                    border-style: dashed;
                    opacity: 0.6;
                }

                /* Bottom Section */
                .hero-builder-bottom {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 1024px) {
                    .hero-builder-bottom {
                        grid-template-columns: 1fr;
                    }
                }

                /* Ability Panel */
                .ability-panel {
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .ability-panel-title {
                    color: #ffd700;
                    font-size: 1rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    padding-left: 0.5rem;
                    border-left: 4px solid #ffd700;
                }

                .ability-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 0.75rem;
                }

                .ability-card {
                    background: rgba(42, 42, 64, 0.6);
                    border: 2px solid #444;
                    border-radius: 8px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ability-card:hover {
                    border-color: #ffd700;
                    transform: translateY(-2px);
                }

                .ability-card.selected {
                    border-color: #4a9eff;
                    background: rgba(74, 158, 255, 0.2);
                }

                /* Build Cost Panel */
                .build-cost-panel {
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .build-cost-title {
                    color: #ffd700;
                    font-size: 1rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    padding-left: 0.5rem;
                    border-left: 4px solid #ffd700;
                }

                .platform-selector {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .platform-btn {
                    flex: 1;
                    background: rgba(42, 42, 64, 0.6);
                    border: 2px solid #444;
                    border-radius: 6px;
                    padding: 0.5rem;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .platform-btn:hover {
                    border-color: #ffd700;
                }

                .platform-btn.active {
                    border-color: #4a9eff;
                    background: rgba(74, 158, 255, 0.2);
                }

                .cost-summary {
                    background: rgba(42, 42, 64, 0.6);
                    border: 2px solid #4a9eff;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .cost-total {
                    font-size: 1.5rem;
                    color: #ffd700;
                    text-align: center;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .cost-breakdown {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                }

                .cost-item {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 0.5rem;
                    border-radius: 4px;
                }

                .cost-expensive-list {
                    font-size: 0.75rem;
                    color: #aaa;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .cost-expensive-item {
                    padding: 0.5rem;
                    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
                }

                /* Stats Bar */
                .stats-bar {
                    display: flex;
                    gap: 1rem;
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                    justify-content: space-around;
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
                    font-size: 0.75rem;
                    color: #aaa;
                    text-transform: uppercase;
                }

                /* Modal Overlay */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 1000;
                    overflow-y: auto;
                    padding: 2rem;
                }

                .modal-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #ffd700;
                }

                .modal-title {
                    color: #ffd700;
                    font-size: 1.5rem;
                    text-transform: uppercase;
                }

                .modal-close {
                    background: rgba(255, 0, 0, 0.2);
                    border: 2px solid #ff0000;
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .modal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                }

                .modal-item {
                    background: rgba(42, 42, 64, 0.8);
                    border: 2px solid #444;
                    border-radius: 8px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .modal-item:hover {
                    border-color: #ffd700;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                }

                .modal-item-name {
                    color: #ffd700;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .modal-item-description {
                    font-size: 0.85rem;
                    color: #aaa;
                }

                .modal-item-rarity {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    margin-top: 0.5rem;
                    background: rgba(74, 158, 255, 0.2);
                    color: #4a9eff;
                }

                .modal-item-rarity.hyper {
                    background: rgba(255, 0, 255, 0.2);
                    color: #ff00ff;
                }

                /* Buttons */
                .btn {
                    padding: 0.75rem 1.5rem;
                    border: 2px solid;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s ease;
                    margin: 0 0.25rem;
                }

                .btn-primary {
                    background: rgba(74, 158, 255, 0.2);
                    border-color: #4a9eff;
                    color: #4a9eff;
                }

                .btn-primary:hover {
                    background: rgba(74, 158, 255, 0.4);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: rgba(255, 215, 0, 0.2);
                    border-color: #ffd700;
                    color: #ffd700;
                }

                .btn-secondary:hover {
                    background: rgba(255, 215, 0, 0.4);
                    transform: translateY(-2px);
                }

                .btn-danger {
                    background: rgba(255, 0, 0, 0.2);
                    border-color: #ff0000;
                    color: #ff0000;
                }

                .btn-danger:hover {
                    background: rgba(255, 0, 0, 0.4);
                    transform: translateY(-2px);
                }

                /* Scrollbars */
                .hero-deck-scroll::-webkit-scrollbar,
                .item-detail-panel::-webkit-scrollbar,
                .modal-overlay::-webkit-scrollbar,
                .cost-expensive-list::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }

                .hero-deck-scroll::-webkit-scrollbar-track,
                .item-detail-panel::-webkit-scrollbar-track,
                .modal-overlay::-webkit-scrollbar-track,
                .cost-expensive-list::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                }

                .hero-deck-scroll::-webkit-scrollbar-thumb,
                .item-detail-panel::-webkit-scrollbar-thumb,
                .modal-overlay::-webkit-scrollbar-thumb,
                .cost-expensive-list::-webkit-scrollbar-thumb {
                    background: #ffd700;
                    border-radius: 4px;
                }
            </style>
        `;
    },

    renderHeader() {
        return `
            <div class="hero-builder-header">
                <h1>⚔️ Hero Builder ⚔️</h1>
                <p style="color: #aaa; margin-top: 0.5rem;">Build and customize your heroes • ${this.heroes.length} heroes loaded</p>
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
                                    <div>⭐ ${this.getHeroItemPower(hero.id)}</div>
                                    <div>Asc ${this.getHeroAscension(hero.id)}</div>
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

                <div style="margin-top: 1.5rem; text-align: center;">
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
                <div class="item-detail-title">${gearItem.name || slot.name}</div>
                <div class="item-detail-rarity">${gearItem.rarity || 'Mythical'} • Item Power: ${gearItem.itemPower || 10500}</div>

                ${slot.maxMods > 0 ? `
                    <div class="item-detail-section">
                        <div class="item-detail-section-title">🔧 MODS (${slot.maxMods})</div>
                        ${Array(slot.maxMods).fill(0).map((_, i) => {
                            const mod = gearItem.mods && gearItem.mods[i];
                            return `
                                <div class="mod-row ${mod ? '' : 'empty'}"
                                     onclick="HeroBuilderV2.openModModal('${slot.id}', ${i})">
                                    ${mod ? `
                                        <div style="font-weight: bold; color: #ffd700;">${mod.name}</div>
                                        <div style="font-size: 0.8rem; color: #aaa; margin-top: 0.25rem;">${mod.description || ''}</div>
                                        <div style="font-size: 0.75rem; color: #4a9eff; margin-top: 0.25rem;">Tier ${mod.tier || 10}</div>
                                    ` : `
                                        <div style="color: #aaa; font-style: italic;">+ Add Mod</div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                ${slot.maxShards > 0 ? `
                    <div class="item-detail-section">
                        <div class="item-detail-section-title">💎 SHARDS (${slot.maxShards})</div>
                        ${Array(slot.maxShards).fill(0).map((_, i) => {
                            const shard = gearItem.shards && gearItem.shards[i];
                            return `
                                <div class="shard-row ${shard ? '' : 'empty'}"
                                     onclick="HeroBuilderV2.openShardModal('${slot.id}', ${i})">
                                    ${shard ? `
                                        <div style="font-weight: bold; color: #4a9eff;">${shard.name}</div>
                                        <div style="font-size: 0.8rem; color: #aaa; margin-top: 0.25rem;">${shard.description || ''}</div>
                                        ${shard.isHyper ? `<div style="font-size: 0.75rem; color: #ff00ff; margin-top: 0.25rem;">⭐ HYPERSHARD</div>` : ''}
                                        ${shard.rarity ? `<div style="font-size: 0.75rem; color: #4a9eff; margin-top: 0.25rem;">${shard.rarity}</div>` : ''}
                                    ` : `
                                        <div style="color: #aaa; font-style: italic;">+ Add Shard</div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderAbilityPanel() {
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
            </div>
        `;
    },

    renderBuildCostPanel() {
        const costs = this.calculateBuildCost();

        return `
            <div class="build-cost-panel">
                <div class="build-cost-title">💰 BUILD COST</div>

                <div class="platform-selector">
                    <button class="platform-btn ${this.selectedPlatform === 'pc' ? 'active' : ''}"
                            onclick="HeroBuilderV2.selectPlatform('pc')">
                        🖥️ PC
                    </button>
                    <button class="platform-btn ${this.selectedPlatform === 'ps' ? 'active' : ''}"
                            onclick="HeroBuilderV2.selectPlatform('ps')">
                        🎮 PS
                    </button>
                    <button class="platform-btn ${this.selectedPlatform === 'xbox' ? 'active' : ''}"
                            onclick="HeroBuilderV2.selectPlatform('xbox')">
                        🎮 Xbox
                    </button>
                </div>

                <div class="cost-summary">
                    <div class="cost-total">${costs.totalFormatted}</div>
                    <div class="cost-breakdown">
                        <div class="cost-item">
                            <div style="color: #4a9eff; font-weight: bold;">Shards</div>
                            <div style="color: #fff;">${costs.shardsFormatted}</div>
                        </div>
                        <div class="cost-item">
                            <div style="color: #ffd700; font-weight: bold;">Mods</div>
                            <div style="color: #fff;">${costs.modsFormatted}</div>
                        </div>
                    </div>
                </div>

                ${costs.expensive.length > 0 ? `
                    <div>
                        <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 0.5rem;">Most Expensive Items:</div>
                        <div class="cost-expensive-list">
                            ${costs.expensive.slice(0, 5).map(item => `
                                <div class="cost-expensive-item">
                                    <div style="color: #ffd700; font-weight: bold;">${item.name}</div>
                                    <div style="color: #4a9eff; font-size: 0.8rem;">${item.priceFormatted}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${costs.noPriceCount > 0 ? `
                    <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255, 215, 0, 0.1); border-radius: 6px; font-size: 0.75rem; color: #ffd700;">
                        ⚠️ ${costs.noPriceCount} item(s) have no price data
                    </div>
                ` : ''}
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

        // Filter shards based on slot type and hero
        let filteredShards = this.allShards.filter(s => {
            // All shards (including hypershards) work on all slots
            // For hero-specific shards, filter by hero
            if (s.heroes && s.heroes.length > 0 && !s.heroes.includes('ALL')) {
                return s.heroes.includes(this.selectedHero?.name);
            }
            return true;
        });

        return `
            <div class="modal-overlay" onclick="if(event.target === this) HeroBuilderV2.closeModal()">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">💎 SELECT SHARD FOR ${slot.name}</div>
                        <button class="modal-close" onclick="HeroBuilderV2.closeModal()">✕ Close</button>
                    </div>
                    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
                        <input type="text" id="shardSearchInput"
                               placeholder="Search shards..."
                               style="flex: 1; padding: 0.75rem; background: rgba(0,0,0,0.5); border: 2px solid #444; border-radius: 6px; color: #fff;"
                               oninput="HeroBuilderV2.filterShardModal(this.value)">
                        <button class="btn btn-secondary" onclick="HeroBuilderV2.toggleHyperFilter()">
                            ${this.hyperFilterOnly ? '⭐ Hyper Only' : '🔵 All Shards'}
                        </button>
                    </div>
                    <div class="modal-grid" id="shardModalGrid">
                        ${filteredShards.slice(0, 50).map(shard => `
                            <div class="modal-item" data-name="${shard.name.toLowerCase()}" data-hyper="${shard.isHyper || false}"
                                 onclick="HeroBuilderV2.equipShard('${shard.name.replace(/'/g, "\\'")}')">
                                <div class="modal-item-name">${shard.name}</div>
                                <div class="modal-item-description">${shard.description || 'No description'}</div>
                                ${shard.isHyper ? `
                                    <span class="modal-item-rarity hyper">⭐ HYPERSHARD</span>
                                ` : `
                                    <span class="modal-item-rarity">${shard.rarity || 'Normal'}</span>
                                `}
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
            if (slot.type === 'weapon') return m.type === 'Weapon' || m.slot === 'weapon';
            if (slot.type === 'armor') return m.type === 'Armor' || m.slot === 'armor';
            if (slot.type === 'relic') return true;
            return false;
        });

        return `
            <div class="modal-overlay" onclick="if(event.target === this) HeroBuilderV2.closeModal()">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">🔧 SELECT MOD FOR ${slot.name}</div>
                        <button class="modal-close" onclick="HeroBuilderV2.closeModal()">✕ Close</button>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <input type="text" id="modSearchInput"
                               placeholder="Search mods..."
                               style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.5); border: 2px solid #444; border-radius: 6px; color: #fff;"
                               oninput="HeroBuilderV2.filterModModal(this.value)">
                    </div>
                    <div class="modal-grid" id="modModalGrid">
                        ${filteredMods.slice(0, 50).map(mod => `
                            <div class="modal-item" data-name="${mod.name.toLowerCase()}"
                                 onclick="HeroBuilderV2.equipMod('${mod.name.replace(/'/g, "\\'")}')">
                                <div class="modal-item-name">${mod.name}</div>
                                <div class="modal-item-description">${mod.description || 'No description'}</div>
                                <span class="modal-item-rarity">${mod.type || 'Mod'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderGearModal() {
        return `
            <div class="modal-overlay" onclick="if(event.target === this) HeroBuilderV2.closeModal()">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">🎁 EQUIP GEAR</div>
                        <button class="modal-close" onclick="HeroBuilderV2.closeModal()">✕ Close</button>
                    </div>
                    <div style="text-align: center; padding: 3rem; color: #aaa;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🎁</div>
                        <p>Gear browser coming soon!</p>
                        <p style="margin-top: 1rem; font-size: 0.9rem;">For now, selecting will create a placeholder item</p>
                        <button class="btn btn-primary" style="margin-top: 2rem;"
                                onclick="HeroBuilderV2.createPlaceholderGear()">
                            Create Placeholder Item
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Helper functions

    getHeroItemPower(heroId) {
        const build = this.builds[heroId];
        if (!build || !build.gear) return 0;

        let maxPower = 0;
        Object.values(build.gear).forEach(item => {
            if (item && item.itemPower > maxPower) {
                maxPower = item.itemPower;
            }
        });
        return maxPower;
    },

    getHeroAscension(heroId) {
        const build = this.builds[heroId];
        return build?.ascension || 0;
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
            notes: ''
        };
    },

    calculateBuildCost() {
        const build = this.getCurrentBuild();
        let shardCost = 0;
        let modCost = 0;
        let noPriceCount = 0;
        let expensiveItems = [];

        // Calculate shard costs
        Object.values(build.gear).forEach(item => {
            if (item && item.shards) {
                item.shards.forEach(shard => {
                    const priceEntry = this.prices.find(p => p.name === shard.name);
                    if (priceEntry) {
                        const price = this.parsePriceString(priceEntry[`${this.selectedPlatform}Price`]);
                        shardCost += price;
                        expensiveItems.push({
                            name: shard.name,
                            price: price,
                            priceFormatted: this.formatPrice(price),
                            type: 'shard'
                        });
                    } else {
                        noPriceCount++;
                    }
                });
            }
        });

        // Calculate mod costs
        Object.values(build.gear).forEach(item => {
            if (item && item.mods) {
                item.mods.forEach(mod => {
                    const priceEntry = this.prices.find(p => p.name === mod.name);
                    if (priceEntry) {
                        const price = this.parsePriceString(priceEntry[`${this.selectedPlatform}Price`]);
                        modCost += price;
                        expensiveItems.push({
                            name: mod.name,
                            price: price,
                            priceFormatted: this.formatPrice(price),
                            type: 'mod'
                        });
                    } else {
                        noPriceCount++;
                    }
                });
            }
        });

        // Sort by price descending
        expensiveItems.sort((a, b) => b.price - a.price);

        return {
            total: shardCost + modCost,
            totalFormatted: this.formatPrice(shardCost + modCost),
            shards: shardCost,
            shardsFormatted: this.formatPrice(shardCost),
            mods: modCost,
            modsFormatted: this.formatPrice(modCost),
            expensive: expensiveItems,
            noPriceCount: noPriceCount
        };
    },

    parsePriceString(priceStr) {
        if (!priceStr) return 0;

        // Handle strings like "10m", "5-8m", "1b", "600m+ 💡", etc.
        let cleanStr = priceStr.toString().toLowerCase();

        // Remove emoji and special chars
        cleanStr = cleanStr.replace(/[^0-9.mb-]/g, '');

        // Handle ranges - take the average
        if (cleanStr.includes('-')) {
            const parts = cleanStr.split('-');
            const low = this.parseSinglePrice(parts[0]);
            const high = this.parseSinglePrice(parts[1]);
            return (low + high) / 2;
        }

        return this.parseSinglePrice(cleanStr);
    },

    parseSinglePrice(str) {
        if (!str) return 0;

        let multiplier = 1;
        if (str.includes('b')) {
            multiplier = 1000000000;
        } else if (str.includes('m')) {
            multiplier = 1000000;
        }

        const numStr = str.replace(/[^0-9.]/g, '');
        return parseFloat(numStr || 0) * multiplier;
    },

    formatPrice(price) {
        if (price === 0) return '0';
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(1) + 'b';
        }
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1) + 'm';
        }
        return price.toLocaleString();
    },

    calculateTotalStats(build) {
        // Placeholder stats calculation
        return {
            health: 0,
            damage: 0,
            abilityPower: 0,
            armor: 0,
            critChance: 0,
            critDamage: 50
        };
    },

    // Event Handlers

    selectHero(heroId) {
        this.selectedHero = this.heroes.find(h => h.id === heroId);
        this.selectedSlot = null;
        DD2Toolkit.loadTool('hero-builder');
    },

    selectSlot(slotId) {
        this.selectedSlot = slotId;
        DD2Toolkit.loadTool('hero-builder');
    },

    selectPlatform(platform) {
        this.selectedPlatform = platform;
        DD2Toolkit.loadTool('hero-builder');
    },

    openShardModal(slotId, slotIndex) {
        this.selectedSlot = slotId;
        this.modalSlotIndex = slotIndex;
        this.modalType = 'shard';
        this.modalOpen = true;
        this.hyperFilterOnly = false;
        DD2Toolkit.loadTool('hero-builder');
    },

    openModModal(slotId, slotIndex) {
        this.selectedSlot = slotId;
        this.modalSlotIndex = slotIndex;
        this.modalType = 'mod';
        this.modalOpen = true;
        DD2Toolkit.loadTool('hero-builder');
    },

    openGearModal(slotId) {
        this.selectedSlot = slotId;
        this.modalType = 'gear';
        this.modalOpen = true;
        DD2Toolkit.loadTool('hero-builder');
    },

    closeModal() {
        this.modalOpen = false;
        this.modalType = null;
        this.modalSlotIndex = null;
        DD2Toolkit.loadTool('hero-builder');
    },

    toggleHyperFilter() {
        this.hyperFilterOnly = !this.hyperFilterOnly;
        this.filterShardModal(document.getElementById('shardSearchInput')?.value || '');
    },

    filterShardModal(searchTerm) {
        const grid = document.getElementById('shardModalGrid');
        if (!grid) return;

        const items = grid.querySelectorAll('.modal-item');
        items.forEach(item => {
            const name = item.getAttribute('data-name');
            const isHyper = item.getAttribute('data-hyper') === 'true';
            const matchesSearch = name.includes(searchTerm.toLowerCase());
            const matchesFilter = !this.hyperFilterOnly || isHyper;

            item.style.display = (matchesSearch && matchesFilter) ? 'block' : 'none';
        });
    },

    filterModModal(searchTerm) {
        const grid = document.getElementById('modModalGrid');
        if (!grid) return;

        const items = grid.querySelectorAll('.modal-item');
        items.forEach(item => {
            const name = item.getAttribute('data-name');
            item.style.display = name.includes(searchTerm.toLowerCase()) ? 'block' : 'none';
        });
    },

    equipGear(slotId) {
        this.selectedSlot = slotId;
        this.openGearModal(slotId);
    },

    createPlaceholderGear() {
        const build = this.getCurrentBuild();
        const slot = this.gearSlots.find(s => s.id === this.selectedSlot);

        build.gear[this.selectedSlot] = {
            id: `${this.selectedSlot}_${Date.now()}`,
            name: `Epic ${slot.name}`,
            type: slot.type,
            rarity: 'Mythical',
            itemPower: 10500,
            stats: {},
            mods: [],
            shards: []
        };

        this.saveBuild();
        this.closeModal();
    },

    equipShard(shardName) {
        const build = this.getCurrentBuild();
        const shard = this.allShards.find(s => s.name === shardName);

        if (!build.gear[this.selectedSlot]) {
            alert('Please equip a gear item first!');
            return;
        }

        if (!build.gear[this.selectedSlot].shards) {
            build.gear[this.selectedSlot].shards = [];
        }

        build.gear[this.selectedSlot].shards[this.modalSlotIndex] = {
            name: shard.name,
            description: shard.description,
            rarity: shard.rarity,
            isHyper: shard.isHyper || false
        };

        this.saveBuild();
        this.closeModal();
    },

    equipMod(modName) {
        const build = this.getCurrentBuild();
        const mod = this.allMods.find(m => m.name === modName);

        if (!build.gear[this.selectedSlot]) {
            alert('Please equip a gear item first!');
            return;
        }

        if (!build.gear[this.selectedSlot].mods) {
            build.gear[this.selectedSlot].mods = [];
        }

        build.gear[this.selectedSlot].mods[this.modalSlotIndex] = {
            name: mod.name,
            description: mod.description,
            tier: 10,
            type: mod.type
        };

        this.saveBuild();
        this.closeModal();
    },

    toggleAbility(abilityName) {
        const build = this.getCurrentBuild();
        const ability = this.abilities.find(a => a.name === abilityName);

        const existingIndex = build.abilities.findIndex(a => a.name === abilityName);
        if (existingIndex >= 0) {
            build.abilities.splice(existingIndex, 1);
        } else {
            build.abilities.push({
                name: ability.name,
                type: ability.abilityType,
                damageScalar: ability.damageScalar
            });
        }

        this.saveBuild();
        DD2Toolkit.loadTool('hero-builder');
    },

    clearBuild() {
        if (confirm('Are you sure you want to clear this build?')) {
            this.builds[this.selectedHero.id] = this.createEmptyBuild();
            this.saveBuild();
            DD2Toolkit.loadTool('hero-builder');
        }
    },

    loadBuilds() {
        try {
            const saved = localStorage.getItem('dd2_hero_builds_v2');
            if (saved) {
                this.builds = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load builds:', e);
        }
    },

    saveBuild() {
        try {
            localStorage.setItem('dd2_hero_builds_v2', JSON.stringify(this.builds));
            console.log('✅ Build saved');
        } catch (e) {
            console.error('Failed to save build:', e);
        }
    },

    exportBuild() {
        const build = this.getCurrentBuild();
        const costs = this.calculateBuildCost();

        const exportData = {
            hero: this.selectedHero.name,
            build: build,
            costs: {
                pc: this.selectedPlatform === 'pc' ? costs.totalFormatted : null,
                ps: this.selectedPlatform === 'ps' ? costs.totalFormatted : null,
                xbox: this.selectedPlatform === 'xbox' ? costs.totalFormatted : null
            },
            exported: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dd2_${this.selectedHero.name}_build_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
