import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const proteins = query.split(',').map(p => p.trim()).filter(Boolean);
  const results = [];

  for (const protein of proteins) {
    try {
      // Query UniProt for the specific gene name, preferring reviewed (Swiss-Prot) entries
      const uniProtUrl = `https://rest.uniprot.org/uniprotkb/search?query=(gene_exact:${protein})+AND+(reviewed:true)&fields=accession,id,gene_names,protein_name,organism_name,length&size=5`;
      
      const response = await fetch(uniProtUrl);
      if (!response.ok) {
        console.error(`Failed to fetch for ${protein}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Group by organism, prioritizing exact gene name matches
        const organismMap = new Map();
        for (const r of data.results) {
          const org = r.organism.scientificName;
          const officialGene = r.genes?.[0]?.geneName?.value?.toUpperCase() || '';
          const isExact = officialGene === protein.toUpperCase();
          
          const mapped = {
            organism: org,
            commonName: r.organism.commonName || org,
            accession: r.primaryAccession,
            proteinName: r.proteinDescription?.recommendedName?.fullName?.value || 'Unknown Protein',
          };

          if (!organismMap.has(org)) {
            organismMap.set(org, mapped);
          } else {
            // Overwrite if this hit is an exact match and the existing one wasn't necessarily
            if (isExact) {
              organismMap.set(org, mapped);
            }
          }
        }
        
        const uniqueOrganisms = Array.from(organismMap.values());
        
        results.push({
          query: protein,
          found: true,
          options: uniqueOrganisms
        });
      } else {
        results.push({
          query: protein,
          found: false,
          options: []
        });
      }
    } catch (error) {
      console.error(`Error querying UniProt for ${protein}:`, error);
      results.push({ query: protein, found: false, error: 'API Error' });
    }
  }

  return NextResponse.json({ results });
}
