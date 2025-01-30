
const axios = require('axios');
const cheerio = require('cheerio');


// Méthode pour récupérer les jobs
const getServices = async (req, res) => {


    // URL de la page à scraper
    const url = `https://www.canada.ca/fr/sante-canada.html`;

    // Fonction pour nettoyer les données extraites
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    // Fonction pour nettoyer l'URL (retirer le jsessionid)
    const cleanUrl = (url) => url.replace(/;jsessionid=[^?]+/, '');

    // Fonction pour scraper les offres d'emploi
    try {
        // Récupérer le contenu HTML de la page
        const { data } = await axios.get(url); // Récupérer le contenu HTML de la page
        const $ = cheerio.load(data); //charge le contenu dans la variable $

        // Tableau pour stocker les services de santé
        const servicesOffers = [];

        $('section.gc-srvinfo div div.col-md-4').each((index, element) => {
            const title = cleanText($(element).find('h3 a').text());
            const description = cleanText($(element).find('p').text());
            const link = $(element).find('a').attr('href');
            const fulllink = `https://www.canada.ca${link}`;
            //   const company = cleanText($(element).find('.business').text());
            //   const location = cleanText($(element).find('.location').text());
            //   const salary = cleanText($(element).find('.salary').text());
            //   const date = cleanText($(element).find('.date').text());
            //   const newPost = cleanText($(element).find('.new').text() ?? "");
            //   const telework = cleanText($(element).find('.telework').text() ?? "");
            //   const jobgreenflag = cleanText($(element).find('.jobgreenflag').text() ?? "");
            //   const distance = cleanText($(element).find('.distance').text() ?? "");
            //   const appmethod = cleanText($(element).find('.appmethod').text() ?? "");

            // Extraction de l'URL complète à partir de la balise <a> (si présente)
            //   const link = $(element).find('a.resultJobItem').attr('href');
            //   let jobUrl = null;

            //   if (link) {
            //     // Si le lien est relatif, on le préfixe avec l'URL principale
            //     if (link.startsWith('/')) {
            //       jobUrl = `https://www.guichetemplois.gc.ca${link}`;
            //     } else {
            //       jobUrl = link;
            //     }

            //     // Nettoyer l'URL pour retirer le jsessionid
            //     jobUrl = cleanUrl(jobUrl);
            //   }

            // Ajout de l'offre d'emploi au tableau
            const servicesOffer = { title, description, fulllink };
            servicesOffers.push(servicesOffer);
        });

        // Retourner les résultats au format JSON
        res.json(servicesOffers);
    } catch (error) {
        console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};


const getServicesDetails = async (req, res) => {
    var link1 = req.params.link1;
    var link2 = req.params.link2;
    var link3 = req.params.link3;


    const baseUrl = "https://www.canada.ca/fr";
    const pathParts = [link1, link2, link3].filter(Boolean); // Supprime les undefined
    const url = `${baseUrl}/${pathParts.map(encodeURIComponent).join('/')}`;

    console.log(url);

    // Fonction pour nettoyer les données extraites
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    // Fonction pour nettoyer l'URL (retirer le jsessionid)
    const cleanUrl = (url) => url.replace(/;jsessionid=[^?]+/, '');

    // Fonction pour scraper les offres d'emploi
    try {
        // Récupérer le contenu HTML de la page
        const { data } = await axios.get(url); // Récupérer le contenu HTML de la page
        const $ = cheerio.load(data); //charge le contenu dans la variable $

        // Tableau pour stocker les services de santé
        const servicesOffersDetails = [];

        $('section.gc-srvinfo div div.col-lg-4').each((index, element) => {
            const title = cleanText($(element).find('h3 a').text());
            const description = cleanText($(element).find('p').text());
            const link = $(element).find('a').attr('href');
            const fulllink = `https://www.canada.ca/fr/services/${link}`;

            // Ajout de l'offre d'emploi au tableau
            const servicesOffersDetail = { title, description, fulllink };
            servicesOffersDetails.push(servicesOffersDetail);
        });

        // Retourner les résultats au format JSON
        res.json(servicesOffersDetails);
    } catch (error) {
        console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

const getServicesDetailsDetails = async (req, res) => {
    var link1 = req.params.link1;
    var link2 = req.params.link2;
    var link3 = req.params.link3;
    var link = req.query.link;

    const baseUrl = "https://www.canada.ca/fr";
    const pathParts = [link1, link2, link3].filter(Boolean); // Supprime les undefined
    const url = `${baseUrl}/${pathParts.map(encodeURIComponent).join('/')}`;

    console.log(url);

    // Fonction pour nettoyer les données extraites
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    // Fonction pour nettoyer l'URL (retirer le jsessionid)
    const cleanUrl = (url) => url.replace(/;jsessionid=[^?]+/, '');

    // Fonction pour scraper les offres d'emploi
    try {
        // Récupérer le contenu HTML de la page
        const { data } = await axios.get(url); // Récupérer le contenu HTML de la page
        const $ = cheerio.load(data); //charge le contenu dans la variable $

        // Tableau pour stocker les services de santé
        const servicesOffersDetailsDetails = [];

        $('section.col-md-8 div.wb-eqht section.col-md-6').each((index, element) => {
            const title = cleanText($(element).find('h3 a').text());
            const description = cleanText($(element).find('p').text());
            const link = $(element).find('a').attr('href');
            const fulllink = `https://www.canada.ca${link}`;

            // Ajout de l'offre d'emploi au tableau
            const servicesOffersDetailDetail = { title, description, fulllink };
            servicesOffersDetailsDetails.push(servicesOffersDetailDetail);
        });

        // Retourner les résultats au format JSON
        res.json(servicesOffersDetailsDetails);
    } catch (error) {
        console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};




module.exports = {
    getServices,
    getServicesDetails,
    getServicesDetailsDetails
};
