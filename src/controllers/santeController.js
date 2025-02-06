const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');

const cleanText = (text) => text.trim().replace(/\s+/g, " ");



const getServices = async (req, res) => {
  const options = req.params.options

  const url = `https://www.indexsante.ca/${options}/`;
  // const url = "https://www.statcan.gc.ca/fr/ecdo/bases-donnees/bdoess/metadonnees";
  const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

  try {
console.log(url)

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const results = [];
    const nearby = [];
    $('.pastille').each((index, element) => {
      const title = cleanText($(element).find('.title').text());
      const address = cleanText($(element).find('.ville').text());
      const link = `https://www.indexsante.ca${$(element).find('a').attr('href')}`;
      const logo = `https://www.indexsante.ca${$(element).find('img').attr('src')}`;

      var result = { title, address, link, logo };
      results.push(result);
    })

    $('.region a').each((index, element) => {
      const title = $(element).text();
      const link = `https://www.indexsante.ca${$(element).attr('href')}`;

      var result = { title, link };
      nearby.push(result);
    })

    res.json({
      results,
      nearby
    });

    // $("table")
    //   .slice(1, 3)
    //   .each((tableIndex, table) => {
    //     let headers = [
    //       "fournisseur de donnees", //province qui a fourni les donne
    //       "province", //province du service hospitalier
    //       "lien", //lien du site web
    //       "lienLicence", //licence et condition d'utilisation lien
    //       "", // date de mise a jour ( element pas recuperer)
    //       "description", // decription du service hospitalier
    //     ];

    //     // Collecter les noms des colonnes à partir des `th`
    //     $(table)
    //       .find("tr")
    //       .each((rowIndex, row) => {
    //         const rowObject = {};

    //         // Associer chaque `td` à son `th`
    //         $(row)
    //           .find("td")
    //           .each((cellIndex, cell) => {
    //             if(cellIndex===2||cellIndex===3){
    //                 const link=$(cell).find('a').attr('href')
    //                 if (link) {
    //                     rowObject[headers[cellIndex]] = link;
    //                   } else {
    //                     rowObject[headers[cellIndex]] = cleanText($(cell).text());
    //                   }
    //             }
    //            else if (cellIndex < headers.length) {

    //               rowObject[headers[cellIndex]] = cleanText($(cell).text());
    //             }
    //           });

    //         // Ajouter l'objet s'il a des données
    //         if (Object.keys(rowObject).length > 0) {
    //           result.push(rowObject);
    //         }
    //       });
    //   });
    // res.json(result);

    // console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Erreur lors du scraping :", error.message);
  }
};

module.exports = {
  getServices,
  // getServicesDetails,
  // getServicesDetailsDetails

};

