// Contrôleur pour récupérer les coordonnées GPS d'une ville
const puppeteer = require('puppeteer-core');

const getCoordinatesFromCity = async (req, res) => {
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({
      success: false,
      error: "Le nom de la ville est requis"
    });
  }

  try {
    // Connexion à browserless.io pour l'exécution du navigateur
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'wss://chrome.browserless.io?token=RlBL97PMa0pmz92ac02a0f78979584fc2a3401f984',
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    // Création d'une nouvelle page
    const page = await browser.newPage();

    // Configuration des en-têtes pour simuler un navigateur normal
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr-FR,fr;q=0.9",
    });

    // Navigation vers l'URL du convertisseur de coordonnées GPS
    await page.goto("https://www.coordonnees-gps.fr/conversion-coordonnees-gps", { 
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Saisie de la ville dans le champ d'adresse
    await page.waitForSelector('#address');
    await page.type('#address', city);
    
    // Clic sur le bouton pour obtenir les coordonnées GPS
    await page.click('button.btn.btn-primary[onclick="codeAddress()"]');

    // Attente que les résultats soient chargés
    await page.waitForFunction(
      () => document.querySelector('#latitude') && document.querySelector('#latitude').value !== '',
      { timeout: 10000 }
    );

    // Récupération des coordonnées (format décimal)
    const coordinates = await page.evaluate(() => {
      const latitude = document.querySelector('#latitude').value;
      const longitude = document.querySelector('#longitude').value;
      
      // Récupération des coordonnées sexagésimales (degrés, minutes, secondes)
      const latDegrees = document.querySelector('#latitude_degres').value;
      const latMinutes = document.querySelector('#latitude_minutes').value;
      const latSeconds = document.querySelector('#latitude_secondes').value;
      const latDirection = document.querySelector('#nord').checked ? 'N' : 'S';
      
      const longDegrees = document.querySelector('#longitude_degres').value;
      const longMinutes = document.querySelector('#longitude_minutes').value;
      const longSeconds = document.querySelector('#longitude_secondes').value;
      const longDirection = document.querySelector('#est').checked ? 'E' : 'O';
      
      // Format what3words si disponible
      const w3w = document.querySelector('#w3w').value;
      
      return {
        decimal: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        sexagesimal: {
          latitude: {
            degrees: parseInt(latDegrees),
            minutes: parseInt(latMinutes),
            seconds: parseFloat(latSeconds),
            direction: latDirection,
            formatted: `${latDegrees}° ${latMinutes}' ${latSeconds}" ${latDirection}`
          },
          longitude: {
            degrees: parseInt(longDegrees),
            minutes: parseInt(longMinutes),
            seconds: parseFloat(longSeconds),
            direction: longDirection,
            formatted: `${longDegrees}° ${longMinutes}' ${longSeconds}" ${longDirection}`
          }
        },
        what3words: w3w
      };
    });

    // Capturer une capture d'écran de la carte si disponible
    let mapScreenshot = null;
    try {
      const mapElement = await page.$('#map_canvas');
      if (mapElement) {
        mapScreenshot = await mapElement.screenshot({ encoding: 'base64' });
      }
    } catch (error) {
      console.log("Impossible de capturer la carte:", error.message);
    }

    await browser.close();

    // Retourner les résultats
    return res.status(200).json({
      success: true,
      city,
      coordinates,
      mapScreenshot: mapScreenshot ? `data:image/png;base64,${mapScreenshot}` : null
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des coordonnées:", error.message);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des coordonnées",
      details: error.message
    });
  }
};

module.exports = { getCoordinatesFromCity };