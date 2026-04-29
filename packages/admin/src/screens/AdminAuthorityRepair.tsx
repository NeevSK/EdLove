import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '@repo/core';
import { Box, HStack, Text, VStack } from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';

import { useState } from 'react';
import { commitGuardedRepair, stageGuardedRepair } from '../admin/adminControl';
import { useAdminWorkspaceSnapshot } from '../admin/adminRepository';
import { AdminRoomPanel, AdminRoomShell } from './AdminRoomShell';

export default function AdminAuthorityRepair() {
  const navigation = useNavigation<any>();
  const { snapshot: data } = useAdminWorkspaceSnapshot();
  const { flags } = usePermissions();
  const [preview, setPreview] = useState(() =>
    stageGuardedRepair({
      kind: 'poa',
      title: 'POA scope repair preview',
      summary: 'Stage a narrow repair for role drift or capability mismatch before committing.',
      scope: 'cross-tenant.poa',
      reversible: true,
    }),
  );

  if (!data) return null;

  return (
    <AdminRoomShell
      eyebrow="Authority repair"
      title="Authority integrity"
      description="Repair role drift, capability mismatch, and POA boundary problems across tenants without crossing into tenant-side admin behavior."
      caution="This room should stay narrowly scoped to maintenance. Any repair should be explicit, reversible, and reviewable."
      onBack={() => navigation.goBack()}
      stats={[
        { label: 'Users in scope', value: data.userCount, hint: 'Cross-tenant directory size' },
        {
          label: 'Feature gates',
          value: Object.values(flags).filter(Boolean).length,
          hint: 'Resolved from feature engine',
        },
      ]}
    >
      <VStack className="gap-4">
        <AdminRoomPanel
          title="Repair posture"
          description="Keep the operator in a decision-making mode, not an automatic remediation mode."
        >
          <VStack className="gap-3">
            <Box className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[13px] font-bold text-phaseText-primary">POA integrity</Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                Repair only when role scope, authority, or tenant boundary evidence is clear.
              </Text>
            </Box>
            <Box className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[13px] font-bold text-phaseText-primary">Feature gating</Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                {flags.isUnderMaintenance
                  ? 'Maintenance mode is active, so keep the room read-mostly until the platform is stable.'
                  : 'Admin-only capabilities are enabled; use them only for platform maintenance and repair.'}
              </Text>
            </Box>
            <Box className="rounded-2xl border border-starlightGray/15 bg-white px-4 py-3">
              <Text className="text-[13px] font-bold text-phaseText-primary">Preview</Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                {preview.title}: {preview.summary}
              </Text>
            </Box>
            <HStack className="flex-wrap gap-3">
              <Pressable
                onPress={() =>
                  setPreview(
                    stageGuardedRepair({
                      kind: 'poa',
                      title: 'POA scope repair preview',
                      summary:
                        'Stage a narrow repair for role drift or capability mismatch before committing.',
                      scope: 'cross-tenant.poa',
                      reversible: true,
                    }),
                  )
                }
                className="active:opacity-80"
              >
                <Box className="rounded-full border border-phase-warning/20 bg-phase-warning/10 px-4 py-2">
                  <Text className="text-[12px] font-bold text-phaseText-primary">
                    Stage POA repair
                  </Text>
                </Box>
              </Pressable>
              <Pressable
                onPress={() =>
                  commitGuardedRepair({
                    kind: 'poa',
                    title: 'POA scope repair preview',
                    summary:
                      'Stage a narrow repair for role drift or capability mismatch before committing.',
                    scope: 'cross-tenant.poa',
                    reversible: true,
                  })
                }
                className="active:opacity-80"
              >
                <Box className="rounded-full bg-phase-primary px-4 py-2">
                  <Text className="text-[12px] font-bold text-white">Commit repair</Text>
                </Box>
              </Pressable>
            </HStack>
          </VStack>
        </AdminRoomPanel>
      </VStack>
    </AdminRoomShell>
  );
}
