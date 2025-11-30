/**
 * DD2 Data Cache System
 * Centralized loading and caching of all READ-ONLY JSON data files
 *
 * IMPORTANT: All JSON files are READ-ONLY. Never modify, save, or regenerate them.
 * This module only loads and caches data for consumption by tools.
 */

const DD2DataCache = {
    cache: {},
    loading: {},

    // Available data files (READ-ONLY)
    dataFiles: {
        // Defense & Tower Data
        defenses: 'data/dd2_defenses.json',
        towerDPS: 'data/tower_dps_efficiency.json',

        // Map & Drop Data
        godlyRates: 'data/godly_rates.json',
        onslaughtMaps: 'data/onslaught_maps.json',
        onslaughtToChaos: 'data/onslaught_to_chaos.json',
        survivalToChaos: 'data/Survival_to_chaos.json',

        // Difficulty & Progression
        difficulties: 'data/dd2_difficulties.json',

        // External Resources
        links: 'data/dd2_links.json',

        // Gear & Items (already loaded by some tools)
        mods: 'data/dd2_mods_data.json',
        shards: 'data/dd2_shards_data.json',
        abilities: 'data/dd2_abilities.json',
        prices: 'data/dd2_prices.json',
        rings: 'data/dd2_rings.json',
        perfectWeapons: 'data/P_Weapon.json',

        // Advanced Systems
        hypershards: 'data/hypershards.json',
        ancientPower: 'data/dd2_ap.json',
        materials: 'data/materials.json',
        masteryRewards: 'data/mastery_rewards.json',
        questlines: 'data/dd2_questlines.json',
        primeIncursions: 'data/Prime_incursions.json',

        // Item Schema (for validation)
        itemSchema: 'data/dd2_item.schema.json',
        itemExample: 'data/dd2_items.example.json'
    },

    /**
     * Load a specific data file
     * @param {string} key - Key from dataFiles object
     * @returns {Promise} Resolves with parsed JSON data
     */
    async load(key) {
        // Return cached data if available
        if (this.cache[key]) {
            return this.cache[key];
        }

        // Return existing loading promise if already loading
        if (this.loading[key]) {
            return this.loading[key];
        }

        // Start loading
        const filePath = this.dataFiles[key];
        if (!filePath) {
            console.error(`Unknown data key: ${key}`);
            return null;
        }

        this.loading[key] = fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${filePath}: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Cache the data
                this.cache[key] = data;
                delete this.loading[key];
                console.log(`✅ Loaded: ${key} (${filePath})`);
                return data;
            })
            .catch(error => {
                console.error(`❌ Error loading ${key}:`, error);
                delete this.loading[key];
                return null;
            });

        return this.loading[key];
    },

    /**
     * Load multiple data files concurrently
     * @param {string[]} keys - Array of data file keys
     * @returns {Promise<Object>} Object with key: data pairs
     */
    async loadMultiple(keys) {
        const promises = keys.map(key =>
            this.load(key).then(data => ({ key, data }))
        );

        const results = await Promise.all(promises);
        const dataMap = {};
        results.forEach(({ key, data }) => {
            dataMap[key] = data;
        });

        return dataMap;
    },

    /**
     * Preload commonly used data files
     */
    async preloadCommon() {
        const commonKeys = [
            'mods', 'shards', 'abilities', 'defenses',
            'towerDPS', 'godlyRates', 'difficulties', 'links'
        ];

        console.log('🔄 Preloading common data files...');
        await this.loadMultiple(commonKeys);
        console.log('✅ Common data files loaded!');
    },

    /**
     * Get cached data (synchronous)
     * Returns null if not loaded yet
     */
    get(key) {
        return this.cache[key] || null;
    },

    /**
     * Check if data is loaded
     */
    isLoaded(key) {
        return !!this.cache[key];
    },

    /**
     * Clear cache (for development/testing)
     */
    clearCache() {
        this.cache = {};
        this.loading = {};
        console.log('Cache cleared');
    }
};

// Helper functions for common data transformations

/**
 * Filter defenses by criteria
 */
DD2DataCache.filterDefenses = function(criteria = {}) {
    const defenses = this.get('defenses');
    if (!defenses) return [];

    let filtered = defenses;

    if (criteria.hero) {
        filtered = filtered.filter(d => d.hero === criteria.hero);
    }

    if (criteria.damageType) {
        filtered = filtered.filter(d =>
            d.damage_types && d.damage_types.includes(criteria.damageType)
        );
    }

    if (criteria.statusEffect) {
        filtered = filtered.filter(d =>
            d.status_effects && d.status_effects.includes(criteria.statusEffect)
        );
    }

    if (criteria.maxDU) {
        filtered = filtered.filter(d => d.du <= criteria.maxDU);
    }

    return filtered;
};

/**
 * Get map godly rate
 */
DD2DataCache.getMapGodlyRate = function(mapName, region = null) {
    const godlyRates = this.get('godlyRates');
    if (!godlyRates) return null;

    // Search in regions
    for (const [regionName, regionData] of Object.entries(godlyRates.regions || {})) {
        if (region && regionName !== region) continue;

        const map = regionData.maps?.find(m =>
            m.map_name.toLowerCase() === mapName.toLowerCase()
        );

        if (map) {
            return {
                region: regionName,
                map: map.map_name,
                godlyRate: map.godly_rate,
                gearTypes: map.gear_types || [],
                icon: regionData.icon
            };
        }
    }

    return null;
};

/**
 * Get Chaos equivalent for Onslaught floor
 */
DD2DataCache.getOnslaughtChaos = function(floor) {
    const mapping = this.get('onslaughtToChaos');
    if (!mapping) return null;

    // Find the appropriate tier
    for (const tier of mapping) {
        if (floor >= tier.floor_min && floor <= tier.floor_max) {
            return {
                chaos: tier.chaos_tier,
                floorRange: `${tier.floor_min}-${tier.floor_max}`,
                notes: tier.notes
            };
        }
    }

    return null;
};

/**
 * Get maps for Onslaught floor
 */
DD2DataCache.getOnslaughtMaps = function(floor) {
    const onslaughtMaps = this.get('onslaughtMaps');
    if (!onslaughtMaps) return [];

    // Determine floor group (XX0, XX1, etc.)
    const lastDigit = floor % 10;

    // Find matching group
    for (const group of onslaughtMaps) {
        if (group.group_type.includes(`XX${lastDigit}`)) {
            return group.maps || [];
        }
    }

    return [];
};

// Export
window.DD2DataCache = DD2DataCache;
