const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { db } = require('../../src/config/firebase');

const COLLECTION_NAME = 'educaloi';
const UPDATE_INTERVAL_DAYS = 10;

const shouldUpdate = async () => {
    const metadataRef = db.collection(COLLECTION_NAME).doc('metadata');
    const metadata = await metadataRef.get();
    
    if (!metadata.exists) return true;
    
    const lastUpdate = metadata.data().lastUpdate.toDate();
    const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate >= UPDATE_INTERVAL_DAYS;
};

const scrapeEducaloiData = async () => {
    const url = "https://educaloi.qc.ca/nos-dossiers/";
    
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
        headless: chromium.headless,
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
        await page.setExtraHTTPHeaders({
            "Accept-Language": "fr-FR,fr;q=0.9",
        });

        await page.goto(url, { waitUntil: "networkidle2" });

        const dossiers = await page.evaluate(() => {
            const cleanText = (text) => text?.trim().replace(/\s+/g, " ") || "";
            const dossiersList = [];

            // Récupération des dossiers en vedette
            const featuredDossiers = document.querySelectorAll(".single-slide");
            featuredDossiers.forEach((dossier) => {
                const title = cleanText(dossier.querySelector("h2")?.innerText);
                const link = dossier.querySelector("a.button")?.href;
                const imageUrl = dossier
                    .querySelector(".slider_img")
                    ?.getAttribute("data-bg-image")
                    ?.replace("url(", "")
                    .replace(")", "");

                dossiersList.push({
                    type: "featured",
                    title,
                    link,
                    imageUrl,
                });
            });

            // Récupération de tous les dossiers
            const allDossiers = document.querySelectorAll(".single-dossier-list");
            allDossiers.forEach((dossier) => {
                const title = cleanText(
                    dossier.querySelector(".single-dossier-list_title")?.innerText
                );
                const link = dossier.href;
                const imageUrl = dossier.querySelector(".lazyload")?.dataset.src;

                dossiersList.push({
                    type: "regular",
                    title,
                    link,
                    imageUrl,
                });
            });

            return {
                totalDossiers: document.querySelector("#all-guides sup")?.innerText,
                dossiers: dossiersList,
            };
        });

        return dossiers;
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
        totalDossiers: data.totalDossiers
    });

    // Mise à jour des données
    const dataRef = db.collection(COLLECTION_NAME).doc('data');
    batch.set(dataRef, {
        ...data,
        updatedAt: new Date()
    });

    await batch.commit();
};

const getAidesJudiciaires = async (req, res) => {
    try {
        // Vérifier si les données existent dans Firebase
        const dataRef = db.collection(COLLECTION_NAME).doc('data');
        const dataDoc = await dataRef.get();

        // Vérifier si une mise à jour est nécessaire
        const needsUpdate = await shouldUpdate();

        if (dataDoc.exists && !needsUpdate) {
            // Retourner les données existantes
            return res.json(dataDoc.data());
        }

        // Scraper de nouvelles données
        const newData = await scrapeEducaloiData();
        
        // Mettre à jour Firebase
        await updateFirebaseData(newData);

        res.json(newData);
    } catch (error) {
        console.error("Erreur lors du scraping :", error.message);
        res.status(500).json({
            error: "Erreur lors du scraping",
            details: error.message,
        });
    }
};

module.exports = { getAidesJudiciaires };
