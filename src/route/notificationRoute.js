// const express = require('express');
// const router = express.Router();
// const admin = require('firebase-admin');

// // Envoyer une notification à un utilisateur spécifique
// router.post('/send', async (req, res) => {
//   try {
//     const { token, title, body, data } = req.body;
    
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       data: data || {},
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

// // Envoyer une notification à plusieurs utilisateurs
// router.post('/send-multiple', async (req, res) => {
//   try {
//     const { tokens, title, body, data } = req.body;
    
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       data: data || {},
//       tokens: tokens
//     };

//     const response = await admin.messaging().sendMulticast(message);
//     res.status(200).json({ 
//       success: true, 
//       message: `Notifications envoyées avec succès. Succès: ${response.successCount}, Échecs: ${response.failureCount}`,
//       response 
//     });
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi des notifications:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Erreur lors de l\'envoi des notifications' 
//     });
//   }
// });

// module.exports = router; 