'use client';

import { useState } from 'react';
import * as webKit from '@repo/ui/components/web';
import { Check, ChevronDown, Globe } from 'lucide-react';
import styles from './language-exhibition.module.css';

interface LanguageExhibitionProps {
  currentLang: string;
  onSelectLang: (code: string) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', shortLabel: 'සි' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', shortLabel: 'த' },
] as const;

export function LanguageExhibition({ currentLang, onSelectLang }: LanguageExhibitionProps) {
  // Dropdown state for Pattern 1 (LanguageToggle)
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div id="language-exhibition" className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitleRow}>
          <webKit.Text kind="title">Language Selector Exhibition &amp; Audit Arena</webKit.Text>
          <span className={styles.badge}>Live Inspection</span>
        </div>
        <webKit.Text kind="body" tone="soft">
          Compare all existing patterns across the codebase side-by-side in real-time under the active World, Mode, and Phase.
          Testing how each pattern behaves in tight spaces (e.g. mobile headers vs settings floors).
        </webKit.Text>
      </div>

      <div className={styles.grid}>
        {/* UNIFIED KIT COMPONENT: LanguagePicker with Capsule & Dropdown */}
        <div className={`${styles.card} ${styles.cardFullWidth}`} style={{ borderColor: 'var(--w-lamp, #f59e0b)' }}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.patternNum} style={{ color: 'var(--w-lamp, #f59e0b)' }}>Unified UI-Kit Component</span>
              <h3 className={styles.patternTitle}>@repo/ui/components/web LanguagePicker</h3>
              <p className={styles.patternPath}>packages/ui/src/components/web/LanguagePicker/LanguagePicker.tsx</p>
            </div>
            <span className={styles.seamTag} style={{ background: 'color-mix(in srgb, var(--w-lamp) 20%, transparent)', color: 'var(--w-lamp)' }}>
              Canonical Invariant
            </span>
          </div>
          <div className={styles.critiqueBox}>
            <strong>Architectural Convergence:</strong> Implements <code>LanguagePickerContract</code> with 100% World Theme tokens (<code>var(--w-sunken)</code>, <code>var(--w-lamp)</code>, <code>var(--w-settle)</code>). Supports both <strong>Capsule</strong> (Pattern 2) for spacious headers and <strong>Dropdown</strong> (Pattern 1) for compact viewports, plus <code>variant="auto"</code> with container-query driven degradation.
          </div>
          <div className={styles.stage} style={{ gap: '28px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--w-ink-soft)' }}>variant="capsule" (Medium/Spacious)</span>
                <webKit.LanguagePicker
                  value={currentLang as 'en' | 'si' | 'ta'}
                  onChange={onSelectLang}
                  variant="capsule"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--w-ink-soft)' }}>variant="dropdown" (Compact/Header)</span>
                <webKit.LanguagePicker
                  value={currentLang as 'en' | 'si' | 'ta'}
                  onChange={onSelectLang}
                  variant="dropdown"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PATTERN 1: Accessible Dropdown (from LanguageToggle.tsx) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.patternNum}>Pattern 1</span>
              <h3 className={styles.patternTitle}>Accessible Dropdown (Popout)</h3>
              <p className={styles.patternPath}>apps/gurudevi-web/app/(sanctuary)/components/LanguageToggle.tsx</p>
            </div>
            <span className={styles.seamTag}>Web Sanctuary &amp; Auth</span>
          </div>
          <div className={styles.critiqueBox}>
            <strong>UX Trade-off:</strong> Takes minimal initial horizontal space (compact pill button), but opens an overlay popover. Requires click/dismiss handling and keyboard navigation traps.
          </div>
          <div className={styles.stage}>
            <div className={styles.toggleWrapper}>
              <button
                type="button"
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                className={styles.toggleButton}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <Globe className="w-3.5 h-3.5 opacity-70 shrink-0" aria-hidden="true" />
                <span className={styles.langCode}>{currentLang.toUpperCase()}</span>
                <ChevronDown
                  className={`w-3 h-3 opacity-60 shrink-0 transition-transform duration-150 ${
                    dropdownOpen ? styles.rotate180 : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {dropdownOpen && (
                <ul className={styles.dropdown} role="listbox">
                  {LANGUAGES.map((l) => {
                    const isSelected = l.code === currentLang;
                    return (
                      <li
                        key={l.code}
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={0}
                        className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          onSelectLang(l.code);
                          setDropdownOpen(false);
                        }}
                      >
                        <div className={styles.langNameRow}>
                          <span className={styles.nativeText}>{l.nativeLabel}</span>
                          {l.code !== 'en' && <span className={styles.secondaryLabel}>{l.label}</span>}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* PATTERN 2: Capsule Pill Switcher (from LanguageSwitcher.tsx) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.patternNum}>Pattern 2</span>
              <h3 className={styles.patternTitle}>Capsule Segmented Pill</h3>
              <p className={styles.patternPath}>packages/ui/src/components/LanguageSwitcher.tsx (SanctuaryWelcomeScreen)</p>
            </div>
            <span className={styles.seamTag}>Welcome &amp; Mobile Onboarding</span>
          </div>
          <div className={styles.critiqueBox}>
            <strong>UX Trade-off:</strong> Zero clicks to see options; instant 1-tap switch. However, takes fixed horizontal width (~120px) which can collide with headers in narrow viewports.
          </div>
          <div className={styles.stage}>
            <div className={styles.capsuleGroup}>
              {LANGUAGES.map((l) => {
                const isActive = currentLang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => onSelectLang(l.code)}
                    className={`${styles.capsuleBtn} ${isActive ? styles.capsuleBtnActive : ''}`}
                    aria-pressed={isActive}
                  >
                    {l.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PATTERN 3: Marketing Header Inline Segmented Buttons */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.patternNum}>Pattern 3</span>
              <h3 className={styles.patternTitle}>Inline Header Segment</h3>
              <p className={styles.patternPath}>apps/gurudevi-web/app/(marketing)/MarketingHeader.tsx</p>
            </div>
            <span className={styles.seamTag}>Marketing &amp; Public Landing</span>
          </div>
          <div className={styles.critiqueBox}>
            <strong>UX Trade-off:</strong> Clean, minimal desktop look with short glyphs (EN, සි, த). Hidden on mobile (sm:flex) because of navigation collision.
          </div>
          <div className={styles.stage}>
            <div className={styles.marketingHeaderGroup}>
              {LANGUAGES.map((l) => {
                const isActive = currentLang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => onSelectLang(l.code)}
                    className={`${styles.marketingBtn} ${isActive ? styles.marketingBtnActive : ''}`}
                    aria-pressed={isActive}
                  >
                    {l.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PATTERN 4: Footer Dot-Separated Text Links */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.patternNum}>Pattern 4</span>
              <h3 className={styles.patternTitle}>Inline Colophon Links (Footer)</h3>
              <p className={styles.patternPath}>apps/gurudevi-web/app/(marketing)/MarketingFooter.tsx</p>
            </div>
            <span className={styles.seamTag}>Public SEO &amp; Colophon</span>
          </div>
          <div className={styles.critiqueBox}>
            <strong>UX Trade-off:</strong> Native textual links with full native script labels (English · සිංහල · தமிழ்). Great for SEO and footer semantics, but not suited for interactive app toolbars.
          </div>
          <div className={styles.stage}>
            <div className={styles.footerLinksGroup}>
              {LANGUAGES.map((l, idx) => (
                <span key={l.code} className={styles.footerLinkItem}>
                  {idx > 0 && <span className={styles.footerDivider}>·</span>}
                  <button
                    type="button"
                    onClick={() => onSelectLang(l.code)}
                    className={`${styles.footerBtn} ${currentLang === l.code ? styles.footerBtnActive : ''}`}
                    lang={l.code}
                  >
                    {l.nativeLabel}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PATTERN 5: Settings Floor Option Cards */}
        <div className={`${styles.card} ${styles.cardFullWidth}`}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.patternNum}>Pattern 5</span>
              <h3 className={styles.patternTitle}>Rich Domain Option Cards</h3>
              <p className={styles.patternPath}>apps/gurudevi-web/app/(sanctuary)/settings/SettingsFloor.tsx</p>
            </div>
            <span className={styles.seamTag}>Sanctuary Settings &amp; Preferences</span>
          </div>
          <div className={styles.critiqueBox}>
            <strong>UX Trade-off:</strong> Rich educational metadata explaining the curriculum and regional context for each language. High visual hierarchy, designed specifically for dedicated settings surfaces rather than compact navigation bars.
          </div>
          <div className={styles.stage}>
            <div className={styles.optionsGrid}>
              <button
                type="button"
                className={styles.optionCard}
                data-selected={currentLang === 'en'}
                onClick={() => onSelectLang('en')}
              >
                <span className={styles.optionLabel}>English</span>
                <span className={styles.optionSub}>Gurudevi Global Edition</span>
              </button>
              <button
                type="button"
                className={styles.optionCard}
                data-selected={currentLang === 'si'}
                onClick={() => onSelectLang('si')}
              >
                <span className={styles.optionLabel}>සිංහල (Sinhala)</span>
                <span className={styles.optionSub}>ශ්‍රී ලංකා ජාතික විෂය නිර්දේශය</span>
              </button>
              <button
                type="button"
                className={styles.optionCard}
                data-selected={currentLang === 'ta'}
                onClick={() => onSelectLang('ta')}
              >
                <span className={styles.optionLabel}>தமிழ் (Tamil)</span>
                <span className={styles.optionSub}>இலங்கை தேசிய பாடத்திட்டம்</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
