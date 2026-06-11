"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Dna, Activity } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    // TODO: Implement actual API search validation
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <main className={styles.main}>
      {/* Background abstract elements */}
      <div className={styles.bgBlur1} />
      <div className={styles.bgBlur2} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={styles.content}
      >
        <div className={styles.iconContainer}>
          <Dna size={48} color="#3b82f6" />
          <Activity size={48} color="#8b5cf6" />
        </div>
        
        <h1 className={`${styles.title} glow-text`}>
          Protein Journey
        </h1>
        
        <p className={styles.subtitle}>
          Enter one or multiple protein names to visualize their genomic origin, transcription process, 3D structure, and crosstalk network.
        </p>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={`glass-panel ${styles.searchBar}`}>
            <Search className={styles.searchIcon} size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. p53, EGFR, KRAS..."
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
      </motion.div>
    </main>
  );
}
