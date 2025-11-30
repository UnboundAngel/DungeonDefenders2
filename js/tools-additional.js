/**
 * DD2 Toolkit - Additional Tools (Part 2)
 * Tools that don't require hero/map data
 */

// ========================================
// DPS BENCHMARK SIMULATOR
// ========================================
const DPSBenchmark = {
    render() {
        return `
            <div class="tool-header">
                <h1 class="tool-title">⚔️ DPS Benchmark Simulator</h1>
                <p class="tool-description">Calculate theoretical DPS with crit, attack rate, and scaling</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Base Stats</h3>
                    <div class="input-group">
                        <label class="input-label">Base Damage</label>
                        <input type="number" class="input-field" id="dps-base-damage" value="10000" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Hero Damage (stat)</label>
                        <input type="number" class="input-field" id="dps-hero-damage" value="50000" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Attack Rate (attacks/sec)</label>
                        <input type="number" class="input-field" id="dps-attack-rate" value="1.5" min="0.1" step="0.1">
                    </div>

                    <h3 class="card-title mt-md">Crit Stats</h3>
                    <div class="input-group">
                        <label class="input-label">Crit Chance (%)</label>
                        <input type="number" class="input-field" id="dps-crit-chance" value="30" min="0" max="100">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Crit Damage (%)</label>
                        <input type="number" class="input-field" id="dps-crit-damage" value="150" min="0">
                    </div>

                    <h3 class="card-title mt-md">Multipliers</h3>
                    <div class="input-group">
                        <label class="input-label">Scaling % (from Hero Damage)</label>
                        <input type="number" class="input-field" id="dps-scaling" value="10" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Additional Damage Bonus (%)</label>
                        <input type="number" class="input-field" id="dps-bonus" value="0" min="0">
                    </div>

                    <button class="btn btn-primary mt-md" id="calculate-dps" style="width: 100%;">Calculate DPS</button>
                </div>

                <div class="neon-panel">
                    <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">DPS Results</h3>
                    <div id="dps-results">
                        <p style="color: var(--text-muted);">Enter values and calculate</p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('calculate-dps')?.addEventListener('click', () => this.calculate());
    },

    calculate() {
        const baseDamage = parseFloat(document.getElementById('dps-base-damage').value) || 0;
        const heroDamage = parseFloat(document.getElementById('dps-hero-damage').value) || 0;
        const attackRate = parseFloat(document.getElementById('dps-attack-rate').value) || 1;
        const critChance = parseFloat(document.getElementById('dps-crit-chance').value) || 0;
        const critDamage = parseFloat(document.getElementById('dps-crit-damage').value) || 0;
        const scaling = parseFloat(document.getElementById('dps-scaling').value) || 0;
        const bonus = parseFloat(document.getElementById('dps-bonus').value) || 0;

        // Calculate scaled damage
        const scaledDamage = baseDamage + (heroDamage * (scaling / 100));

        // Apply bonus
        const withBonus = scaledDamage * (1 + (bonus / 100));

        // Calculate crit multiplier
        const critMultiplier = 1 + (critChance / 100) * (critDamage / 100);

        // Final damage per hit
        const damagePerHit = Math.floor(withBonus * critMultiplier);

        // DPS
        const dps = Math.floor(damagePerHit * attackRate);

        const resultsDiv = document.getElementById('dps-results');
        resultsDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 3rem; color: var(--dd2-orange); font-weight: bold; margin-bottom: 0.5rem;">
                    ${DD2Utils.formatNumber(dps)}
                </div>
                <div style="color: var(--text-secondary); font-size: 1.2rem;">DPS</div>
            </div>

            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Damage Breakdown</h4>
                <p><strong>Base Damage:</strong> ${DD2Utils.formatNumber(baseDamage)}</p>
                <p><strong>+ Scaling (${scaling}%):</strong> ${DD2Utils.formatNumber(scaledDamage - baseDamage)}</p>
                <p><strong>Scaled Damage:</strong> ${DD2Utils.formatNumber(scaledDamage)}</p>
                <p><strong>With Bonus (${bonus}%):</strong> ${DD2Utils.formatNumber(withBonus)}</p>
                <p><strong>Crit Multiplier:</strong> ${critMultiplier.toFixed(2)}x</p>
                <p style="color: var(--dd2-orange); font-weight: bold; font-size: 1.1rem; margin-top: 0.5rem;">
                    <strong>Damage/Hit:</strong> ${DD2Utils.formatNumber(damagePerHit)}
                </p>
            </div>

            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px;">
                <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Rate Stats</h4>
                <p><strong>Attack Rate:</strong> ${attackRate} attacks/sec</p>
                <p><strong>Time per Attack:</strong> ${(1 / attackRate).toFixed(3)}s</p>
                <p><strong>Attacks per Minute:</strong> ${(attackRate * 60).toFixed(1)}</p>
            </div>
        `;
    }
};

// ========================================
// ANCIENT POWER PLANNING TOOL
// Official DD2 Wiki formulas - accurate calculations
// ========================================
const AncientPowerTool = {
    currentAP: 0,
    maxFloorEver: 30,
    maxAscensionEver: 250,
    perkPoints: {},
    apData: null,

    async loadAPData() {
        if (!this.apData) {
            this.apData = await DD2DataCache.load('ancientPower');
            if (this.apData) {
                console.log('✅ Loaded Ancient Power data from dd2_ap.json');
            }
        }
    },

    // Official DD2 Wiki floor requirements per AP
    getFloorRequirement(apLevel) {
        const floorTable = {
            0: 30, 1: 34, 2: 39, 3: 44, 4: 50, 5: 56, 6: 63, 7: 71, 8: 79, 9: 88,
            10: 97, 11: 107, 12: 117, 13: 128, 14: 139, 15: 151, 16: 163, 17: 176, 18: 189, 19: 203,
            20: 217, 21: 231, 22: 246, 23: 261, 24: 277, 25: 293, 26: 309, 27: 326, 28: 343, 29: 360,
            30: 377, 31: 394, 32: 412, 33: 430, 34: 448, 35: 466, 36: 484, 37: 502, 38: 520, 39: 538,
            40: 556, 41: 574, 42: 592, 43: 610, 44: 628, 45: 646, 46: 664, 47: 682, 48: 700, 49: 718
        };
        return apLevel >= 50 ? 320 : (floorTable[apLevel] || 30);
    },

    // AP Perk system - load from dd2_ap.json
    getPerks() {
        if (this.apData) {
            // Convert dd2_ap.json format to internal format
            const perks = {};
            for (const [key, data] of Object.entries(this.apData)) {
                // Convert from decimal format (0.04 = 4%) to percentage values
                const values = data.levels.slice(1).map(level => level * 100);
                perks[key.toLowerCase()] = {
                    name: data.name,
                    bonus: this.getBonusDescription(key),
                    values: values,
                    maxLevel: data.maxLevel
                };
            }
            return perks;
        }

        // Fallback to hardcoded values if JSON not loaded
        return {
            'ancientheroicpower': { name: 'Ancient Heroic Power', bonus: 'Hero Damage', values: [4, 6, 8, 9, 10], maxLevel: 5 },
            'ancienthealth': { name: 'Ancient Health', bonus: 'Hero Health', values: [4, 6, 8, 9, 10], maxLevel: 5 },
            'ancientdestruction': { name: 'Ancient Destruction', bonus: 'Defense Power', values: [4, 6, 8, 9, 10], maxLevel: 5 },
            'ancientfortification': { name: 'Ancient Fortification', bonus: 'Defense Health', values: [4, 6, 8, 9, 10], maxLevel: 5 },
            'ancientabilitypower': { name: 'Ancient Ability Power', bonus: 'Ability Power', values: [4, 6, 8, 9, 10], maxLevel: 5 }
        };
    },

    getBonusDescription(key) {
        const descriptions = {
            'AncientAbilityPower': 'Ability Power',
            'AncientHeroicPower': 'Hero Damage',
            'AncientHealth': 'Hero Health',
            'AncientResistance': 'All Resistance',
            'AncientLifeSteal': 'Life Steal',
            'AncientFortification': 'Defense Health',
            'AncientDestruction': 'Defense Power',
            'AncientStrikes': 'Critical Damage',
            'AncientCriticalDamage': 'Critical Damage',
            'AncientSpeed': 'Attack Rate'
        };
        return descriptions[key] || 'Bonus';
    },

    async render() {
        await this.loadAPData();
        this.loadData();
        const perks = this.getPerks();
        const nextFloorReq = this.getFloorRequirement(this.currentAP);

        return `
            <div class="tool-header">
                <h1 class="tool-title">🌟 Ancient Power Calculator</h1>
                <p class="tool-description">Official DD2 Wiki formulas - accurate reset planning and perk management</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Current Progress</h3>
                    <div class="input-group">
                        <label class="input-label">Current Ancient Power</label>
                        <input type="number" class="input-field" id="ap-current" value="${this.currentAP}" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Current Ascension Level</label>
                        <input type="number" class="input-field" id="ap-ascension" value="${this.maxAscensionEver}" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Highest Onslaught Floor Reached</label>
                        <input type="number" class="input-field" id="ap-floor" value="${this.maxFloorEver}" min="30">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Max Ascension Level Ever</label>
                        <input type="number" class="input-field" id="ap-max-ascension" value="${this.maxAscensionEver}" min="250">
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                            Used for minimum ascension calculation
                        </p>
                    </div>

                    <button class="btn btn-primary mt-md" id="calculate-ap" style="width: 100%;">Calculate Reset Requirements</button>
                    <button class="btn btn-secondary mt-sm" id="save-ap" style="width: 100%;">Save Progress</button>
                </div>

                <div class="neon-panel">
                    <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Next Reset Requirements</h3>
                    <div id="ap-requirements">
                        <p style="color: var(--text-muted);">Click Calculate to check eligibility</p>
                    </div>
                </div>
            </div>

            <div class="card mt-md">
                <h3 class="card-title">AP Perk Allocation (${this.currentAP} points available)</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Each reset gives +1 AP point. Allocate points to perks for stat bonuses.
                </p>
                <div id="perk-allocation" class="grid-2">
                    ${Object.entries(perks).map(([key, perk]) => {
                        const points = this.perkPoints[key] || 0;
                        const maxLevel = perk.maxLevel || 10;
                        const bonus = points > 0 ? perk.values[Math.min(points - 1, perk.values.length - 1)] : 0;
                        return `
                            <div class="card" style="background: var(--bg-input);">
                                <h4 style="color: var(--dd2-purple);">${perk.name}</h4>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${perk.bonus}: +${bonus.toFixed(1)}%</p>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <button class="btn btn-danger" onclick="AncientPowerTool.adjustPerk('${key}', -1)" style="padding: 0.25rem 0.75rem;">−</button>
                                    <div style="flex: 1; text-align: center; font-size: 1.2rem; font-weight: bold; color: var(--dd2-orange);">
                                        ${points} / ${maxLevel}
                                    </div>
                                    <button class="btn btn-primary" onclick="AncientPowerTool.adjustPerk('${key}', 1)" style="padding: 0.25rem 0.75rem;">+</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--dd2-orange);">
                    <p style="color: var(--text-primary);"><strong>Allocated Points:</strong> <span id="total-allocated">0</span> / ${this.currentAP}</p>
                    <p style="color: var(--text-primary);"><strong>Unspent Points:</strong> <span id="unspent-points">${this.currentAP}</span></p>
                </div>
            </div>

            <div class="card mt-md">
                <h3 class="card-title">Account Bonuses</h3>
                <div id="account-bonuses">
                    ${this.renderAccountBonuses()}
                </div>
            </div>
        `;
    },

    renderAccountBonuses() {
        const goldBonus = this.currentAP * 5;
        const expBonus = this.currentAP * 5;
        const talentCap = this.calculateTalentCap();

        return `
            <div class="grid-2">
                <div style="padding: 1rem; background: var(--bg-input); border-radius: 8px;">
                    <p style="color: var(--dd2-gold); font-weight: bold;">💰 Gold Bonus</p>
                    <p style="font-size: 1.5rem; color: var(--text-primary);">+${goldBonus}%</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">+5% per AP reset</p>
                </div>
                <div style="padding: 1rem; background: var(--bg-input); border-radius: 8px;">
                    <p style="color: var(--dd2-purple); font-weight: bold;">⭐ EXP Bonus</p>
                    <p style="font-size: 1.5rem; color: var(--text-primary);">+${expBonus}%</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">+5% per AP reset</p>
                </div>
                <div style="padding: 1rem; background: var(--bg-input); border-radius: 8px;">
                    <p style="color: var(--dd2-orange); font-weight: bold;">📊 Talent Cap Bonus</p>
                    <p style="font-size: 1.5rem; color: var(--text-primary);">+${talentCap.toFixed(0)}</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">(Floor - 30) × 4.16 + (Asc / 50)</p>
                </div>
                <div style="padding: 1rem; background: var(--bg-input); border-radius: 8px;">
                    <p style="color: var(--dd2-cyan); font-weight: bold;">🎯 Min Ascension After Reset</p>
                    <p style="font-size: 1.5rem; color: var(--text-primary);">${this.calculateMinAscension().toFixed(0)}</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Minimum level after next reset</p>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('calculate-ap')?.addEventListener('click', () => this.calculate());
        document.getElementById('save-ap')?.addEventListener('click', () => this.saveProgress());
        this.updatePerkDisplay();
    },

    calculateTalentCap() {
        const floor = parseInt(document.getElementById('ap-floor')?.value) || this.maxFloorEver;
        const ascension = parseInt(document.getElementById('ap-ascension')?.value) || this.maxAscensionEver;
        return (Math.max(0, floor - 30) * 4.16) + (ascension / 50);
    },

    calculateMinAscension() {
        const maxFloor = parseInt(document.getElementById('ap-floor')?.value) || this.maxFloorEver;
        const maxAsc = parseInt(document.getElementById('ap-max-ascension')?.value) || this.maxAscensionEver;
        return ((Math.max(0, maxFloor - 30) * 4.16) + (maxAsc / 50)) * 3;
    },

    calculate() {
        const currentAP = parseInt(document.getElementById('ap-current').value) || 0;
        const ascension = parseInt(document.getElementById('ap-ascension').value) || 0;
        const floor = parseInt(document.getElementById('ap-floor').value) || 30;
        const maxAsc = parseInt(document.getElementById('ap-max-ascension').value) || ascension;

        // Get requirements
        const requiredFloor = this.getFloorRequirement(currentAP);
        const requiredAscension = currentAP === 0 ? 250 : this.calculateMinAscension();

        const floorMet = floor >= requiredFloor;
        const ascensionMet = ascension >= requiredAscension;
        const canReset = floorMet && ascensionMet;

        const resultsDiv = document.getElementById('ap-requirements');
        resultsDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem; padding: 1rem; background: ${canReset ? 'var(--dd2-orange)' : 'var(--bg-card)'}; border-radius: 12px;">
                <h2 style="font-size: 2.5rem; margin: 0; color: ${canReset ? 'white' : 'var(--text-muted)'};">
                    ${canReset ? '✅ Ready to Reset!' : '❌ Not Ready'}
                </h2>
            </div>

            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Floor Requirement</h4>
                <p><strong>Required Floor:</strong> ${requiredFloor}</p>
                <p><strong>Your Highest Floor:</strong> ${floor}</p>
                <p><strong>Status:</strong> ${floorMet ? '✅ Met' : `❌ Need ${requiredFloor - floor} more floors`}</p>
            </div>

            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Ascension Requirement</h4>
                <p><strong>Required Ascension:</strong> ${Math.ceil(requiredAscension)}</p>
                <p><strong>Your Ascension:</strong> ${ascension}</p>
                <p><strong>Status:</strong> ${ascensionMet ? '✅ Met' : `❌ Need ${Math.ceil(requiredAscension - ascension)} more levels`}</p>
            </div>

            ${canReset ? `
                <div style="background: linear-gradient(135deg, var(--dd2-orange), var(--dd2-purple)); padding: 1rem; border-radius: 8px; color: white;">
                    <h4 style="margin-bottom: 0.5rem;">After Reset</h4>
                    <p><strong>New AP:</strong> ${currentAP + 1}</p>
                    <p><strong>Gold Bonus:</strong> +${(currentAP + 1) * 5}%</p>
                    <p><strong>EXP Bonus:</strong> +${(currentAP + 1) * 5}%</p>
                    <p><strong>Next Required Floor:</strong> ${this.getFloorRequirement(currentAP + 1)}</p>
                </div>
            ` : `
                <div style="background: var(--bg-input); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--dd2-orange);">
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        <strong>What to do:</strong> ${!floorMet ? `Push to floor ${requiredFloor}. ` : ''}${!ascensionMet ? `Gain ${Math.ceil(requiredAscension - ascension)} ascension levels.` : ''}
                    </p>
                </div>
            `}
        `;
    },

    adjustPerk(perkKey, delta) {
        const current = this.perkPoints[perkKey] || 0;
        const totalAllocated = Object.values(this.perkPoints).reduce((sum, val) => sum + val, 0);

        const newValue = Math.max(0, Math.min(10, current + delta));

        // Check if we have enough points
        if (delta > 0 && totalAllocated >= this.currentAP) {
            DD2Utils.showToast('No unspent AP points available!', 'error');
            return;
        }

        this.perkPoints[perkKey] = newValue;
        if (newValue === 0) delete this.perkPoints[perkKey];

        this.saveData();
        DD2Toolkit.loadTool('ancient-power');
    },

    updatePerkDisplay() {
        const totalAllocated = Object.values(this.perkPoints).reduce((sum, val) => sum + val, 0);
        const unspent = this.currentAP - totalAllocated;

        const allocatedEl = document.getElementById('total-allocated');
        const unspentEl = document.getElementById('unspent-points');

        if (allocatedEl) allocatedEl.textContent = totalAllocated;
        if (unspentEl) unspentEl.textContent = unspent;
    },

    saveProgress() {
        const currentAP = parseInt(document.getElementById('ap-current').value) || 0;
        const floor = parseInt(document.getElementById('ap-floor').value) || 30;
        const ascension = parseInt(document.getElementById('ap-ascension').value) || 250;
        const maxAsc = parseInt(document.getElementById('ap-max-ascension').value) || ascension;

        this.currentAP = currentAP;
        this.maxFloorEver = Math.max(this.maxFloorEver, floor);
        this.maxAscensionEver = Math.max(this.maxAscensionEver, ascension, maxAsc);

        this.saveData();
        DD2Utils.showToast('Progress saved!', 'success');
    },

    loadData() {
        const data = DD2Storage.load('ancient_power', {
            currentAP: 0,
            maxFloorEver: 30,
            maxAscensionEver: 250,
            perkPoints: {}
        });
        this.currentAP = data.currentAP;
        this.maxFloorEver = data.maxFloorEver;
        this.maxAscensionEver = data.maxAscensionEver;
        this.perkPoints = data.perkPoints || {};
    },

    saveData() {
        DD2Storage.save('ancient_power', {
            currentAP: this.currentAP,
            maxFloorEver: this.maxFloorEver,
            maxAscensionEver: this.maxAscensionEver,
            perkPoints: this.perkPoints
        });
    }
};

// ========================================
// GEAR STATS SIMULATOR
// ========================================
const GearSimulator = {
    pWeapons: [],
    rings: [],

    async render() {
        await this.loadGearData();
        return `
            <div class="tool-header">
                <h1 class="tool-title">⚙️ Gear Stats Simulator</h1>
                <p class="tool-description">Calculate gear stat ranges, browse premium weapons, and prime rings</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Gear Parameters</h3>
                    <div class="input-group">
                        <label class="input-label">Chaos Tier</label>
                        <select class="input-field" id="gear-chaos">
                            <option value="1">Chaos 1</option>
                            <option value="2">Chaos 2</option>
                            <option value="3">Chaos 3</option>
                            <option value="4">Chaos 4</option>
                            <option value="5">Chaos 5</option>
                            <option value="6">Chaos 6</option>
                            <option value="7">Chaos 7</option>
                            <option value="8">Chaos 8</option>
                            <option value="9">Chaos 9</option>
                            <option value="10" selected>Chaos 10</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Rarity</label>
                        <select class="input-field" id="gear-rarity">
                            <option value="common">Common</option>
                            <option value="uncommon">Uncommon</option>
                            <option value="rare">Rare</option>
                            <option value="epic">Epic</option>
                            <option value="mythical" selected>Mythical</option>
                            <option value="legendary">Legendary</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Item Type</label>
                        <select class="input-field" id="gear-type">
                            <option value="weapon">Weapon</option>
                            <option value="armor">Armor</option>
                            <option value="relic" selected>Relic</option>
                            <option value="medal">Medal</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Quality Modifier (%)</label>
                        <input type="number" class="input-field" id="gear-quality" value="100" min="0" max="130">
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                            100% = max base, 130% = max with upgrades
                        </p>
                    </div>

                    <button class="btn btn-primary mt-md" id="simulate-gear" style="width: 100%;">Simulate Stats</button>
                </div>

                <div class="neon-panel">
                    <h3 style="color: var(--dd2-orange); margin-bottom: 1rem;">Stat Ranges</h3>
                    <div id="gear-results">
                        <p style="color: var(--text-muted);">Configure gear and simulate</p>
                    </div>
                </div>
            </div>

            <!-- Premium Weapons Reference -->
            ${this.renderPWeaponsReference()}

            <!-- Prime Rings Reference -->
            ${this.renderRingsReference()}
        `;
    },

    async loadGearData() {
        try {
            // Load premium weapons from P_Weapon.json
            const pWeaponsData = await DD2DataCache.load('pWeapons');
            if (pWeaponsData && Array.isArray(pWeaponsData)) {
                this.pWeapons = pWeaponsData;
                console.log('✅ Loaded', this.pWeapons.length, 'premium weapons from P_Weapon.json');
            }

            // Load rings from dd2_rings.json
            const ringsData = await DD2DataCache.load('rings');
            if (ringsData?.rings) {
                this.rings = ringsData.rings;
                console.log('✅ Loaded', this.rings.length, 'rings from dd2_rings.json');
            }
        } catch (e) {
            console.error('Failed to load gear data:', e);
        }
    },

    renderPWeaponsReference() {
        if (!this.pWeapons || this.pWeapons.length === 0) {
            return '';
        }

        // Group weapons by category
        const byCategory = {};
        this.pWeapons.forEach(weapon => {
            const category = weapon.category || 'Other';
            if (!byCategory[category]) {
                byCategory[category] = [];
            }
            byCategory[category].push(weapon);
        });

        return `
            <div class="card mt-md">
                <h3 class="card-title">⚔️ Premium Weapons Database</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
                    Special weapons with unique stats and drop locations. Total: ${this.pWeapons.length} weapons
                </p>

                ${Object.keys(byCategory).sort().map(category => `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--dd2-orange); margin-bottom: 1rem; font-size: 1.1rem;">
                            ${category} (${byCategory[category].length})
                        </h4>
                        <div class="grid-2" style="gap: 0.75rem;">
                            ${byCategory[category].map(weapon => `
                                <div class="card" style="background: var(--bg-input); padding: 0.75rem;">
                                    <h5 style="color: var(--dd2-purple); margin-bottom: 0.5rem; font-size: 0.95rem;">
                                        ${weapon.name}
                                    </h5>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
                                        <p><strong>Attack Speed:</strong> ${weapon.attack_speed_raw || 'N/A'}</p>
                                        <p><strong>Projectiles:</strong> ${weapon.projectile_raw || 'N/A'}</p>
                                        <p><strong>Main Stat:</strong> ${weapon.main_stat ? weapon.main_stat.join(', ') : 'N/A'}</p>
                                        <p><strong>Drop Rate:</strong> ${weapon.drop_rate || 'Unknown'}</p>
                                        <p style="color: var(--dd2-orange);"><strong>Location:</strong> ${weapon.drop_location || 'Unknown'}</p>
                                        ${weapon.special ? `<p style="color: var(--dd2-gold); margin-top: 0.5rem;"><strong>Special:</strong> ${weapon.special}</p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderRingsReference() {
        if (!this.rings || this.rings.length === 0) {
            return '';
        }

        return `
            <div class="card mt-md">
                <h3 class="card-title">💍 Prime Rings Collection</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
                    Special rings from Prime Incursions and Survival. Total: ${this.rings.length} rings
                </p>

                <div class="grid-3" style="gap: 1rem;">
                    ${this.rings.map(ring => `
                        <div class="card" style="background: var(--bg-input); padding: 1rem; text-align: center;">
                            ${ring.iconUrl ? `
                                <img src="${ring.iconUrl}" alt="${ring.name}"
                                     style="width: 64px; height: 64px; margin: 0 auto 0.75rem; display: block; border-radius: 8px;"
                                     onerror="this.style.display='none'">
                            ` : ''}
                            <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem; font-size: 1rem;">
                                ${ring.name}
                            </h4>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">
                                ${ring.acquisition}
                            </p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('simulate-gear')?.addEventListener('click', () => this.simulate());
    },

    simulate() {
        const chaos = parseInt(document.getElementById('gear-chaos').value);
        const rarity = document.getElementById('gear-rarity').value;
        const type = document.getElementById('gear-type').value;
        const quality = parseFloat(document.getElementById('gear-quality').value) / 100;

        // Base stat multipliers per chaos tier (simplified)
        const chaosMultiplier = {
            1: 1.0, 2: 1.5, 3: 2.0, 4: 2.5, 5: 3.0,
            6: 3.5, 7: 4.0, 8: 4.5, 9: 5.0, 10: 6.0
        }[chaos];

        // Rarity multipliers
        const rarityMultiplier = {
            common: 0.6, uncommon: 0.75, rare: 0.9,
            epic: 1.0, mythical: 1.15, legendary: 1.3
        }[rarity];

        // Base values for Chaos 10 Mythical
        const baseStats = {
            weapon: { primary: 50000, secondary: 30000 },
            armor: { defense: 40000, health: 25000 },
            relic: { power: 45000, range: 3000 },
            medal: { bonus: 35000, special: 20000 }
        }[type];

        // Calculate final ranges
        const finalMultiplier = chaosMultiplier * rarityMultiplier * quality;
        const stats = {};
        Object.keys(baseStats).forEach(stat => {
            const base = baseStats[stat];
            const min = Math.floor(base * finalMultiplier * 0.85);
            const max = Math.floor(base * finalMultiplier * 1.15);
            stats[stat] = { min, max };
        });

        const resultsDiv = document.getElementById('gear-results');
        resultsDiv.innerHTML = `
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">Configuration</h4>
                <p><strong>Chaos Tier:</strong> ${chaos}</p>
                <p><strong>Rarity:</strong> ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</p>
                <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p><strong>Quality:</strong> ${(quality * 100).toFixed(0)}%</p>
            </div>

            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--dd2-orange); margin-bottom: 0.5rem;">Stat Ranges</h4>
                ${Object.entries(stats).map(([stat, range]) => `
                    <div style="margin-bottom: 0.75rem;">
                        <p style="color: var(--dd2-purple); font-weight: bold; text-transform: capitalize;">
                            ${stat.replace('_', ' ')}
                        </p>
                        <p style="font-size: 1.2rem; color: var(--text-primary);">
                            ${DD2Utils.formatNumber(range.min)} - ${DD2Utils.formatNumber(range.max)}
                        </p>
                    </div>
                `).join('')}
            </div>

            <div style="background: var(--bg-input); padding: 0.75rem; border-radius: 8px; border-left: 3px solid var(--dd2-gold);">
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    <strong>Multiplier Applied:</strong> ${finalMultiplier.toFixed(2)}x
                </p>
            </div>
        `;
    }
};

// ========================================
// SHARD WISHLIST & COLLECTION TRACKER
// ========================================
const ShardWishlist = {
    collection: [],
    wishlist: [],
    allShards: [],

    async render() {
        await this.loadShards();
        this.loadData();

        const collected = this.collection.length;
        const total = this.allShards.length;
        const percent = total > 0 ? ((collected / total) * 100).toFixed(1) : 0;

        return `
            <div class="tool-header">
                <h1 class="tool-title">💎 Shard Collection & Wishlist</h1>
                <p class="tool-description">Track collected shards and create your wishlist</p>
            </div>

            <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid var(--dd2-purple);">
                <div class="flex-between" style="margin-bottom: 1rem;">
                    <div>
                        <h3 style="color: var(--dd2-orange);">Collection Progress</h3>
                        <p style="color: var(--text-secondary);">${collected} / ${total} shards (${percent}%)</p>
                    </div>
                    <div>
                        <h3 style="color: var(--dd2-purple);">Wishlist</h3>
                        <p style="color: var(--text-secondary);">${this.wishlist.length} shards</p>
                    </div>
                </div>
                <div style="background: var(--bg-input); height: 24px; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, var(--dd2-orange), var(--dd2-purple));
                                height: 100%; width: ${percent}%;
                                transition: width 0.5s ease;"></div>
                </div>
            </div>

            <div class="card mb-md">
                <div class="input-group">
                    <label class="input-label">Search Shards</label>
                    <input type="text" class="input-field" id="shard-wishlist-search" placeholder="Search by name...">
                </div>
            </div>

            <div class="grid-2" style="align-items: start;">
                <div class="card">
                    <h3 class="card-title">All Shards (${this.allShards.length})</h3>
                    <div id="all-shards-list" style="max-height: 600px; overflow-y: auto;">
                        ${this.renderAllShards()}
                    </div>
                </div>

                <div>
                    <div class="card mb-md">
                        <h3 class="card-title">Wishlist (${this.wishlist.length})</h3>
                        <div id="wishlist-items" style="max-height: 300px; overflow-y: auto;">
                            ${this.renderWishlist()}
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="card-title">Collected (${collected})</h3>
                        <button class="btn btn-secondary mb-sm" id="clear-collection" style="width: 100%;">Clear Collection</button>
                        <div id="collected-items" style="max-height: 250px; overflow-y: auto;">
                            ${this.renderCollected()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderAllShards() {
        const searchTerm = document.getElementById('shard-wishlist-search')?.value.toLowerCase() || '';
        const filtered = this.allShards.filter(shard =>
            shard.name.toLowerCase().includes(searchTerm) ||
            (shard.description && shard.description.toLowerCase().includes(searchTerm))
        );

        if (filtered.length === 0) {
            return '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No shards found</p>';
        }

        return filtered.slice(0, 100).map(shard => {
            const isCollected = this.collection.includes(shard.name);
            const isWishlisted = this.wishlist.includes(shard.name);

            return `
                <div style="padding: 0.75rem; border-bottom: 1px solid var(--dd2-purple); ${isCollected ? 'opacity: 0.5;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong style="color: var(--dd2-purple);">${shard.name}</strong>
                        <div style="display: flex; gap: 0.5rem;">
                            ${!isCollected ? `
                                <button onclick="ShardWishlist.toggleWishlist('${shard.name.replace(/'/g, "\\'")}', event)"
                                        style="background: ${isWishlisted ? 'var(--dd2-gold)' : 'var(--dd2-purple)'};
                                               border: none; padding: 0.25rem 0.5rem; border-radius: 4px;
                                               color: white; cursor: pointer; font-size: 0.85rem;">
                                    ${isWishlisted ? '⭐' : '☆'}
                                </button>
                            ` : ''}
                            <button onclick="ShardWishlist.toggleCollected('${shard.name.replace(/'/g, "\\'")}', event)"
                                    style="background: ${isCollected ? 'var(--dd2-orange)' : 'var(--bg-input)'};
                                           border: none; padding: 0.25rem 0.5rem; border-radius: 4px;
                                           color: white; cursor: pointer; font-size: 0.85rem;">
                                ${isCollected ? '✓' : '+'}
                            </button>
                        </div>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">${shard.description || ''}</p>
                </div>
            `;
        }).join('');
    },

    renderWishlist() {
        if (this.wishlist.length === 0) {
            return '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No wishlist items</p>';
        }

        return this.wishlist.map(name => `
            <div style="padding: 0.5rem; border-bottom: 1px solid var(--dd2-purple); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--dd2-gold);">⭐ ${name}</span>
                <button onclick="ShardWishlist.removeFromWishlist('${name.replace(/'/g, "\\'")}', event)"
                        style="background: #ef4444; border: none; padding: 0.25rem 0.5rem;
                               border-radius: 4px; color: white; cursor: pointer;">×</button>
            </div>
        `).join('');
    },

    renderCollected() {
        if (this.collection.length === 0) {
            return '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No collected shards</p>';
        }

        return this.collection.map(name => `
            <div style="padding: 0.5rem; border-bottom: 1px solid var(--dd2-purple); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--dd2-orange);">✓ ${name}</span>
                <button onclick="ShardWishlist.toggleCollected('${name.replace(/'/g, "\\'")}', event)"
                        style="background: #ef4444; border: none; padding: 0.25rem 0.5rem;
                               border-radius: 4px; color: white; cursor: pointer;">×</button>
            </div>
        `).join('');
    },

    init() {
        const searchInput = document.getElementById('shard-wishlist-search');
        searchInput?.addEventListener('input', DD2Utils.debounce(() => {
            DD2Toolkit.loadTool('shard-wishlist');
        }, 300));

        document.getElementById('clear-collection')?.addEventListener('click', () => {
            if (confirm('Clear your entire collection?')) {
                this.collection = [];
                this.saveData();
                DD2Toolkit.loadTool('shard-wishlist');
                DD2Utils.showToast('Collection cleared', 'info');
            }
        });
    },

    toggleCollected(name, event) {
        event?.stopPropagation();
        const index = this.collection.indexOf(name);
        if (index > -1) {
            this.collection.splice(index, 1);
            DD2Utils.showToast(`Removed from collection`, 'info');
        } else {
            this.collection.push(name);
            // Remove from wishlist if collected
            const wishIndex = this.wishlist.indexOf(name);
            if (wishIndex > -1) {
                this.wishlist.splice(wishIndex, 1);
            }
            DD2Utils.showToast(`Added to collection!`, 'success');
        }
        this.saveData();
        DD2Toolkit.loadTool('shard-wishlist');
    },

    toggleWishlist(name, event) {
        event?.stopPropagation();
        const index = this.wishlist.indexOf(name);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            DD2Utils.showToast(`Removed from wishlist`, 'info');
        } else {
            this.wishlist.push(name);
            DD2Utils.showToast(`Added to wishlist!`, 'success');
        }
        this.saveData();
        DD2Toolkit.loadTool('shard-wishlist');
    },

    removeFromWishlist(name, event) {
        event?.stopPropagation();
        const index = this.wishlist.indexOf(name);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.saveData();
            DD2Toolkit.loadTool('shard-wishlist');
        }
    },

    async loadShards() {
        try {
            const response = await fetch('data/dd2_shards_data.json');
            const data = await response.json();
            this.allShards = data.filter(s => s.name && !s.name.startsWith('http'));
        } catch (e) {
            console.error('Failed to load shards:', e);
            this.allShards = [];
        }
    },

    loadData() {
        const data = DD2Storage.load('shard_wishlist', { collection: [], wishlist: [] });
        this.collection = data.collection;
        this.wishlist = data.wishlist;
    },

    saveData() {
        DD2Storage.save('shard_wishlist', {
            collection: this.collection,
            wishlist: this.wishlist
        });
    }
};

// ========================================
// LOADOUT SHARING
// ========================================
const LoadoutSharing = {
    render() {
        return `
            <div class="tool-header">
                <h1 class="tool-title">🔗 Loadout Sharing</h1>
                <p class="tool-description">Export and import builds as JSON or shareable text</p>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3 class="card-title">Create Loadout</h3>
                    <div class="input-group">
                        <label class="input-label">Build Name</label>
                        <input type="text" class="input-field" id="loadout-name" placeholder="My DPS Build">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Description</label>
                        <textarea class="input-field" id="loadout-desc" rows="3" placeholder="Build description..."></textarea>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Build Data (JSON)</label>
                        <textarea class="input-field" id="loadout-data" rows="8" placeholder='{"gear": [], "mods": [], "shards": []}'></textarea>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn-primary" id="export-loadout" style="flex: 1;">Export</button>
                        <button class="btn btn-secondary" id="copy-loadout" style="flex: 1;">Copy</button>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Import Loadout</h3>
                    <div class="input-group">
                        <label class="input-label">Paste Loadout JSON</label>
                        <textarea class="input-field" id="import-data" rows="12" placeholder="Paste exported JSON here..."></textarea>
                    </div>
                    <button class="btn btn-primary" id="import-loadout" style="width: 100%;">Import</button>

                    <div id="imported-loadout" class="mt-md" style="display: none;">
                        <h4 style="color: var(--dd2-orange);">Imported Loadout</h4>
                        <div id="imported-content" style="background: var(--bg-input); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-md">
                <h3 class="card-title">Saved Loadouts</h3>
                <div id="saved-loadouts">
                    ${this.renderSavedLoadouts()}
                </div>
            </div>
        `;
    },

    renderSavedLoadouts() {
        const saved = DD2Storage.load('saved_loadouts', []);
        if (saved.length === 0) {
            return '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No saved loadouts</p>';
        }

        return `
            <div class="grid-3">
                ${saved.map((loadout, idx) => `
                    <div class="card">
                        <h4 style="color: var(--dd2-orange);">${loadout.name}</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">${loadout.description || 'No description'}</p>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Saved: ${DD2Utils.formatDate(loadout.timestamp)}</p>
                        <div class="flex gap-sm mt-sm">
                            <button onclick="LoadoutSharing.loadSaved(${idx})" class="btn btn-secondary" style="flex: 1; padding: 0.5rem;">Load</button>
                            <button onclick="LoadoutSharing.deleteSaved(${idx})" class="btn btn-danger" style="flex: 1; padding: 0.5rem;">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    init() {
        document.getElementById('export-loadout')?.addEventListener('click', () => this.exportLoadout());
        document.getElementById('copy-loadout')?.addEventListener('click', () => this.copyLoadout());
        document.getElementById('import-loadout')?.addEventListener('click', () => this.importLoadout());
    },

    exportLoadout() {
        const name = document.getElementById('loadout-name').value || 'Unnamed Build';
        const description = document.getElementById('loadout-desc').value || '';
        const dataStr = document.getElementById('loadout-data').value;

        let data;
        try {
            data = JSON.parse(dataStr);
        } catch (e) {
            DD2Utils.showToast('Invalid JSON data!', 'error');
            return;
        }

        const loadout = {
            name,
            description,
            data,
            timestamp: Date.now(),
            version: '1.0'
        };

        // Save to saved loadouts
        const saved = DD2Storage.load('saved_loadouts', []);
        saved.push(loadout);
        DD2Storage.save('saved_loadouts', saved);

        // Download as file
        DD2Utils.downloadJSON(loadout, `${name.replace(/\s+/g, '_')}_loadout.json`);
        DD2Utils.showToast('Loadout exported!', 'success');

        DD2Toolkit.loadTool('loadout-sharing');
    },

    async copyLoadout() {
        const name = document.getElementById('loadout-name').value || 'Unnamed Build';
        const description = document.getElementById('loadout-desc').value || '';
        const dataStr = document.getElementById('loadout-data').value;

        let data;
        try {
            data = JSON.parse(dataStr);
        } catch (e) {
            DD2Utils.showToast('Invalid JSON data!', 'error');
            return;
        }

        const loadout = { name, description, data, timestamp: Date.now(), version: '1.0' };
        const json = JSON.stringify(loadout, null, 2);

        try {
            await DD2Utils.copyToClipboard(json);
            DD2Utils.showToast('Copied to clipboard!', 'success');
        } catch (e) {
            DD2Utils.showToast('Failed to copy', 'error');
        }
    },

    importLoadout() {
        const importData = document.getElementById('import-data').value;
        if (!importData.trim()) {
            DD2Utils.showToast('Please paste loadout data', 'info');
            return;
        }

        try {
            const loadout = JSON.parse(importData);

            const importedDiv = document.getElementById('imported-loadout');
            const contentDiv = document.getElementById('imported-content');

            contentDiv.innerHTML = `
                <h4 style="color: var(--dd2-purple); margin-bottom: 0.5rem;">${loadout.name}</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${loadout.description || 'No description'}</p>
                <pre style="background: var(--bg-card); padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; color: var(--text-primary);">${JSON.stringify(loadout.data, null, 2)}</pre>
            `;

            importedDiv.style.display = 'block';
            DD2Utils.showToast('Loadout imported!', 'success');
        } catch (e) {
            DD2Utils.showToast('Invalid loadout format!', 'error');
        }
    },

    loadSaved(idx) {
        const saved = DD2Storage.load('saved_loadouts', []);
        const loadout = saved[idx];
        if (!loadout) return;

        document.getElementById('loadout-name').value = loadout.name;
        document.getElementById('loadout-desc').value = loadout.description || '';
        document.getElementById('loadout-data').value = JSON.stringify(loadout.data, null, 2);

        DD2Utils.showToast(`Loaded: ${loadout.name}`, 'success');
    },

    deleteSaved(idx) {
        if (!confirm('Delete this loadout?')) return;

        const saved = DD2Storage.load('saved_loadouts', []);
        saved.splice(idx, 1);
        DD2Storage.save('saved_loadouts', saved);

        DD2Toolkit.loadTool('loadout-sharing');
        DD2Utils.showToast('Loadout deleted', 'info');
    }
};
