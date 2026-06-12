fetch('https://v23.proteinatlas.org/api/search_download.php?search=NLRP3&format=json&columns=g,hpa_antibody,hpa_antibody_ihc,hpa_antibody_wb,hpa_antibody_if')
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data[0])))
  .catch(console.error);
