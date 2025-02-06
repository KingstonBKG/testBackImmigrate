const axios = require("axios");
const cheerio = require("cheerio");

const cleanText = (text) => text.trim().replace(/\s+/g, " ");

const getServices = async (req, res) => {
  const url =
    "https://www.statcan.gc.ca/fr/ecdo/bases-donnees/bdoess/metadonnees";
  const cleanUrl = (url) => url.replace(/;jsessionid=[^?]+/, "");
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const result = [];

    $("table")
      .slice(1, 3)
      .each((tableIndex, table) => {
        let headers = [
          "fournisseur de donnees", //province qui a fourni les donne
          "province", //province du service hospitalier
          "lien", //lien du site web
          "lienLicence", //licence et condition d'utilisation lien
          "", // date de mise a jour ( element pas recuperer)
          "description", // decription du service hospitalier
        ];

        // Collecter les noms des colonnes à partir des `th`
        $(table)
          .find("tr")
          .each((rowIndex, row) => {
            const rowObject = {};

            // Associer chaque `td` à son `th`
            $(row)
              .find("td")
              .each((cellIndex, cell) => {
                if(cellIndex===2||cellIndex===3){
                    const link=$(cell).find('a').attr('href')
                    if (link) {
                        rowObject[headers[cellIndex]] = link;
                      } else {
                        rowObject[headers[cellIndex]] = cleanText($(cell).text());
                      }
                }
               else if (cellIndex < headers.length) {
               
                  rowObject[headers[cellIndex]] = cleanText($(cell).text());
                }
              });

            // Ajouter l'objet s'il a des données
            if (Object.keys(rowObject).length > 0) {
              result.push(rowObject);
            }
          });
      });
    res.json(result);
  } catch (error) {
    console.error("Erreur lors du scraping :", error.message);
  }
};

module.exports = {
  getServices,
  // getServicesDetails,
  // getServicesDetailsDetails
};