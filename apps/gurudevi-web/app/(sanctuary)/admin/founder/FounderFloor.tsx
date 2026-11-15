'use client';

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
import Link from 'next/link';
import React, { useState } from 'react';
import { FounderBroadcast, FounderPulse, FounderSchools } from './founderParts';

interface FounderFloorProps {
  displayName: string;
  capacity?: string;
  userId?: string;
}

const FOUNDER_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'header', label: 'Ecosystem Command Cockpit Header', icon: '🏛️' },
  { id: 'telemetry', label: 'Multi-Tenant Telemetry & Priorities', icon: '⚡' },
];

export function FounderFloor({ displayName, capacity, userId }: Readonly<FounderFloorProps>) {
  const [tab, setTab] = useState<'pulse' | 'directives' | 'schools' | 'sentinel'>('pulse');
  const isModuleVisible = (id: string) => FOUNDER_FURNITURE_ITEMS.some((item) => item.id === id);

  return (
    // A Workspace screen: the shell draws it on the Workspace floor, under the room's strip.
    <>
      {(
        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {isModuleVisible('header') && (
            <Surface tone="raised" style={{ padding: '1.5rem 2rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <Link
                      href="/workspace"
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

          {isModuleVisible('telemetry') && (
            <>
              {tab === 'pulse' && (
                <FounderPulse userId={userId} />
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
                <FounderSchools />
              )}

              {tab === 'sentinel' && (
                <FounderBroadcast />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
