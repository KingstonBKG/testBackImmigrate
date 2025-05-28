<<<<<<< HEAD:api/controllers/logementController.js
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
    const cleanText = (text) => text?.replace(/\s+/g, ' ').trim() || '';

    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath() || "/usr/bin/chromium-browser",
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    try {
        page.setDefaultTimeout(50000);
        await page.goto(url);
        
        // Attendre que l'élément à cliquer soit visible et cliquer dessus
        await page.waitForSelector('.MediaItem_MediaItem__diph2');
        await page.click('.MediaItem_MediaItem__diph2');

        // Attendre que toutes les images soient chargées
        await page.waitForSelector('.Image_imageTag__glEse');
        
        // Récupérer toutes les images et leurs données avant le pageContent
        const images = await page.evaluate(() => {
            const imgElements = document.querySelectorAll('.Image_imageTag__glEse');
            return Array.from(imgElements, img => {
                const srcSet = img.getAttribute('srcset');
                if (srcSet) {
                    const imageUrls = srcSet.split(',')
                        .map(item => item.trim().split(' ')[0])
                        .map(url => url.split('?')[0]);
                    return { image: imageUrls[imageUrls.length - 1] };
                }
                return null;
            }).filter(Boolean);
        });
        
        const pageContent = await page.content();
        const $ = cheerio.load(pageContent);

        // Utiliser directement les images récupérées
        const logementImageData = images;

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
            const plan = { title, availabilityCount, price }
            plans.push(plan);
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
=======
// const axios = require('axios');
// const cheerio = require('cheerio');
// const puppeteer = require('puppeteer-core');





// // Méthode pour récupérer les jobs
// const getLogement = async (req, res) => {
//     var type = req.params.type;
//     var city = req.params.city;
//     var bed = req.params.bed;
//     var price = req.params.price;
//     var pet = req.params.pet;
//     var pet = req.params.pet;



//     const propertyCategories = req.query["property-categories"];
//     const leaseTerms = req.query["lease-term"];
//     const minSquareFeet = req.query["min-square-feet"];

//     console.log(req.query);

//     // Vérifiez que la ville est fournie
//     if (!city) {
//         return res.status(400).json({ error: 'Le paramètre de ville est requis.' });
//     }

//     city = city.toLowerCase().replace(/\s+/g, '-');



//     const baseUrl = "https://www.padmapper.com";
//     const pathParts = [type, city, bed, price, pet].filter(Boolean); // Supprime les undefined
//     const url = `${baseUrl}/${pathParts.join('/')}?property-categories=${propertyCategories}&lease-terms=${leaseTerms}&min-square-feet=${minSquareFeet}`;

//     // Fonction pour nettoyer les données extraites
//     const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

//     console.log(url);
//     try {
//         // Récupérer le contenu HTML de la page
//         const { data } = await axios.get(url);
//         const $ = cheerio.load(data);
//         var imageUrl;

//         var logements_results = [];
//         var nearby_city = [];
//         var type_city_link = [];

//         var location = $('div.city_guide_cityName__3uI3L').text().trim();
//         var number_result = $('div.city_guide_listingsCount___UbVD').text().trim();
//         var number_result_city = $('div.list_totalResult__1ASlF span').text().trim();

//         $('a.locale_nearby_cityNearbyLink__3bIGw').each((index, element) => {
//             title = cleanText($(element).text() ?? '');
//             linknearbycity = $(element).attr('href') ?? '';

//             const city = { title, linknearbycity }
//             nearby_city.push(city);
//         });

//         $('a.locale_facet_links_localeFacetLink__28BVy').each((index, element) => {
//             title = cleanText($(element).text() ?? '');
//             linktype = $(element).attr('href') ?? '';

//             const city = { title, linktype }
//             type_city_link.push(city);
//         });

//         $('div.ListItemFull_noGutterRow__jMdAt').each((index, element) => {
//             badge = cleanText($(element).find('div.PropertyBadge_badge__HKEaf').text() ?? 'not verified');
//             must_see = cleanText($(element).find('p.chakra-text').text() ?? '');
//             featured = cleanText($(element).find('span.PropertyBadge_badge__HKEaf').text() ?? '');
//             price = cleanText($(element).find('span.ListItemFull_text__26sFf').text());
//             info = cleanText($(element).find('div.ListItemFull_address__ihYsi').text());
//             rooms = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(1)').text());
//             type = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(2)').text());
//             localisation = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(3)').text());
//             link = $(element).find('a.ListItemFull_headerText__HlDxW').attr('href');
//             fulllink = `https://www.padmapper.com${link}`;
//             // Sélectionner le div avec la classe spécifique
//             const img = $(element).find('.ListItemFull_imageContainer__3hGTu').attr('style');



//             if (img) {
//                 // Utilisation d'une expression régulière pour capturer l'URL
//                 const urlMatch = img.match(/url\((['"]?)(https?:\/\/[^'"]+)\1\)/);

//                 if (urlMatch && urlMatch[2]) {
//                     imageUrl = urlMatch[2]; // URL correspondante

//                     // Remplacement des paramètres h et w à la fin
//                     imageUrl = imageUrl.replace(/h=\d+&w=\d+/, 'h=320&w=540');

//                 }
//             }


//             if (index % 2 == 0) {
//                 const log = { badge, must_see, featured, imageUrl, price, rooms, type, localisation, info, fulllink }
//                 logements_results.push(log);
//             };

//         });

//         res.json({
//             location,
//             number_result,
//             number_result_city,
//             logements_results,
//             nearby_city,
//             type_city_link
//         });

//     } catch (error) {
//         console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
//         res.status(500).json({ error: 'Erreur interne du serveur' });
//     }
// };


// // Méthode pour récupérer les jobs
// const geLogementwithtype = async (req, res) => {
//     var type = req.params.type;
//     var city = req.params.city;
//     var ftype = req.params.ftype;

//     const baseUrl = "https://www.padmapper.com";
//     const pathParts = [type, city, ftype].filter(Boolean); // Supprime les undefined
//     const url = `${baseUrl}/${pathParts.map(encodeURIComponent).join('/')}`;

//     // URL de la page à scraper
//     // const url = `https://www.padmapper.com/${encodeURIComponent(type)}/${encodeURIComponent(city)}/${encodeURIComponent(ftype)}`;
//     console.log(url);
//     // Fonction pour nettoyer les données extraites
//     const cleanText = (text) => text.replace(/\s+/g, ' ').trim();


//     try {
//         // Récupérer le contenu HTML de la page
//         const { data } = await axios.get(url);
//         const $ = cheerio.load(data);
//         var imageUrl;

//         var logements_results = [];
//         var nearby_city = [];

//         var location = $('div.city_guide_cityName__3uI3L').text().trim();
//         var number_result = $('div.city_guide_listingsCount___UbVD').text().trim();

//         $('a.locale_nearby_cityNearbyLink__3bIGw').each((index, element) => {
//             title = cleanText($(element).text() ?? '');
//             linknearbycity = $(element).attr('href') ?? '';

//             const city = { title, linknearbycity }
//             nearby_city.push(city);
//         });


//         $('div.ListItemFull_noGutterRow__jMdAt').each((index, element) => {
//             badge = cleanText($(element).find('div.PropertyBadge_badge__HKEaf').text() ?? 'not verified');
//             must_see = cleanText($(element).find('p.chakra-text').text() ?? '');
//             featured = cleanText($(element).find('span.classPropertyBadge_badge__HKEaf').text() ?? '');
//             price = cleanText($(element).find('span.ListItemFull_text__26sFf').text());
//             info = cleanText($(element).find('div.ListItemFull_address__ihYsi').text());
//             rooms = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(1)').text());
//             type = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(2)').text());
//             localisation = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(3)').text());
//             link = $(element).find('a.ListItemFull_headerText__HlDxW').attr('href');
//             fulllink = `https://www.padmapper.com${link}`;
//             // Sélectionner le div avec la classe spécifique
//             const img = $(element).find('.ListItemFull_imageContainer__3hGTu').attr('style');



//             if (img) {
//                 // Utilisation d'une expression régulière pour capturer l'URL
//                 const urlMatch = img.match(/url\((['"]?)(https?:\/\/[^'"]+)\1\)/);

//                 if (urlMatch && urlMatch[2]) {
//                     imageUrl = urlMatch[2]; // URL correspondante

//                     // Remplacement des paramètres h et w à la fin
//                     imageUrl = imageUrl.replace(/h=\d+&w=\d+/, 'h=320&w=540');

//                 }
//             }


//             if (index % 2 == 0) {
//                 const log = { badge, must_see, featured, imageUrl, price, rooms, type, localisation, info, fulllink }
//                 logements_results.push(log);
//             };

//         });

//         res.json({
//             location,
//             number_result,
//             logements_results,
//             nearby_city,
//         });

//     } catch (error) {
//         console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
//         res.status(500).json({ error: 'Erreur interne du serveur' });
//     }
// };

// // Méthode pour récupérer les jobs
// const geLogementwithfilter = async (req, res) => {
//     var type = req.params.type;
//     var city = req.params.city;
//     var ftype = req.params.ftype;

//     const baseUrl = "https://www.padmapper.com";
//     const pathParts = [type, city, ftype].filter(Boolean); // Supprime les undefined
//     const url = `${baseUrl}/${pathParts.map(encodeURIComponent).join('/')}`;

//     // URL de la page à scraper
//     // const url = `https://www.padmapper.com/${encodeURIComponent(type)}/${encodeURIComponent(city)}/${encodeURIComponent(ftype)}`;
//     console.log(url);
//     // Fonction pour nettoyer les données extraites
//     const cleanText = (text) => text.replace(/\s+/g, ' ').trim();


//     try {
//         // Récupérer le contenu HTML de la page
//         const { data } = await axios.get(url);
//         const $ = cheerio.load(data);
//         var imageUrl;

//         var logements_results = [];
//         var nearby_city = [];

//         var location = $('div.city_guide_cityName__3uI3L').text().trim();
//         var number_result = $('div.city_guide_listingsCount___UbVD').text().trim();

//         $('a.locale_nearby_cityNearbyLink__3bIGw').each((index, element) => {
//             title = cleanText($(element).text() ?? '');
//             linknearbycity = $(element).attr('href') ?? '';

//             const city = { title, linknearbycity }
//             nearby_city.push(city);
//         });


//         $('div.ListItemFull_noGutterRow__jMdAt').each((index, element) => {
//             badge = cleanText($(element).find('div.PropertyBadge_badge__HKEaf').text() ?? 'not verified');
//             must_see = cleanText($(element).find('p.chakra-text').text() ?? '');
//             featured = cleanText($(element).find('span.classPropertyBadge_badge__HKEaf').text() ?? '');
//             price = cleanText($(element).find('span.ListItemFull_text__26sFf').text());
//             info = cleanText($(element).find('div.ListItemFull_address__ihYsi').text());
//             rooms = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(1)').text());
//             type = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(2)').text());
//             localisation = cleanText($(element).find('div.ListItemFull_info__331nX span:nth-child(3)').text());
//             link = $(element).find('a.ListItemFull_headerText__HlDxW').attr('href');
//             fulllink = `https://www.padmapper.com${link}`;
//             // Sélectionner le div avec la classe spécifique
//             const img = $(element).find('.ListItemFull_imageContainer__3hGTu').attr('style');



//             if (img) {
//                 // Utilisation d'une expression régulière pour capturer l'URL
//                 const urlMatch = img.match(/url\((['"]?)(https?:\/\/[^'"]+)\1\)/);

//                 if (urlMatch && urlMatch[2]) {
//                     imageUrl = urlMatch[2]; // URL correspondante

//                     // Remplacement des paramètres h et w à la fin
//                     imageUrl = imageUrl.replace(/h=\d+&w=\d+/, 'h=320&w=540');

//                 }
//             }


//             if (index % 2 == 0) {
//                 const log = { badge, must_see, featured, imageUrl, price, rooms, type, localisation, info, fulllink }
//                 logements_results.push(log);
//             };

//         });

//         res.json({
//             location,
//             number_result,
//             logements_results,
//             nearby_city,
//         });

//     } catch (error) {
//         console.error('Erreur lors du scraping ou de l\'enregistrement :', error.message);
//         res.status(500).json({ error: 'Erreur interne du serveur' });
//     }
// };

// const getLogementDetails = async (req, res) => {
//     const link = decodeURIComponent(req.params[0]);
//     console.log("Lien reçu :", link);


//     const url = `${link}`;
//     const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

//     const browser = await puppeteer.connect({
//         headless: false,
//         browserWSEndpoint: 'wss://chrome.browserless.io?token=RlBL97PMa0pmz92ac02a0f78979584fc2a3401f984' // Remplace par ta clé API Browserless
//     });

//     const page = await browser.newPage();

//     try {
//         page.setDefaultTimeout(50000);
//         await page.goto(url);
//         await page.waitForSelector('.MediaItem_MediaItem__2qqHp');
//         await page.click('.MediaItem_MediaItem__2qqHp');
//         const imgElements = await page.$$('.Image_imageTag__1q2pE');
//         console.log(imgElements.length);

//         let logementImageData = []; // Tableau pour stocker les données des images

//         for (let imgElement of imgElements) {
//             const srcSet = await imgElement.getProperty('srcset');
//             const srcSetValue = await srcSet.jsonValue();

//             if (srcSetValue) {
//                 // Découper les différentes URLs en fonction des virgules
//                 const imageUrls = srcSetValue.split(',').map(item => item.trim().split(' ')[0]);

//                 // Pour chaque URL, retirer la query string et garder la partie avant le "?"
//                 const cleanedImageUrls = imageUrls.map(url => url.split('?')[0]);

//                 // Prendre la dernière URL nettoyée
//                 logementImageData.push({
//                     image: cleanedImageUrls[cleanedImageUrls.length - 1]
//                 });
//             }
//         }


//         console.log('fermeture du brower');
//         browser.close();


//         const { data } = await axios.get(url);
//         const $ = cheerio.load(data);

//         const logementdetails = [];
//         const amenities = [];



//         // 🛠️ **Récupération dynamique des infos du logement**
//         let logementData = {};
//         let similarslogementData = {};

//         logementData.title = cleanText($('h1.FullDetail_street__16nT6').text().trim());
//         logementData.phone = cleanText($('a.FullDetail_phoneNumber__2L7_k').text().trim());
//         logementData.description = cleanText($('div.Description_text__hK1dE').text().trim());

//         // const imageSrcSet = $('img.MediaItem_imageTag__ytQiK').attr('srcset');
//         // let image = '';

//         // if (imageSrcSet) {
//         //     // Découper les différentes URLs en fonction des virgules
//         //     const imageUrls = imageSrcSet.split(',').map(item => item.trim().split(' ')[0]);
//         //     // Prendre la dernière URL de la liste
//         //     logementData.image = imageUrls[imageUrls.length - 1];
//         // }


//         $('div.SummaryTable_summaryTable__1gSYh ul li').each((index, element) => {
//             const text = $(element).text().trim();

//             if (text.includes("Price")) {
//                 logementData.price = text.replace("Price", "").trim();
//             } else if (text.includes("Bedrooms")) {
//                 logementData.bedrooms = text.replace("Bedrooms", "").trim();
//             } else if (text.includes("Bathrooms")) {
//                 logementData.Bathrooms = text.replace("Bathrooms", "").trim();
//             } else if (text.includes("Available")) {
//                 logementData.Available = text.replace("Available", "").trim();
//             } else if (text.includes("Square Feet")) {
//                 logementData.surface = text.replace("Square Feet", "").trim();
//             } else if (text.includes("Min. Lease")) {
//                 logementData.minlease = text.replace("Min. Lease", "").trim();
//             } else if (text.includes("Address")) {
//                 logementData.Address = text.replace("Address", "").trim();
//             } else if (text.includes("Broker Fee?")) {
//                 logementData.brokerfee = text.replace("Broker Fee?", "").trim();
//             } else if (text.includes("Cats/Dogs Allowed?")) {
//                 logementData.pets = text.replace("Cats/Dogs Allowed?", "").trim();
//             }

//         });

//         // 🏢 **Récupération des équipements**
//         $('div > div.Amenities_amenityContainer__3JHoG').each((index, element) => {
//             const amenitie = $(element).find('div.Amenities_text__1hUI9').text().trim();
//             amenities.push(amenitie);
//         });



//         var logementdetail = {
//             ...logementData,  // Ajout dynamique des infos du logement
//             logementImageData,
//             amenities,
//         };

//         logementdetails.push(logementdetail);
//         res.json(logementdetails);

//     } catch (e) {
//         console.error('Erreur :', e.message);
//         res.status(500).json({ error: "Une erreur est survenue lors du scraping." });
//     }
// };
// const getLogementDetails = async (req, res) => {
//     const link = decodeURIComponent(req.params[0]);
//     console.log("Lien reçu :", link);

//     const url = `${link}`;
//     const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

//     const browser = await puppeteer.connect({
//         headless: false,
//         browserWSEndpoint: 'wss://chrome.browserless.io?token=RlBL97PMa0pmz92ac02a0f78979584fc2a3401f984' // Remplace par ta clé API Browserless
//     });

//     const page = await browser.newPage();

//     try {
//         page.setDefaultTimeout(50000);
//         await page.goto(url);
        
//         // Attendre que l'élément à cliquer soit visible et cliquer dessus
//         await page.waitForSelector('.MediaItem_MediaItem__2qqHp');
//         await page.click('.MediaItem_MediaItem__2qqHp');
        
//         // Attendre un peu que la page soit mise à jour (vous pouvez ajuster selon le cas)
//         await page.waitForSelector('.Image_imageTag__1q2pE');

//         // Récupérer le nouveau contenu HTML de la page
//         const pageContent = await page.content(); // Récupère le HTML complet de la page mise à jour
        
//         // Utiliser Cheerio pour analyser le HTML récupéré
//         const $ = cheerio.load(pageContent);

//         const imgElements = $('.Image_imageTag__1q2pE');
//         console.log(imgElements.length);

//         let logementImageData = [];

//         imgElements.each((index, element) => {
//             const srcSet = $(element).attr('srcset');

//             if (srcSet) {
//                 // Découper les différentes URLs en fonction des virgules
//                 const imageUrls = srcSet.split(',').map(item => item.trim().split(' ')[0]);

//                 // Pour chaque URL, retirer la query string et garder la partie avant le "?"
//                 const cleanedImageUrls = imageUrls.map(url => url.split('?')[0]);

//                 // Prendre la dernière URL nettoyée
//                 logementImageData.push({
//                     image: cleanedImageUrls[cleanedImageUrls.length - 1]
//                 });
//             }
//         });

//         // Récupérer d'autres données
//         let logementData = {};

//         logementData.title = cleanText($('h1.FullDetail_street__16nT6').text().trim());
//         logementData.phone = cleanText($('a.FullDetail_phoneNumber__2L7_k').text().trim());
//         logementData.description = cleanText($('div.Description_text__hK1dE').text().trim());

//         $('div.SummaryTable_summaryTable__1gSYh ul li').each((index, element) => {
//             const text = $(element).text().trim();

//             if (text.includes("Price")) {
//                 logementData.price = text.replace("Price", "").trim();
//             } else if (text.includes("Bedrooms")) {
//                 logementData.bedrooms = text.replace("Bedrooms", "").trim();
//             } else if (text.includes("Bathrooms")) {
//                 logementData.Bathrooms = text.replace("Bathrooms", "").trim();
//             } else if (text.includes("Available")) {
//                 logementData.Available = text.replace("Available", "").trim();
//             } else if (text.includes("Square Feet")) {
//                 logementData.surface = text.replace("Square Feet", "").trim();
//             } else if (text.includes("Min. Lease")) {
//                 logementData.minlease = text.replace("Min. Lease", "").trim();
//             } else if (text.includes("Address")) {
//                 logementData.Address = text.replace("Address", "").trim();
//             } else if (text.includes("Broker Fee?")) {
//                 logementData.brokerfee = text.replace("Broker Fee?", "").trim();
//             } else if (text.includes("Cats/Dogs Allowed?")) {
//                 logementData.pets = text.replace("Cats/Dogs Allowed?", "").trim();
//             }
//         });

//         const amenities = [];
//         $('div.Amenities_amenityContainer__3JHoG').each((index, element) => {
//             const amenitie = $(element).find('div.Amenities_text__1hUI9').text().trim();
//             amenities.push(amenitie);
//         });

//         const logementdetail = {
//             ...logementData,
//             logementImageData,
//             amenities,
//         };

//         // Envoi de la réponse avec les données extraites
//         res.json([logementdetail]);

//     } catch (e) {
//         console.error('Erreur :', e.message);
//         res.status(500).json({ error: "Une erreur est survenue lors du scraping." });
//     } finally {
//         // Fermer le navigateur
//         console.log('fermeture du browser');
//         await browser.close();
//     }
// };





// module.exports = {
//     getLogement,
//     geLogementwithtype,
//     geLogementwithfilter,
//     getLogementDetails
// };


// const axios = require('axios');
// const cheerio = require('cheerio');
// const puppeteer = require('puppeteer');

// // Configuration
// const CONFIG = {
//   BASE_URL: 'https://www.zolo.ca',
//   MAX_CONCURRENT_PAGES: 3,
//   REQUEST_DELAY: 2000,
//   USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//   TIMEOUT: 60000,
//   RETRY_CONFIG: {
//     maxRetries: 3,
//     retryDelay: 5000,
//     timeoutIncrement: 10000
//   }
// };

// // Helper functions
// const helpers = {
//   normalizeText: (text) => {
//     if (!text) return '';
//     return text
//       .replace(/\s+/g, ' ')
//       .replace(/\n/g, ' ')
//       .trim();
//   },
//   delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
//   parsePrice: (priceText) => {
//     if (!priceText) return null;
//     const cleaned = priceText.replace(/[^\d.,]/g, '');
//     const normalized = cleaned.replace(',', '.');
//     return parseFloat(normalized) || null;
//   },
//   log: (message, level = 'info') => {
//     const timestamp = new Date().toISOString();
//     const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
//     console.log(logMessage);
//   },
//   waitForSelectors: async (page, selectors, timeout = 30000) => {
//     const delays = [1000, 2000, 5000, 10000];
//     for (const selector of selectors) {
//       for (const delayTime of delays) {
//         try {
//           await page.waitForSelector(selector, { timeout: delayTime });
//           return selector;
//         } catch (e) {
//           continue;
//         }
//       }
//     }
//     throw new Error(`Aucun des sélecteurs ${selectors.join(', ')} n'a été trouvé`);
//   },
//   reloadWithRetry: async (page, url, maxRetries = 3) => {
//     for (let i = 0; i < maxRetries; i++) {
//       try {
//         await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
//         return true;
//       } catch (e) {
//         if (i === maxRetries - 1) throw e;
//         await helpers.delay(5000 * (i + 1));
//       }
//     }
//   }
// };

// // Main Controller
// const propertyController = {
//   // Entry point
//   getProperties: async (req, res) => {
//     try {
//       const { type = 'all', limit = 50 } = req.query;
      
//       if (!['all', 'sale', 'rent'].includes(type)) {
//         return res.status(400).json({ error: 'Invalid property type. Use "all", "sale" or "rent".' });
//       }

//       if (isNaN(limit)) {
//         return res.status(400).json({ error: 'Limit must be a number' });
//       }

//       const properties = await propertyController.scrapeZoloProperties({ type, limit });

//       res.json({
//         success: true,
//         count: properties.length,
//         data: properties
//       });

//     } catch (error) {
//       helpers.log(`Error in getProperties: ${error.message}`, 'error');
//       res.status(500).json({ 
//         success: false,
//         error: error.message 
//       });
//     }
//   },

//   // Main scraping function
//   scrapeZoloProperties: async (options = {}) => {
//     const { type = 'all', limit = 50 } = options;
//     let properties = [];
//     let browser;
    
//     try {
//       browser = await puppeteer.launch({
//         headless: false, // À mettre à true après les tests
//         args: [
//           '--no-sandbox',
//           '--disable-setuid-sandbox',
//           '--disable-dev-shm-usage',
//           '--disable-accelerated-2d-canvas',
//           '--no-first-run',
//           '--no-zygote',
//           '--single-process',
//           '--disable-blink-features=AutomationControlled'
//         ],
//         timeout: 60000
//       });

//       const page = await browser.newPage();
      
//       // Configurer le masquage du navigateur
//       await page.setUserAgent(CONFIG.USER_AGENT);
//       await page.setViewport({ width: 1366, height: 768 });
//       await page.evaluateOnNewDocument(() => {
//         Object.defineProperty(navigator, 'webdriver', {
//           get: () => false,
//         });
//       });

//       // Interception des requêtes
//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         if (['image', 'stylesheet', 'font', 'script'].includes(req.resourceType())) {
//           req.abort();
//         } else {
//           req.continue();
//         }
//       });

//       let currentPage = 1;
//       let hasNextPage = true;
//       let retryCount = 0;
//       const maxRetries = 3;

//       while (hasNextPage && properties.length < limit) {
//         try {
//           const pageUrl = currentPage === 1 
//             ? `${CONFIG.BASE_URL}/${type === 'rent' ? 'for-rent' : 'real-estate'}`
//             : `${CONFIG.BASE_URL}/${type === 'rent' ? 'for-rent' : 'real-estate'}/page-${currentPage}`;

//           helpers.log(`Tentative de chargement: ${pageUrl}`);
          
//           // Navigation avec plusieurs stratégies de fallback
//           try {
//             await page.goto(pageUrl, {
//               waitUntil: 'networkidle2',
//               timeout: 60000,
//               referer: CONFIG.BASE_URL
//             });
//           } catch (e) {
//             helpers.log(`Erreur de navigation: ${e.message}`, 'warn');
//             continue;
//           }

//           // Attendre le chargement du contenu
//           try {
//             await helpers.waitForSelectors(page, [
//               '.card-listing',
//               '[data-testid="property-card"]',
//               '.property-item'
//             ], 15000);
//           } catch (e) {
//             await page.screenshot({ path: `debug_page_${currentPage}.png` });
//             helpers.log(`Aucune propriété trouvée sur la page ${currentPage}`, 'warn');
//             hasNextPage = false;
//             continue;
//           }

//           // Faire défiler pour charger le contenu dynamique
//           await propertyController.autoScroll(page);

//           const html = await page.content();
//           const $ = cheerio.load(html);
          
//           // Essayer plusieurs sélecteurs
//           let pageProperties = propertyController.extractProperties($);
//           if (pageProperties.length === 0) {
//             pageProperties = propertyController.extractProperties($, '[data-testid="property-card"]');
//           }
//           if (pageProperties.length === 0) {
//             pageProperties = propertyController.extractProperties($, '.property-item');
//           }

//           if (pageProperties.length === 0) {
//             if (retryCount < maxRetries) {
//               retryCount++;
//               helpers.log(`Aucune propriété trouvée, réessai ${retryCount}/${maxRetries}`, 'warn');
//               await helpers.delay(5000);
//               continue;
//             }
//             hasNextPage = false;
//             continue;
//           }

//           properties = [...properties, ...pageProperties];
//           retryCount = 0;
          
//           // Vérifier la page suivante
//           hasNextPage = await propertyController.checkNextPage(page);
//           currentPage++;
          
//           await helpers.delay(CONFIG.REQUEST_DELAY);

//         } catch (error) {
//           helpers.log(`Erreur lors du traitement de la page ${currentPage}: ${error.message}`, 'error');
//           if (retryCount < maxRetries) {
//             retryCount++;
//             helpers.log(`Réessai ${retryCount}/${maxRetries}`, 'warn');
//             await helpers.delay(5000);
//           } else {
//             hasNextPage = false;
//             throw error;
//           }
//         }
//       }

//       return properties.slice(0, limit);

//     } catch (error) {
//       helpers.log(`Erreur fatale dans scrapeZoloProperties: ${error.message}`, 'error');
//       throw error;
//     } finally {
//       if (browser) {
//         await browser.close().catch(e => helpers.log(`Erreur lors de la fermeture du browser: ${e.message}`, 'error'));
//       }
//     }
//   },

//   // Auto-scroll pour charger le contenu dynamique
//   autoScroll: async (page) => {
//     await page.evaluate(async () => {
//       await new Promise((resolve) => {
//         let totalHeight = 0;
//         const distance = 100;
//         const timer = setInterval(() => {
//           const scrollHeight = document.body.scrollHeight;
//           window.scrollBy(0, distance);
//           totalHeight += distance;

//           if (totalHeight >= scrollHeight) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 100);
//       });
//     });
//   },

//   // Vérification de la page suivante
//   checkNextPage: async (page) => {
//     try {
//       const nextButton = await page.$('.pagination-next:not(.disabled)');
//       return nextButton !== null;
//     } catch (error) {
//       helpers.log(`Error checking next page: ${error.message}`, 'error');
//       return false;
//     }
//   },

//   // Extraction des propriétés avec sélecteur flexible
//   extractProperties: ($, selector = '.card-listing') => {
//     const properties = [];

//     $(selector).each((index, element) => {
//       try {
//         const $el = $(element);
        
//         // Type de propriété
//         const type = $el.find('.fill-green').length > 0 ? 'sale' : 
//                      $el.find('.fill-blue').length > 0 ? 'rent' : 'unknown';

//         // Adresse
//         const street = $el.find('.street').text().trim();
//         const city = $el.find('.city').text().trim();
//         const province = $el.find('.province').text().replace(/[()]/g, '').trim();
        
//         // Prix
//         const priceText = $el.find('.price').text().trim();
//         const price = helpers.parsePrice(priceText);
//         const currency = priceText.includes('$') ? 'CAD' : null;

//         // Spécifications
//         const specs = [];
//         $el.find('.card-listing--values li, .property-specs li').each((i, specEl) => {
//           const text = $(specEl).text().trim();
//           if (text && text !== '-') {
//             specs.push(helpers.normalizeText(text));
//           }
//         });

//         // Détails
//         const details = {
//           bedrooms: null,
//           bathrooms: null,
//           squareFeet: null,
//           age: null,
//           propertyType: null
//         };

//         specs.forEach(spec => {
//           if (spec.includes('lit') || spec.includes('chambre') || spec.includes('bed')) {
//             const bedMatch = spec.match(/(\d+)/);
//             details.bedrooms = bedMatch ? parseInt(bedMatch[1]) : null;
//           }
//           if (spec.includes('salle de bain') || spec.includes('bath')) {
//             const bathMatch = spec.match(/(\d+)/);
//             details.bathrooms = bathMatch ? parseInt(bathMatch[1]) : null;
//           }
//           if (spec.includes('pieds carrés') || spec.includes('sqft')) {
//             const sqftMatch = spec.match(/(\d+)/);
//             details.squareFeet = sqftMatch ? parseInt(sqftMatch[1]) : null;
//           }
//           if (spec.includes('ans') || spec.includes('year')) {
//             const ageMatch = spec.match(/(\d+)/);
//             details.age = ageMatch ? parseInt(ageMatch[1]) : null;
//           }
//           if (spec.includes('Maison') || spec.includes('Townhouse') || spec.includes('Condo')) {
//             details.propertyType = spec;
//           }
//         });

//         // Image
//         const imageElement = $el.find('.card-listing--img, .property-image img');
//         const imageUrl = imageElement.attr('src') || 
//                         imageElement.attr('srcset')?.split(' ')[0];

//         // MLS et agence
//         const mls = $el.find('.card-listing--brokerage').prev().text().trim() || 
//                    $el.find('.mls-number').text().trim();
//         const agency = $el.find('.card-listing--brokerage').contents().last().text().trim() || 
//                       $el.find('.brokerage').text().trim();

//         // Temps depuis la publication
//         const postedTime = $el.find('.fill-primary').text().trim() || 
//                          $el.find('.time-posted').text().trim();

//         // URL
//         const url = $el.find('a[href]').attr('href');

//         // Ajout à la liste
//         properties.push({
//           type,
//           address: { street, city, province },
//           price: { value: price, currency },
//           details,
//           image: imageUrl,
//           mls,
//           agency,
//           postedTime,
//           url
//         });

//       } catch (error) {
//         helpers.log(`Error extracting property at index ${index}: ${error.message}`, 'error');
//       }
//     });

//     return properties;
//   }
// };

// module.exports = propertyController;

// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const cheerio = require('cheerio');

// // Configuration
// const CONFIG = {
//   BASE_URL: 'https://rentals.ca',
//   TIMEOUT: 60000,
//   DELAY: 1500,
//   USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
// };

// // Utiliser le plugin Stealth
// puppeteer.use(StealthPlugin());

// class RentalsController {
//   constructor() {
//     // Liaison explicite des méthodes
//     this.getCities = this.getCities.bind(this);
//     this.getCityListings = this.getCityListings.bind(this);
//   }

//   async getCities(req, res) {
//     try {
//       const cities = await this.scrapeCities();
//       res.json({
//         success: true,
//         count: cities.length,
//         data: cities
//       });
//     } catch (error) {
//       console.error('Error getting cities:', error);
//       res.status(500).json({ 
//         success: false,
//         error: error.message 
//       });
//     }
//   }

//   async getCityListings(req, res) {
//     try {
//       const { city } = req.params;
//       const listings = await this.scrapeListings(city);
      
//       res.json({
//         success: true,
//         count: listings.length,
//         data: listings
//       });
//     } catch (error) {
//       console.error('Error getting listings:', error);
//       res.status(500).json({ 
//         success: false,
//         error: error.message 
//       });
//     }
//   }

//   async scrapeCities() {
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage'
//       ]
//     });

//     try {
//       const page = await browser.newPage();
//       await page.setUserAgent(CONFIG.USER_AGENT);
//       await page.setViewport({ width: 1366, height: 768 });

//       // Bloquer les ressources non essentielles
//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
//           req.abort();
//         } else {
//           req.continue();
//         }
//       });

//       await page.goto(CONFIG.BASE_URL, { 
//         waitUntil: 'domcontentloaded',
//         timeout: CONFIG.TIMEOUT
//       });

//       const html = await page.content();
//       const $ = cheerio.load(html);

//       const cities = [];
//       $('.page-home__search-items-list-primary li a').each((i, el) => {
//         const $el = $(el);
//         cities.push({
//           name: $el.find('h3 span').first().text().trim(),
//           url: CONFIG.BASE_URL + $el.attr('href'),
//           image: CONFIG.BASE_URL + $el.find('img').attr('src')
//         });
//       });

//       return cities;
//     } finally {
//       await browser.close();
//     }
//   }

//   async scrapeListings(city) {
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage'
//       ]
//     });

//     try {
//       const page = await browser.newPage();
//       await page.setUserAgent(CONFIG.USER_AGENT);
//       await page.setViewport({ width: 1366, height: 768 });

//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
//           req.abort();
//         } else {
//           req.continue();
//         }
//       });

//       const url = `${CONFIG.BASE_URL}/${city}`;
//       await page.goto(url, { 
//         waitUntil: 'domcontentloaded',
//         timeout: CONFIG.TIMEOUT
//       });

//       await page.waitForSelector('.listing-card', { timeout: 60000 });
//       await this.autoScroll(page);

//       const html = await page.content();
//       const $ = cheerio.load(html);

//       const listings = [];
//       $('.listing-card').each((i, el) => {
//         const $el = $(el);
        
//         const images = [];
//         $el.find('.carousel--img-landscape img').each((i, img) => {
//           images.push($(img).attr('src'));
//         });

//         const features = {};
//         $el.find('.listing-card__main-features li').each((i, li) => {
//           const text = $(li).text().trim();
//           if (text.includes('Bed')) {
//             features.bedrooms = text.replace('Bed', '').trim();
//           } else if (text.includes('Bath')) {
//             features.bathrooms = text.replace('Bath', '').trim();
//           } else if (text.includes('FT²')) {
//             features.squareFeet = text.replace('FT²', '').trim();
//           }
//         });

//         listings.push({
//           title: $el.find('.listing-card__title').text().trim(),
//           price: $el.find('.listing-card__price').text().trim(),
//           type: $el.find('.listing-card__type').text().trim(),
//           address: $el.find('.listing-card__title').text().trim(),
//           url: CONFIG.BASE_URL + $el.find('.listing-card__permalink-button').attr('href'),
//           images,
//           features,
//           isVerified: $el.find('.verified-badge').length > 0,
//           isPopular: $el.find('.label--senary').text().includes('Popular')
//         });
//       });

//       return listings;
//     } finally {
//       await browser.close();
//     }
//   }

//   async autoScroll(page) {
//     await page.evaluate(async () => {
//       await new Promise((resolve) => {
//         let totalHeight = 0;
//         const distance = 100;
//         const timer = setInterval(() => {
//           const scrollHeight = document.body.scrollHeight;
//           window.scrollBy(0, distance);
//           totalHeight += distance;

//           if (totalHeight >= scrollHeight) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 100);
//       });
//     });
//   }
// }

// module.exports = new RentalsController();



// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const cheerio = require('cheerio');

// // Configuration optimisée
// const CONFIG = {
//   BASE_URL: 'https://www.realtor.ca',
//   TIMEOUT: 30000,
//   CONCURRENCY: 3,
//   DELAY: 1000,
//   USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
// };

// // Ajouter le plugin stealth pour éviter la détection
// puppeteer.use(StealthPlugin());

// const propertyController = {
//   async getProperties(req, res) {
//     try {
//       const { type = 'buy', location = 'montreal', limit = 20 } = req.query;
//       const properties = await this.scrapeProperties({ type, location, limit });
      
//       res.json({
//         success: true,
//         count: properties.length,
//         data: properties
//       });
//     } catch (error) {
//       console.error('Scraping error:', error);
//       res.status(500).json({ 
//         success: false,
//         error: error.message 
//       });
//     }
//   },

//   async scrapeProperties({ type, location, limit }) {
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage'
//       ]
//     });

//     try {
//       const page = await browser.newPage();
//       await page.setUserAgent(CONFIG.USER_AGENT);
//       await page.setViewport({ width: 1366, height: 768 });

//       // Bloquer les ressources non essentielles
//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
//           req.abort();
//         } else {
//           req.continue();
//         }
//       });

//       const url = `${CONFIG.BASE_URL}/${type === 'rent' ? 'for-rent' : 'for-sale'}/${location}`;
//       await page.goto(url, { 
//         waitUntil: 'domcontentloaded',
//         timeout: CONFIG.TIMEOUT
//       });

//       // Attendre le chargement des résultats
//       await page.waitForSelector('.listing-card', { timeout: 60000 });

//       // Scroller pour charger plus de contenu
//       await this.autoScroll(page);

//       const html = await page.content();
//       const $ = cheerio.load(html);

//       const properties = [];
//       $('.listing-card').slice(0, limit).each((i, el) => {
//         const $el = $(el);
//         properties.push({
//           price: $el.find('.listing-price').text().trim(),
//           address: $el.find('.listing-address').text().trim(),
//           beds: $el.find('.listing-bedrooms').text().trim(),
//           baths: $el.find('.listing-bathrooms').text().trim(),
//           size: $el.find('.listing-sqft').text().trim(),
//           url: `${CONFIG.BASE_URL}${$el.find('a').attr('href')}`,
//           image: $el.find('img').attr('src')
//         });
//       });

//       return properties;
//     } finally {
//       await browser.close();
//     }
//   },

//   async autoScroll(page) {
//     await page.evaluate(async () => {
//       await new Promise((resolve) => {
//         let totalHeight = 0;
//         const distance = 100;
//         const timer = setInterval(() => {
//           const scrollHeight = document.body.scrollHeight;
//           window.scrollBy(0, distance);
//           totalHeight += distance;
//           if (totalHeight >= scrollHeight) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 100);
//       });
//     });
//   }
// };

// module.exports = propertyController;



const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class AppartogoScraper {
    constructor() {
        this.baseUrl = 'https://appartogo.com';
    }

    async scrapeAllProvinces() {
        try {
            // First get all provinces and cities
            const response = await axios.get(this.baseUrl);
            const $ = cheerio.load(response.data);
            
            const provinces = [];
            
            // Find all province sections
            $('.container > h3').each((i, element) => {
                const provinceName = $(element).text().trim();
                const province = {
                    name: provinceName,
                    cities: []
                };
                
                // Get the next sibling which contains the cities list
                const citiesList = $(element).next().find('ul.list-unstyled li');
                
                citiesList.each((j, cityElement) => {
                    const cityLink = $(cityElement).find('a');
                    const cityName = cityLink.text().trim();
                    const cityUrl = new URL(cityLink.attr('href'), this.baseUrl).href;
                    
                    province.cities.push({
                        name: cityName,
                        url: cityUrl
                    });
                });
                
                provinces.push(province);
            });
            
            // Now scrape listings for each city
            for (const province of provinces) {
                for (const city of province.cities) {
                    city.listings = await this.scrapeListings(city.url);
                    // Add delay to avoid being blocked
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            return provinces;
        } catch (error) {
            console.error('Error scraping provinces:', error);
            throw error;
        }
    }

    async scrapeListings(url, maxPages = 3) {
        try {
            const listings = [];
            let currentPage = 1;
            let hasNextPage = true;
            
            while (hasNextPage && currentPage <= maxPages) {
                const pageUrl = currentPage === 1 ? url : `${url}?page=${currentPage}`;
                console.log(`Scraping page ${currentPage}: ${pageUrl}`);
                
                const response = await axios.get(pageUrl);
                const $ = cheerio.load(response.data);
                
                // Process each listing on the page
                $('.result-block .listing').each((i, element) => {
                    const listing = {
                        id: $(element).attr('data-listing-id'),
                        title: $(element).find('[itemprop="name"]').text().trim(),
                        price: $(element).find('[itemprop="price"]').attr('content'),
                        priceDisplay: $(element).find('[itemprop="price"]').text().trim().replace(/\s+/g, ' '),
                        currency: $(element).find('[itemprop="priceCurrency"]').attr('content'),
                        priceRating: $(element).find('.fscore-label').text().trim(),
                        bedrooms: $(element).find('.pieces').first().text().trim(),
                        rooms: $(element).find('.pieces').last().text().trim(),
                        location: $(element).find('h4').text().trim(),
                        image: $(element).find('[itemprop="image"]').attr('src'),
                        url: new URL($(element).find('.tile-link').attr('href'), this.baseUrl).href,
                        postedDate: $(element).find('.badge.created-on').text().trim(),
                        latitude: $(element).find('[itemprop="latitude"]').attr('content'),
                        longitude: $(element).find('[itemprop="longitude"]').attr('content')
                    };
                    
                    listings.push(listing);
                });
                
                // Check if there's a next page
                const pagination = $('.pagination');
                const nextPageLink = pagination.find('a[href*="page=' + (currentPage + 1) + '"]');
                hasNextPage = nextPageLink.length > 0;
                
                currentPage++;
                
                // Add delay between pages
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            return listings;
        } catch (error) {
            console.error(`Error scraping listings from ${url}:`, error);
            throw error;
        }
    }

    async getListingsByCity(cityName) {
        try {
            // First get all provinces and cities
            const provinces = await this.scrapeAllProvinces();
            
            // Find the city
            let targetCity = null;
            for (const province of provinces) {
                const city = province.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
                if (city) {
                    targetCity = city;
                    break;
                }
            }
            
            if (!targetCity) {
                throw new Error(`City ${cityName} not found`);
            }
            
            return targetCity.listings;
        } catch (error) {
            console.error('Error getting listings by city:', error);
            throw error;
        }
    }
}

// Example usage
// (async () => {
//     try {
//         const scraper = new AppartogoScraper();
        
//         // Scrape all provinces and cities (with listings)
//         // const allProvinces = await scraper.scrapeAllProvinces();
//         // console.log(JSON.stringify(allProvinces, null, 2));
        
//         // Or scrape listings for a specific city
//         const quebecListings = await scraper.getListingsByCity('Québec');
//         console.log(JSON.stringify(quebecListings, null, 2));
        
//         // Save to file if needed
//         // const fs = require('fs');
//         // fs.writeFileSync('quebec_listings.json', JSON.stringify(quebecListings, null, 2));
//     } catch (error) {
//         console.error('Error in example usage:', error);
//     }
// })();

module.exports = AppartogoScraper;
>>>>>>> remotes/origin/eduF:src/controllers/logementController.js
