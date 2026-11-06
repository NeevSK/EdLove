'use client';

import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import {
  Button,
  Chip,
  Section,
  Surface,
  Text,
} from '@repo/ui/components/web';
import type { FurnitureDefinition } from '../../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../../components/SanctuaryFloorCanvas';
import styles from './principal.module.css';

import {
  type CurriculumProgress,
  type PendingStaffLeave as PendingLeave,
  usePrincipalDomain,
} from '@/lib/domain/principalDomain';

const PRINCIPAL_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'header', label: 'Executive Intelligence & Action Header', icon: '🏛️' },
  { id: 'pulse', label: 'Operational Campus Pulse Ribbon', icon: '📈' },
  { id: 'tabs', label: 'Executive Navigation (Brief, Curriculum, Leaves)', icon: '📑' },
  { id: 'dossier', label: 'Detailed Operational Ledger Panel', icon: '📋' },
];

export function PrincipalFloor({
  displayName = 'Principal',
  isExplore = false,
}: Readonly<{
  displayName?: string;
  isExplore?: boolean;
}>): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'brief' | 'curriculum' | 'leaves'>('brief');
  const { curriculumData, pendingLeaves, reviewLeave } = usePrincipalDomain();
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleReviewLeave = (id: string, decision: 'approved' | 'rejected') => {
    void reviewLeave(id, decision);
    setActionNotice(`Leave application ${id} ${decision}.`);
  };

  return (
    <SanctuaryFloorCanvas domain="workspace" furnitureItems={PRINCIPAL_FURNITURE_ITEMS}>
      {({ isModuleVisible }) => (
        <div className={styles.container}>
          {isModuleVisible('header') && (
            <Surface tone="raised" className={styles.header}>
              <div>
                <Text kind="caption" tone="soft" className={styles.eyebrow}>Institutional Executive Leadership</Text>
                <Text kind="title" tone="ink" className={styles.title}>Principal Command Center</Text>
                <Text kind="body" tone="soft" className={styles.subtitle}>
                  Morning situational intelligence, pedagogical governance, and institutional faculty oversight.
                </Text>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/workspace/workforce" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="md" label="👥 Workforce Roster" />
                </Link>
                <Link href="/admin/analytics" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="md" label="📈 Campus Analytics" />
                </Link>
              </div>
            </Surface>
          )}

          {/* Operational Pulse Ribbon */}
          {isModuleVisible('pulse') && (
            <section className={styles.pulseGrid} aria-label="Campus Pulse">
              <Surface tone="raised" className={styles.pulseCard}>
                <span className={styles.pulseLabel}>Student Census</span>
                <span className={styles.pulseValue}>1,428</span>
                <span className={styles.pulseHint}>94.2% daily presence</span>
              </Surface>
              <Surface tone="raised" className={styles.pulseCard}>
                <span className={styles.pulseLabel}>Active Faculty</span>
                <span className={styles.pulseValue}>74 / 76</span>
                <span className={styles.pulseHint}>2 on sanctioned leave</span>
              </Surface>
              <Surface tone="raised" className={styles.pulseCard}>
                <span className={styles.pulseLabel}>Curriculum Pace</span>
                <span className={styles.pulseValue}>76.8%</span>
                <span className={styles.pulseHint}>Target: 75% for Week 9</span>
              </Surface>
              <Surface tone="raised" className={styles.pulseCard}>
                <span className={styles.pulseLabel}>Disciplinary Solv.</span>
                <span className={styles.pulseValue}>98.5%</span>
                <span className={styles.pulseHint}>0 critical incidents</span>
              </Surface>
            </section>
          )}

          {actionNotice && (
            <div
              aria-live="polite"
              style={{
                background: 'rgba(59, 123, 50, 0.1)',
                border: '1px solid var(--w-line, #ded8cf)',
                color: 'var(--w-ink-lamp, #2e5d32)',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              ✓ {actionNotice}
            </div>
          )}

          {/* View Mode Navigation */}
          {isModuleVisible('tabs') && (
            <nav className={styles.tabBar} aria-label="Command Center Views">
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'brief' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('brief')}
              >
                <Layers size={18} />
                Morning Executive Intelligence
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'curriculum' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('curriculum')}
              >
                <GraduationCap size={18} />
                Curriculum Progression Matrix
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'leaves' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('leaves')}
              >
                <Clock size={18} />
                Staff Sanction & Leaves ({pendingLeaves.length})
              </button>
            </nav>
          )}

          {/* Ledger Content */}
          {isModuleVisible('dossier') && (
            <>
              {/* Tab: Brief */}
              {activeTab === 'brief' && (
                <section className={styles.section}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))', gap: '1.25rem' }}>
                    <Surface tone="raised" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '1rem' }}>
                      <Text kind="title" tone="ink">Morning Situational Assessment</Text>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--w-ink-soft, #453c35)' }}>
                        <li>Grade 10 Sinhala Literature Mid-Year examinations commence at 08:30 in Main Hall.</li>
                        <li>Western Province Educational Zonal inspector scheduled for 11:00 curriculum review.</li>
                        <li>Water filtration maintenance scheduled for Building 3 laboratories after school hours.</li>
                      </ul>
                    </Surface>

                    <Surface tone="raised" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '1rem' }}>
                      <Text kind="title" tone="ink">Curricular Alert Flags</Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(217, 119, 6, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #d97706' }}>
                          <Text kind="label" tone="lamp" style={{ fontWeight: 700 }}>Grade 11 Mathematics (Section C)</Text>
                          <Text kind="caption" tone="soft">Pacing lagging 4 periods behind target syllabus milestone.</Text>
                        </div>
                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(59, 123, 50, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #16a34a' }}>
                          <Text kind="label" tone="lamp" style={{ fontWeight: 700 }}>Science & Technology Society</Text>
                          <Text kind="caption" tone="soft">National Olympiad delegation secured 4 gold commendations.</Text>
                        </div>
                      </div>
                    </Surface>
                  </div>
                </section>
              )}

              {/* Tab: Curriculum Matrix */}
              {activeTab === 'curriculum' && (
                <section className={styles.section}>
                  <div className={styles.curriculumGrid}>
                    {curriculumData.map((curr) => (
                      <Surface key={`${curr.grade}-${curr.subject}`} tone="raised" className={styles.curriculumCard}>
                        <div className={styles.currHeader}>
                          <Text kind="title" tone="ink" className={styles.currGrade}>{curr.grade} · {curr.subject}</Text>
                          <span className={styles.currPercentage}>{curr.completionPercent}% Done</span>
                        </div>
                        <div className={styles.progressBarBg}>
                          <div
                            className={styles.progressBarFill}
                            style={{ width: `${curr.completionPercent}%` }}
                          />
                        </div>
                        <Text kind="caption" tone="soft" className={styles.currDetails}>
                          Status: {curr.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </Surface>
                    ))}
                  </div>
                </section>
              )}

              {/* Tab: Staff Leaves */}
              {activeTab === 'leaves' && (
                <section className={styles.section}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingLeaves.length === 0 ? (
                      <Surface tone="raised" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
                        <CheckCircle2 size={36} color="var(--w-ink-lamp, #16a34a)" style={{ margin: '0 auto 0.75rem' }} />
                        <Text kind="title" tone="ink">No Pending Faculty Leaves</Text>
                        <Text kind="caption" tone="soft">All staff absence applications have been fully reviewed.</Text>
                      </Surface>
                    ) : (
                      pendingLeaves.map((leave) => (
                        <Surface
                          key={leave.id}
                          tone="raised"
                          style={{
                            padding: '1.25rem 1.5rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                          }}
                        >
                          <div className={styles.leaveMeta}>
                            <Text kind="title" tone="ink" className={styles.leaveName}>{leave.staffName}</Text>
                            <Text kind="caption" tone="lamp" style={{ margin: 0 }}>
                              {leave.role} • {leave.type} Leave
                            </Text>
                            <Text kind="caption" tone="soft" className={styles.leaveDates}>
                              Duration: {leave.duration} • Nominated Substitute: {leave.substitute}
                            </Text>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                              variant="danger"
                              size="sm"
                              label="✕ Decline"
                              onClick={() => handleReviewLeave(leave.id, 'rejected')}
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              label="✓ Authorize"
                              onClick={() => handleReviewLeave(leave.id, 'approved')}
                            />
                          </div>
                        </Surface>
                      ))
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
