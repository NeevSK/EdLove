'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './map.module.css';

interface LearningCenter {
  id: string;
  name: string;
  province: string;
  district: string;
  booksCount: number;
  digitalHub: boolean;
  hours: string;
  contact: string;
}

const initialCenters: LearningCenter[] = [
  {
    id: 'lc-1',
    name: 'Colombo Central Educational Resource Center',
    province: 'Western',
    district: 'Colombo',
    booksCount: 18400,
    digitalHub: true,
    hours: 'Mon-Sat: 08:30 - 17:00',
    contact: '+94 11 269 1234',
  },
  {
    id: 'lc-2',
    name: 'Kandy Municipal Community Library & Heritage Archives',
    province: 'Central',
    district: 'Kandy',
    booksCount: 12200,
    digitalHub: true,
    hours: 'Mon-Sat: 09:00 - 16:30',
    contact: '+94 81 222 5678',
  },
  {
    id: 'lc-3',
    name: 'Jaffna Public Learning Hub & Science Corner',
    province: 'Northern',
    district: 'Jaffna',
    booksCount: 24500,
    digitalHub: true,
    hours: 'Daily: 08:00 - 18:00',
    contact: '+94 21 222 2345',
  },
  {
    id: 'lc-4',
    name: 'Galle Fort Cultural & Maritime Curricular Archive',
    province: 'Southern',
    district: 'Galle',
    booksCount: 9800,
    digitalHub: false,
    hours: 'Tue-Sun: 09:00 - 17:00',
    contact: '+94 91 223 4567',
  },
  {
    id: 'lc-5',
    name: 'Badulla Uva Provincial Resource Library',
    province: 'Uva',
    district: 'Badulla',
    booksCount: 7500,
    digitalHub: true,
    hours: 'Mon-Fri: 08:30 - 16:00',
    contact: '+94 55 222 7890',
  },
];

interface LibraryMapFloorProps {
  displayName: string;
  capacity?: string;
}

export function LibraryMapFloor({ displayName, capacity }: Readonly<LibraryMapFloorProps>) {
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  const filteredCenters = initialCenters.filter((c) => {
    if (selectedProvince === 'all') return true;
    return c.province.toLowerCase() === selectedProvince.toLowerCase();
  });

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
              ← Back to Library
            </Link>
          </div>
          <h1>National Learning Centers & Library Map</h1>
          <p>
            Explore public educational resource libraries, digital hubs, and archives across Sri
            Lanka.
          </p>
        </div>

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
      </header>

      <div className={styles.mapCard}>
        {/* Visual Map Canvas / Overview */}
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

        {/* Directory Grid */}
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
    </div>
  );
}
