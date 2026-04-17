/**
 * PrincipalObservationsSection
 *
 * Compact observation notes widget:
 *  - Last 5 observations with type badge, content, date
 *  - Inline new-observation form
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity, TextInput } from 'react-native';
import { Box, HStack, VStack, Text, useThemedColors } from '@repo/ui';
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

const OBS_TYPE_OPTIONS = ['walkthrough', 'note', 'concern', 'praise'];

export default function PrincipalObservationsSection({
  schoolId,
  principalId
}: PrincipalObservationsSectionProps) {
  const theme = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [content, setContent] = useState('');
  const [obsType, setObsType] = useState('note');

  const obsBadgeColor = (type: string): string => {
    switch (type) {
      case 'walkthrough': return theme.status.info;
      case 'concern': return theme.status.error;
      case 'praise': return theme.status.success;
      case 'note': return theme.status.warning;
      default: return theme.text.tertiary;
    }
  };

  async function fetchObservations() {
    try {
      const { data } = await supabase
        .from('principal_observations')
        .select('*')
        .eq('principal_id', principalId)
        .order('created_at', { ascending: false })
        .limit(5);
      setObservations((data ?? []) as Observation[]);
    } catch (err) {
      console.error('PrincipalObservations: fetch error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchObservations();
  }, [principalId]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('principal_observations').insert({
        school_id: schoolId,
        principal_id: principalId,
        type: obsType,
        content: content.trim()
      });
      if (!error) {
        setContent('');
        setObsType('note');
        setShowForm(false);
        await fetchObservations();
      }
    } catch (err) {
      console.error('PrincipalObservations: save error', err);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.scene.border,
    borderRadius: theme.corners.md,
    padding: theme.spacing.sm,
    color: theme.text.primary,
    backgroundColor: theme.scene.backgroundBody,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top' as const
  };

  return (
    <Box
      style={{
        backgroundColor: theme.scene.backgroundPrimary,
        borderRadius: theme.corners.md,
        borderWidth: 1,
        borderColor: theme.scene.border,
        padding: theme.spacing.md
      }}>
      <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text.primary }}>
          Observation Notes
        </Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} activeOpacity={0.8}>
          <Box
            style={{
              backgroundColor: theme.status.warning,
              borderRadius: theme.corners.md,
              paddingHorizontal: 10,
              paddingVertical: 4
            }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>+ New</Text>
          </Box>
        </TouchableOpacity>
      </HStack>

      {loading && (
        <VStack style={{ gap: theme.spacing.sm }}>
          <Box style={{ height: 40, backgroundColor: theme.scene.backgroundBody, borderRadius: theme.corners.md, opacity: 0.5 }} />
          <Box style={{ height: 40, backgroundColor: theme.scene.backgroundBody, borderRadius: theme.corners.md, opacity: 0.3 }} />
        </VStack>
      )}

      {!loading && observations.length === 0 && (
        <Text style={{ fontSize: 13, color: theme.text.secondary, textAlign: 'center', paddingVertical: theme.spacing.md }}>
          No observations yet. Start your first classroom walkthrough note.
        </Text>
      )}

      {!loading && observations.map((obs) => (
        <VStack
          key={obs.id}
          style={{ 
            paddingVertical: theme.spacing.xs, 
            borderBottomWidth: 1, 
            borderBottomColor: theme.scene.border, 
            gap: 4 
          }}>
          <HStack style={{ alignItems: 'center', gap: theme.spacing.sm }}>
            <Box
              style={{
                backgroundColor: obsBadgeColor(obs.type),
                borderRadius: 8,
                paddingHorizontal: 7,
                paddingVertical: 2
              }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'capitalize' }}>
                {obs.type}
              </Text>
            </Box>
            <Text style={{ fontSize: 11, color: theme.text.secondary, marginLeft: 'auto' }}>
              {obs.created_at.split('T')[0]}
            </Text>
          </HStack>
          <Text style={{ fontSize: 13, color: theme.text.primary }} numberOfLines={2}>
            {obs.content}
          </Text>
        </VStack>
      ))}

      {showForm && (
        <VStack style={{ marginTop: theme.spacing.md }}>
          <TextInput
            placeholder="Write your observation..."
            placeholderTextColor={theme.text.tertiary}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={3}
            style={inputStyle}
          />

          <HStack style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.sm, flexWrap: 'wrap' }}>
            {OBS_TYPE_OPTIONS.map((t) => (
              <TouchableOpacity key={t} onPress={() => setObsType(t)} activeOpacity={0.8}>
                <Box
                  style={{
                    borderRadius: 14,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: obsType === t ? obsBadgeColor(t) : theme.scene.border
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: obsType === t ? '#FFFFFF' : theme.text.secondary,
                      textTransform: 'capitalize'
                    }}>
                    {t}
                  </Text>
                </Box>
              </TouchableOpacity>
            ))}
          </HStack>

          <TouchableOpacity onPress={handleSave} activeOpacity={0.8} disabled={saving}>
            <Box
              style={{
                backgroundColor: theme.status.warning,
                borderRadius: theme.corners.md,
                padding: theme.spacing.sm,
                alignItems: 'center',
                opacity: saving ? 0.6 : 1
              }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Box>
          </TouchableOpacity>
        </VStack>
      )}
    </Box>
  );
}
