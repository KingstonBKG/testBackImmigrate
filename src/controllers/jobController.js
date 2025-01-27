const bcrypt = require('bcrypt');
const { db, admin } = require('../config/firebase');
const axios = require('axios');
const cheerio = require('cheerio');

// Méthode pour vérifier l'API Key
const verifyApiKey = async (req, res, next) => {
  const apiKey = req.header('apikey');
  const appName = req.header('appName');

  if (!apiKey || !appName) {
    return res.status(400).json({ message: 'apiKey and appName are required' });
  }

  try {
    const snapshot1 = await db.collection('apiKeys').get();
    console.log('Collections disponibles dans Firestore:');
    snapshot1.forEach(doc => {
      console.log('Document ID:', doc.id, 'Data:', doc.data());
    });

    const snapshot = await db
      .collection('apiKeys')
      .where('appName', '==', appName)
      .get();

      if (snapshot.empty) {
        console.error(`Aucune application trouvée avec le nom ${appName}`);
        return res.status(404).json({ message: 'App not found' });
      }

    const doc = snapshot.docs[0];
    const firebaseApiKey = doc.data().apiKey;

    const isValid = await bcrypt.compare(apiKey, firebaseApiKey);
    if (!isValid) {
      console.error('Clé API invalide');
      return res.status(401).json({ message: 'Invalid API Key' });
    }

    console.log('Clé API valide');
    next();
  } catch (error) {
    console.error('Erreur complète:', error);
    return res.status(500).json({ message: 'Internal server error', details: error.message || error });
  }

};


// Méthode pour récupérer les jobs
const getJob = async (req, res) => {

  const searchstring = req.query.searchstring || '';  // Par défaut 'avocat' si non fourni
  const locationstring = req.query.locationstring || '';

  // URL de la page à scraper
  const url = `https://www.guichetemplois.gc.ca/jobsearch/rechercheemplois?searchstring=${encodeURIComponent(searchstring)}&locationstring=${encodeURIComponent(locationstring)}&locationparam=`;


  // Fonction pour nettoyer les données extraites
  const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

  // Fonction pour scraper les offres d'emploi

  try {
    // Récupérer le contenu HTML de la page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Tableau pour stocker les offres d'emploi
    const jobOffers = [];

    $('.resultJobItem').each((index, element) => {
      const title = cleanText($(element).find('.noctitle').text());
      const company = cleanText($(element).find('.business').text());
      const location = cleanText($(element).find('.location').text());
      const salary = cleanText($(element).find('.salary').text());
      const date = cleanText($(element).find('.date').text());

      const jobOffer = { title, company, location, salary, date };
      jobOffers.push(jobOffer);
    });



    res.json(jobOffers);
  } catch (error) {
    console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
  }

};

module.exports = {
  verifyApiKey,
  getJob,
};
