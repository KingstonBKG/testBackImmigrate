const express = require('express');
const router = express.Router();
const actuController = require('../../api/controllers/actuController.js');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getactu',  actuController.getactu);
router.get('/getacturadiocanada',  actuController.getacturadiocanada);
  
module.exports = router;
