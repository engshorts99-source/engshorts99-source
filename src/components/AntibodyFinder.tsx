"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AntibodyFinderProps {
  gene: string;
}

export default function AntibodyFinder({ gene }: AntibodyFinderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const apps = [
    { name: 'Broad / All Applications', query: gene, color: 'var(--accent-primary)' },
    { name: 'Western Blot (WB)', query: `${gene} WB`, color: '#3b82f6' },
    { name: 'Immunohistochemistry (IHC)', query: `${gene} IHC`, color: '#f59e0b' },
    { name: 'Immunofluorescence (IF)', query: `${gene} IF`, color: '#10b981' },
    { name: 'ELISA', query: `${gene} ELISA`, color: '#ef4444' }
  ];

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
                maxWidth: '500px',
                position: 'relative'
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
                Select an application below to search CiteAb, the leading citation-ranked antibody search engine, for experimentally validated {gene} antibodies.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {apps.map(app => (
                  <a 
                    key={app.name}
                    href={`https://www.citeab.com/antibodies/search?q=${encodeURIComponent(app.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: `1px solid ${app.color}40`,
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s',
                      fontWeight: 600
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = `${app.color}15`;
                      e.currentTarget.style.borderColor = app.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.borderColor = `${app.color}40`;
                    }}
                  >
                    <span>{app.name}</span>
                    <span style={{ color: app.color }}>Search ↗</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
