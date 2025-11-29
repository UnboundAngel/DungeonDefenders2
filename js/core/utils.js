/**
 * DD2 Toolkit - Utility Functions
 * Common helper functions used across tools
 */

const DD2Utils = {
    // Format numbers with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Format gold values (10000000 => "10M")
    formatGold(amount) {
        if (amount >= 1000000000) {
            return (amount / 1000000000).toFixed(2) + 'B';
        }
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(2) + 'M';
        }
        if (amount >= 1000) {
            return (amount / 1000).toFixed(2) + 'K';
        }
        return amount.toString();
    },

    // Calculate percentage
    calculatePercent(value, total) {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(2);
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Generate unique ID
    generateId() {
        return `dd2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Format time (seconds to MM:SS)
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Download JSON file
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Copy to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return Promise.resolve();
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 2px solid var(--dd2-orange);
            box-shadow: var(--shadow-neon-orange);
            z-index: 10000;
            animation: slide-in 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fade-out 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Validate input
    validateNumber(value, min = -Infinity, max = Infinity) {
        const num = parseFloat(value);
        if (isNaN(num)) return min;
        return this.clamp(num, min, max);
    },

    // DD2-specific calculations
    calculateScaledDamage(baseDamage, scalingStat, scalingPercent) {
        return Math.floor(baseDamage + (scalingStat * (scalingPercent / 100)));
    },

    calculateCritDamage(baseDamage, critChance, critDamagePercent) {
        const avgMultiplier = 1 + (critChance / 100) * (critDamagePercent / 100);
        return Math.floor(baseDamage * avgMultiplier);
    },

    calculateDPS(damage, attackRate) {
        return Math.floor(damage * attackRate);
    },

    // Onslaught floor scaling
    calculateOnslaughtScaling(floor) {
        const healthMultiplier = 1 + (floor * 0.15);
        const damageMultiplier = 1 + (floor * 0.10);
        return { health: healthMultiplier, damage: damageMultiplier };
    }
};

// Export
window.DD2Utils = DD2Utils;
