# 🎮 DD2 Toolkit - Complete Interactive Suite

A comprehensive web-based toolkit for Dungeon Defenders 2 players with 20+ interactive features, DD2-themed UI, and full offline support.

## 🚀 Quick Start

Open `toolkit.html` in your browser to access the full suite of tools!

## ✨ Features

### 🏗️ Builders & Planners
- **Hero Builder** - Build heroes with gear slots, mods, and shards (needs hero data)
- **Strategy Planner** - Multi-hero defense planning with lane assignments (needs hero/map data)

### 📊 Calculators
- **Gold/Hour Calculator** ✅ - Calculate farming efficiency
- **DPS Benchmark Simulator** ✅ - Simulate DPS with crit, attack rate, and scaling calculations
- **Ancient Power Planning Tool** ✅ - Plan AP reset timing with stat bonus projections
- **Gear Stats Simulator** ✅ - Generate stat ranges based on chaos tier, rarity, and quality

### 📚 Browsers & Databases
- **Mod Browser** ✅ - Search and filter all 300+ defense and hero mods
- **Shard Browser** ✅ - Browse all equipment shards with filtering
- **Enemy Database** - Complete enemy info with weaknesses (framework ready)
- **Map Efficiency Tier List** - Ranked maps by gold/xp/hr (framework ready)

### ⏱️ Timers & Counters
- **DD2 Timers** ✅ - Wave, Map, and Prep timers with DD2-themed UI
- **Totem Reroll Counter** ✅ - Track rerolls with history, auto-resets at 286

### 📋 Trackers
- **Onslaught Progress Tracker** ✅ - Track floors with enemy scaling calculations
- **Material Tracker** ✅ - Log motes, clusters, gold, medals, shard dust
- **Mission Tracker** ✅ - Daily/weekly mission checklist with completion tracking
- **Shard Wishlist & Collection** ✅ - Track collected shards, create wishlist, view progress

### 🔧 Utilities
- **Loadout Sharing** ✅ - Export/import builds as JSON, save multiple loadouts
- **Pet Evolution Tool** - Simulate pet rerolls and evolution (needs pet data)
- **Tower Scaling Visualizer** - Graph tower stats across upgrade levels (needs tower data)
- **Practice Mode Helper** - IHDC map guides with timers (needs map data)

### 📖 Resources
- **Community Links** ✅ - All essential DD2 community resources and guides

## 🎨 Theme & Customization

### Dark/Light Themes
- Toggle between dark and light themes via the moon/sun button
- Full DD2-themed styling with neon orange/purple accents

### Settings (⚙️ button in footer)
- **Animations** - Toggle all animations on/off
- **Particle Effects** - Enable/disable background particle effects
- **Neon Accents** - Toggle neon glow effects
- **Font Scaling** - Adjust font size from 80% to 120%
- **Clear Data** - Reset all saved data (localStorage)

## 💾 Data Persistence

All data is automatically saved to your browser's localStorage:
- Totem counter progress and history
- Onslaught floors and personal bests
- Material inventory
- Mission checklists
- Theme preferences
- All tool states

## 🏗️ Architecture

### Modular Design
```
DD2 Toolkit/
├── toolkit.html          # Main app entry point
├── toolkit-styles.css    # DD2-themed CSS with animations
├── js/
│   ├── core/
│   │   ├── storage.js    # localStorage manager
│   │   ├── theme.js      # Theme system
│   │   └── utils.js      # Helper functions
│   ├── toolkit-main.js   # Main orchestrator
│   └── tools-extended.js # Additional tool implementations
└── data/                 # JSON data files
    ├── dd2_mods_data.json
    ├── dd2_shards_data.json
    ├── dd2_abilities.json
    └── dd2_prices.json
```

### Core Utilities

**DD2Storage** - localStorage wrapper
- `save(key, data)` - Save data
- `load(key, default)` - Load data
- `delete(key)` - Delete data
- `clearAll()` - Clear all DD2 toolkit data
- `exportAll()` / `importAll(data)` - Backup/restore

**DD2Theme** - Theme manager
- Dark/light theme switching
- Animation toggles
- Font scaling
- Persistent settings

**DD2Utils** - Helper functions
- Number formatting (`formatNumber`, `formatGold`)
- Time formatting (`formatTime`)
- DD2 calculations (DPS, scaling, crit damage)
- Clipboard support
- Toast notifications
- JSON download

## 🛠️ Extending the Toolkit

### Adding a New Tool

1. Create your tool object:
```javascript
const MyNewTool = {
    render() {
        return `<div class="tool-header">...</div>`;
    },

    init() {
        // Setup event listeners
    }
};
```

2. Register in `toolkit-main.js`:
```javascript
getToolModule(toolName) {
    const modules = {
        'my-new-tool': MyNewTool,
        // ...existing tools
    };
    return modules[toolName];
}
```

3. Add navigation item in `toolkit.html`:
```html
<button class="nav-item" data-tool="my-new-tool">My New Tool</button>
```

## 📱 Responsive Design

Fully responsive across all devices:
- **Mobile** (< 768px): Single column, hamburger menu
- **Tablet** (768px - 1024px): 2-3 column grids
- **Desktop** (> 1024px): 3-4 column grids, full navigation

## 🎯 DD2-Specific Features

### Calculations
- Onslaught scaling formulas (health/damage multipliers)
- DPS calculations with crit chance/damage
- Stat scaling (Defense Power, Hero Damage, etc.)
- Gold/hour efficiency

### Data Integration
- Loads from existing JSON data files
- Mod browser with 300+ mods
- Shard browser with complete shard list
- Ability database
- Market price data

## 🚧 Framework-Ready Features

The following tools have their framework in place and can be easily completed:

1. **Hero Builder** - Full gear slot UI ready, needs stat calculation logic
2. **DPS Benchmark** - Formula utilities ready, needs UI integration
3. **Ancient Power Tool** - Needs AP progression formulas
4. **Pet Evolution** - Needs pet data JSON
5. **Tower Visualizer** - Needs Chart.js integration
6. **Enemy Database** - Needs enemy data JSON
7. **Practice Helper** - Needs IHDC map data
8. **Map Efficiency** - Needs map farming data
9. **Shard Wishlist** - Needs collection tracking UI
10. **Loadout Sharing** - Needs URL encoding/decoding
11. **Strategy Planner** - Needs drag-drop lane system

## 🎨 Design System

### Colors
- **Primary Orange**: `#ff6b35` (DD2 orange)
- **Purple**: `#8b5cf6` (accent)
- **Blue**: `#3b82f6` (secondary)
- **Gold**: `#fbbf24` (rewards)

### Components
- **Neon Panels** - Glowing bordered containers
- **Cards** - Standard content containers with hover effects
- **Buttons** - Gradient buttons with ripple effect
- **Inputs** - DD2-themed form elements with focus glow

### Animations
- Pulse glow on headers
- Slide-in transitions
- Neon pulse effects
- Smooth hover states

## 📊 Current Status

**Total Lines of Code**: ~3,500+ lines
**Tools Functional**: 14/20 (70%) ✅
**Framework Complete**: 100%
**UI Theme**: Complete with DD2 neon styling
**Data Persistence**: Fully implemented
**Responsive Design**: Mobile → Desktop

### ✅ Fully Working Tools (14):
1. Totem Reroll Counter
2. Mod Browser
3. Shard Browser
4. Gold/Hour Calculator
5. DD2 Timers (Wave/Map/Prep)
6. Onslaught Progress Tracker
7. Material Tracker
8. Mission Tracker (Daily/Weekly)
9. DPS Benchmark Simulator
10. Ancient Power Planning Tool
11. Gear Stats Simulator
12. Shard Wishlist & Collection
13. Loadout Sharing (Export/Import)
14. Community Resources

### 🚧 Needs Data (6):
- Hero Builder (needs hero data)
- Strategy Planner (needs hero/map data)
- Pet Evolution (needs pet data)
- Tower Visualizer (needs tower data)
- Enemy Database (needs enemy data)
- Practice Helper (needs map data)

---

## 📄 License

Community-driven open-source project.
Dungeon Defenders 2 is property of Chromatic Games.

## 🤝 Contributing

Want to add more tools or improve existing ones?
1. Fork the repository
2. Add your tool module
3. Test across devices
4. Submit a pull request

## 📞 Support

- **GitHub Issues**: Report bugs or request features
- **Discord**: Join the DD2 community
- **Wiki**: https://wiki.dungeondefenders2.com/

---

**Built with ⚔️ by the DD2 Community**
