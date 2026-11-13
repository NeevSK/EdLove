import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { KIT_CATEGORIES, type KitCategoryGroup } from '../kitNavigationData';
import { ScrollArea, SearchField } from '@repo/ui/components/web';
import styles from './kit-toc.module.css';

export interface KitTableOfContentsProps {
  /** Active component id or section anchor */
  activeId?: string;
  /** Callback when user clicks a link */
  onSelectComponent?: (id: string) => void;
  /** Whether the TOC can be collapsed on smaller screens or in sidebar trays */
  collapsible?: boolean;
  className?: string;
}

/**
 * Reusable, High-Fidelity Table of Contents (TOC) Component
 * Features:
 * - Domain categorization & A-Z sorting
 * - Live fuzzy search filtering with exact match counts
 * - Collapsible category tree with state persistence
 * - In-page active heading highlight / route sync
 * - Quick jump indicators & badges
 */
export function KitTableOfContents({
  activeId,
  onSelectComponent,
  collapsible = true,
  className = '',
}: KitTableOfContentsProps) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'domain' | 'az'>('domain');
  
  // Track collapsed category states
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Filtered and sorted component groups
  const filteredCategories = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();

    let groups = KIT_CATEGORIES.map((cat) => ({
      ...cat,
      components: cat.components.filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.badge?.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.components.length > 0);

    if (sortBy === 'az') {
      groups = groups.map((g) => ({
        ...g,
        components: [...g.components].sort((a, b) => a.name.localeCompare(b.name)),
      }));
    }

    return groups;
  }, [filterQuery, sortBy]);

  const totalResults = useMemo(
    () => filteredCategories.reduce((acc, cat) => acc + cat.components.length, 0),
    [filteredCategories]
  );

  return (
    <nav className={`${styles.tocSidebar} ${className}`} aria-label="Component Directory Table of Contents">
      {/* Header */}
      <div className={styles.tocHeader}>
        <div className={styles.tocHeaderRow}>
          <div className={styles.tocTitleGroup}>
            <span className={styles.tocIcon}>🧭</span>
            <h2 className={styles.tocTitle}>Table of Contents</h2>
          </div>
          <span className={styles.itemCountBadge}>
            {totalResults} items
          </span>
        </div>
      </div>

      {/* Embedded Search Filter */}
      <div className={styles.searchSection}>
        <SearchField
          label="Filter components or specs"
          value={filterQuery}
          onChange={setFilterQuery}
          placeholder="Filter components or specs..."
          resultCount={totalResults}
        />
      </div>

      {/* Sort & Scope Pills Row */}
      <div className={styles.sortBar}>
        <span className={styles.sortLabel}>Sort:</span>
        <button
          type="button"
          className={styles.sortPill}
          data-active={sortBy === 'domain'}
          onClick={() => setSortBy('domain')}
          title="Organize by functional architectural domain"
        >
          📂 Domain
        </button>
        <button
          type="button"
          className={styles.sortPill}
          data-active={sortBy === 'az'}
          onClick={() => setSortBy('az')}
          title="Sort alphabetically A to Z"
        >
          🔤 Alphabetical
        </button>
      </div>

      {/* Interactive Category Tree with Owned Sovereign ScrollArea */}
      <ScrollArea
        orientation="vertical"
        variant="sovereign"
        tone="lamp"
        scrollbarVisibility="always"
        label="Component Categories"
        className={styles.categoryTreeScrollArea}
      >
        <div className={styles.categoryTreeContent}>
          {filteredCategories.length === 0 ? (
            <div className={styles.emptyState}>
              <span>No matching components</span>
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setFilterQuery('')}
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isCollapsed = Boolean(collapsedCategories[cat.id]);

              return (
                <div key={cat.id} className={styles.categoryGroup}>
                  {/* Category Header with Collapse Toggle */}
                  <button
                    type="button"
                    className={styles.categoryHeaderBtn}
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={!isCollapsed}
                  >
                    <div className={styles.categoryHeaderTitle}>
                      <span className={styles.categoryIcon}>{cat.icon}</span>
                      <span className={styles.categoryName}>{cat.title}</span>
                    </div>
                    <div className={styles.categoryHeaderMeta}>
                      <span className={styles.categoryCount}>{cat.components.length}</span>
                      <span className={styles.collapseChevron}>
                        {isCollapsed ? '›' : 'ˇ'}
                      </span>
                    </div>
                  </button>

                  {/* Sub-items */}
                  {!isCollapsed && (
                    <div className={styles.categoryItems}>
                      {cat.components.map((comp) => {
                        const isSelected = activeId === comp.id || (comp.route && pathname === comp.route);
                        const href = comp.route ?? `/kit#${comp.id}`;

                        const handleClick = (e: React.MouseEvent) => {
                          onSelectComponent?.(comp.id);
                          // If targeting an in-page anchor on the current page, perform smooth scroll to it
                          if (href.includes('#')) {
                            const anchorId = href.split('#')[1];
                            if (anchorId) {
                              const targetEl = document.getElementById(anchorId);
                              if (targetEl) {
                                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }
                          }
                        };

                        return (
                          <Link
                            key={comp.id}
                            to={href}
                            className={styles.componentLink}
                            data-active={isSelected}
                            onClick={handleClick}
                          >
                            <span className={styles.componentName}>{comp.name}</span>
                            {comp.badge && (
                              <span className={styles.itemBadge}>{comp.badge}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </nav>
  );
}
