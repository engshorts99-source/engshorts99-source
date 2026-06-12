"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProteinStructure from '@/components/ProteinStructure';
import CellLocalization from '@/components/CellLocalization';
import CrosstalkNetwork from '@/components/CrosstalkNetwork';
import AntibodyFinder from '@/components/AntibodyFinder';
import styles from './page.module.css';

const BASE_STAGES = [
  "Genomic Locus",
  "Transcription",
  "3D Structure",
  "Localization"
];

function JourneyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [geneInfo, setGeneInfo] = useState<{ chr: string; map_location: string; tfs: string[]; symbol: string; tfSource: string } | null>(null);
  
  // Parse "?p=p53:P04637,EGFR:P00533"
  const pParam = searchParams.get('p') || '';
  const proteins = pParam.split(',').filter(Boolean).map(item => {
    const [name, acc] = item.split(':');
    return { name: decodeURIComponent(name), accession: decodeURIComponent(acc) };
  });

  const mainProtein = proteins[0]?.name || 'Target Protein';
  
  const isMultiple = proteins.length > 1;
  const STAGES = [...BASE_STAGES, ...(isMultiple ? ["Crosstalk"] : [])];

  useEffect(() => {
    if (proteins.length > 0) {
      // The user already selected the exact accession (e.g. zbp1:Q9H171).
      const selectedAccession = proteins[0].accession;
      
      // Fetch precise genomic location and exact TFs, including uniprot IDs
      fetch(`https://mygene.info/v3/query?q=symbol:${proteins[0].name}%20OR%20alias:${proteins[0].name}&species=human&fields=genomic_pos,map_location,symbol,uniprot`)
      .then(r => r.json())
      .then(myGeneData => {
        // Find the hit that exactly matches the queried accession from UniProt
        const exactHit = myGeneData.hits?.find((h: any) => 
          h.uniprot?.['Swiss-Prot'] === selectedAccession || 
          h.uniprot?.TrEMBL === selectedAccession
        );
        
        // If not found by accession, fallback to symbol match
        const symbolHit = myGeneData.hits?.find((h: any) => h.symbol?.toUpperCase() === proteins[0].name.toUpperCase());
        
        const hit = exactHit || symbolHit || myGeneData.hits?.[0];
        
        const chr = hit?.genomic_pos?.chr || hit?.map_location?.split(/[pq]/)[0] || '?';
        const map_location = hit?.map_location || 'Unknown Band';
        const officialSymbol = hit?.symbol || proteins[0].name.toUpperCase();
        
        // Use the official HGNC symbol to fetch exact TFs from TRRUST
        return fetch(`/api/tfs?gene=${officialSymbol}`)
          .then(r => r.json())
          .then(tfData => {
            const tfs = tfData.tfs && tfData.tfs.length > 0 ? tfData.tfs : ['TBP', 'SP1'];
            const tfSource = tfData.source || 'Fallback';
            setGeneInfo({ chr, map_location, tfs, symbol: officialSymbol, tfSource });
          });
      })
      .catch(err => {
        console.error("Gene info fetch error", err);
        setGeneInfo({ chr: '?', map_location: 'Unknown', tfs: ['TBP', 'SP1'], symbol: proteins[0].name, tfSource: 'Fallback' });
      });
    }
  }, [proteins]);

  // Info content per stage
  const stageInfo = [
    {
      title: "Genomic Locus",
      desc: geneInfo 
        ? `Zooming into Chromosome ${geneInfo.chr} (Locus: ${geneInfo.map_location}) containing the gene for ${mainProtein}. The blinking indicator shows the exact locus out of 23 chromosome pairs where this gene resides.`
        : `Locating the specific chromosome containing the gene for ${mainProtein}...`
    },
    {
      title: "Transcription Regulation",
      desc: geneInfo
        ? geneInfo.tfSource === 'TRRUST' 
          ? `At the nucleosome level, exact regulatory Transcription Factors for ${geneInfo.symbol} (such as ${geneInfo.tfs.join(', ')}) bind to the promoter region. They recruit RNA Polymerase II to begin transcribing the gene into mRNA.`
          : `Note: The TRRUST database has no exact experimentally verified transcription factors for ${geneInfo.symbol}. However, key interacting proteins (${geneInfo.tfs.join(', ')}) likely participate in its regulatory complex, recruiting RNA Polymerase II to begin transcribing the gene.`
        : `Transcription Factors bind to the promoter region, recruiting RNA Polymerase II...`
    },
    {
      title: "Translation & 3D Structure",
      desc: `The mRNA is translated into an amino acid sequence, folding into this complex 3D structure. Key functional domains are highlighted.`
    },
    {
      title: "Cellular Localization",
      desc: `After synthesis, ${mainProtein} is transported to its functional compartment within the cell (e.g., nucleus, cell membrane, or cytosol).`
    },
    {
      title: "Crosstalk & Pathways",
      desc: `Proteins don't act alone. Here is the interaction network showing how ${proteins.map(p=>p.name).join(', ')} communicate with other key regulators.`
    }
  ];

  if (!proteins.length) {
    return <div className="p-8">No proteins selected.</div>;
  }

  return (
    <main className={styles.main}>
      {/* Sidebar Progress */}
      <div className={styles.sidebar}>
        
        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0 0 2rem 0',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'color 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Search
        </button>

        {STAGES.map((s, idx) => (
          <div 
            key={s} 
            className={`${styles.step} ${stage === idx ? styles.stepActive : ''}`}
            onClick={() => setStage(idx)}
          >
            <div className={styles.stepIndicator} />
            <div className={styles.stepLabel}>{s}</div>
          </div>
        ))}
      </div>

      {/* Info Panel */}
      <div className={`glass-panel ${styles.infoPanel}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={styles.panelTitle}>{stageInfo[stage].title}</h2>
            <p className={styles.panelDesc}>{stageInfo[stage].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Visualization Stage */}
      <div className={styles.stageContainer}>
        <AnimatePresence mode="wait">
          
          {/* STAGE 0: Chromosome */}
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={styles.chromosomeWrapper}
            >
              {/* Stylized Chromosome SVG */}
              <svg viewBox="0 0 100 300" width="100%" height="100%">
                <defs>
                  <linearGradient id="chromGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="50%" stopColor="#9ca3af" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                </defs>
                <path d="M30,20 Q50,0 70,20 L70,130 Q50,150 30,130 Z" fill="url(#chromGrad)" />
                <path d="M30,170 Q50,150 70,170 L70,280 Q50,300 30,280 Z" fill="url(#chromGrad)" />
                <circle cx="50" cy="150" r="10" fill="#4b5563" />
              </svg>
              
              {/* Blinking Locus with Label */}
              <motion.div 
                className={styles.locusIndicator}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {geneInfo && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  style={{ position: 'absolute', top: '35%', left: '110%', whiteSpace: 'nowrap', color: 'var(--accent-secondary)', fontWeight: 'bold' }}
                >
                  ◀ Chr {geneInfo.chr} ({geneInfo.map_location})
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STAGE 1: Transcription */}
          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={styles.dnaStrand}
              style={{ position: 'relative', height: '400px', justifyContent: 'center' }}
            >
              {/* Background DNA bases */}
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className={styles.basePair} style={{ opacity: 0.3 }} />
              ))}
              
              {/* Transcription Factors */}
              {geneInfo?.tfs.map((tf, i) => (
                <motion.div 
                  key={i}
                  className={styles.tfBinding}
                  style={{ 
                    top: `${15 + i * 8}%`, 
                    left: i % 2 === 0 ? '-30px' : undefined,
                    right: i % 2 !== 0 ? '-30px' : undefined,
                    backgroundColor: i === 0 ? '#f59e0b' : '#3b82f6',
                    boxShadow: `0 0 15px ${i === 0 ? '#f59e0b' : '#3b82f6'}`
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.2, type: 'spring' }}
                >
                  {tf}
                </motion.div>
              ))}

              {/* RNA Polymerase moving down */}
              <motion.div
                className={styles.polymerase}
                initial={{ top: '10%' }}
                animate={{ top: '80%' }}
                transition={{ duration: 6, ease: "linear", repeat: Infinity }}
              >
                Pol II
                <div className={styles.rna} />
              </motion.div>
            </motion.div>
          )}

          {/* STAGE 2: Translation & 3D Structure */}
          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1 }}
              style={{ width: '100%', height: '100%', maxWidth: '1000px', display: 'flex', alignItems: 'center' }}
            >
              <ProteinStructure accession={proteins[0]?.accession} name={proteins[0]?.name} />
            </motion.div>
          )}

          {/* STAGE 3: Localization */}
          {stage === 3 && (
            <motion.div
              key="stage-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1 }}
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CellLocalization accession={proteins[0]?.accession} name={proteins[0]?.name} />
            </motion.div>
          )}

          {/* STAGE 4: Crosstalk (Only shown if multiple proteins) */}
          {stage === 4 && isMultiple && (
            <motion.div
              key="stage-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1 }}
              style={{ width: '100%', maxWidth: '800px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CrosstalkNetwork proteins={proteins} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className={styles.bottomNav}>
        <button 
          className={styles.navBtn} 
          disabled={stage === 0}
          onClick={() => setStage(s => s - 1)}
        >
          Previous
        </button>
        <button 
          className={`${styles.navBtn} ${styles.navBtnPrimary}`}
          disabled={stage === STAGES.length - 1}
          onClick={() => setStage(s => s + 1)}
        >
          Next Phase
        </button>
      </div>

      {/* Antibody Finder Floating Action Button */}
      <AntibodyFinder gene={geneInfo?.symbol || mainProtein} />
    </main>
  );
}

export default function Journey() {
  return (
    <React.Suspense fallback={<div>Loading Journey...</div>}>
      <JourneyContent />
    </React.Suspense>
  );
}

