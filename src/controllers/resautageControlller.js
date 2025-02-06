const axios = require("axios");
const cheerio = require("cheerio");

const cleanText = (text) => text.trim().replace(/\s+/g, " ");

const getResautage = async (req, res) => {
  const url = "http://mentoratquebec.org/programmes-de-mentorat/";
  const cleanUrl = (url) => url.replace(/;jsessionid=[^?]+/, "");

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const result = [];
 
    $(".et_pb_text_inner").each((divIndex, div) => {
      
      const context = cleanText($(div).find('h4').text().trim());
      if(context){ //parceque certain n'ont pas le h4 
        const liList = [];
       
        $(div).find('a').each((index,linkElement)=>{
            const linkText=$(linkElement).text().trim() //texte dans le lien
            const linkHref=$(linkElement).attr('href')||'';//lien
             liList.push({
                text:linkText,
                url:linkHref
             })
        })

        result.push({
            context,
            links:liList
        })
      }
     
     
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur lors du scraping :", error.message);
  }
};
module.exports ={
    getResautage
};
