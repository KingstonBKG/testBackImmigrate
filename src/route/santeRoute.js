const express = require('express');
const router = express.Router();
const santeController = require('../controllers/santeController');
const verifyApiKey = require('../config/verifyApiKey');

// router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getservices?ffilter',  santeController.getServices);
router.get('/getservices/details/:link1?/:link2?/:link3?',  santeController.getServicesDetails);
router.get('/getservices/details/details/:link1?/:link2?/:link3?',  santeController.getServicesDetailsDetails);
  
module.exports = router;
