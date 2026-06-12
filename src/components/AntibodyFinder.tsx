"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AntibodyFinderProps {
  gene: string;
}

export default function AntibodyFinder({ gene }: AntibodyFinderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [antibodies, setAntibodies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && antibodies.length === 0) {
      setLoading(true);
      fetch(`/api/antibodies?gene=${gene}`)
        .then(r => r.json())
        .then(data => {
          setAntibodies(data.results || []);
          setLoading(false);
        })
        .catch(e => {
          console.error(e);
          setLoading(false);
        });
    }
  }, [isOpen, gene, antibodies.length]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--accent-secondary)',
          color: 'var(--text-primary)',
          borderRadius: '2rem',
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        Find Validated Antibodies
      </button>

      <AnimatePresence>
        {isOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-light)',
                borderRadius: '1rem',
                padding: '2rem',
                width: '90%',
                maxWidth: '600px',
                position: 'relative',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
            >
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '1.5rem'
                }}
              >&times;</button>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Validated Antibodies for {gene}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Directly displaying experimentally validated antibodies (WB, IHC, IF, ELISA) sourced from Human Protein Atlas and major suppliers.
              </p>

              {loading ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  Fetching verified antibodies...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {antibodies.map((ab, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: `1px solid var(--border-focus)`,
                        borderRadius: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ab.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supplier: {ab.supplier}</div>
                        </div>
                        <a 
                          href={ab.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          View Details ↗
                        </a>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {ab.applications.map((app: string) => (
                          <span key={app} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                            {app} Validated
                          </span>
                        ))}
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <strong>Reactivity:</strong> {ab.species ? ab.species.join(', ') : 'Human'}
                      </div>
                    </div>
                  ))}
                  {antibodies.length === 0 && (
                     <div style={{ color: 'var(--text-muted)' }}>No exact matches found. Search generic catalogs for {gene}.</div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
