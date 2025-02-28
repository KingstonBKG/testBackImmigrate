const express = require("express");
const cors = require("cors");
const admin = require('firebase-admin');
const jobRoute = require("./src/route/Jobroute");
const LogementRoute = require("./src/route/LogementRoute");
const santeRoute = require("./src/route/santeRoute");
const searchRoute = require("./src/route/searchRoute");
const educationRoute = require("./src/route/educationRoute");
const educaloiRoute = require("./src/route/educaloiRoutes.js");
const serviceRoute = require("./src/route/serviceRoutes.js");
const gpsCoordinatesRoute = require("./src/route/gpsCoordinatesRoutes.js");
const actuRoute = require("./src/route/actuRoutes.js");


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

// Initialisation de Firebase Admin
// const serviceAccount = require('./chemin-vers-votre-fichier-serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

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
app.use("/api/service", serviceRoute);
app.use("/api/geo", gpsCoordinatesRoute); 
app.use("/api/actu", actuRoute); 


// app.use("/api/notifications", notificationRoute);

// Nouvelle route pour les notifications
// app.post('/api/notifications/send', async (req, res) => {
//   try {
//     const { token, title, body } = req.body;
    
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       token: token
//     };

//     const response = await admin.messaging().send(message);
//     res.status(200).json({ 
//       success: true, 
//       message: 'Notification envoyée avec succès',
//       response 
//     });
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi de la notification:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Erreur lors de l\'envoi de la notification' 
//     });
//   }
// });

app.get("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port http://localhost:${PORT}`);
});
