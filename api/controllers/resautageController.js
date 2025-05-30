// <<<<<<< HEAD:api/controllers/resautageController.js
const puppeteer = require("puppeteer-core"); // ⚠️ Remplace "puppeteer" par "puppeteer-core"
const chromium = require("@sparticuz/chromium");

const getResautage = async (req, res) => {
    const url = "http://mentoratquebec.org/programmes-de-mentorat/";
    try {
        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
            headless: chromium.headless, // Utiliser le mode headless adapté
        });
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

        await browser.close();
        res.json(result);
    } catch (error) {
        console.error("Erreur lors du scraping :", error.message);
        res.status(500).json({ error: "Erreur lors du scraping" });
    }
};

module.exports = { getResautage };
// =======
// const puppeteer = require("puppeteer");

// const cleanText = (text) => text.trim().replace(/\s+/g, " ");

// const getResautage = async (req, res) => {
//     const url = "http://mentoratquebec.org/programmes-de-mentorat/";    
//     try {
//       const browser = await puppeteer.launch({
//         headless: true,
//         args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-blink-features=AutomationControlled'
//         ]
//     });
//     const page = await browser.newPage();
//     await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
//     await page.setExtraHTTPHeaders({
//         'Accept-Language': 'fr-FR,fr;q=0.9'
//     });
    
//     await page.goto(url, { waitUntil: 'networkidle2' });

//         const result = await page.evaluate(() => {
//             const cleanText = (text) => text.trim().replace(/\s+/g, " ");
//             const sections = document.querySelectorAll(".et_pb_text_inner");
//             const data = [];

//             sections.forEach((section) => {
//                 const context = cleanText(section.querySelector("h4")?.innerText || "");
//                 if (context) {
//                     const liList = [];
//                     section.querySelectorAll("a").forEach((link) => {
//                         liList.push({
//                             text: cleanText(link.innerText),
//                             url: link.href || ""
//                         });
//                     });
//                     data.push({ context, links: liList });
//                 }
//             });
//             return data;
//         });

//         await browser.close();
//         res.json(result);
//     } catch (error) {
//         console.error("Erreur lors du scraping :", error.message);
//         res.status(500).json({ error: "Erreur lors du scraping" });
//     }
// };

// module.exports = { getResautage };
// >>>>>>> remotes/origin/eduF:src/controllers/resautageController.js


// const puppeteer = require("puppeteer");

// const cleanText = (text) => text.trim().replace(/\s+/g, " ");

// const getResautage = async (req, res) => {
//     const url = "http://mentoratquebec.org/programmes-de-mentorat/";    
//     try {
//       const browser = await puppeteer.launch({
//         headless: true,
//         args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-blink-features=AutomationControlled'
//         ]
//     });
//     const page = await browser.newPage();
//     await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
//     await page.setExtraHTTPHeaders({
//         'Accept-Language': 'fr-FR,fr;q=0.9'
//     });
    
//     await page.goto(url, { waitUntil: 'networkidle2' });

//         const result = await page.evaluate(() => {
//             const cleanText = (text) => text.trim().replace(/\s+/g, " ");
//             const sections = document.querySelectorAll(".et_pb_text_inner");
//             const data = [];

//             sections.forEach((section) => {
//                 const context = cleanText(section.querySelector("h4")?.innerText || "");
//                 if (context) {
//                     const liList = [];
//                     section.querySelectorAll("a").forEach((link) => {
//                         liList.push({
//                             text: cleanText(link.innerText),
//                             url: link.href || ""
//                         });
//                     });
//                     data.push({ context, links: liList });
//                 }
//             });
//             return data;
//         });

//         await browser.close();
//         res.json(result);
//     } catch (error) {
//         console.error("Erreur lors du scraping :", error.message);
//         res.status(500).json({ error: "Erreur lors du scraping" });
//     }
// };

// module.exports = { getResautage };