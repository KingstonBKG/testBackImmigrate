const axios = require('axios');
const cheerio = require('cheerio');


// Méthode pour récupérer les jobs
const getLogement = async (req, res) => {
    var type = req.params.type;
    var city = req.params.city;
    var bed = req.params.bed;
    var price = req.params.price;
    var pet = req.params.pet;

    const propertyCategories = req.query["property-categories"];
    const leaseTerms = req.query["lease-term"];
    
    // Vérifiez que la ville est fournie
    if (!city) {
        return res.status(400).json({ error: 'Le paramètre de ville est requis.' });
    }

    const baseUrl = "https://www.padmapper.com";
    const pathParts = [type, city, bed, price, pet].filter(Boolean); // Supprime les undefined
    const url = `${baseUrl}/${pathParts.join('/')}?property-categories=${propertyCategories}&lease-terms=${leaseTerms}`;
    
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

            const city = { title, linknearbycity}
            nearby_city.push(city);
        });

        $('a.locale_facet_links_localeFacetLink__28BVy').each((index, element) => {
            title = cleanText($(element).text() ?? '');
            linktype = $(element).attr('href') ?? '';

            const city = { title, linktype}
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


            if(index % 2 == 0){
                const log = { badge, must_see,featured, imageUrl, price, rooms, type, localisation, info, fulllink }
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

            const city = { title, linknearbycity}
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


            if(index % 2 == 0){
                const log = { badge, must_see,featured, imageUrl, price, rooms, type, localisation, info, fulllink }
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

            const city = { title, linknearbycity}
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


            if(index % 2 == 0){
                const log = { badge, must_see,featured, imageUrl, price, rooms, type, localisation, info, fulllink }
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




module.exports = {
    getLogement,
    geLogementwithtype,
    geLogementwithfilter
};
