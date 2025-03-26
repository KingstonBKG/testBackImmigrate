const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

// Cache avec expiration
const searchCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure

async function getSuggestions(text) {
    // Vérifier le cache
    const cacheKey = text.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { suggestions: cached.suggestions, fromCache: true };
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox'],
            defaultViewport: { width: 1024, height: 768 },
            executablePath: await chromium.executablePath(),
            headless: chromium.headless
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

            // Attente réduite
            await new Promise(resolve => setTimeout(resolve, 800));

            const elements = document.querySelectorAll(".Autocomplete_primaryText__16RA_");
            return Array.from(elements, el => el.innerText);
        }, text);

        // Mettre en cache
        searchCache.set(cacheKey, {
            suggestions,
            timestamp: Date.now()
        });

        return { suggestions, fromCache: false };

    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
        return { 
            suggestions: cached?.suggestions || [],
            fromCache: true,
            error: error.message
        };
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
