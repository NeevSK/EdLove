import { Link } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
import styles from './atlas.module.css';
import {
  FUNCTIONAL_SCREENS,
  SCREEN_ROLES,
  type ScreenCategory,
  type ScreenRole,
} from './atlasData';

interface AtlasFloorProps {
  initialRole?: ScreenRole | 'all';
}

export function AtlasFloor({ initialRole = 'all' }: AtlasFloorProps) {
  const [selectedRole, setSelectedRole] = useState<ScreenRole | 'all'>(initialRole);
  const [selectedCategory, setSelectedCategory] = useState<ScreenCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeRoleMeta = useMemo(() => {
    if (selectedRole === 'all') return null;
    return SCREEN_ROLES.find((r) => r.id === selectedRole) ?? null;
  }, [selectedRole]);

  const filteredScreens = useMemo(() => {
    return FUNCTIONAL_SCREENS.filter((screen) => {
      // Role filter
      if (selectedRole !== 'all' && !screen.roles.includes(selectedRole)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && screen.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = screen.name.toLowerCase().includes(q);
        const matchJob = screen.jobSummary.toLowerCase().includes(q);
        const matchDesc = screen.detailedDescription.toLowerCase().includes(q);
        const matchLegacy = screen.legacyPoeticName?.toLowerCase().includes(q) ?? false;
        const matchRoute = screen.webRoute.toLowerCase().includes(q) || screen.mobileRoute.toLowerCase().includes(q);
        return matchName || matchJob || matchDesc || matchLegacy || matchRoute;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, selectedRole]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Directory & Cartography</p>
        <h1 className={styles.title}>School Screen & Capability Atlas</h1>
        <p className={styles.subtitle}>
          Plain functional catalog of all available screens across Web and Mobile. Explore what each screen does,
          which role it serves, and where to access it without poetic jargon.
        </p>
      </header>

      {/* Role / Capacity Selector Bar */}
      <section className={styles.roleBar} aria-label="Select Role Perspective">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className={styles.roleBarLabel}>Select Role / Capacity Perspective:</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
            Showing <strong>{filteredScreens.length}</strong> available screens
          </span>
        </div>

        <div className={styles.rolePills} role="tablist">
          <button
            type="button"
            className={`${styles.rolePill} ${selectedRole === 'all' ? styles.rolePillActive : ''}`}
            onClick={() => setSelectedRole('all')}
            role="tab"
            aria-selected={selectedRole === 'all'}
          >
            <span>✦</span>
            <span>All Roles ({FUNCTIONAL_SCREENS.length})</span>
          </button>

          {SCREEN_ROLES.map((role) => {
            const count = FUNCTIONAL_SCREENS.filter((s) => s.roles.includes(role.id)).length;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                className={`${styles.rolePill} ${isSelected ? styles.rolePillActive : ''}`}
                onClick={() => setSelectedRole(role.id)}
                role="tab"
                aria-selected={isSelected}
              >
                <span>{role.icon}</span>
                <span>{role.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {activeRoleMeta ? (
          <div className={styles.roleSummaryBox}>
            <strong>{activeRoleMeta.label}:</strong> {activeRoleMeta.description}
          </div>
        ) : null}
      </section>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by school job, screen name, or legacy keyword (e.g. roll call, gradebook, relief, quest)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className={styles.categoryPills}>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'attendance', label: 'Attendance & Census' },
            { id: 'academics', label: 'Academics & Teaching' },
            { id: 'grading', label: 'Grading & Exams' },
            { id: 'operations', label: 'Operations & Staff' },
            { id: 'pastoral', label: 'Pastoral & Family' },
            { id: 'library', label: 'Library' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryButton} ${selectedCategory === cat.id ? styles.categoryButtonActive : ''}`}
              onClick={() => setSelectedCategory(cat.id as ScreenCategory | 'all')}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Cards Grid */}
      <div className={styles.screenGrid}>
        {filteredScreens.map((screen) => (
          <article key={screen.id} className={styles.screenCard}>
            <div>
              <div className={styles.cardHeader}>
                <div className={styles.cardTopRow}>
                  <span className={styles.categoryBadge}>{screen.category}</span>
                  {screen.badge ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '0.2rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857' }}>
                      {screen.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className={styles.cardTitle}>{screen.name}</h3>
                <p className={styles.cardJob}>{screen.jobSummary}</p>
              </div>

              <p className={styles.cardDesc}>{screen.detailedDescription}</p>

              {screen.legacyPoeticName ? (
                <div className={styles.legacyNote}>
                  <strong>Legacy / Poetic Label:</strong> {screen.legacyPoeticName}
                </div>
              ) : null}
            </div>

            <div className={styles.routesBox}>
              <Link to={screen.webRoute} className={styles.openLink}>
                Open Web Screen ➔
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-ink-muted)' }}>Mobile App Route:</span>
                <span className={styles.mobileRouteTag}>{screen.mobileRoute}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredScreens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-ink)' }}>No screens found matching your query.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)' }}>Try adjusting your search terms or clearing role filters.</p>
          <button
            type="button"
            className={styles.openLink}
            onClick={() => {
              setSelectedRole('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            style={{ marginTop: '0.5rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </div>
  );
}

