const puppeteer = require("puppeteer-core"); // ⚠️ Remplace "puppeteer" par "puppeteer-core"
const chromium = require("@sparticuz/chromium");



const getAidesJudiciaires = async (req, res) => {
  const url = "https://educaloi.qc.ca/nos-dossiers/";

  try {

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
      headless: chromium.headless, // Utiliser le mode headless adapté
    });

    // Création d'une nouvelle page
    const page = await browser.newPage();

    // Configuration des en-têtes
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr-FR,fr;q=0.9",
    });

    // Navigation vers l'URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extraction des données
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

    await browser.close();
    res.json(dossiers);
  } catch (error) {
    console.error("Erreur lors du scraping :", error.message);
    res.status(500).json({
      error: "Erreur lors du scraping",
      details: error.message,
    });
  }
};

module.exports = { getAidesJudiciaires };
