const axios = require('axios');
const cheerio = require('cheerio');


// Méthode pour récupérer les jobs
const getactu = async (req, res) => {

  // URL de la page à scraper
  const url = `https://www.lemonde.fr/canada/`;

  // Fonction pour nettoyer les données extraites
  const cleanText = (text) => text.replace(/\s+/g, ' ').trim();


  // Fonction pour scraper les offres d'emploi
  try {
    // Récupérer le contenu HTML de la page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Tableau pour stocker les offres d'emploi
    const actus = [];

    $('div.thread').each((index, element) => {
      const title = cleanText($(element).find('.teaser__title').text());
      const description = cleanText($(element).find('.teaser__desc').text());
      const date = cleanText($(element).find('.meta__date').text());
      const author = cleanText($(element).find('.meta__author').text());
      const image = $(element).find('.teaser__media').attr('data-src');
      const link = $(element).find('.teaser__link').attr('href');
    
      // Ajout de l'offre d'emploi au tableau
      const actu = { title, description, date, author, image,link };
      actus.push(actu);
    });

    // Retourner les résultats au format JSON
    res.json(actus);
  } catch (error) {
    console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};



module.exports = {
  getactu,
};
