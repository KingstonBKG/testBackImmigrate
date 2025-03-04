const express = require('express');
const router = express.Router();
const logementController = require('../../api/controllers/logementController');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getlogement/:type/:city/:bed?/:price?/:pet?', logementController.getLogement);
router.get('/getlogementwithtype/:type?/:city?/:ftype?',  logementController.geLogementwithtype);
router.get('/getlogementdetails/*',  logementController.getLogementDetails);
  
module.exports = router;
