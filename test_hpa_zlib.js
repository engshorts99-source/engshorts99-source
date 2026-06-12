const https = require('https');
const zlib = require('zlib');
https.get('https://v23.proteinatlas.org/api/search_download.php?search=NLRP3&format=json&columns=g,rn,hpa_antibody,hpa_antibody_ihc,hpa_antibody_wb,hpa_antibody_if', res => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    try {
      const decompressed = zlib.gunzipSync(buffer).toString();
      console.log(JSON.parse(decompressed)[0]);
    } catch(e) { console.error("Not gzip?", e); }
  });
});
