const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const verifyApiKey = require('../config/verifyApiKey');

// router.use(verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
router.get('/getjob',  jobController.getJob);
router.get('/getjobdetails',  jobController.getJobdetails);
  
module.exports = router;
