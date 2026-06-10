import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '@repo/core/logic';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';

import { useState } from 'react';
import { commitFeatureGateChanges, stageFeatureGateChanges } from '../admin/adminControl';
import { useAdminWorkspaceSnapshot } from '../admin/adminRepository';
import { AdminRoomPanel, AdminRoomShell } from './AdminRoomShell';

export default function AdminReleaseControl() {
  const navigation = useNavigation<any>();
  const { snapshot: data } = useAdminWorkspaceSnapshot();
  const { flags } = usePermissions();
  const [preview, setPreview] = useState(() =>
    stageFeatureGateChanges([{ key: 'MAINTENANCE_MODE', value: false }], 'platform'),
  );

  if (!data) {
    return null;
  }

  return (
    <AdminRoomShell
      eyebrow="Release control"
      title="Release watch"
      description="Track deployment posture, feature flags, and post-release health for the cross-tenant platform."
      caution="Treat release changes as production changes. If maintenance is active, prefer read-only monitoring and staged rollouts."
      onBack={() => navigation.goBack()}
      stats={[
        {
          label: 'Schools',
          value: data.schoolCount,
          hint: 'Cross-tenant footprint',
        },
        {
          label: 'Feature gates',
          value: Object.values(flags).filter(Boolean).length,
          hint: 'Resolved from feature engine',
        },
        {
          label: 'Signals',
          value: data.recentObservations.length,
          hint: 'Fresh post-release context',
        },
      ]}
    >
      <VStack className="gap-4">
        <AdminRoomPanel
          title="Release posture"
          description="Use this room to verify rollout readiness, not to hide risk."
        >
          <VStack className="gap-3">
            <Box className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[13px] font-bold text-phaseText-primary">Feature flags</Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                {flags.isUnderMaintenance
                  ? 'Maintenance mode is on; keep release control in watch-only posture.'
                  : 'Feature flags are available for controlled rollout and safe platform evolution.'}
              </Text>
            </Box>
            <Box className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[13px] font-bold text-phaseText-primary">
                Post-release health
              </Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                Watch for auth drift, incident spikes, and support pressure after every deployment
                or migration.
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
                    stageFeatureGateChanges([{ key: 'MAINTENANCE_MODE', value: true }], 'platform'),
                  )
                }
                className="active:opacity-80"
              >
                <Box className="rounded-full border border-phase-warning/20 bg-phase-warning/10 px-4 py-2">
                  <Text className="text-[12px] font-bold text-phaseText-primary">
                    Preview maintenance on
                  </Text>
                </Box>
              </Pressable>
              <Pressable
                onPress={() =>
                  setPreview(
                    stageFeatureGateChanges(
                      [{ key: 'MAINTENANCE_MODE', value: false }],
                      'platform',
                    ),
                  )
                }
                className="active:opacity-80"
              >
                <Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                  <Text className="text-[12px] font-bold text-phaseText-primary">
                    Preview maintenance off
                  </Text>
                </Box>
              </Pressable>
              <Pressable
                onPress={() => commitFeatureGateChanges(preview.changes)}
                className="active:opacity-80"
              >
                <Box className="rounded-full bg-phase-primary px-4 py-2">
                  <Text className="text-[12px] font-bold text-white">Commit preview</Text>
                </Box>
              </Pressable>
            </HStack>
          </VStack>
        </AdminRoomPanel>
      </VStack>
    </AdminRoomShell>
  );
}
