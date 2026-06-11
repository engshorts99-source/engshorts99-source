import { NextResponse } from 'next/server';
import tfsData from '@/lib/tfs.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gene = searchParams.get('gene');

  if (!gene) {
    return NextResponse.json({ error: 'Missing gene parameter' }, { status: 400 });
  }

  const exactTfs = (tfsData as Record<string, string[]>)[gene.toUpperCase()] || [];

  // If TRRUST has known TFs, return up to 6 of them. Otherwise return basal TFs.
  if (exactTfs.length > 0) {
    return NextResponse.json({ tfs: exactTfs.slice(0, 6) });
  } else {
    // Fallback basal TFs for genes with no recorded specific TFs
    return NextResponse.json({ tfs: ['TBP', 'SP1'] });
  }
}
