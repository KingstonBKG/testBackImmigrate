const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { timeouts } = require('retry');


// Méthode pour récupérer les jobs
const getJob = async (req, res) => {
  const searchstring = req.query.searchstring || '';  // Par défaut 'avocat' si non fourni
  const locationstring = req.query.locationstring || '';
  const fper = req.query.fper || '';

  // URL de la page à scraper
  const url = `https://www.guichetemplois.gc.ca/jobsearch/rechercheemplois?searchstring=${encodeURIComponent(searchstring)}&locationstring=${encodeURIComponent(locationstring)}&locationparam=&fper=${encodeURIComponent(fper)}`;

  // Fonction pour nettoyer les données extraites
  const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

  // Fonction pour nettoyer l'URL (retirer le jsessionid)
  const cleanUrl = (url) => url.replace(/;jsessionid=[^?]+/, '');


  // Fonction pour scraper les offres d'emploi
  try {
    // Récupérer le contenu HTML de la page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Tableau pour stocker les offres d'emploi
    const jobOffers = [];

    $('article.action-buttons').each((index, element) => {
      const title = cleanText($(element).find('.noctitle').text());
      const company = cleanText($(element).find('.business').text());
      const location = cleanText($(element).find('.location').text());
      const salary = cleanText($(element).find('.salary').text());
      const date = cleanText($(element).find('.date').text());
      const newPost = cleanText($(element).find('.new').text() ?? "");
      const telework = cleanText($(element).find('.telework').text() ?? "");
      const jobgreenflag = cleanText($(element).find('.jobgreenflag').text() ?? "");
      const distance = cleanText($(element).find('.distance').text() ?? "");
      const appmethod = cleanText($(element).find('.appmethod').text() ?? "");

      // Extraction de l'URL complète à partir de la balise <a> (si présente)
      const link = $(element).find('a.resultJobItem').attr('href');
      let jobUrl = null;

      if (link) {
        // Si le lien est relatif, on le préfixe avec l'URL principale
        if (link.startsWith('/')) {
          jobUrl = `https://www.guichetemplois.gc.ca${link}`;
        } else {
          jobUrl = link;
        }

        // Nettoyer l'URL pour retirer le jsessionid
        jobUrl = cleanUrl(jobUrl);
      }

      // Ajout de l'offre d'emploi au tableau
      const jobOffer = { title, company, location, salary, date, telework, newPost, jobgreenflag, distance, appmethod, jobUrl };
      jobOffers.push(jobOffer);
    });

    // Retourner les résultats au format JSON
    res.json(jobOffers);
  } catch (error) {
    console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Méthode pour récupérer les jobs
const getJobdetails = async (req, res) => {
  const searchstring = req.query.details || '';

  // Vous pouvez récupérer l'ID de l'offre à partir des données renvoyées par l'API (exemple: 43126771)
  const jobId = req.query.jobId || '';  // Récupérer l'ID de l'offre d'emploi depuis les paramètres de la requête

  // Vérification que l'ID de l'offre est bien présent
  if (!jobId) {
    return res.status(400).json({ error: 'ID de l\'offre d\'emploi manquant' });
  }

  // Construction de l'URL dynamique en fonction de l'ID de l'offre d'emploi
  const url = `https://www.guichetemplois.gc.ca/rechercheemplois/offredemploi/${jobId}?source=searchresults`;

  // Fonction pour nettoyer les données extraites
  const cleanText = (text) => text.replace(/\s+/g, ' ').trim();


  // Fonction pour scraper les offres d'emploi
  try {
    // Récupérer le contenu HTML de la page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    var responsabilite, expetspec, renseignementsup, jobaudience;

    // Tableau pour stocker les offres d'emploi
    // Extraire les informations nécessaires
    const jobTitle = cleanText($('h1.title span[property="title"]').text().trim());
    const jobAppellation = cleanText($('p.source-title .source-title-inner').text().trim());
    const datePosted = cleanText($('p.date-business .date').text().trim().replace('Publiée le', '').trim());
    const employer = cleanText($('span[property="hiringOrganization"] strong').text().trim());
    const jobLocation = cleanText($('ul.job-posting-brief li span[property="joblocation"] .city').text().trim());
    const employmentType = cleanText($('ul.job-posting-brief li span[property="employmentType"]').text().trim());
    const jobSource = cleanText($('ul.job-posting-brief li span.source-title').text().trim());
    const jobUrl = $('a#externalJobLink').attr('href');
    const langue = cleanText($('p[property="qualification"]').text().trim());
    const experience = cleanText($('p[property="experienceRequirements qualification"] span').text().trim());
    const diplome = cleanText($('ul[property="educationRequirements qualification"] li span').text().trim());
    const description = cleanText($('span.description').text().trim());
    const important = cleanText($('div.job-posting-detail-common div p.small').text().trim());
    const salary = $('ul.job-posting-brief li:nth-child(3)').text().trim();
    const type = cleanText($('ul.job-posting-brief li:nth-child(4)').text().trim());
    const startDate = $('ul.job-posting-brief li:nth-child(5)').text().trim();



    $('div[property="responsibilities"] ul.csvlist').each((index, element) => {
      responsabilite = cleanText($(element).find('li').text());

    });
    $('div[property="experienceRequirements"] ul.csvlist').each((index, element) => {
      expetspec = cleanText($(element).find('li').text());
    });
    $('div[property="skills"] ul.csvlist').each((index, element) => {
      renseignementsup = cleanText($(element).find('li').text());
    });
    $('div.job-audience ul').each((index, element) => {
      jobaudience = cleanText($(element).find('li').text());
    });



    // Créer un objet avec les informations extraites
    const jobDetails = {
      jobTitle,
      langue,
      diplome,
      experience,
      description,
      responsabilite,
      salary,
      expetspec,
      renseignementsup,
      jobAppellation,
      datePosted,
      employer,
      jobLocation,
      employmentType,
      startDate,
      type,
      jobSource,
      jobUrl,
      jobaudience,
      important
    };


    res.json(jobDetails);


    // Retourner les résultats au format JSON
  } catch (error) {
    console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Méthode pour récupérer les jobs
const applyJob = async (req, res) => {
  const idjob = req.params.idjob; 
  let browser;

  try {
    const baseUrl = "https://www.guichetemplois.gc.ca/rechercheemplois/offredemploi";
    const url = `${baseUrl}/${idjob}?source=searchresults`;
    console.log(`Navigating to: ${url}`);

    // browser = await puppeteer.connect({
    //   headless: true,
    //   browserWSEndpoint: 'wss://chrome.browserless.io?token=RlBL97PMa0pmz92ac02a0f78979584fc2a3401f984'
    // });
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Vérifier si le bouton "Comment postuler" existe
    const applyButtonExists = await page.$('.how-to-apply > p > button');
    if (applyButtonExists) {
      await page.click('.how-to-apply > p > button');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Récupérer toutes les informations de postulation
    const applicationInfo = await page.evaluate(() => {
      const results = {};
      
      // Vérifier le bouton de redirection
      const submitButton = document.querySelector('input[type="submit"]');
      if (submitButton) {
        results.redirectURL = submitButton.getAttribute('data-redirect');
      }

      // Vérifier l'email
      const emailElement = document.querySelector('a[href^="mailto:"]');
      if (emailElement) {
        results.email = emailElement.href.replace('mailto:', '');
      }

      // Vérifier le lien externe
      const externalLink = document.querySelector('#externalJobLink');
      if (externalLink) {
        results.externaljoblink = externalLink.getAttribute('href');
      }

      // Vérifier le texte de postulation
      const applyText = document.querySelector('#howtoapply > p');
      if (applyText) {
        results.applyText = applyText.textContent.trim();
      }

      return results;
    });

    console.log('Application info:', applicationInfo);
    await browser.close();
    return res.json(applicationInfo);

  } catch (error) {
    console.error('Error in applyJob:', error);
    if (browser) {
      await browser.close();
    }
    return res.status(500).json({ 
      error: 'Error while fetching application information',
      details: error.message 
    });
  }
};



module.exports = {
  getJob,
  getJobdetails,
  applyJob
};
