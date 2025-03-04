const express=require('express');
const router = express.Router();
const educationController = require('../../api/controllers/educationController');
const verifyApiKey = require('../config/verifyApiKey');

router.use(verifyApiKey);

router.get('/geteducation',educationController.scrapeCICIC);

module.exports=router