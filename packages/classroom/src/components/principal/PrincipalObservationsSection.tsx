/**
 * PrincipalObservationsSection
 *
 * Compact observation notes widget:
 *  - Last 5 observations with type badge, content, date
 *  - Inline new-observation form
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity, TextInput } from 'react-native';
import { Box, HStack, VStack, Text, SkeletonCard, useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { supabase } from '@repo/core';

interface Observation {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

interface PrincipalObservationsSectionProps {
  schoolId: string;
  principalId: string;
}

const OBS_TYPE_COLORS: Record<string, string> = {
  walkthrough: Theme.colors.gurudeviBlue ?? '#2196f3',
  note: Theme.colors.textMuted ?? '#9e9e9e',
  concern: Theme.colors.roseQuartz ?? '#f44336',
  praise: Theme.colors.sage ?? '#4caf50',
};

const OBS_TYPE_OPTIONS = ['walkthrough', 'note', 'concern', 'praise'];

function obsBadgeColor(type: string): string {
  return OBS_TYPE_COLORS[type] ?? (Theme.colors.textMuted ?? '#9e9e9e');
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PrincipalObservationsSection({
  schoolId,
  principalId,
}: PrincipalObservationsSectionProps) {
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [content, setContent] = useState('');
  const [obsType, setObsType] = useState('note');

  async function fetchObservations() {
    const { data } = await supabase
      .from('principal_observations')
      .select('*')
      .eq('principal_id', principalId)
      .order('created_at', { ascending: false })
      .limit(5);
    setObservations((data ?? []) as Observation[]);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    supabase
      .from('principal_observations')
      .select('*')
      .eq('principal_id', principalId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (mounted) {
          setObservations((data ?? []) as Observation[]);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [principalId]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('principal_observations').insert({
      school_id: schoolId,
      principal_id: principalId,
      type: obsType,
      content: content.trim(),
    });
    setSaving(false);
    if (!error) {
      setContent('');
      setObsType('note');
      setShowForm(false);
      await fetchObservations();
    }
  }

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Theme.corners.medium ?? 8,
    padding: Theme.spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 14,
    marginBottom: Theme.spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top' as const,
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.surface,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Theme.spacing.md,
      }}
    >
      {/* Header */}
      <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.sm }}>
        <Text sx={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
          📝 Observation Notes
        </Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} activeOpacity={0.8}>
          <Box
            sx={{
              backgroundColor: Theme.colors.sanctuarySaffron ?? '#ff9800',
              borderRadius: Theme.corners.medium ?? 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>+ New</Text>
          </Box>
        </TouchableOpacity>
      </HStack>

      {/* Loading */}
      {loading && <SkeletonCard height={60} />}

      {/* Empty state */}
      {!loading && observations.length === 0 && (
        <Text sx={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: Theme.spacing.md }}>
          No observations yet. Start your first classroom walkthrough note.
        </Text>
      )}

      {/* Observation rows */}
      {!loading && observations.map((obs) => (
        <VStack
          key={obs.id}
          sx={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 }}
        >
          <HStack sx={{ alignItems: 'center', gap: Theme.spacing.sm }}>
            <Box
              sx={{
                backgroundColor: obsBadgeColor(obs.type),
                borderRadius: 8,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <Text sx={{ fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'capitalize' }}>
                {obs.type}
              </Text>
            </Box>
            <Text sx={{ fontSize: 11, color: colors.textMuted, marginLeft: 'auto' }}>
              {formatDate(obs.created_at)}
            </Text>
          </HStack>
          <Text sx={{ fontSize: 13, color: colors.text }} numberOfLines={2}>
            {obs.content}
          </Text>
        </VStack>
      ))}

      {/* Inline new observation form */}
      {showForm && (
        <VStack sx={{ marginTop: Theme.spacing.md, gap: 0 }}>
          <TextInput
            placeholder="Write your observation…"
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={3}
            style={inputStyle}
          />

          {/* Type chips */}
          <HStack sx={{ gap: Theme.spacing.xs, marginBottom: Theme.spacing.sm, flexWrap: 'wrap' }}>
            {OBS_TYPE_OPTIONS.map((t) => (
              <TouchableOpacity key={t} onPress={() => setObsType(t)} activeOpacity={0.8}>
                <Box
                  sx={{
                    borderRadius: 14,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: obsType === t ? obsBadgeColor(t) : colors.border,
                  }}
                >
                  <Text
                    sx={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: obsType === t ? '#fff' : colors.textMuted,
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </Text>
                </Box>
              </TouchableOpacity>
            ))}
          </HStack>

          <TouchableOpacity onPress={handleSave} activeOpacity={0.8} disabled={saving}>
            <Box
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron ?? '#ff9800',
                borderRadius: Theme.corners.medium ?? 8,
                padding: Theme.spacing.sm,
                alignItems: 'center',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Text sx={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Box>
          </TouchableOpacity>
        </VStack>
      )}
    </Box>
  );
}
