const cheerio = require('cheerio');
const puppeteer = require("puppeteer-core"); // ⚠️ Remplace "puppeteer" par "puppeteer-core"
const chromium = require("@sparticuz/chromium");


const getService = async (req, res) => {
    const recherche = req.query.recherche;

    // Définition par défaut pour chaque paramètre
    const checkGeneral = req.query.checkGeneral === "true";
    const checkNeeds_assets_referrals = req.query.checkNeeds_assets_referrals === "true";
    const checkCitzenship_test_prep = req.query.checkCitzenship_test_prep === "true";
    const checkHelp_community = req.query.checkHelp_community === "true";
    const checkOnline_services = req.query.checkOnline_services === "true";
    const checkJob_search = req.query.checkJob_search === "true";
    const checkHelp_professions = req.query.checkHelp_professions === "true";
    const checkLang_assess = req.query.checkLang_assess === "true";
    const checkLang_training = req.query.checkLang_training === "true";
    const checkJob_lang_training = req.query.checkJob_lang_training === "true";
    const checkLang_informal = req.query.checkLang_informal === "true";
    const checkChildren = req.query.checkChildren === "true";
    const checkYouth = req.query.checkYouth === "true";
    const checkWomen = req.query.checkWomen === "true";
    const checkSeniors = req.query.checkSeniors === "true";
    const checkFranco = req.query.checkFranco === "true";
    const checkHelp_gar = req.query.checkHelp_gar === "true";
    const checkLGBTQ2 = req.query.checkLGBTQ2 === "true";
    const checkGender_based_violence = req.query.checkGender_based_violence === "true";

    

    const url = "https://ircc.canada.ca/francais/nouveaux/services/index.asp#table1caption";
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    try {

        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
            headless: chromium.headless, // Utiliser le mode headless adapté
            timeout: 60000
          });
        

        const page = await browser.newPage();

        // Optimisation : Bloquer les ressources inutiles

        // Aller à la page (avec un seul appel)
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Attendre que l'élément soit chargé (avec timeout pour éviter le blocage)
        await page.waitForSelector('#textPostalCode');

        // Remplir le formulaire
        await page.type('#textPostalCode', recherche ?? "", { delay: 50 });
        // await page.keyboard.press('Enter');

        // Vérification et clic sur les cases à cocher si elles sont définies sur true
        if (checkGeneral) {
            await page.click('#checkGeneral');
        }
        if (checkNeeds_assets_referrals) {
            await page.click('#checkNeeds_assets_referrals');
        }
        if (checkCitzenship_test_prep) {
            await page.click('#checkCitzenship_test_prep');
        }
        if (checkHelp_community) {
            await page.click('#checkHelp_community');
        }
        if (checkOnline_services) {
            await page.click('#checkOnline_services');
        }
        if (checkJob_search) {
            await page.click('#checkJob_search');
        }
        if (checkHelp_professions) {
            await page.click('#checkHelp_professions');
        }
        if (checkLang_assess) {
            await page.click('#checkLang_assess');
        }
        if (checkLang_training) {
            await page.click('#checkLang_training');
        }
        if (checkJob_lang_training) {
            await page.click('#checkJob_lang_training');
        }
        if (checkLang_informal) {
            await page.click('#checkLang_informal');
        }
        if (checkChildren) {
            await page.click('#checkChildren');
        }
        if (checkYouth) {
            await page.click('#checkYouth');
        }
        if (checkWomen) {
            await page.click('#checkWomen');
        }
        if (checkSeniors) {
            await page.click('#checkSeniors');
        }
        if (checkFranco) {
            await page.click('#checkFranco');
        }
        if (checkHelp_gar) {
            await page.click('#checkHelp_gar');
        }
        if (checkLGBTQ2) {
            await page.click('#checkLGBTQ2');
        }
        if (checkGender_based_violence) {
            await page.click('#checkGender_based_violence');
        }

        await page.click('button[value="Find"]');

        // Attendre que la liste déroulante soit chargée
        await page.waitForSelector('select[name="table1_length"]', { timeout: 5000 });
        await page.select('select[name="table1_length"]', '-1');
        
        // Petite pause pour attendre l'affichage des résultats
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Récupération du HTML et parsing
        const pageContent = await page.content();
        const $ = cheerio.load(pageContent);

        const infoservices = [];
        const services = [];

        $('tbody tr').each((index, element) => {
            const distance = cleanText($(element).find('td:nth-child(1)').text() ?? 'distance non disponible');
            const title = cleanText($(element).find('td:nth-child(2) p a:nth-child(1)').text() ?? 'titre non disponible');
            const email = cleanText($(element).find('td:nth-child(2) a:nth-child(3)').text() ?? 'email non disponible');
            const address = cleanText($(element).find('td:nth-child(2) a:nth-child(2)').text() ?? 'adresse non disponible');
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
        
            // ✅ EXTRACTION DES SERVICES (plusieurs)
            const services = [];
            $(element).find('td:nth-child(3) li').each((i, serviceElement) => {
                const serviceTitle = cleanText($(serviceElement).text());
                if (serviceTitle) {
                    services.push(serviceTitle);
                }
            });
        
            // ✅ Ajout d'un seul objet avec plusieurs services
            infoservices.push({ title, distance, address, phone, email, link, services });
        });
        
        res.json({ infoservices });
        

        await browser.close();
    } catch (e) {
        console.error('Erreur :', e.message);
        res.status(500).json({ error: "Une erreur est survenue lors du scraping." });
    }
};

module.exports = { getService };
