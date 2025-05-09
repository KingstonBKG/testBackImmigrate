const puppeteer = require("puppeteer-core"); // ⚠️ Remplace "puppeteer" par "puppeteer-core"
const chromium = require("@sparticuz/chromium");

const scrapeCICIC = async (req, res) => {
  try {
    const search = req.query.search || '';
    const t = req.query.t || '';

    console.log(`Search parameter: ${search}`);
    console.log(`T parameter: ${t}`);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
      headless: chromium.headless, // Utiliser le mode headless adapté
  });

    const page = await browser.newPage();

    let url = `https://www.cicic.ca/869/results.canada?search=${search}`;
    if (t) {
      url += `&t=${t}`;
    }

    console.log(`Navigating to URL: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    let allData = [];
    let hasNextPage = true;

    if (t) {
      await page.keyboard.press('Enter');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    while (hasNextPage) {
      // Attendre que le tableau soit chargé
      await page.waitForSelector('table.rgMasterTable tbody tr');

      // Récupérer les données de la page actuelle
      const pageData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table.rgMasterTable tbody tr'));
        return rows.map(row => {
          const tds = Array.from(row.querySelectorAll('td'));
          const link = tds[1]?.querySelector('a')?.href || null;
          return {
            tds: tds.map(td => td.textContent.trim()),
            link: link,
          };
        });
      });

      allData = allData.concat(pageData);

      // Vérifier s'il y a un bouton "Afficher plus" et cliquer dessus
      const showMoreButton = await page.$('.result-more a');
      if (showMoreButton) {
        await Promise.all([
          page.click('.result-more a'),
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 }),
        ]);
      } else {
        console.log("Toutes les pages ont été parcourues.");
        hasNextPage = false;
      }
    }

    await browser.close();
    return res.json(allData);
  } catch (error) {
    console.error('Error scraping CICIC:', error);
    return res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
};

module.exports = {
  scrapeCICIC
};

