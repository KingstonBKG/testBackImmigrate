const axios = require('axios');
const cheerio = require('cheerio');

const scrapeEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    const url = 'https://www.cesoc.ca/calendrier-evenements-activites/';
    
    // Fetch the HTML content
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const events = [];

    // Process each event article
    $('article.mec-past-event').each((i, element) => {
      const eventElement = $(element);
      
      // Extract event details
      const title = eventElement.find('.mec-event-title a').text().trim();
      const description = eventElement.find('.mec-event-description').text().trim();
      const date = eventElement.find('.mec-event-d').text().trim();
      const time = eventElement.find('.mec-time-details').text().trim();
      const location = eventElement.find('.mec-venue-details span').text().trim();
      const link = eventElement.find('.mec-event-title a').attr('href');
      const image = eventElement.find('.mec-event-image img').attr('src');

      // Extract start and end times
      const timeParts = time.split(' - ');
      const startTime = timeParts[0] || '';
      const endTime = timeParts[1] || '';

      events.push({
        title,
        description,
        date,
        startTime,
        endTime,
        location,
        link,
        image
      });
    });

    //mettre par mois
    const eventsByMonth = {};
    events.forEach(event => {
      // Extract month , "04 Août" => "août")
      const monthName = event.date.split(' ')[1].toLowerCase();
      
      if (!eventsByMonth[monthName]) {
        eventsByMonth[monthName] = [];
      }
      eventsByMonth[monthName].push(event);
    });

    res.json({
      success: true,
      data: month ? { [month]: eventsByMonth[month] || [] } : eventsByMonth,
      totalEvents: events.length
    });

  } catch (error) {
    console.error('Error scraping events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape events',
      error: error.message
    });
  }
};

module.exports = {
  scrapeEvents
};