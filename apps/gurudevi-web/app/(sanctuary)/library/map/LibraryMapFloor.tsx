'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type {
  MockKnowledgeTopology as TopologyData,
  MockLearningCenter as LearningCenter,
  MockTopologyNode as TopologyNode,
} from '@repo/core/api/library';
import { orpcClient } from '@repo/core/api/orpcClient';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './map.module.css';

const initialCenters = getSandboxSamples<readonly LearningCenter[]>('library', 'getLearningCenters', [], []);
const fallbackTopology = getSandboxSamples<TopologyData>('library', 'getMapTopology', [], {
  nodes: [],
  links: [],
});

interface LibraryMapFloorProps {
  displayName: string;
  capacity?: string;
}

export function LibraryMapFloor({ displayName, capacity }: Readonly<LibraryMapFloorProps>) {
  const [viewMode, setViewMode] = useState<'physical' | 'cosmos'>('physical');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [topology, setTopology] = useState<TopologyData>(fallbackTopology);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);

  // Load live map topology from oRPC
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await (orpcClient.library as any).getMapTopology({ query: {} });
        if (!active || !res) return;
        if (Array.isArray(res.nodes) && res.nodes.length > 0) {
          setTopology(res);
        }
      } catch {
        // Retain fallback topology smoothly
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredCenters = (initialCenters ?? []).filter((c) => {
    if (selectedProvince === 'all') return true;
    return (c.province ?? '').toLowerCase() === selectedProvince.toLowerCase();
  });

  // Calculate layout coordinates for Cosmos nodes
  const nodeLayout = useMemo(() => {
    const nodes = topology?.nodes ?? [];
    const total = Math.max(nodes.length, 1);
    const width = 800;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.72;

    const coords = new Map<string, { x: number; y: number }>();
    nodes.forEach((node, index) => {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      const r = node.type === 'topic' ? radius * 0.6 : radius;
      coords.set(node.id, {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      });
    });
    return coords;
  }, [topology?.nodes]);

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/library"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Sanctuary Library
            </Link>
          </div>
          <h1>{viewMode === 'physical' ? 'National Learning Centers Map' : 'Knowledge Cosmos Topology'}</h1>
          <p>
            {viewMode === 'physical'
              ? 'Physical educational resource centers, municipal archives, and digital study terminals across Sri Lanka.'
              : 'Interactive cosmic graph connecting pedagogical units, topics, and prerequisite pathways.'}
          </p>
        </div>

        {/* 2-World Mode Switcher */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.modeSwitcher}>
            <button
              type="button"
              className={styles.modeBtn}
              data-active={viewMode === 'physical'}
              onClick={() => setViewMode('physical')}
            >
              📍 Learning Centers
            </button>
            <button
              type="button"
              className={styles.modeBtn}
              data-active={viewMode === 'cosmos'}
              onClick={() => setViewMode('cosmos')}
            >
              🌌 Knowledge Cosmos
            </button>
          </div>

          {viewMode === 'physical' && (
            <div className={styles.filterBar}>
              {['all', 'western', 'central', 'northern', 'southern', 'uva'].map((prov) => (
                <button
                  key={prov}
                  type="button"
                  className={styles.filterBtn}
                  data-active={selectedProvince === prov}
                  onClick={() => setSelectedProvince(prov)}
                >
                  {prov.charAt(0).toUpperCase() + prov.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* World 1: Physical Learning Centers */}
      {viewMode === 'physical' && (
        <div className={styles.mapCard}>
          <div className={styles.mapViewport}>
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#453c35' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🗺️</span>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>
                Sri Lanka Education Geo-Topology
              </p>
              <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                {filteredCenters.length} verified provincial centers active in current filter
              </p>
            </div>
          </div>

          <div className={styles.centersGrid}>
            {filteredCenters.map((c) => (
              <div key={c.id} className={styles.centerCard}>
                <span className={styles.centerTitle}>{c.name}</span>
                <span className={styles.centerMeta}>
                  {c.district} District • {c.province} Province
                </span>
                <span className={styles.centerMeta}>
                  Holdings: {c.booksCount.toLocaleString()} volumes
                </span>
                <span className={styles.centerMeta}>
                  Facility:{' '}
                  {c.digitalHub ? (
                    <span className={styles.statusOnline}>✓ Digital Terminal & Wi-Fi</span>
                  ) : (
                    'Print Archive Only'
                  )}
                </span>
                <span className={styles.centerMeta}>Hours: {c.hours}</span>
                <span className={styles.centerMeta}>Phone: {c.contact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World 2: Knowledge Cosmos Graph */}
      {viewMode === 'cosmos' && (
        <div className={styles.mapCard}>
          <div className={styles.cosmosViewport}>
            <div className={styles.cosmosOverlay}>
              <strong>Knowledge Cosmos</strong>
              <p style={{ margin: '0.25rem 0 0', opacity: 0.8 }}>
                {topology.nodes.length} entities • {topology.links.length} relational seams
              </p>
            </div>

            <svg viewBox="0 0 800 480" className={styles.cosmosSvg} aria-label="Knowledge Cosmos Constellation">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Edge Links */}
              {(topology?.links ?? []).map((link, idx) => {
                const s = nodeLayout.get(link.source);
                const t = nodeLayout.get(link.target);
                if (!s || !t) return null;
                const isPrereq = link.relationship === 'prerequisite';
                return (
                  <line
                    key={idx}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={isPrereq ? '#f59e0b' : 'rgba(255, 255, 255, 0.22)'}
                    strokeWidth={isPrereq ? 2.5 : 1.5}
                    strokeDasharray={isPrereq ? '5,5' : undefined}
                    opacity={0.8}
                  />
                );
              })}

              {/* Cosmos Nodes */}
              {(topology?.nodes ?? []).map((node) => {
                const pos = nodeLayout.get(node.id);
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;
                const isTopic = node.type === 'topic';
                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      r={isTopic ? 14 : 20}
                      fill={isTopic ? '#7dd4c0' : '#818cf8'}
                      stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter="url(#glow)"
                    />
                    <text
                      y={isTopic ? 24 : 32}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize={isTopic ? 10 : 11}
                      fontWeight={600}
                    >
                      {node.label.length > 24 ? node.label.slice(0, 22) + '…' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Node Inspector Panel */}
            {selectedNode && (
              <div className={styles.cosmosDetailPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: selectedNode.type === 'topic' ? 'rgba(125, 212, 192, 0.2)' : 'rgba(129, 140, 248, 0.2)',
                      color: selectedNode.type === 'topic' ? '#7dd4c0' : '#818cf8',
                      fontWeight: 700,
                    }}
                  >
                    {selectedNode.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{selectedNode.label}</h3>

                {selectedNode.metadata?.description && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
                    {selectedNode.metadata.description}
                  </p>
                )}

                {selectedNode.metadata?.subjects && selectedNode.metadata.subjects.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {selectedNode.metadata.subjects.map((sub) => (
                      <span
                        key={sub}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                {selectedNode.type === 'resource' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link
                      href={`/library/reader/${selectedNode.id}`}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '0.6rem 1rem',
                        borderRadius: '0.5rem',
                        background: '#7dd4c0',
                        color: '#08080a',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                      }}
                    >
                      Open in Reader Desk 📖
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
