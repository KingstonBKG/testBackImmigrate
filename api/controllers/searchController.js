const puppeteer = require("puppeteer");

// Cache avec expiration
const searchCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure

async function getSuggestions(text) {
    // Vérifier le cache
    const cacheKey = text.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.suggestions; // Retourne directement le tableau de suggestions
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox'],
            defaultViewport: { width: 1024, height: 768 }
        });

        const page = await browser.newPage();
        
        // Optimiser le chargement
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto("https://www.padmapper.com/", {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        const suggestions = await page.evaluate(async (searchText) => {
            const input = document.querySelector('input[type="search"]');
            if (!input) return [];

            input.value = searchText;
            input.dispatchEvent(new Event('input', { bubbles: true }));

            await new Promise(resolve => setTimeout(resolve, 800));

            const elements = document.querySelectorAll(".Autocomplete_primaryText__16RA_");
            return Array.from(elements, el => el.innerText);
        }, text);

        // Mettre en cache seulement le tableau de suggestions
        searchCache.set(cacheKey, {
            suggestions,
            timestamp: Date.now()
        });

        return suggestions; // Retourne directement le tableau de suggestions

    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
        return cached?.suggestions || []; // Retourne le cache ou tableau vide en cas d'erreur
    } finally {
        if (browser) await browser.close();
    }
}

// Nettoyage périodique du cache
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of searchCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            searchCache.delete(key);
        }
    }
}, CACHE_DURATION);

module.exports = { getSuggestions };
