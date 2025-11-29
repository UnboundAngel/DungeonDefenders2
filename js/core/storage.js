/**
 * DD2 Toolkit - LocalStorage Manager
 * Handles all data persistence
 */

const DD2Storage = {
    prefix: 'dd2_toolkit_',

    // Save data
    save(key, data) {
        try {
            const fullKey = this.prefix + key;
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },

    // Load data
    load(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    },

    // Delete data
    delete(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error('Storage delete error:', e);
            return false;
        }
    },

    // Clear all DD2 toolkit data
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    },

    // Get all keys
    getAllKeys() {
        const keys = Object.keys(localStorage);
        return keys
            .filter(key => key.startsWith(this.prefix))
            .map(key => key.replace(this.prefix, ''));
    },

    // Export all data
    exportAll() {
        const data = {};
        this.getAllKeys().forEach(key => {
            data[key] = this.load(key);
        });
        return data;
    },

    // Import data
    importAll(data) {
        try {
            Object.entries(data).forEach(([key, value]) => {
                this.save(key, value);
            });
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};

// Export for use in other modules
window.DD2Storage = DD2Storage;
