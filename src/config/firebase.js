const admin = require('firebase-admin');
const serviceAccount = require('../../firebaseConnect/firebase.json'); // Remplacez par le chemin vers votre fichier JSON de service Firebase

// Initialisation de Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Exportation de `admin` et `db` (Firestore)
const db = admin.firestore();  // Accès à la base de données Firestore

module.exports = {
  admin,
  db
};
