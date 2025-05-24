const express = require('express');
const router = express.Router();
const AppartogoScraper  = require('../controllers/logementController');
const verifyApiKey = require('../config/verifyApiKey');
const scraper = new AppartogoScraper();
const cacheDuration = 3600; // 1 heure en secondes
// router.use(verifyApiKey);

// router.use(verifyApiKey);

// Route pour récupérer les propriétés avec filtres type, location et limit
// router.get('/properties', async (req, res) => {
//     try {
//         // Récupération des paramètres de requête
//         const { type = 'buy', location = '', limit = 10 } = req.query;
//         // Appel du contrôleur principal
//         await logementController.getProperties(req, res);
//         // La réponse est gérée dans le contrôleur
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// router.get('/getlogement/cities', logementController.getCities);
// router.get('/getlogement/listings/:city', logementController.getCityListings);
// Route pour récupérer les jobs en fonction du searchstring
// router.get('/getlogement/:type/:city/:bed?/:price?/:pet?', logementController.getLogement);
// router.get('/getlogementwithtype/:type?/:city?/:ftype?',  logementController.geLogementwithtype);
// router.get('/getlogementdetails/*',  logementController.getLogementDetails);
  
/**
 * @route GET /api/appartogo/provinces
 * @description Récupère toutes les provinces avec leurs villes et annonces
 * @access Public
 */
router.get('/provinces', async (req, res) => {
    try {
        const provinces = await scraper.scrapeAllProvinces();
        res.json({ success: true, data: provinces });
    } catch (error) {
        console.error('Error in /provinces route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors du scraping des provinces',
            error: error.message 
        });
    }
});

/**
 * @route GET /api/appartogo/city/:cityName
 * @description Récupère les annonces pour une ville spécifique
 * @access Public
 */
router.get('/city/:cityName', async (req, res) => {
    try {
        const cityName = req.params.cityName;
        const listings = await scraper.getListingsByCity(cityName);
        
        if (!listings || listings.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `Aucune annonce trouvée pour la ville ${cityName}` 
            });
        }
        
        res.json({ 
            success: true, 
            city: cityName,
            count: listings.length,
            data: listings 
        });
    } catch (error) {
        console.error(`Error in /city/${req.params.cityName} route:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors du scraping des annonces',
            error: error.message 
        });
    }
});

/**
 * @route GET /api/appartogo/refresh/:cityName
 * @description Force l'actualisation des données pour une ville (ignore le cache)
 * @access Public
 */
router.get('/refresh/:cityName', async (req, res) => {
    try {
        const cityName = req.params.cityName;
        const listings = await scraper.getListingsByCity(cityName);
        
        res.json({ 
            success: true, 
            city: cityName,
            refreshed: new Date(),
            count: listings.length,
            data: listings 
        });
    } catch (error) {
        console.error(`Error in /refresh/${req.params.cityName} route:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'actualisation des annonces',
            error: error.message 
        });
    }
});

module.exports = router;
