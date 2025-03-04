const express = require("express");
const router = express.Router();
const gpsCoordinatesController = require("../../api/controllers/gpsCoordinatesController.js");
const verifyKey = require("../config/verifyApiKey.js");

// Middleware pour vérifier la clé API
router.use(verifyKey);

// Route pour obtenir les coordonnées GPS d'une ville
router.get("/coordinates", gpsCoordinatesController.getCoordinatesFromCity);

module.exports = router;