const bcrypt = require('bcrypt');
const { db, admin } = require('../config/firebase');
const axios = require('axios');
const cheerio = require('cheerio');

// Méthode pour vérifier l'API Key
const verifyApiKey = async (req, res, next) => {
  const apiKey = req.header('apikey');
  const appName = req.header('appname');

  console.log('apiKey from header:', apiKey);
  console.log('appName from header:', appName);

  if (!apiKey || !appName) {
    return res.status(400).json({ message: 'apiKey and appName are required' });
  }

  try {
    // Récupération de la clé de l'application depuis Firestore (db)
    const snapshot = await db.collection('apiKeys').doc(appName).get();

    if (!snapshot.exists) {
      console.log(`L'application ${appName} n'existe pas dans Firestore`);
      return res.status(404).json({ message: 'App not found' });
    }

    const firebaseApiKey = snapshot.data().apiKey; // L'API Key cryptée dans Firebase
    console.log('Clé API stockée (hachée) depuis Firebase:', firebaseApiKey);

    // Vérification de l'API Key avec bcrypt
    const isValid = await bcrypt.compare(apiKey, firebaseApiKey);
    if (!isValid) {
      console.log('Clé API invalide');
      return res.status(401).json({ message: 'Invalid API Key' });
    }

    console.log('Clé API valide');
    next(); // API Key est valide, on passe à la suite
  } catch (error) {
    console.error('Erreur de vérification de la clé API:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Méthode pour récupérer les jobs
const getJob = async (req, res) => {
  // URL de la page à scraper
  const url = 'https://www.guichetemplois.gc.ca/jobsearch/rechercheemplois?searchstring=avocat&locationstring=&locationparam=';
  
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
