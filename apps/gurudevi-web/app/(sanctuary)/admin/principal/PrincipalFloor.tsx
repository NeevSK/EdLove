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
import styles from './principal.module.css';
import {
  PrincipalBrief,
  PrincipalCurriculum,
  PrincipalLeaves,
  PrincipalPulse,
} from './principalParts';

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
  const { pendingLeaves } = usePrincipalDomain();

  const isModuleVisible = (id: string) => PRINCIPAL_FURNITURE_ITEMS.some((item) => item.id === id);

  return (
    // A Workspace screen: the shell draws it on the Workspace floor, under the room's strip.
    <>
      {(
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
          {isModuleVisible('pulse') && <PrincipalPulse />}

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
                <PrincipalBrief />
              )}

              {/* Tab: Curriculum Matrix */}
              {activeTab === 'curriculum' && (
                <PrincipalCurriculum />
              )}

              {/* Tab: Staff Leaves */}
              {activeTab === 'leaves' && (
                <PrincipalLeaves />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
