// ========================================
// DOM Elements
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navToggle = document.getElementById('navToggle');
    const navList = document.getElementById('navList');
    const navLinks = document.querySelectorAll('.nav-list a');

    // Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Back to top button
    const backToTop = document.getElementById('backToTop');

    // ========================================
    // Mobile Navigation Toggle
    // ========================================
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');

            // Animate hamburger menu
            const spans = navToggle.querySelectorAll('span');
            if (navList.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 600) {
                navList.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // ========================================
    // Tab System
    // ========================================
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Load data for the tab if not already loaded
            loadTabData(targetTab);
        });
    });

    // ========================================
    // Back to Top Button
    // ========================================
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ========================================
    // Dynamic Data Loading
    // ========================================
    const dataLoaded = {
        mods: false,
        shards: false,
        abilities: false,
        prices: false
    };

    const dataFileMap = {
        mods: 'dd2_mods_data.json',
        shards: 'dd2_shards_data.json',
        abilities: 'dd2_abilities.json',
        prices: 'dd2_prices.json'
    };

    function loadTabData(tabName) {
        // Skip if already loaded
        if (dataLoaded[tabName]) {
            return;
        }

        const listElement = document.getElementById(`${tabName}-list`);
        if (!listElement) return;

        const dataFile = dataFileMap[tabName];
        if (!dataFile) {
            listElement.innerHTML = '<p class="loading-message">Data source not configured.</p>';
            return;
        }

        // Try to fetch JSON data
        fetch(`data/${dataFile}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Data file not found');
                }
                return response.json();
            })
            .then(data => {
                displayData(listElement, data, tabName);
                dataLoaded[tabName] = true;
            })
            .catch(error => {
                listElement.innerHTML = `<p class="loading-message">Error loading data: ${error.message}</p>`;
                dataLoaded[tabName] = true;
            });
    }

    function displayData(container, data, tabName) {
        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="loading-message">No data available.</p>';
            return;
        }

        // Filter out invalid entries (some data has image URLs as names)
        const validData = data.filter(item => {
            return item.name &&
                   !item.name.startsWith('http') &&
                   item.name.trim().length > 0;
        });

        if (validData.length === 0) {
            container.innerHTML = '<p class="loading-message">No valid data found.</p>';
            return;
        }

        validData.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'info-item';

            let content = '';

            switch(tabName) {
                case 'mods':
                    // Mods: name, description, hero, drop, type, image
                    content = `
                        ${item.image ? `<img src="${item.image}" alt="${item.name} icon" loading="lazy" onerror="this.style.display='none'">` : ''}
                        <div class="info-item-details">
                            <div class="info-item-name">${item.name}</div>
                            ${item.description ? `<div class="info-item-description">${item.description}</div>` : ''}
                            ${item.hero ? `<div class="info-item-meta"><strong>Hero:</strong> ${item.hero}</div>` : ''}
                            ${item.drop ? `<div class="info-item-meta"><strong>Drop:</strong> ${item.drop}</div>` : ''}
                        </div>
                    `;
                    break;

                case 'shards':
                    // Shards: name, description, source.difficulty
                    const difficulty = item.source?.difficulty || '';
                    content = `
                        <div class="info-item-details">
                            <div class="info-item-name">${item.name}</div>
                            ${item.description ? `<div class="info-item-description">${item.description}</div>` : ''}
                            ${difficulty ? `<div class="info-item-meta"><strong>Source:</strong> ${difficulty}</div>` : ''}
                        </div>
                    `;
                    break;

                case 'abilities':
                    // Abilities: name, abilityType, heroes, recharge
                    const heroList = Array.isArray(item.heroes) ? item.heroes.join(', ') : item.iconUrl || '';
                    content = `
                        <div class="info-item-details">
                            <div class="info-item-name">${item.name}</div>
                            ${item.abilityType && item.abilityType !== 'N/A' ? `<div class="info-item-meta"><strong>Type:</strong> ${item.abilityType}</div>` : ''}
                            ${heroList ? `<div class="info-item-meta"><strong>Heroes:</strong> ${heroList}</div>` : ''}
                            ${item.recharge ? `<div class="info-item-meta"><strong>Recharge:</strong> ${item.recharge}</div>` : ''}
                        </div>
                    `;
                    break;

                case 'prices':
                    // Prices: name, pcPrice, psPrice, xboxPrice
                    content = `
                        <div class="info-item-details">
                            <div class="info-item-name">${item.name}</div>
                            <div class="price-grid">
                                ${item.pcPrice ? `<div class="price-item"><strong>PC:</strong> ${item.pcPrice}</div>` : ''}
                                ${item.psPrice ? `<div class="price-item"><strong>PS:</strong> ${item.psPrice}</div>` : ''}
                                ${item.xboxPrice ? `<div class="price-item"><strong>Xbox:</strong> ${item.xboxPrice}</div>` : ''}
                            </div>
                        </div>
                    `;
                    break;

                default:
                    content = `
                        <div class="info-item-details">
                            <div class="info-item-name">${item.name}</div>
                            ${item.description ? `<div class="info-item-description">${item.description}</div>` : ''}
                        </div>
                    `;
            }

            itemDiv.innerHTML = content;
            container.appendChild(itemDiv);
        });
    }

    // ========================================
    // Initialize - Load first tab data
    // ========================================
    loadTabData('mods');

    // ========================================
    // Lazy Loading for Images (Performance)
    // ========================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ========================================
    // Console Welcome Message
    // ========================================
    console.log('%c⚔️ Dungeon Defenders 2 Resources Hub', 'font-size: 20px; font-weight: bold; color: #ff6b35;');
    console.log('%cWelcome! This site is open source and community-driven.', 'font-size: 14px; color: #b8b8b8;');
    console.log('%cContributions welcome at: https://github.com/UnboundAngel/DungeonDefenders2', 'font-size: 12px; color: #f7931e;');
});

// ========================================
// Service Worker Registration (Optional - for PWA)
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment if you add a service worker for offline functionality
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(err => console.log('SW registration failed'));
    });
}
