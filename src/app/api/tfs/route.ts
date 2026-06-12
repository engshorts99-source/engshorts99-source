import { NextResponse } from 'next/server';
import tfsData from '@/lib/tfs.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gene = searchParams.get('gene');

  if (!gene) {
    return NextResponse.json({ error: 'Missing gene parameter' }, { status: 400 });
  }

  const exactTfs = (tfsData as Record<string, string[]>)[gene.toUpperCase()] || [];

  // If TRRUST has known TFs, return up to 6 of them.
  if (exactTfs.length > 0) {
    return NextResponse.json({ tfs: exactTfs.slice(0, 6), source: 'TRRUST' });
  }

  // If TRRUST has no TFs for this gene, fetch from STRING-DB as a robust fallback
  try {
    const res = await fetch(`https://string-db.org/api/json/network?identifiers=${gene.toUpperCase()}&species=9606&limit=15`);
    const data = await res.json();
    if (data && data.length > 0) {
      // Filter out the queried gene itself, get unique interactors
      const interactors = [...new Set(data.map((d: any) => d.preferredName_B).filter((n: string) => n.toUpperCase() !== gene.toUpperCase()))];
      if (interactors.length > 0) {
        return NextResponse.json({ 
          tfs: interactors.slice(0, 4).map(t => `${t} (Inferred)`), 
          source: 'STRING' 
        });
      }
    }
  } catch(e) {
    console.error("STRING API fallback error", e);
  }

  // Final basal fallback if both fail
  return NextResponse.json({ tfs: ['NF-kB (General)', 'SP1 (General)'], source: 'Fallback' });
}
