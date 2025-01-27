const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const contactRoutes = require('./routes/contactRoutes');
const errorHandler = require('./middleware/errorHandler');
const newsletterRoutes = require('./routes/newsletter');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const path = require('path');
const app = express();

const allowedOrigins = [
  '*', // Origine en développement,  // Origine en production
];

const corsOptions = {
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  credentials: true, // Si vous utilisez des cookies ou des sessions
};

// Middleware
// app.use(cors({
//   origin: config.clientURL,
//   credentials: true,
// }));
app.use(cors(corsOptions));


app.use(express.json());

// Serve les fichiers statiques
app.use(express.static(path.join(__dirname, 'DTR-Client/build')));

// Routes API
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Gestion des routes non trouvées pour l'API
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Redirige toutes les autres routes vers index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'DTR-Client/build/index.html'));
});

// Error Handler
app.use(errorHandler);

// Connexion à MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Démarrage du serveur
app.listen(config.port, () => {
  console.log(`Serveur démarré sur le port http://localhost:${config.port}`);
});
