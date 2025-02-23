const axios = require('axios');
const cheerio = require('cheerio');
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');

const getService = async (req, res) => {
    const recherche = req.query.recherche;
    const url = "https://ircc.canada.ca/francais/nouveaux/services/index.asp#table1caption";
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    const browser = await puppeteer.connect({
        headless: false,
        browserWSEndpoint: 'wss://chrome.browserless.io?token=RlBL97PMa0pmz92ac02a0f78979584fc2a3401f984' // Remplace par ta clé API Browserless
    });
    // const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    try {
        page.setDefaultTimeout(50000);
        await page.goto(url);

        // Attendre que l'élément à cliquer soit visible et cliquer dessus
        await page.waitForSelector('#textPostalCode');
        await page.type('#textPostalCode', recherche, { delay: 50 });
        await page.keyboard.press('Enter');
        await page.waitForSelector('select');
        await page.click('select');
        await page.select('select[name="table1_length"]', '20');
        await new Promise(resolve => setTimeout(resolve, 1000));


        const pageContent = await page.content(); // Récupère le HTML complet de la page mise à jour


        const $ = cheerio.load(pageContent);


        const infoservices = [];
        const services = [];

        $('tbody tr').each((index, element) => {
            const distance = cleanText($(element).find('td:nth-child(1)').text());
            const title = cleanText($(element).find('td:nth-child(2) p a:nth-child(1)').text());
            const email = cleanText($(element).find('td:nth-child(2)  a:nth-child(3)').text());
            const address = cleanText($(element).find('td:nth-child(2) a:nth-child(2)').text());
            const link = $(element).find('td:nth-child(2) p a').attr('href');
            // Extract phone number from the <td> element
            let phone = '';
            const tdContent = $(element).find('td:nth-child(2)').html();
            if (tdContent) {
                const lines = tdContent.split('<br>');
                lines.forEach(line => {
                    if (line.includes('Téléphone')) {
                        phone = cleanText(line.replace('Téléphone :', '').trim());
                    }
                });
            }


            const service = { title, distance, address, phone, email, link };
            infoservices.push(service);
        });


        $('tbody tr').each((index, element) => {
            const title = cleanText($(element).find('td:nth-child(3) li').text());
          


            const service = { title };
            services.push(service);
        });

        // Retourner les résultats au format JSON
    res.json({infoservices, services});
        await browser.close();

    } catch (e) {
        console.error('Erreur :', e.message);
        res.status(500).json({ error: "Une erreur est survenue lors du scraping." });
    }
};





module.exports = {
    getService
};
