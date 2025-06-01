const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const { db } = require('../../src/config/firebase');

class AppartogoScraper {
    constructor() {
        this.baseUrl = 'https://appartogo.com';
    }

    async scrapeAllProvinces() {
        try {
            const response = await axios.get(this.baseUrl);
            const $ = cheerio.load(response.data);
            
            const provinces = [];
            const batch = db.batch();
            const allCitiesRef = db.collection('allCities');
            
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
                    
                    const cityData = {
                        name: cityName,
                        url: cityUrl,
                        province: provinceName,
                        updatedAt: new Date()
                    };
                    
                    province.cities.push(cityData);
                    
                    // Ajouter la ville à la collection allCities
                    const cityDocRef = allCitiesRef.doc(cityName.toLowerCase());
                    batch.set(cityDocRef, cityData);
                });
                
                provinces.push(province);
                
                // Sauvegarder la province et ses villes
                const provinceRef = db.collection('provinces').doc(province.name.toLowerCase());
                batch.set(provinceRef, {
                    name: province.name,
                    updatedAt: new Date()
                });
                
                // Store cities in province subcollection
                province.cities.forEach(city => {
                    const cityRef = provinceRef.collection('cities').doc(city.name.toLowerCase());
                    batch.set(cityRef, {
                        name: city.name,
                        url: city.url,
                        updatedAt: new Date()
                    });
                });
            });
            
            // Commit all changes
            await batch.commit();
            
            return provinces;
        } catch (error) {
            console.error('Error scraping provinces:', error);
            throw error;
        }
    }

    async scrapeListings(url, maxPages = 4) {
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
            // Rechercher directement dans la collection allCities
            const cityDoc = await db.collection('allCities').doc(cityName.toLowerCase()).get();
            
            if (!cityDoc.exists) {
                // Si la ville n'existe pas, on rafraîchit les données et on réessaie
                await this.scrapeAllProvinces();
                const refreshedCityDoc = await db.collection('allCities').doc(cityName.toLowerCase()).get();
                
                if (!refreshedCityDoc.exists) {
                    throw new Error(`City ${cityName} not found`);
                }
                
                return await this.scrapeListings(refreshedCityDoc.data().url);
            }
            
            return await this.scrapeListings(cityDoc.data().url);
        } catch (error) {
            console.error('Error getting listings by city:', error);
            throw error;
        }
    }
}

module.exports = new AppartogoScraper();