"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Next.js dynamic import for client-side rendering only
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface CrosstalkNetworkProps {
  proteins: { name: string; accession: string }[];
}

export default function CrosstalkNetwork({ proteins }: CrosstalkNetworkProps) {
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNetwork() {
      if (!proteins.length) return;
      
      const identifiers = proteins.map(p => p.name).join('%0d');
      // Add up to 15 intermediate nodes to show "stepping stones" between queried proteins
      const url = `https://string-db.org/api/json/network?identifiers=${identifiers}&species=9606&add_nodes=15`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const nodesMap = new Map();
        const links: any[] = [];

        data.forEach((interaction: any) => {
          const isAInput = proteins.some(p => p.name.toUpperCase() === interaction.preferredName_A.toUpperCase());
          if (!nodesMap.has(interaction.preferredName_A)) {
            nodesMap.set(interaction.preferredName_A, { 
              id: interaction.preferredName_A, 
              val: isAInput ? 20 : 5,
              color: isAInput ? '#3b82f6' : '#6b7280' // Inputs are blue, intermediates are gray
            });
          }
          
          const isBInput = proteins.some(p => p.name.toUpperCase() === interaction.preferredName_B.toUpperCase());
          if (!nodesMap.has(interaction.preferredName_B)) {
            nodesMap.set(interaction.preferredName_B, { 
              id: interaction.preferredName_B, 
              val: isBInput ? 20 : 5,
              color: isBInput ? '#3b82f6' : '#6b7280' 
            });
          }
          
          links.push({
            source: interaction.preferredName_A,
            target: interaction.preferredName_B,
            score: interaction.score
          });
        });

        // Ensure searched proteins are in nodes even if no crosstalk found among them
        proteins.forEach(p => {
          if (!nodesMap.has(p.name.toUpperCase())) {
            nodesMap.set(p.name.toUpperCase(), { id: p.name.toUpperCase(), val: 20, color: '#3b82f6' });
          }
        });

        setGraphData({
          nodes: Array.from(nodesMap.values()) as any,
          links
        });

      } catch (err) {
        console.error("Failed to fetch STRING interaction network", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNetwork();
  }, [proteins]);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading network...</div>;
  }

  if (!graphData.nodes.length) {
    return <div style={{ color: 'var(--text-muted)' }}>No interactions found.</div>;
  }

  return (
    <div style={{ width: '100%', height: '500px', background: 'var(--bg-surface-elevated)', borderRadius: '1rem', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
      <ForceGraph2D
        graphData={graphData}
        width={800}
        height={500}
        nodeLabel="id"
        nodeColor={(node: any) => node.color}
        linkColor={() => 'rgba(255,255,255,0.15)'}
        linkWidth={(link: any) => link.score * 1.5}
        backgroundColor="#111111"
        // Physics settings to stabilize graph quickly
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        cooldownTicks={100}
      />
    </div>
  );
}
