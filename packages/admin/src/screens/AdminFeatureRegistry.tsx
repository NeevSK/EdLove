import { View, Text, Pressable } from 'react-native';
import { getAllDomains } from '@repo/core/logic/registry/appCatalog';
import { useFeatureStore } from '@repo/core/store';
import { safeBack } from '@repo/ui/utils/navigation';

import { useMemo, useState } from 'react';
import {
  commitFeatureGateChanges,
  getAdminAuditEntries,
  stageFeatureGateChanges,
} from '@repo/admin/admin/adminControl';
import { AdminRoomPanel, AdminRoomShell } from '@repo/admin/screens/AdminRoomShell';

export default function AdminFeatureRegistry() {
  const catalog = useMemo(() => getAllDomains(), []);
  const flags = useFeatureStore((state) => state.flags);
  const rolloutSnapshot = useFeatureStore((state) => state.snapshot);
  const snapshot = {
    flags,
    snapshot: rolloutSnapshot,
    activeFlagCount: Object.values(flags).filter(Boolean).length,
    maintenanceMode: flags.isUnderMaintenance,
  };
  const [preview, setPreview] = useState(() =>
    stageFeatureGateChanges([{ key: 'isUnderMaintenance', value: false }], 'platform'),
  );
  const auditEntries = useMemo(() => getAdminAuditEntries(), []);

  return (
    <AdminRoomShell
      eyebrow="Registry"
      title="Admin feature registry"
      description="Inspect the admin control surface, the current feature gate posture, and the live maintenance state before staging changes."
      caution="This screen only stages global feature changes and guarded repairs. Commit only after reviewing the preview."
      onBack={() => safeBack('/workspace')}
      stats={[
        {
          label: 'Enabled flags',
          value: snapshot.activeFlagCount,
          hint: 'Resolved from the feature engine',
        },
        {
          label: 'Maintenance',
          value: snapshot.maintenanceMode ? 'on' : 'off',
          hint: 'Global posture',
        },
        {
          label: 'Catalog capabilities',
          value: catalog.length,
          hint: 'Canonical AppCatalog inventory',
        },
      ]}
    >
      <View className="gap-4">
        <AdminRoomPanel
          title="Capability inventory"
          description="AppCatalog is the source of truth for what exists. GrowthBook rollout values only decide who receives a capability."
        >
          <View className="gap-2">
            {catalog.map((entry) => (
              <View
                key={entry.id}
                className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3"
              >
                <View className="flex-row items-center items-center justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-[13px] font-bold text-phaseText-primary">
                      {entry.label}
                    </Text>
                    <Text className="text-[11px] text-phaseText-secondary">
                      {entry.id} · owner: {entry.lifecycle.owner}
                    </Text>
                  </View>
                  <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                    {entry.state}
                  </Text>
                </View>
                <Text className="mt-1 text-[11px] text-phaseText-secondary">
                  {entry.flagKey ?? 'Catalog-only capability'} ·{' '}
                  {entry.lifecycle.flagClass ?? 'no rollout class'}
                </Text>
              </View>
            ))}
          </View>
        </AdminRoomPanel>

        <AdminRoomPanel
          title="Live feature gates"
          description="These are the most important resolved flags for an admin operator."
        >
          <View className="flex-row items-center flex-wrap gap-3">
            {Object.entries(snapshot.flags)
              .filter(([, value]) => typeof value === 'boolean')
              .slice(0, 12)
              .map(([key, value]) => (
                <View
                  key={key}
                  className="min-w-[47%] flex-1 rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3"
                >
                  <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                    {key}
                  </Text>
                  <Text className="mt-1 text-[13px] font-bold text-phaseText-primary">
                    {value ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              ))}
          </View>
        </AdminRoomPanel>

        <AdminRoomPanel
          title="Rollout freshness"
          description="Stale snapshots retain only operational controls; temporary capabilities fail closed until GrowthBook refreshes."
        >
          <View className="flex-row items-center flex-wrap gap-3">
            <View className="min-w-[47%] flex-1 rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                Source
              </Text>
              <Text className="mt-1 text-[13px] font-bold text-phaseText-primary">
                {snapshot.snapshot?.source ?? 'computed'}
              </Text>
            </View>
            <View className="min-w-[47%] flex-1 rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                Freshness
              </Text>
              <Text className="mt-1 text-[13px] font-bold text-phaseText-primary">
                {snapshot.snapshot?.stale ? 'Stale — operational fallback' : 'Fresh'}
              </Text>
            </View>
          </View>
          <Text className="mt-2 text-[11px] text-phaseText-secondary">
            Last refreshed: {snapshot.snapshot?.refreshedAt ?? 'No GrowthBook snapshot yet'}
          </Text>
        </AdminRoomPanel>

        <AdminRoomPanel
          title="Guarded mutation preview"
          description="Stage a change, inspect the preview, then commit deliberately."
        >
          <View className="gap-3">
            <Text className="text-[12px] text-phaseText-secondary">
              {preview.title}: {preview.summary}
            </Text>
            <View className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[12px] font-bold text-phaseText-primary">Affected scope</Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                {preview.affectedScope}
              </Text>
            </View>
            <View className="flex-row items-center flex-wrap gap-3">
              <Pressable
                onPress={() =>
                  setPreview(
                    stageFeatureGateChanges(
                      [{ key: 'isUnderMaintenance', value: true }],
                      'platform',
                    ),
                  )
                }
                className="active:opacity-80"
              >
                <View className="rounded-full border border-phase-warning/20 bg-phase-warning/10 px-4 py-2">
                  <Text className="text-[12px] font-bold text-phaseText-primary">
                    Preview maintenance on
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  setPreview(
                    stageFeatureGateChanges(
                      [{ key: 'isUnderMaintenance', value: false }],
                      'platform',
                    ),
                  )
                }
                className="active:opacity-80"
              >
                <View className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                  <Text className="text-[12px] font-bold text-phaseText-primary">
                    Preview maintenance off
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => commitFeatureGateChanges(preview.changes)}
                className="active:opacity-80"
              >
                <View className="rounded-full bg-phase-primary px-4 py-2">
                  <Text className="text-[12px] font-bold text-white">Queue GrowthBook change</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </AdminRoomPanel>
        <AdminRoomPanel
          title="Mutation history"
          description="The registry should show the operator's recent intent, not just static flags."
        >
          <View className="gap-3">
            {auditEntries.length === 0 ? (
              <Text className="text-[13px] text-phaseText-secondary">
                Audit history is available in the audit room after actions are committed.
              </Text>
            ) : (
              auditEntries.slice(0, 3).map((entry) => (
                <View
                  key={entry.id}
                  className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3"
                >
                  <Text className="text-[13px] font-bold text-phaseText-primary">{entry.name}</Text>
                  <Text className="mt-1 text-[12px] text-phaseText-secondary">{entry.summary}</Text>
                </View>
              ))
            )}
          </View>
        </AdminRoomPanel>
      </View>
    </AdminRoomShell>
  );
}
