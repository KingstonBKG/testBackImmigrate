const puppeteer = require('puppeteer');

async function scrapeCICIC() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = 'https://www.cicic.ca/869/results.canada?search=';


  await page.goto(url, { waitUntil: 'networkidle2' ,timeout:0});

  let allData = [];
  let hasNextPage = true;

  while (hasNextPage) {
    // Attendre que le tableau soit chargé
    await page.waitForSelector('table.rgMasterTable tbody tr');

    // Récupérer les données de la page actuelle
    const pageData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table.rgMasterTable tbody tr'));
      return rows.map(row => {
        const tds = Array.from(row.querySelectorAll('td'));
        const link = tds[1].querySelector('a')?.href || null;
        return {
          tds: tds.map(td => td.textContent.trim()),
          link: link,
        };
      });
    });

    allData = allData.concat(pageData);

    // Vérifier s'il y a un bouton "Afficher plus" et cliquer dessus
    const showMoreButton = await page.$('rgPageNext');
    if (showMoreButton) {
      await Promise.all([
        
        page.click('.result-more a'),
        page.waitForNavigation({ waitUntil: 'networkidle2',timeout :0}),
      ]);
    } else {
        console.log("Toutes les pages ont été parcourues.");
      hasNextPage = false;
    }
  }

  await browser.close();
  return allData;
}

// Exemple d'utilisation
scrapeCICIC().then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(error => {
  console.error('Erreur lors du scraping :', error);
});