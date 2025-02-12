const puppeteer = require('puppeteer-core');

async function getSuggestions(text) {
    const browser = await puppeteer.connect({
        browserWSEndpoint: 'wss://chrome.browserless.io?token=RlBL97PMa0pmz92ac02a0f78979584fc2a3401f984' // Remplace par ta clé API Browserless
    });

    const page = await browser.newPage();

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

        return suggestions;
    } catch (e) {
        console.error("Erreur lors du scraping :", e.message);
        return [];
    } finally {
        await browser.close();
    }
}

module.exports = { getSuggestions };
