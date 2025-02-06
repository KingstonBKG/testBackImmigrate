const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const getEducation = async (req, res) => {
  const url =
    "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/permis-etudes/preparer/liste-etablissements-enseignement-designes.html";

  const cleanUrl = (url) => url.replace(/;jsessionid=[^?]+/, "");
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    //Démarrer le navigateur
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    // Sélectionner toutes les options de la liste des villes
    const cities = await page.$$eval("select#wb-auto-20 option", (options) => {
      return options
        .map((option) => ({
          value: option.value,
          name: option.textContent.trim(),
        }))
        .filter((city) => city.value);
    });

    const result = [];

    for (const city of cities) {
      console.log(`Scraping city: ${city.name}`);

      // Sélectionner la ville
      await page.select("select#wb-auto-20", city.value);
      await page.waitForSelector("#wb-auto-21 tbody tr");

      // Récupérer les écoles de la ville
      const schools = await page.$$eval("#wb-auto-21 tbody tr", (rows) => {
        return rows.map((row) => {
          const columns = row.querySelectorAll("td");
          return {
            name: columns[0]?.textContent.trim(),
            type: columns[1]?.textContent.trim(),
            city: columns[2]?.textContent.trim(),
            province: columns[3]?.textContent.trim(),
            status: columns[4]?.textContent.trim(),
          };
        });
      });

      result.push({ city: city.name, schools });
    }
    console.log(result);

    // Sauvegarder en JSON
    // fs.writeFileSync('schools.json', JSON.stringify(result, null, 2));
    res.json(result);
    console.log("Data saved to schools.json");

    await browser.close();
  } catch (error) {
    console.error(
      "Erreur lors du scraping ou de l'enregistrement :",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  getEducation,
};