"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Dna, Activity, CheckCircle2, XCircle } from 'lucide-react';
import styles from './page.module.css';

type OrganismOption = {
  organism: string;
  commonName: string;
  accession: string;
  proteinName: string;
};

type ValidationResult = {
  query: string;
  found: boolean;
  options: OrganismOption[];
  error?: string;
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<Record<string, string>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults(null);
    
    try {
      const res = await fetch(`/api/validate?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results);
      
      // Auto-select human if available, else first option
      const initialSelections: Record<string, string> = {};
      data.results.forEach((r: ValidationResult) => {
        if (r.found && r.options.length > 0) {
          const humanOpt = r.options.find(o => o.commonName.toLowerCase().includes('human'));
          initialSelections[r.query] = humanOpt ? humanOpt.accession : r.options[0].accession;
        }
      });
      setSelectedSpecies(initialSelections);
      
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSpeciesSelect = (proteinQuery: string, accession: string) => {
    setSelectedSpecies(prev => ({
      ...prev,
      [proteinQuery]: accession
    }));
  };

  const allSelected = results 
    ? results.filter(r => r.found).every(r => selectedSpecies[r.query])
    : false;

  const handleContinue = () => {
    console.log("Proceeding with:", selectedSpecies);
    // TODO: Route to the genomic journey phase
    alert("Navigating to Chromosome view... (To be implemented)");
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgBlur1} />
      <div className={styles.bgBlur2} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={styles.content}
      >
        <AnimatePresence mode="wait">
          {!results && (
            <motion.div 
              key="header"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div className={styles.iconContainer}>
                <Dna size={48} color="#3b82f6" />
                <Activity size={48} color="#8b5cf6" />
              </div>
              <h1 className={`${styles.title} glow-text`}>
                Protein Journey
              </h1>
              <p className={styles.subtitle}>
                Enter one or multiple protein names (e.g. p53, EGFR) to visualize their genomic origin, transcription, structure, and crosstalk.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={`glass-panel ${styles.searchBar}`}>
            <Search className={styles.searchIcon} size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. TP53, EGFR, KRAS..."
              className={styles.searchInput}
            />
            <button
              type="submit"
              disabled={isSearching}
              className={styles.submitBtn}
            >
              {isSearching ? 'Analyzing...' : 'Explore'}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.resultsContainer}
            >
              {results.map((res) => (
                <div key={res.query} className={`glass-panel ${styles.proteinCard}`}>
                  <div className={styles.proteinHeader}>
                    <div className={styles.proteinName}>{res.query.toUpperCase()}</div>
                    <div className={`${styles.proteinStatus} ${res.found ? styles.statusFound : styles.statusNotFound}`}>
                      {res.found ? (
                        <><CheckCircle2 size={18} /> Verified in UniProt</>
                      ) : (
                        <><XCircle size={18} /> Not found</>
                      )}
                    </div>
                  </div>
                  
                  {res.found && res.options.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Organism:</p>
                      <div className={styles.speciesGrid}>
                        {res.options.map((opt) => (
                          <div 
                            key={opt.accession}
                            onClick={() => handleSpeciesSelect(res.query, opt.accession)}
                            className={`${styles.speciesCard} ${selectedSpecies[res.query] === opt.accession ? styles.speciesSelected : ''}`}
                          >
                            <span className={styles.speciesCommon}>{opt.commonName}</span>
                            <span className={styles.speciesScientific}>{opt.organism}</span>
                            <span className={styles.speciesAccession}>{opt.accession}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {results.some(r => r.found) && (
                <button 
                  className={styles.continueBtn}
                  disabled={!allSelected}
                  onClick={handleContinue}
                >
                  Begin Journey
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
