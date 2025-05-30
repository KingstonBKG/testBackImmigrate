const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { db } = require('../../src/config/firebase');

const COLLECTION_NAME = 'resautage';
const UPDATE_INTERVAL_DAYS = 10;

const shouldUpdate = async () => {
    const metadataRef = db.collection(COLLECTION_NAME).doc('metadata');
    const metadata = await metadataRef.get();
    
    if (!metadata.exists) return true;
    
    const lastUpdate = metadata.data().lastUpdate.toDate();
    const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate >= UPDATE_INTERVAL_DAYS;
};

const scrapeResautageData = async () => {
    const url = "http://mentoratquebec.org/programmes-de-mentorat/";
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
        headless: chromium.headless,
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr-FR,fr;q=0.9'
        });

        await page.goto(url, { waitUntil: 'networkidle2' });

        const result = await page.evaluate(() => {
            const cleanText = (text) => text.trim().replace(/\s+/g, " ");
            const sections = document.querySelectorAll(".et_pb_text_inner");
            const data = [];

            sections.forEach((section) => {
                const context = cleanText(section.querySelector("h4")?.innerText || "");
                if (context) {
                    const liList = [];
                    section.querySelectorAll("a").forEach((link) => {
                        liList.push({
                            text: cleanText(link.innerText),
                            url: link.href || ""
                        });
                    });
                    data.push({ context, links: liList });
                }
            });
            return data;
        });

        return result;
    } finally {
        await browser.close();
    }
};

const updateFirebaseData = async (data) => {
    const batch = db.batch();
    
    // Mise à jour des metadata
    const metadataRef = db.collection(COLLECTION_NAME).doc('metadata');
    batch.set(metadataRef, {
        lastUpdate: new Date(),
        totalSections: data.length
    });

    // Mise à jour des données
    const dataRef = db.collection(COLLECTION_NAME).doc('data');
    batch.set(dataRef, {
        sections: data,
        updatedAt: new Date()
    });

    await batch.commit();
};

const getResautage = async (req, res) => {
    try {
        // Vérifier si les données existent dans Firebase
        const dataRef = db.collection(COLLECTION_NAME).doc('data');
        const dataDoc = await dataRef.get();

        // Vérifier si une mise à jour est nécessaire
        const needsUpdate = await shouldUpdate();

        if (dataDoc.exists && !needsUpdate) {
            // Retourner les données existantes
            return res.json(dataDoc.data().sections);
        }

        // Scraper de nouvelles données
        const newData = await scrapeResautageData();
        
        // Mettre à jour Firebase
        await updateFirebaseData(newData);

        res.json(newData);
    } catch (error) {
        console.error("Erreur:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération des données" });
    }
};

module.exports = { getResautage };
