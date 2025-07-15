// //pour service communautaire

// const axios = require('axios');
// const cheerio = require('cheerio');

// const scrapeCESOCEvents = async () => {
//   try {
//     const url = 'https://www.cesoc.ca/calendrier-evenements-activites/';
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);
    
//     const events = [];
    
//     // Parcourir chaque mois
//     $('.tribe-events-calendar-month').each((monthIndex, monthElement) => {
//       const monthName = $(monthElement).find('.tribe-events-calendar-month__month').text().trim();
      
//       // Parcourir chaque jour du mois
//       $(monthElement).find('.tribe-events-calendar-month__day').each((dayIndex, dayElement) => {
//         const dayNumber = $(dayElement).find('.tribe-events-calendar-month__day-date-daynum').text().trim();
        
//         // Parcourir chaque événement du jour
//         $(dayElement).find('.tribe-events-calendar-month__calendar-event').each((eventIndex, eventElement) => {
//           const event = {
//             month: monthName,
//             date: dayNumber,
//             title: $(eventElement).find('.tribe-events-calendar-month__calendar-event-title').text().trim(),
//             time: $(eventElement).find('.tribe-events-calendar-month__calendar-event-datetime').text().trim(),
//             description: $(eventElement).find('.tribe-events-calendar-month__calendar-event-description').text().trim(),
//             link: $(eventElement).attr('href') || '',
//           };
          
//           events.push(event);
//         });
//       });
//     });
    
//     return events;
//   } catch (error) {
//     console.error('Error scraping CESOC events:', error);
//     throw error;
//   }
// };

// module.exports = {
//   scrapeCESOCEvents,
// };