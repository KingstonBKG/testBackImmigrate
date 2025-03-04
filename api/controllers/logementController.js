const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require("puppeteer-core"); // ⚠️ Remplace "puppeteer" par "puppeteer-core"
const chromium = require("@sparticuz/chromium");





// Méthode pour récupérer les jobs
const getLogement = async (req, res) => {
    var type = req.params.type;
    var city = req.params.city;
    var bed = req.params.bed;
    var price = req.params.price;
    var pet = req.params.pet;
    var pet = req.params.pet;



    const propertyCategories = req.query["property-categories"];
    const leaseTerms = req.query["lease-term"];
    const minSquareFeet = req.query["min-square-feet"];

    console.log(req.query);

    // Vérifiez que la ville est fournie
    if (!city) {
        return res.status(400).json({ error: 'Le paramètre de ville est requis.' });
    }

    city = city.toLowerCase().replace(/\s+/g, '-');



    const baseUrl = "https://www.padmapper.com";
    const pathParts = [type, city, bed, price, pet].filter(Boolean); // Supprime les undefined
    const url = `${baseUrl}/${pathParts.join('/')}?property-categories=${propertyCategories}&lease-terms=${leaseTerms}&min-square-feet=${minSquareFeet}`;

    // Fonction pour nettoyer les données extraites
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    console.log(url);
    try {
        // Récupérer le contenu HTML de la page
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        var imageUrl;

        var logements_results = [];
        var nearby_city = [];
        var type_city_link = [];

        var location = $('div.city_guide_cityName__3uI3L').text().trim();
        var number_result = $('div.city_guide_listingsCount___UbVD').text().trim();
        var number_result_city = $('div.list_totalResult__1ASlF span').text().trim();

        $('a.locale_nearby_cityNearbyLink__3bIGw').each((index, element) => {
            title = cleanText($(element).text() ?? '');
            linknearbycity = $(element).attr('href') ?? '';

            const city = { title, linknearbycity }
            nearby_city.push(city);
        });

        $('a.locale_facet_links_localeFacetLink__28BVy').each((index, element) => {
            title = cleanText($(element).text() ?? '');
            linktype = $(element).attr('href') ?? '';

            const city = { title, linktype }
            type_city_link.push(city);
        });

        $('div.ListItemFull_noGutterRow__jMdAt').each((index, element) => {
            badge = cleanText($(element).find('div.PropertyBadge_badge__HKEaf').text() ?? 'not verified');
            must_see = cleanText($(element).find('p.chakra-text').text() ?? '');
            featured = cleanText($(element).find('span.PropertyBadge_badge__HKEaf').text() ?? '');
            price = cleanText($(element).find('span.ListItemFull_text__26sFf').text());
            info = cleanText($(element).find('div.ListItemFull_address__ihYsi').text());
            rooms = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(1)').text());
            type = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(2)').text());
            localisation = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(3)').text());
            link = $(element).find('a.ListItemFull_headerText__HlDxW').attr('href');
            fulllink = `https://www.padmapper.com${link}`;
            // Sélectionner le div avec la classe spécifique
            const img = $(element).find('.ListItemFull_imageContainer__3hGTu').attr('style');



            if (img) {
                // Utilisation d'une expression régulière pour capturer l'URL
                const urlMatch = img.match(/url\((['"]?)(https?:\/\/[^'"]+)\1\)/);

                if (urlMatch && urlMatch[2]) {
                    imageUrl = urlMatch[2]; // URL correspondante

                    // Remplacement des paramètres h et w à la fin
                    imageUrl = imageUrl.replace(/h=\d+&w=\d+/, 'h=320&w=540');

                }
            }


            if (index % 2 == 0) {
                const log = { badge, must_see, featured, imageUrl, price, rooms, type, localisation, info, fulllink }
                logements_results.push(log);
            };

        });

        res.json({
            location,
            number_result,
            number_result_city,
            logements_results,
            nearby_city,
            type_city_link
        });

    } catch (error) {
        console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};


// Méthode pour récupérer les jobs
const geLogementwithtype = async (req, res) => {
    var type = req.params.type;
    var city = req.params.city;
    var ftype = req.params.ftype;

    const baseUrl = "https://www.padmapper.com";
    const pathParts = [type, city, ftype].filter(Boolean); // Supprime les undefined
    const url = `${baseUrl}/${pathParts.map(encodeURIComponent).join('/')}`;

    // URL de la page à scraper
    // const url = `https://www.padmapper.com/${encodeURIComponent(type)}/${encodeURIComponent(city)}/${encodeURIComponent(ftype)}`;
    console.log(url);
    // Fonction pour nettoyer les données extraites
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();


    try {
        // Récupérer le contenu HTML de la page
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        var imageUrl;

        var logements_results = [];
        var nearby_city = [];

        var location = $('div.city_guide_cityName__3uI3L').text().trim();
        var number_result = $('div.city_guide_listingsCount___UbVD').text().trim();

        $('a.locale_nearby_cityNearbyLink__3bIGw').each((index, element) => {
            title = cleanText($(element).text() ?? '');
            linknearbycity = $(element).attr('href') ?? '';

            const city = { title, linknearbycity }
            nearby_city.push(city);
        });


        $('div.ListItemFull_noGutterRow__jMdAt').each((index, element) => {
            badge = cleanText($(element).find('div.PropertyBadge_badge__HKEaf').text() ?? 'not verified');
            must_see = cleanText($(element).find('p.chakra-text').text() ?? '');
            featured = cleanText($(element).find('span.classPropertyBadge_badge__HKEaf').text() ?? '');
            price = cleanText($(element).find('span.ListItemFull_text__26sFf').text());
            info = cleanText($(element).find('div.ListItemFull_address__ihYsi').text());
            rooms = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(1)').text());
            type = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(2)').text());
            localisation = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(3)').text());
            link = $(element).find('a.ListItemFull_headerText__HlDxW').attr('href');
            fulllink = `https://www.padmapper.com${link}`;
            // Sélectionner le div avec la classe spécifique
            const img = $(element).find('.ListItemFull_imageContainer__3hGTu').attr('style');



            if (img) {
                // Utilisation d'une expression régulière pour capturer l'URL
                const urlMatch = img.match(/url\((['"]?)(https?:\/\/[^'"]+)\1\)/);

                if (urlMatch && urlMatch[2]) {
                    imageUrl = urlMatch[2]; // URL correspondante

                    // Remplacement des paramètres h et w à la fin
                    imageUrl = imageUrl.replace(/h=\d+&w=\d+/, 'h=320&w=540');

                }
            }


            if (index % 2 == 0) {
                const log = { badge, must_see, featured, imageUrl, price, rooms, type, localisation, info, fulllink }
                logements_results.push(log);
            };

        });

        res.json({
            location,
            number_result,
            logements_results,
            nearby_city,
        });

    } catch (error) {
        console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

// Méthode pour récupérer les jobs
const geLogementwithfilter = async (req, res) => {
    var type = req.params.type;
    var city = req.params.city;
    var ftype = req.params.ftype;

    const baseUrl = "https://www.padmapper.com";
    const pathParts = [type, city, ftype].filter(Boolean); // Supprime les undefined
    const url = `${baseUrl}/${pathParts.map(encodeURIComponent).join('/')}`;

    // URL de la page à scraper
    // const url = `https://www.padmapper.com/${encodeURIComponent(type)}/${encodeURIComponent(city)}/${encodeURIComponent(ftype)}`;
    console.log(url);
    // Fonction pour nettoyer les données extraites
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();


    try {
        // Récupérer le contenu HTML de la page
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        var imageUrl;

        var logements_results = [];
        var nearby_city = [];

        var location = $('div.city_guide_cityName__3uI3L').text().trim();
        var number_result = $('div.city_guide_listingsCount___UbVD').text().trim();

        $('a.locale_nearby_cityNearbyLink__3bIGw').each((index, element) => {
            title = cleanText($(element).text() ?? '');
            linknearbycity = $(element).attr('href') ?? '';

            const city = { title, linknearbycity }
            nearby_city.push(city);
        });


        $('div.ListItemFull_noGutterRow__jMdAt').each((index, element) => {
            badge = cleanText($(element).find('div.PropertyBadge_badge__HKEaf').text() ?? 'not verified');
            must_see = cleanText($(element).find('p.chakra-text').text() ?? '');
            featured = cleanText($(element).find('span.classPropertyBadge_badge__HKEaf').text() ?? '');
            price = cleanText($(element).find('span.ListItemFull_text__26sFf').text());
            info = cleanText($(element).find('div.ListItemFull_address__ihYsi').text());
            rooms = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(1)').text());
            type = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(2)').text());
            localisation = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(3)').text());
            link = $(element).find('a.ListItemFull_headerText__HlDxW').attr('href');
            fulllink = `https://www.padmapper.com${link}`;
            // Sélectionner le div avec la classe spécifique
            const img = $(element).find('.ListItemFull_imageContainer__3hGTu').attr('style');



            if (img) {
                // Utilisation d'une expression régulière pour capturer l'URL
                const urlMatch = img.match(/url\((['"]?)(https?:\/\/[^'"]+)\1\)/);

                if (urlMatch && urlMatch[2]) {
                    imageUrl = urlMatch[2]; // URL correspondante

                    // Remplacement des paramètres h et w à la fin
                    imageUrl = imageUrl.replace(/h=\d+&w=\d+/, 'h=320&w=540');

                }
            }


            if (index % 2 == 0) {
                const log = { badge, must_see, featured, imageUrl, price, rooms, type, localisation, info, fulllink }
                logements_results.push(log);
            };

        });

        res.json({
            location,
            number_result,
            logements_results,
            nearby_city,
        });

    } catch (error) {
        console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

const getLogementDetails = async (req, res) => {
    let browser;
    try {
        const link = decodeURIComponent(req.params[0]);
        console.log("Lien reçu :", link);

        const url = `${link}`;
        const cleanText = (text) => text?.replace(/\s+/g, ' ').trim() || '';

        browser = await puppeteer.launch({
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);

        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });

        // Attendre que les éléments nécessaires soient chargés
        await page.waitForSelector('.MediaItem_MediaItem__2qqHp');
        
        // Extraire les données de la page
        const logementDetails = await page.evaluate(() => {
            const cleanText = text => text?.replace(/\s+/g, ' ').trim() || '';
            
            // Fonction helper pour extraire le texte
            const getText = (selector) => {
                const element = document.querySelector(selector);
                return element ? cleanText(element.textContent) : '';
            };

            // Extraire les images
            const imgElements = Array.from(document.querySelectorAll('.Image_imageTag__1q2pE'));
            const logementImageData = imgElements.map(img => {
                const srcSet = img.getAttribute('srcset');
                if (srcSet) {
                    const imageUrls = srcSet.split(',').map(item => item.trim().split(' ')[0]);
                    const cleanedImageUrls = imageUrls.map(url => url.split('?')[0]);
                    return { image: cleanedImageUrls[cleanedImageUrls.length - 1] };
                }
                return null;
            }).filter(Boolean);

            // Extraire les données principales
            const logementData = {
                title: getText('h1.FullDetail_street__16nT6'),
                phone: getText('a.FullDetail_phoneNumber__2L7_k'),
                description: getText('div.Description_text__hK1dE')
            };

            // Extraire les plans
            const floorplans = Array.from(document.querySelectorAll('div.Floorplan_pFloorplanFull__SIXh2 div.Floorplan_floorplansContainer__o-p9u'))
                .map(element => {
                    const plan = {};
                    const title = element.querySelector('div.Floorplan_title__2BJq9');
                    const availability = element.querySelector('div.Floorplan_availabilityCount__1ssf1');
                    const price = element.querySelector('div.Floorplan_priceRange__1f4P7');

                    if (title) plan.title = cleanText(title.textContent);
                    if (availability) plan.availabilityCount = cleanText(availability.textContent);
                    if (price) plan.priceRange = cleanText(price.textContent);

                    return Object.keys(plan).length ? plan : null;
                }).filter(Boolean);

            // Extraire les amenities
            const amenities = Array.from(document.querySelectorAll('div.Amenities_amenityContainer__3JHoG div.Amenities_text__1hUI9'))
                .map(element => cleanText(element.textContent))
                .filter(Boolean);

            return {
                logementData,
                logementImageData,
                ...(floorplans.length && { plans: floorplans }),
                ...(amenities.length && { amenities })
            };
        });

        res.json([logementDetails]);

    } catch (error) {
        console.error('Erreur lors du scraping:', error);
        res.status(500).json({ 
            error: 'Erreur lors du scraping',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser fermé');
        }
    }
};




module.exports = {
    getLogement,
    geLogementwithtype,
    geLogementwithfilter,
    getLogementDetails
};
