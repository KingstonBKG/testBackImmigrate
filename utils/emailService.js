const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport(config.emailConfig);

exports.sendConfirmationEmail = async ({ to, name }) => {
  const mailOptions = {
    from: config.emailConfig.auth.user,
    to,
    subject: 'Confirmation de réception - DTR Solutions',
    html: `
      <h2>Merci de nous avoir contacté, ${name}!</h2>
      <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
      <p>Cordialement,<br>L'équipe DTR Solutions</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendConfirmationNewsletter = async ({ to }) => {
  const mailOptions = {
    from: config.emailConfig.auth.user,
    to,
    subject: 'Bienvenue à la newsletter Dream Team Record',
    html: `
      <h2>Merci de vous être inscrit à la newsletter Dream Team Record!</h2>
      <p>Vous recevrez désormais nos actualités et nos meilleures offres.</p>
      <p>Pour vous désabonner, Contacter l'équipe DTR via le formulaire de contact.</p>
      <p>Cordialement,<br>L'équipe DTR</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendTeamNotification = async ({ name, email, subject, message }) => {
  const mailOptions = {
    from: config.emailConfig.auth.user,
    to: config.emailConfig.auth.user, // Envoyer à l'équipe
    subject: `Nouveau message de contact - ${subject}`,
    html: `
      <h2>Nouveau message de contact</h2>
      <p><strong>De:</strong> ${name} (${email})</p>
      <p><strong>Sujet:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Envoyer des emails en masse
// exports.sendBulkEmails = async (recipients, subject, message) => {
//   const mailOptions = {
//     from: config.emailConfig.auth.user,
//     to: recipients.join(','),
//     subject,
//     html: `
//       <h2>${subject}</h2>
//       <p>${message}</p>
//       <p>Cordialement,<br>L'équipe</p>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };
exports.sendBulkEmails = async ({ to, bcc, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou votre service d'email (ex: SMTP)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to, // Une adresse générique
    bcc, // Liste des abonnés masquée
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};


exports.sendReplyEmail = async ({ to, replyMessage }) => {
  const mailOptions = {
    from: config.emailConfig.auth.user,
    to,
    subject: 'Réponse à votre message - DTR Solutions',
    html: replyMessage, // Affiche uniquement le contenu de replyMessage
  };

  await transporter.sendMail(mailOptions);
};
