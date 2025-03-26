const puppeteer = require("puppeteer-core"); // ⚠️ Remplace "puppeteer" par "puppeteer-core"
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

    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
        headless: chromium.headless, // Utiliser le mode headless adapté
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', request => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
            request.abort();
        } else {
            request.continue();
        }
    });

    try {
        await page.goto("https://www.padmapper.com/");
        const input = await page.$('input[type="search"]');

        if (!input) {
            console.error("Champ de recherche introuvable.");
            return [];
        }

        await input.type(text);
        await new Promise(resolve => setTimeout(resolve, 2000));

        await page.waitForFunction(() => {
            return document.querySelectorAll(".Autocomplete_primaryText__16RA_").length > 0;
        }, { timeout: 5000 }).catch(() => {
            console.log("Aucune suggestion trouvée.");
        });

        const suggestions = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".Autocomplete_primaryText__16RA_")).map(el => el.innerText);
        });

                // Mettre en cache
                searchCache.set(cacheKey, {
                    suggestions,
                    timestamp: Date.now()
                });

        return suggestions;
    } catch (e) {
        console.error("Erreur lors du scraping :", e.message);
        return {suggestions: cached?.suggestions || []};
    } finally {
        await browser.close();
    }
}

module.exports = { getSuggestions };
