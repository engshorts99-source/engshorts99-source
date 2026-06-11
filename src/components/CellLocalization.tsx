"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CellLocalizationProps {
  accession: string;
  name: string;
}

export default function CellLocalization({ accession, name }: CellLocalizationProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocalization() {
      try {
        const res = await fetch(`https://rest.uniprot.org/uniprotkb/${accession}`);
        const data = await res.json();
        
        let locs: string[] = [];
        if (data.comments) {
          const subcell = data.comments.find((c: any) => c.type === 'SUBCELLULAR LOCATION');
          if (subcell && subcell.subcellularLocations) {
            locs = subcell.subcellularLocations.map((l: any) => l.location.value);
          }
        }
        setLocations(locs.length ? locs : ['Cytoplasm (Predicted)']);
      } catch (err) {
        console.error("Localization fetch failed", err);
        setLocations(['Cytoplasm (Default)']);
      } finally {
        setLoading(false);
      }
    }
    fetchLocalization();
  }, [accession]);

  // Determine roughly where to place the dot based on keyword
  const mainLoc = locations[0]?.toLowerCase() || '';
  let targetX = 50;
  let targetY = 50; // Cytosol default
  
  if (mainLoc.includes('nucleus')) {
    targetX = 30; targetY = 30;
  } else if (mainLoc.includes('membrane')) {
    targetX = 85; targetY = 50;
  } else if (mainLoc.includes('mitochondrion')) {
    targetX = 70; targetY = 70;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
      <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: '1rem', border: '1px solid var(--border-focus)', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          Known Locations for {name}
        </h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {locations.map((loc, i) => (
              <li key={i} style={{ color: 'var(--text-secondary)' }}>{loc}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Stylized Cell Diagram */}
      <div style={{ position: 'relative', width: '400px', height: '400px' }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.2))' }}>
          {/* Cell Membrane */}
          <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.5)" stroke="var(--accent-primary)" strokeWidth="2" />
          
          {/* Nucleus */}
          <circle cx="30" cy="30" r="15" fill="rgba(139, 92, 246, 0.3)" stroke="var(--accent-secondary)" strokeWidth="1" />
          
          {/* Mitochondrion (Simplified) */}
          <ellipse cx="70" cy="70" rx="10" ry="6" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="1" transform="rotate(-45 70 70)" />
        </svg>

        {/* Protein Particle */}
        <motion.div
          initial={{ left: '50%', top: '50%', scale: 0 }}
          animate={{ left: `${targetX}%`, top: `${targetY}%`, scale: 1 }}
          transition={{ delay: 1, duration: 2, type: 'spring' }}
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 15px 5px rgba(16, 185, 129, 0.6)'
          }}
        />
        
        {/* Labels */}
        <div style={{ position: 'absolute', top: '25%', left: '20%', fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>Nucleus</div>
        <div style={{ position: 'absolute', top: '75%', left: '75%', fontSize: '0.7rem', color: '#f59e0b' }}>Mitochondrion</div>
        <div style={{ position: 'absolute', top: '10%', left: '50%', fontSize: '0.7rem', color: 'var(--accent-primary)' }}>Membrane</div>
      </div>
    </div>
  );
}
