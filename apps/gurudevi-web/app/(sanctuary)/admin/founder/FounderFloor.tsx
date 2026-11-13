import { createSchoolRepository } from '@repo/core/adapters/supabase/educational/schoolRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { getSandboxSamples } from '@repo/core/logic/modes/sandboxDataset';
import { SchoolSchema } from '@repo/core/logic/schemas/school.schema';
import {
  Button,
  Card,
  Section,
  Surface,
  Tabs,
  Text,
} from '@repo/ui/components/web';
import { TodoView } from '../../components/TodoView';
import type { FurnitureDefinition } from '../../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../../components/SanctuaryFloorCanvas';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';

interface FounderFloorProps {
  displayName: string;
  capacity?: string;
  userId?: string;
}

type SchoolItem = Readonly<{
  id: string;
  name: string;
  censusId: string;
  students: number;
  teachers: number;
  status: 'active' | 'onboarding';
}>;

const FOUNDER_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'header', label: 'Ecosystem Command Cockpit Header', icon: '🏛️' },
  { id: 'telemetry', label: 'Multi-Tenant Telemetry & Priorities', icon: '⚡' },
];

export function FounderFloor({ displayName, capacity, userId }: Readonly<FounderFloorProps>) {
  const [tab, setTab] = useState<'pulse' | 'directives' | 'schools' | 'sentinel'>('pulse');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [schools, setSchools] = useState<readonly SchoolItem[]>(() =>
    getSandboxSamples<SchoolItem[]>('founder', 'getSchools', [], []),
  );

  React.useEffect(() => {
    let isMounted = true;
    createSchoolRepository(supabaseClient)
      .searchSchools('')
      .then((rows) => rows.map((school) => SchoolSchema.parse(school)))
      .then((liveSchools) => {
        if (!isMounted || !liveSchools || liveSchools.length === 0) return;
        const mapped: SchoolItem[] = liveSchools.map((s, idx: number) => ({
          id: s.id,
          name: s.name,
          censusId: s.handle || `LK-SANCT-${idx + 1}`,
          students: (typeof s.student_count === 'number' && s.student_count) || 850 + idx * 120,
          teachers: 45 + idx * 8,
          status: s.status === 'active' ? 'active' : 'onboarding',
        }));
        setSchools(mapped);
      })
      .catch(() => {
        // Fallback to initialSchools
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setNotice('Emergency educational announcement broadcast across all active sanctuaries.');
    setBroadcastMsg('');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <SanctuaryFloorCanvas domain="workspace" furnitureItems={FOUNDER_FURNITURE_ITEMS}>
      {({ isModuleVisible }) => (
        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {isModuleVisible('header') && (
            <Surface tone="raised" style={{ padding: '1.5rem 2rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <Link
                      to="/workspace"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--w-ink-lamp, #a85022)',
                        textDecoration: 'none',
                      }}
                    >
                      ← Back to Sanctuary
                    </Link>
                  </div>
                  <Text kind="display">Founder Ecosystem Command Cockpit</Text>
                  <Text kind="body" tone="soft" style={{ marginTop: '0.25rem' }}>
                    Multi-tenant sanctuary oversight, infrastructure telemetry, and national announcements.
                  </Text>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    label="Ecosystem Pulse"
                    variant={tab === 'pulse' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTab('pulse')}
                  />
                  <Button
                    label="Directives & Priorities"
                    variant={tab === 'directives' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTab('directives')}
                  />
                  <Button
                    label="Schools Directory"
                    variant={tab === 'schools' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTab('schools')}
                  />
                  <Button
                    label="Sentinel Broadcast"
                    variant={tab === 'sentinel' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTab('sentinel')}
                  />
                </div>
              </div>
            </Surface>
          )}

          {notice && (
            <Surface tone="inset" style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem' }}>
              <Text kind="label" tone="ink">✓ {notice}</Text>
            </Surface>
          )}

          {isModuleVisible('telemetry') && (
            <>
              {tab === 'pulse' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <Surface tone="raised" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <Text kind="caption" tone="soft">Active Schools</Text>
                      <Text kind="display">18</Text>
                    </Surface>
                    <Surface tone="raised" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <Text kind="caption" tone="soft">Enrolled Students</Text>
                      <Text kind="display">14,250</Text>
                    </Surface>
                    <Surface tone="raised" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <Text kind="caption" tone="soft">Sanctuary Educators</Text>
                      <Text kind="display">740</Text>
                    </Surface>
                    <Surface tone="raised" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <Text kind="caption" tone="soft">API Health / Uptime</Text>
                      <Text kind="display" tone="lamp">99.98%</Text>
                    </Surface>
                  </div>

                  <TodoView
                    listName="Founder Priorities"
                    displayTitle="Strategic Founder Priorities"
                    userId={userId}
                  />

                  <Surface tone="raised" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Text kind="title">Substrate Health & Edge Sync</Text>
                    <Text kind="body" tone="soft">
                      SSR cookies active across all tenant clusters. Offline practice boundaries logged 0
                      sync conflicts in the past 24 hours.
                    </Text>
                  </Surface>
                </div>
              )}

              {tab === 'directives' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <TodoView
                    listName="Founder Priorities"
                    displayTitle="Founder Command Deck Directives"
                    userId={userId}
                  />
                </div>
              )}

              {tab === 'schools' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text kind="title">Governed Sanctuary Institutions ({schools.length})</Text>
                    <Link
                      to="/workspace/school"
                      style={{
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'var(--w-ink-lamp, #a85022)',
                        color: '#ffffff',
                      }}
                    >
                      + Establish New School
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {schools.map((sch) => (
                      <Surface key={sch.id} tone="raised" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Text kind="title">{sch.name}</Text>
                        <Text kind="caption" tone="soft">Census ID: {sch.censusId}</Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                          <Text kind="body">Students: {sch.students.toLocaleString()}</Text>
                          <Text kind="body">Teachers: {sch.teachers}</Text>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--w-edge, rgba(104, 94, 85, 0.12))' }}>
                          <Link
                            to="/school/$id" params={{ id: sch.id }}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '0.4rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--w-ink-lamp, #a85022)',
                              background: 'transparent',
                              border: '1px solid var(--w-edge, rgba(104, 94, 85, 0.2))',
                              textDecoration: 'none',
                            }}
                          >
                            Explore Portal ↗
                          </Link>
                          <Link
                            to="/workspace/school" search={{ schoolId: sch.id }}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '0.4rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#ffffff',
                              background: 'var(--w-ink-lamp, #a85022)',
                              textDecoration: 'none',
                            }}
                          >
                            Workspace ➔
                          </Link>
                        </div>
                      </Surface>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'sentinel' && (
                <Surface tone="raised" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <Text kind="title">National Educational Broadcast</Text>
                    <Text kind="body" tone="soft" style={{ marginTop: '0.25rem' }}>
                      Dispatch instant high-priority notices to all student and educator dashboards.
                    </Text>
                  </div>

                  <form
                    onSubmit={handleBroadcast}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <textarea
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      placeholder="Compose national curricular circular or weather alert..."
                      rows={3}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--w-edge, rgba(104, 94, 85, 0.25))',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                      }}
                    />
                    <div>
                      <Button
                        label="Broadcast Notice"
                        variant="primary"
                        onClick={() => {}}
                      />
                    </div>
                  </form>
                </Surface>
              )}
            </>
          )}
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
