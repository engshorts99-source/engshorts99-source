"use client";

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { motion } from 'framer-motion';

interface ProteinStructureProps {
  accession: string;
  name: string;
}

export default function ProteinStructure({ accession, name }: ProteinStructureProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [domains, setDomains] = useState<any[]>([]);
  const [viewerInstance, setViewerInstance] = useState<any>(null);

  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch(`https://rest.uniprot.org/uniprotkb/${accession}`);
        const data = await res.json();
        if (data.features) {
          const domainFeatures = data.features.filter((f: any) => 
            f.type === 'Domain' || f.type === 'Region' || f.type === 'Zinc finger'
          );
          setDomains(domainFeatures);
        }
      } catch (err) {
        console.error("Failed to fetch domains", err);
      }
    }
    fetchDomains();
  }, [accession]);

  const initViewer = () => {
    if (!window.$3Dmol || !viewerRef.current) return;
    
    const pdbUri = `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v6.pdb`;
    
    const viewer = window.$3Dmol.createViewer(viewerRef.current, {
      defaultcolors: window.$3Dmol.rasmolElementColors
    });

    fetch(pdbUri)
      .then(res => res.text())
      .then(data => {
        viewer.addModel(data, "pdb");
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.zoomTo();
        viewer.render();
        setViewerInstance(viewer);
        setLoaded(true);
      })
      .catch(err => {
        console.error("Failed to load PDB:", err);
      });
  };

  const highlightDomain = (start: number, end: number) => {
    if (!viewerInstance || !start || !end) return;
    // Reset all to spectrum with low opacity
    viewerInstance.setStyle({}, { cartoon: { color: 'spectrum', opacity: 0.5 } });
    
    // Create array of residue indices
    const resiArray = [];
    for (let i = start; i <= end; i++) resiArray.push(i);
    
    // Highlight specific domain
    viewerInstance.setStyle({resi: resiArray}, { cartoon: { color: '#ef4444', opacity: 1.0 } });
    viewerInstance.render();
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', gap: '1.5rem', flexWrap: 'wrap' }}>
      <Script 
        src="https://3Dmol.org/build/3Dmol-min.js" 
        onLoad={initViewer}
        strategy="lazyOnload"
      />
      
      {/* 3D Viewer Area */}
      <div style={{ flex: '1 1 400px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '1rem', border: '1px solid var(--border-light)', overflow: 'hidden', position: 'relative', minHeight: '400px' }}>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', zIndex: 10 }}>
            Loading 3D Structure for {name} ({accession})...
          </div>
        )}
        <div ref={viewerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      </div>

      {/* Domain Information Panel */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', margin: 0 }}>
          Functional Domains
        </h3>
        {domains.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No specific domains annotated or still loading.</p>
        ) : (
          domains.map((d, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => highlightDomain(d.location?.start?.value, d.location?.end?.value)}
              style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-focus)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.description || d.type}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Position: {d.location?.start?.value} - {d.location?.end?.value}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    $3Dmol: any;
  }
}
