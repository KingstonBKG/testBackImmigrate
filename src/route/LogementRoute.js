const express = require('express');
const router = express.Router();
const logementController = require('../controllers/logementController');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getlogement/:type/:city', logementController.getLogement);
router.get('/getlogementwithtype/:type?/:city?/:ftype?',  logementController.geLogementwithtype);
  
module.exports = router;
