const puppeteer = require("puppeteer");

async function getSuggestions(text) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://www.padmapper.com/");
    const input = await page.$('input[type="search"]');

    if (!input) {
        console.error("Champ de recherche introuvable.");
        await browser.close();
        return [];
    }

    await input.type(text);

    await new Promise(resolve => setTimeout(resolve, 5000));


    await page.waitForFunction(() => {
        return document.querySelectorAll(".Autocomplete_primaryText__16RA_").length > 0;
    }, { timeout: 5000 }).catch(() => {
        console.log("Aucune suggestion trouvée.");
    });

    const suggestions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".Autocomplete_primaryText__16RA_")).map(el => el.innerText);
    });

    await browser.close();
    return suggestions;
}

// Exporter la fonction
module.exports = { getSuggestions };
