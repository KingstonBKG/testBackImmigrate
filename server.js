const express = require('express');
const cors = require('cors');
const jobController = require('./src/controllers/jobController');
// const Router = require('./src/route/route');
const app = express();
require('dotenv').config();


// Middleware
app.use(cors());
app.use(express.json()); // Pour pouvoir parser les requêtes JSON

// Définition des routes

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/jobs', jobController.getJob);  // La route pour récupérer les jobs