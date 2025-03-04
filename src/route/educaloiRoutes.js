const express = require("express");
const router = express.Router();
const educaloiController = require("../../api/controllers/educaloiController");
const verifyKey = require("../config/verifyApiKey.js");

router.use(verifyKey);
router.get("/getAidesJudiciaires", educaloiController.getAidesJudiciaires);

module.exports = router;
