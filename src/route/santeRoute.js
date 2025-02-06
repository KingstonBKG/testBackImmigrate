const express = require('express');
const router = express.Router();
const santeController = require('../controllers/santeController');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getservices',  santeController.getServices);
module.exports = router;