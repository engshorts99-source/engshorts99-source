const https = require('https');
https.get('https://www.proteinatlas.org/api/search_download.php?search=TP53&format=json&columns=g,hpa_antibody,hpa_antibody_ihc,hpa_antibody_wb,hpa_antibody_if', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(data.slice(0, 500)));
});
