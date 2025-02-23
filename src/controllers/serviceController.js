const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');

const getService = async (req, res) => {
    const recherche = req.query.recherche;
    const url = "https://ircc.canada.ca/francais/nouveaux/services/index.asp#table1caption";
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    try {
        const browser = await puppeteer.connect({
            browserWSEndpoint: 'wss://chrome.browserless.io?token=RlBL97PMa0pmz92ac02a0f78979584fc2a3401f984',
            timeout: 30000
        });

        const page = await browser.newPage();

        // Aller à la page (avec un seul appel)
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Attendre que l'élément soit chargé (avec timeout pour éviter le blocage)
        await page.waitForSelector('#textPostalCode', { timeout: 5000 });

        // Remplir le formulaire
        await page.type('#textPostalCode', recherche, { delay: 50 });
        await page.keyboard.press('Enter');

        // Attendre que la liste déroulante soit chargée
        await page.waitForSelector('select[name="table1_length"]', { timeout: 5000 });
        await page.select('select[name="table1_length"]', '20');
        
        // Petite pause pour attendre l'affichage des résultats
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Récupération du HTML et parsing
        const pageContent = await page.content();
        const $ = cheerio.load(pageContent);

        const infoservices = [];
        const services = [];

        $('tbody tr').each((index, element) => {
            const distance = cleanText($(element).find('td:nth-child(1)').text());
            const title = cleanText($(element).find('td:nth-child(2) p a:nth-child(1)').text());
            const email = cleanText($(element).find('td:nth-child(2) a:nth-child(3)').text());
            const address = cleanText($(element).find('td:nth-child(2) a:nth-child(2)').text());
            const link = $(element).find('td:nth-child(2) p a').attr('href');

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

            infoservices.push({ title, distance, address, phone, email, link });
        });

        $('tbody tr').each((index, element) => {
            const title = cleanText($(element).find('td:nth-child(3) li').text());
            services.push({ title });
        });

        res.json({ infoservices, services });

        await browser.close();
    } catch (e) {
        console.error('Erreur :', e.message);
        res.status(500).json({ error: "Une erreur est survenue lors du scraping." });
    }
};

module.exports = { getService };
