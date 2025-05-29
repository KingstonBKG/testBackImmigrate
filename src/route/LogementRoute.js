const express = require('express');
const router = express.Router();
const AppartogoScraper  = require('../../api/controllers/logementController');
const verifyApiKey = require('../config/verifyApiKey');
const cacheDuration = 3600; // 1 heure en secondes
router.use(verifyApiKey);

  
/**
 * @route GET /api/appartogo/provinces
 * @description Récupère toutes les provinces avec leurs villes et annonces
 * @access Public
 */
router.get('/provinces', async (req, res) => {
    try {
        const provinces = await AppartogoScraper.scrapeAllProvinces();
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
        
        // Add input validation
        if (!cityName || cityName.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Le nom de la ville est requis'
            });
        }
        
        const listings = await AppartogoScraper.getListingsByCity(cityName.trim());
        
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
        
        // Better error handling
        if (error.message.includes('not found in database')) {
            return res.status(404).json({
                success: false,
                message: `La ville ${req.params.cityName} n'existe pas dans notre base de données`
            });
        }
        
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
        const listings = await AppartogoScraper.getListingsByCity(cityName);
        
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