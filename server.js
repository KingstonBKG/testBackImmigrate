const express = require("express");
const cors = require("cors");
const jobRoute = require("./src/route/Jobroute");
const LogementRoute = require("./src/route/LogementRoute");
const santeRoute = require("./src/route/santeRoute");
const searchRoute = require("./src/route/searchRoute");
const educationRoute = require("./src/route/educationRoute");
const educaloiRoute = require("./src/route/educaloiRoutes.js");

const resautageRoute = require("./src/route/resautageRoute.js");

const app = express();
require("dotenv").config();

// Middleware
const allowedOrigins = [
  "*", // Origine en développement,  // Origine en production
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Si vous utilisez des cookies ou des sessions
};
app.use(cors(corsOptions));
app.use(express.json()); // Pour pouvoir parser les requêtes JSON

// Définition des routes

// Lancer le serveur
const PORT = process.env.PORT || 5000;

app.use("/api/job", jobRoute); // La route pour récupérer les jobs
app.use("/api/logement", LogementRoute); // La route pour récupérer les logements
app.use("/api/sante", santeRoute);
app.use("/api/education", educationRoute); // la route pour recuper les ecoles
app.use("/api/resautage", resautageRoute);
app.use("/api/search", searchRoute);
app.use("/api/aide-judiciaire", educaloiRoute);

app.get("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port http://localhost:${PORT}`);
});
