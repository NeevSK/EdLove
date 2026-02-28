/**
 * InstitutionalCalendarSection
 *
 * Compact calendar widget for the principal:
 *  - Upcoming events list with type badges
 *  - Inline add-event form
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity, TextInput, ScrollView as RNScrollView } from 'react-native';
import { Box, HStack, VStack, Text, SkeletonCard, useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { staffManagementAPI, CalendarEvent } from '@repo/core';

interface InstitutionalCalendarSectionProps {
  schoolId: string;
  principalId: string;
  onAddEvent?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  term_start: Theme.colors.gurudeviBlue ?? '#2196f3',
  exam: Theme.colors.roseQuartz ?? '#f44336',
  holiday: Theme.colors.sage ?? '#4caf50',
  event: Theme.colors.sanctuarySaffron ?? '#ff9800',
  other: Theme.colors.textMuted ?? '#9e9e9e',
};

const TYPE_LABELS: Record<string, string> = {
  term_start: 'Term Start',
  exam: 'Exam',
  holiday: 'Holiday',
  event: 'Event',
  other: 'Other',
};

const TYPE_OPTIONS = ['term_start', 'exam', 'holiday', 'event', 'other'];

function typeBadgeColor(type: string): string {
  return TYPE_COLORS[type] ?? (Theme.colors.textMuted ?? '#9e9e9e');
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function InstitutionalCalendarSection({
  schoolId,
  principalId,
  onAddEvent,
}: InstitutionalCalendarSectionProps) {
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState('event');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function fetchEvents() {
    const data = await staffManagementAPI.getUpcomingCalendarEvents(schoolId, 5);
    setEvents(data);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    staffManagementAPI.getUpcomingCalendarEvents(schoolId, 5).then((data) => {
      if (mounted) { setEvents(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [schoolId]);

  async function handleSave() {
    if (!title.trim() || !startDate.trim()) return;
    setSaving(true);
    const ok = await staffManagementAPI.createCalendarEvent(schoolId, principalId, {
      title: title.trim(),
      type: selectedType,
      start_date: startDate.trim(),
      end_date: endDate.trim() || undefined,
    });
    setSaving(false);
    if (ok) {
      setTitle('');
      setStartDate('');
      setEndDate('');
      setSelectedType('event');
      setShowForm(false);
      await fetchEvents();
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
  } as const;

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
          📅 School Calendar
        </Text>
        <TouchableOpacity
          onPress={() => {
            setShowForm(!showForm);
            onAddEvent?.();
          }}
          activeOpacity={0.8}
        >
          <Box
            sx={{
              backgroundColor: Theme.colors.gurudeviBlue ?? '#2196f3',
              borderRadius: Theme.corners.medium ?? 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>+ Add</Text>
          </Box>
        </TouchableOpacity>
      </HStack>

      {/* Loading */}
      {loading && <SkeletonCard height={60} />}

      {/* Event list */}
      {!loading && events.length === 0 && (
        <Text sx={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: Theme.spacing.md }}>
          No upcoming events
        </Text>
      )}

      {!loading && events.map((ev) => (
        <HStack
          key={ev.id}
          sx={{ alignItems: 'center', gap: Theme.spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <Box
            sx={{
              backgroundColor: typeBadgeColor(ev.type),
              borderRadius: 8,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text sx={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
              {TYPE_LABELS[ev.type] ?? ev.type}
            </Text>
          </Box>
          <Text sx={{ flex: 1, fontSize: 13, color: colors.text }} numberOfLines={1}>
            {ev.title}
          </Text>
          <Text sx={{ fontSize: 11, color: colors.textMuted }}>{formatDate(ev.start_date)}</Text>
        </HStack>
      ))}

      {/* Inline add form */}
      {showForm && (
        <VStack sx={{ marginTop: Theme.spacing.md, gap: 0 }}>
          <TextInput
            placeholder="Event title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            style={inputStyle}
          />

          {/* Type chips */}
          <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Theme.spacing.sm }}>
            <HStack sx={{ gap: Theme.spacing.xs }}>
              {TYPE_OPTIONS.map((t) => (
                <TouchableOpacity key={t} onPress={() => setSelectedType(t)} activeOpacity={0.8}>
                  <Box
                    sx={{
                      borderRadius: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor:
                        selectedType === t
                          ? (typeBadgeColor(t))
                          : (colors.border),
                    }}
                  >
                    <Text
                      sx={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: selectedType === t ? '#fff' : colors.textMuted,
                      }}
                    >
                      {TYPE_LABELS[t]}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </HStack>
          </RNScrollView>

          <TextInput
            placeholder="Start date (YYYY-MM-DD)"
            placeholderTextColor={colors.textMuted}
            value={startDate}
            onChangeText={setStartDate}
            style={inputStyle}
          />
          <TextInput
            placeholder="End date (YYYY-MM-DD, optional)"
            placeholderTextColor={colors.textMuted}
            value={endDate}
            onChangeText={setEndDate}
            style={inputStyle}
          />

          <TouchableOpacity onPress={handleSave} activeOpacity={0.8} disabled={saving}>
            <Box
              sx={{
                backgroundColor: Theme.colors.gurudeviBlue ?? '#2196f3',
                borderRadius: Theme.corners.medium ?? 8,
                padding: Theme.spacing.sm,
                alignItems: 'center',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Text sx={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                {saving ? 'Saving…' : 'Save Event'}
              </Text>
            </Box>
          </TouchableOpacity>
        </VStack>
      )}
    </Box>
  );
}
