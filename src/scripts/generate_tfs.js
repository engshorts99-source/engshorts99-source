const fs = require('fs');
const https = require('https');

https.get('https://www.grnpedia.org/trrust/data/trrust_rawdata.human.tsv', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    const targetToTFs = {};
    lines.forEach(line => {
      if (!line.trim()) return;
      const [tf, target] = line.split('\t');
      if (!targetToTFs[target]) targetToTFs[target] = new Set();
      targetToTFs[target].add(tf);
    });
    
    // Convert sets to arrays
    const result = {};
    for (const [target, tfs] of Object.entries(targetToTFs)) {
      result[target] = Array.from(tfs);
    }
    
    fs.mkdirSync('src/lib', { recursive: true });
    fs.writeFileSync('src/lib/tfs.json', JSON.stringify(result));
    console.log('Successfully generated src/lib/tfs.json');
  });
});
