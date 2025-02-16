const express = require('express')
const router=express.Router()
const verifyApiKey=require('../config/verifyApiKey')

router.use(verifyApiKey)
