const express = require('express');
const router = express.Router();
const searchController = require('../../api/controllers/searchController');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
// Route GET /api/search/searchLocation
router.get("/searchLocation", async (req, res) => {
    const { query } = req.query; // Récupère le paramètre `query` depuis l'URL

    if (!query) {
        return res.status(400).json({ error: "Le paramètre 'query' est requis." });
    }

    try {
        const suggestions = await searchController.getSuggestions(query);
        res.json({ suggestions });
    } catch (error) {
        console.error("Erreur lors de la récupération des suggestions:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

module.exports = router;


