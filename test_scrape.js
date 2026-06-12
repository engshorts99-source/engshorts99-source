const cheerio = require('cheerio');
fetch('https://www.citeab.com/antibodies/search?q=NLRP3', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}).then(r => r.text()).then(html => {
  const $ = cheerio.load(html);
  const results = [];
  $('.product-results .product-result').each((i, el) => {
    if(i >= 5) return;
    const name = $(el).find('h3 a').text().trim();
    const supplier = $(el).find('.supplier-name').text().trim();
    const applications = $(el).find('.applications-list').text().trim().replace(/\s+/g, ' ');
    results.push({name, supplier, applications});
  });
  console.log(results);
}).catch(console.error);
