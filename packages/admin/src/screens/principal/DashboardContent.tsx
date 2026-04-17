import React from 'react';
import { Icon, useTranslation } from 'react-i18next';
import { Building2, LayoutGrid, NotebookPen, Share2 } from 'lucide-react-native';
import type { PublishedSchoolGradingCompletion } from '@repo/core';
import {
  getPrincipalCapabilitiesByZone,
  type PrincipalWorkspaceView} from '../../principal/workspace';
import { WebScreenHeader } from '@repo/ui';
import { getPrincipalFeatureScopeMeta } from './PrincipalIAScope';

export interface DashboardContentProps {
  school: any;
  user: any;
  stats: any;
  presence: any;
  resonanceScore: number;
  pulse: any;
  echoItems: any[];
  teachers: any[];
  studentPulse: any;
  atRiskCount: number;
  pendingLeaves: any[];
  calendarEvents: any[];
  schoolTopology: any;
  topologyLoading: boolean;
  staffLoading: boolean;
  curriculumProgress: any[];
  resourceNeeds: any[];
  publishedGradingCompletion?: PublishedSchoolGradingCompletion | null;
  isPastView: boolean;
  onNavigate: (view: PrincipalWorkspaceView) => void;
  onAddStaff: () => void;
  onAddClassroom: () => void;
  onMarkEchoRead: (id: string) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onShowAtRisk: () => void;
  onAddAction: (featureId: string) => void;
  onHistoryAction: (featureId: string) => void;
  onNavigateToProfile: () => void;
  onOpenCommons: () => void;
  observations: any[];
  renderTodayZone?: (context: { schoolId: string; principalId: string } & Pick<DashboardContentProps, 'studentPulse' | 'atRiskCount' | 'onShowAtRisk'>) => React.ReactNode;
  renderInstitutionZone?: (context: { schoolId: string; principalId: string }) => React.ReactNode;
  renderOutlookZone?: (context: { schoolId: string; principalId: string }) => React.ReactNode;
}

function ZoneShell({
  title,
  subtitle,
  count,
  children}: {
  title: string;
  subtitle: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minWidth: 0,
        background: 'rgba(250, 247, 237, 0.55)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '20px'}}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--ink)' }}>{title}</h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: '1.6', color: 'var(--ink-ghost)' }}>{subtitle}</p>
        </div>
        <div
          style={{
            flexShrink: 0,
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'var(--background)',
            color: 'var(--ink-ghost)',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'}}
        >
          {count} modules
        </div>
      </div>
      {children}
    </section>
  );
}

export function DashboardContent({
  school,
  user,
  publishedGradingCompletion,
  studentPulse,
  atRiskCount,
  onNavigate,
  onNavigateToProfile,
  onOpenCommons,
  onShowAtRisk,
  renderTodayZone,
  renderInstitutionZone,
  renderOutlookZone}: DashboardContentProps) {
  const { t } = useTranslation();
  const schoolId = school?.id ?? '';
  const principalId = user?.id ?? '';

  const renderScopeBadge = (featureId: string) => {
    const scopeMeta = getPrincipalFeatureScopeMeta(featureId);
    if (!scopeMeta) return null;

    return (
      <span
        title={t(scopeMeta.scopeHelpTextKey)}
        style={{
          fontSize: '10px',
          fontWeight: 800,
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: '999px',
          background: 'var(--background-alt)',
          color: 'var(--ink-ghost)',
          letterSpacing: '0.4px'}}
      >
        {t(scopeMeta.scopeBadgeLabelKey)}
      </span>
    );
  };

  const todayCount = getPrincipalCapabilitiesByZone('today', 'live').length;
  const institutionCount = getPrincipalCapabilitiesByZone('institution', 'live').length;
  const outlookCount = getPrincipalCapabilitiesByZone('outlook').filter((capability) => capability.status !== 'hidden').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '64px' }}>
      <WebScreenHeader
        title={<>Principal <span style={{ color: 'var(--lotus)' }}>Workspace</span>.</>}
        note={`Balanced cockpit for ${school?.name || 'your school'}: operate today, govern the institution, and prepare the next layers.`}
        timeText={school?.name || 'Sri Lankan School Leadership'}
        actions={(
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="secondary-button"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={onNavigateToProfile}
            >
              <Building2 size={18} /> {t('principal.ia.actions.profileCta') || 'Institution Profile'}
              {renderScopeBadge('school_profile')}
            </button>
            <button
              className="secondary-button"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--water)', borderColor: 'var(--water)' }}
              onClick={onOpenCommons}
            >
              <Icon as={Share}2 size={18} /> {t('principal.ia.actions.commonsCta') || 'Open Community Commons'}
              {renderScopeBadge('open_commons')}
            </button>
          </div>
        )}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'}}
      >
        <ZoneShell
          title="Today"
          subtitle="Situational awareness, urgent operations, and the few things that cannot wait."
          count={todayCount}
        >
          {renderTodayZone?.({ schoolId, principalId, studentPulse, atRiskCount, onShowAtRisk })}
        </ZoneShell>

        <ZoneShell
          title="Institution"
          subtitle="The official work of shaping the school, its structure, and its institutional memory."
          count={institutionCount}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px'}}
          >
            <button
              className="secondary-button"
              onClick={() => onNavigate('hierarchy')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon as={Layout}Grid size={16} /> Shape structure
              </span>
              {renderScopeBadge('hierarchy')}
            </button>
            <button
              className="secondary-button"
              onClick={() => onNavigate('invites')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} /> Role invites
              </span>
              {renderScopeBadge('invites')}
            </button>
            <button
              className="secondary-button"
              onClick={() => onNavigate('notes')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NotebookPen size={16} /> Open logbook
              </span>
              {renderScopeBadge('log')}
            </button>
          </div>
          {renderInstitutionZone?.({ schoolId, principalId })}
        </ZoneShell>

        <ZoneShell
          title="Outlook"
          subtitle="Aggregated patterns, community signals, and the ERP families this workspace is preparing to hold."
          count={outlookCount}
        >
          {publishedGradingCompletion && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'rgba(250,247,237,0.72)',
                color: 'var(--ink-ghost)',
                fontSize: '12px',
                lineHeight: '1.6'}}
            >
              Published grading is live in {publishedGradingCompletion.classroomsWithPublishedGrades} of {publishedGradingCompletion.totalClassrooms} classrooms.
            </div>
          )}
          {renderOutlookZone?.({ schoolId, principalId })}
        </ZoneShell>
      </div>
    </div>
  );
}
