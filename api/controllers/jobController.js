
const puppeteer = require("puppeteer-core"); // ⚠️ Remplace "puppeteer" par "puppeteer-core"
const chromium = require("@sparticuz/chromium");


// Méthode pour récupérer les jobs
const getJob = async (req, res) => {
  let browser;

  browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
    headless: chromium.headless, // Utiliser le mode headless adapté
  });
  
  try {
    const searchstring = req.query.searchstring || '';
    const locationstring = req.query.locationstring || '';
    const fper = req.query.fper || '';

    const url = `https://www.guichetemplois.gc.ca/jobsearch/rechercheemplois?searchstring=${encodeURIComponent(searchstring)}&locationstring=${encodeURIComponent(locationstring)}&locationparam=&fper=${encodeURIComponent(fper)}`;

    

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    // Attendre que les articles soient chargés
    await page.waitForSelector('article.action-buttons');

    const jobOffers = await page.evaluate(() => {
      const cleanText = text => text ? text.replace(/\s+/g, ' ').trim() : '';
      const cleanUrl = url => url ? url.replace(/;jsessionid=[^?]+/, '') : '';

      return Array.from(document.querySelectorAll('article.action-buttons')).map(element => {
        const link = element.querySelector('a.resultJobItem');
        let jobUrl = link ? link.href : null;
        jobUrl = cleanUrl(jobUrl);

        return {
          title: cleanText(element.querySelector('.noctitle')?.textContent),
          company: cleanText(element.querySelector('.business')?.textContent),
          location: cleanText(element.querySelector('.location')?.textContent),
          salary: cleanText(element.querySelector('.salary')?.textContent),
          date: cleanText(element.querySelector('.date')?.textContent),
          telework: cleanText(element.querySelector('.telework')?.textContent),
          newPost: cleanText(element.querySelector('.new')?.textContent),
          jobgreenflag: cleanText(element.querySelector('.jobgreenflag')?.textContent),
          distance: cleanText(element.querySelector('.distance')?.textContent),
          appmethod: cleanText(element.querySelector('.appmethod')?.textContent),
          jobUrl
        };
      });
    });

    await browser.close();
    return res.json(jobOffers);

  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    if (browser) await browser.close();
    
    // Retourner une réponse plus détaillée
    return res.status(500).json({ 
      error: 'Erreur lors du scraping',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Méthode pour récupérer les jobs
const getJobdetails = async (req, res) => {
  let browser;
  try {
    const jobId = req.query.jobId;
    if (!jobId) {
      return res.status(400).json({ error: 'ID de l\'offre d\'emploi manquant' });
    }

    const url = `https://www.guichetemplois.gc.ca/rechercheemplois/offredemploi/${jobId}?source=searchresults`;

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    const jobDetails = await page.evaluate(() => {
      const cleanText = text => text ? text.replace(/\s+/g, ' ').trim() : '';

      // Fonction helper pour extraire le texte
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? cleanText(element.textContent) : '';
      };

      // Fonction helper pour extraire les listes
      const getListItems = (selector) => {
        const items = document.querySelectorAll(`${selector} li`);
        return Array.from(items).map(item => cleanText(item.textContent)).join(', ');
      };

      return {
        jobTitle: getText('h1.title span[property="title"]'),
        jobAppellation: getText('p.source-title .source-title-inner'),
        datePosted: getText('p.date-business .date').replace('Publiée le', ''),
        employer: getText('span[property="hiringOrganization"] strong'),
        jobLocation: getText('ul.job-posting-brief li span[property="joblocation"] .city'),
        employmentType: getText('ul.job-posting-brief li span[property="employmentType"]'),
        jobSource: getText('ul.job-posting-brief li span.source-title'),
        jobUrl: document.querySelector('a#externalJobLink')?.href || '',
        langue: getText('p[property="qualification"]'),
        experience: getText('p[property="experienceRequirements qualification"] span'),
        diplome: getText('ul[property="educationRequirements qualification"] li span'),
        description: getText('span.description'),
        important: getText('div.job-posting-detail-common div p.small'),
        salary: getText('ul.job-posting-brief li:nth-child(3)'),
        type: getText('ul.job-posting-brief li:nth-child(4)'),
        startDate: getText('ul.job-posting-brief li:nth-child(5)'),
        responsabilite: getListItems('div[property="responsibilities"] ul.csvlist'),
        expetspec: getListItems('div[property="experienceRequirements"] ul.csvlist'),
        renseignementsup: getListItems('div[property="skills"] ul.csvlist'),
        jobaudience: getListItems('div.job-audience ul')
      };
    });

    await browser.close();
    return res.json(jobDetails);

  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    if (browser) await browser.close();
    return res.status(500).json({ 
      error: 'Erreur lors du scraping',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
      headless: chromium.headless, // Utiliser le mode headless adapté
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

      // // Vérifier le bouton de redirection
      // const submitButton = document.querySelector('input[type="submit"]');
      // if (submitButton) {
      //   results.redirectURL = submitButton.getAttribute('data-redirect');
      // }

      // Vérifier l'email
      const emailElement = document.querySelector('#howtoapply a[href^="mailto:"]');
      if (emailElement) {
        results.email = emailElement.href.replace('mailto:', '');
      }

      // Vérifier le lien externe
      const externalLink = document.querySelector('#externalJobLink');
      if (externalLink) {
        results.externaljoblink = externalLink.getAttribute('href');
      }

      // Vérifier le texte de postulation

      // Vérifier les informations de courrier
      const courrierStreetElement = document.querySelector('.block_street');
      const courrierCityElement = document.querySelector('.block_city');
      const courrierPostcodeElement = document.querySelector('.block_postalcode');

      const courrierStreet = courrierStreetElement ? courrierStreetElement.textContent.trim() : '';
      const courrierCity = courrierCityElement ? courrierCityElement.textContent.trim() : '';
      const courrierPostcode = courrierPostcodeElement ? courrierPostcodeElement.textContent.trim() : '';

      if (courrierStreet || courrierCity || courrierPostcode) {
        results.courrier = `${courrierStreet} ${courrierCity} ${courrierPostcode}`.trim();
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
