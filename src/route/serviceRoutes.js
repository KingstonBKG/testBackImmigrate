const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getservices', serviceController.getService);

module.exports = router;
