const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { db, admin } = require('../config/firebase');

// Fonction pour générer une clé API aléatoire
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Fonction pour hasher la clé API
async function hashApiKey(apiKey) {
  const saltRounds = 10;
  return await bcrypt.hash(apiKey, saltRounds);
}

// Fonction principale pour créer une API key et un nom d'application
async function createApiKeyAndAppName() {
  try {
    // Génération de la clé API et du nom d'application
    const apiKey = generateApiKey();
    const appName = 'MyApp-' + Date.now(); // Exemple simple pour un nom unique

    // Hachage de la clé API
    const hashedApiKey = await hashApiKey(apiKey);

    // Stockage dans Firebase Firestore
    const apiKeysRef = db.collection('apiKeys');
    const docRef = await apiKeysRef.add({
      apiKey: hashedApiKey,
      appName: appName,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('API Key and App Name created successfully:');
    console.log('API Key:', apiKey);
    console.log('App Name:', appName);
    console.log('Firebase Document ID:', docRef.id);

  } catch (error) {
    console.error('Error creating API Key and App Name:', error);
  }
}

// Exécution du script
createApiKeyAndAppName();