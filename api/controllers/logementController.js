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
    const link = decodeURIComponent(req.params[0]);
    console.log("Lien reçu :", link);

    const url = `${link}`;
    const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
        headless: chromium.headless, // Utiliser le mode headless adapté
    });

    const page = await browser.newPage();

    try {
        page.setDefaultTimeout(50000);
        await page.goto(url);
        
        // Attendre que l'élément à cliquer soit visible et cliquer dessus
        await page.waitForSelector('.MediaItem_MediaItem__2qqHp');
        await page.click('.MediaItem_MediaItem__2qqHp');
        
        // Attendre un peu que la page soit mise à jour (vous pouvez ajuster selon le cas)
        await page.waitForSelector('.Image_imageTag__1q2pE');

        // Récupérer le nouveau contenu HTML de la page
        const pageContent = await page.content(); // Récupère le HTML complet de la page mise à jour
        
        // Utiliser Cheerio pour analyser le HTML récupéré
        const $ = cheerio.load(pageContent);

        const imgElements = $('.Image_imageTag__1q2pE');
        console.log(imgElements.length);

        let logementImageData = [];

        imgElements.each((index, element) => {
            const srcSet = $(element).attr('srcset');

            if (srcSet) {
                // Découper les différentes URLs en fonction des virgules
                const imageUrls = srcSet.split(',').map(item => item.trim().split(' ')[0]);

                // Pour chaque URL, retirer la query string et garder la partie avant le "?"
                const cleanedImageUrls = imageUrls.map(url => url.split('?')[0]);

                // Prendre la dernière URL nettoyée
                logementImageData.push({
                    image: cleanedImageUrls[cleanedImageUrls.length - 1]
                });
            }
        });

        // Récupérer d'autres données
        let logementData = {};

        logementData.title = cleanText($('h1.FullDetail_street__16nT6').text().trim());
        logementData.phone = cleanText($('a.FullDetail_phoneNumber__2L7_k').text().trim());
        logementData.description = cleanText($('div.Description_text__hK1dE').text().trim());
        logementData.link = link;

        $('div.SummaryTable_summaryTable__1gSYh ul li').each((index, element) => {
            const text = $(element).text().trim();

            if (text.includes("Price")) {
                logementData.price = text.replace("Price", "").trim();
            } else if (text.includes("Bedrooms")) {
                logementData.bedrooms = text.replace("Bedrooms", "").trim();
            } else if (text.includes("Bathrooms")) {
                logementData.Bathrooms = text.replace("Bathrooms", "").trim();
            } else if (text.includes("Available")) {
                logementData.Available = text.replace("Available", "").trim();
            } else if (text.includes("Square Feet")) {
                logementData.surface = text.replace("Square Feet", "").trim();
            } else if (text.includes("Min. Lease")) {
                logementData.minlease = text.replace("Min. Lease", "").trim();
            } else if (text.includes("Address")) {
                logementData.Address = text.replace("Address", "").trim();
            } else if (text.includes("Broker Fee?")) {
                logementData.brokerfee = text.replace("Broker Fee?", "").trim();
            } else if (text.includes("Cats/Dogs Allowed?")) {
                logementData.pets = text.replace("Cats/Dogs Allowed?", "").trim();
            }
        });

        const amenities = [];
        $('div.Amenities_amenityContainer__3JHoG').each((index, element) => {
            const amenitie = $(element).find('div.Amenities_text__1hUI9').text().trim();
            amenities.push(amenitie);
        });


        const plans = [];
        $('div.Floorplan_floorplansContainer__o-p9u').each((index, element) => {
            const title = $(element).find('div.Floorplan_title__2BJq9').text().trim();
            const availabilityCount = $(element).find('div.Floorplan_availabilityCount__1ssf1').text().trim();
            const price = $(element).find('div.Floorplan_priceRange__1f4P7 span').text().trim();

            plans.push(title, availabilityCount, price);
        });

        const logementdetail = {
            ...logementData,
            logementImageData,
            amenities,
            ...(plans.length !== 0 && { plans })
        };

        // Envoi de la réponse avec les données extraites
        res.json([logementdetail]);

    } catch (e) {
        console.error('Erreur :', e.message);
        res.status(500).json({ error: "Une erreur est survenue lors du scraping." });
    } finally {
        // Fermer le navigateur
        console.log('fermeture du browser');
        await browser.close();
    }
};





module.exports = {
    getLogement,
    geLogementwithtype,
    geLogementwithfilter,
    getLogementDetails
};
