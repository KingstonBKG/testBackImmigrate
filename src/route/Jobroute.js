const express = require('express');
const router = express.Router();
const jobController = require('../../api/controllers/jobController');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getjob',  jobController.getJob);
router.get('/getjobdetails',  jobController.getJobdetails);
router.get('/applyjob/:idjob',  jobController.applyJob);

router.get("/locate", async (req, res) => {
    const { locationstring } = req.query; // Récupère le paramètre `query` depuis l'URL

    if (!locationstring) {
        return res.status(400).json({ error: "Entrer une ville" });
    }

    try {
        const suggestions = await jobController.locate(locationstring);
        res.json({ suggestions });
    } catch (error) {
        console.error("Erreur lors de la récupération des suggestions:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});
  
module.exports = router;
