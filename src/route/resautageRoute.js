const express=require('express');
const router=express.Router();
const resautageController = require('../../api/controllers/resautageController.js');

const verifyKey=require('../config/verifyApiKey.js')

router.use(verifyKey)
router.get('/getresautage', resautageController.getResautage)

module.exports=router;