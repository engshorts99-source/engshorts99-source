"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProteinStructure from '@/components/ProteinStructure';
import styles from './page.module.css';

const STAGES = [
  "Genomic Locus",
  "Transcription",
  "3D Structure",
  "Localization",
  "Crosstalk"
];

function JourneyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  
  // Parse "?p=p53:P04637,EGFR:P00533"
  const pParam = searchParams.get('p') || '';
  const proteins = pParam.split(',').filter(Boolean).map(item => {
    const [name, acc] = item.split(':');
    return { name: decodeURIComponent(name), accession: decodeURIComponent(acc) };
  });

  const mainProtein = proteins[0]?.name || 'Target Protein';

  // Info content per stage
  const stageInfo = [
    {
      title: "Genomic Locus",
      desc: `Zooming into the specific chromosome containing the gene for ${mainProtein}. The blinking indicator shows the exact locus where this gene resides.`
    },
    {
      title: "Transcription Regulation",
      desc: `At the nucleosome level, Transcription Factors (TFs) bind to the promoter region, recruiting RNA Polymerase II to begin transcribing the ${mainProtein} gene into mRNA.`
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
              
              {/* Blinking Locus */}
              <motion.div 
                className={styles.locusIndicator}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
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
              <motion.div 
                className={styles.tfBinding}
                style={{ top: '20%', left: '-20px' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
              >
                TF
              </motion.div>
              <motion.div 
                className={styles.tfBinding}
                style={{ top: '25%', right: '-20px' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: 'spring' }}
              >
                TF
              </motion.div>

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

          {/* Placeholder for future stages */}
          {stage > 2 && (
            <motion.div
              key={`stage-${stage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl text-[var(--text-muted)] border border-dashed border-[var(--border-focus)] p-12 rounded-2xl"
            >
              {STAGES[stage]} implementation pending...
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

