const express = require('express');
const Router = express.Router();
const jobController = require('../controllers/jobController');
// Router.use(jobController.verifyApiKey);

// Route pour récupérer les jobs en fonction du searchstring
Router.get('/jobs', (req, res) => {
    res.json({ message: 'Here are the jobs!' });
  });
module.exports = Router;
