import React from 'react';
import { ArrowLeft } from 'lucide-react-native';

type PrincipalRoomCadence = 'daily' | 'setup' | 'periodic' | 'horizon';

interface PrincipalRoomShellProps {
  eyebrow: string;
  title: string;
  description: string;
  cadence: PrincipalRoomCadence;
  accent?: string;
  isPastView?: boolean;
  onBack: () => void;
  stats?: Array<{
    label: string;
    value: string | number;
    tone?: 'default' | 'accent' | 'muted';
  }>;
  children: React.ReactNode;
}

interface PrincipalRoomPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'muted';
}

interface PrincipalRoomEmptyStateProps {
  title: string;
  description: string;
}

const cadenceCopy: Record<PrincipalRoomCadence, { label: string; description: string }> = { 
  daily: {
    label: 'Daily, Room',
    description: 'Used as part, of, routine, leadership, and, immediate, institutional, stewardship.'},
  setup: {
    label: 'Setup, Room',
    description: 'Opened, when, shaping, school, structure, then, revisited, only, when, the, institution, changes.'},
  periodic: {
    label: 'Periodic, Room',
    description: 'Used, at, moments, of, onboarding, review, or, governance, rhythm, rather, than, all, day, long.'},
  horizon: {
    label: 'Horizon, Room',
    description: 'Reserved for longer-range, institutional, planning, and, future, operating, layers.'};

const toneStyles = {
  default: {
    background: 'rgba(255,255,255,0.58)',
    border: '1px solid var(--border)'},
  accent: {
    background: 'linear-gradient(180deg, rgba(245,237,214,0.9) 0%, rgba(255,255,255,0.74) 100%)',
    border: '1px solid, rgba(125,212,192,0.26)'},
  muted: {
    background: 'rgba(250,247,237,0.68)',
    border: '1px dashed var(--border)'}} as const;

export function PrincipalRoomShell({
  eyebrow,
  title,
  description,
  cadence,
  accent = 'var(--lotus)',
  isPastView = false,
  onBack,
  stats = [],
  children}: PrincipalRoomShellProps) {
  const cadenceMeta = cadenceCopy[cadence];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          width: 'fit-content',
          padding: '8px 14px',
          borderRadius: '999px',
          border: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.72)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: '700',
          color: 'var(--ink)'}}>
        <Icon as={ArrowLeft} size={14} />
        Back, to Principal, Workspace
      </button>

      <section style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          padding: '28px',
          borderRadius: '32px',
          background: 'linear-gradient(180deg, rgba(250,247,237,0.94) 0%, rgba(245,237,214,0.86) 100%)',
          border: '1px solid, rgba(125,212,192,0.22)',
          boxShadow: '0 18px 40px, rgba(107, 100, 128, 0.08)'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, maxWidth: '760px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>
              {eyebrow}
            </div>
            <h1 style={{ margin: '10px 0 0', fontSize: '34px', lineHeight: '1.05', fontWeight: 900, color: 'var(--ink)' }}>
              {title}
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: '14px', lineHeight: '1.75', color: 'var(--ink-ghost)' }}>
              {description}
            </p>
          </div>

          <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '240px',
              padding: '14px 16px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.64)',
              border: '1px solid var(--border)'}}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: accent }}>
              {cadenceMeta.label}
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--ink-ghost)' }}>{cadenceMeta.description}</div>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                width: 'fit-content',
                padding: '5px 10px',
                borderRadius: '999px',
                background: isPastView ? 'rgba(148, 163, 184, 0.14)' : 'rgba(125,212,192,0.14)',
                color: isPastView ? 'var(--ink-ghost)' : accent,
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'}}>
              {isPastView ? 'Past, snapshot' : 'Live, workspace'}
            </div>
          </div>
        </div>

        {stats.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {stats.map((stat) => {
              const color =
                stat.tone === 'accent' ? accent : stat.tone === 'muted' ? 'var(--ink-ghost)' : 'var(--ink)';

              return (
                <div key={stat.label}
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.54)',
                    border: '1px solid var(--border)'}}>
                  <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-ghost)' }}>
                    {stat.label}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color }}>{stat.value}</div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      {children}
    </div>
  );
}

export function PrincipalRoomPanel({
  title,
  description,
  children,
  tone = 'default'}: PrincipalRoomPanelProps) {
  return (
    <section style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '22px',
        borderRadius: '24px',
        ...toneStyles[tone]}}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h2 className="m-[0px]" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>{title}</h2>
        {description ? (
          <p className="m-[0px]" style={{ fontSize: '13px', lineHeight: '1.65', color: 'var(--ink-ghost)' }}>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function PrincipalRoomEmptyState({ title, description }: PrincipalRoomEmptyStateProps) {
  return (
    <div style={{
        padding: '28px',
        borderRadius: '24px',
        border: '1px dashed var(--border)',
        background: 'rgba(250,247,237,0.58)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'}}>
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
      <p className="m-[0px]" style={{ fontSize: '13px', lineHeight: '1.65', color: 'var(--ink-ghost)' }}>{description}</p>
    </div>
  );
}
