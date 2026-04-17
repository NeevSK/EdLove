/**
 * InstitutionalCalendarSection
 *
 * Compact calendar widget for the principal:
 *  - Upcoming events list with type badges
 *  - Inline add-event form
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity, TextInput, ScrollView as RNScrollView } from 'react-native';
import { Box, HStack, VStack, Text, useThemedColors } from '@repo/ui';
import { staffManagementAPI, type CalendarEvent } from '@repo/core';

interface InstitutionalCalendarSectionProps {
  schoolId: string;
  principalId: string;
  onAddEvent?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  term_start: 'Term Start',
  exam: 'Exam',
  holiday: 'Holiday',
  event: 'Event',
  other: 'Other'
};

const TYPE_OPTIONS = ['term_start', 'exam', 'holiday', 'event', 'other'];

export default function InstitutionalCalendarSection({
  schoolId,
  principalId,
  onAddEvent
}: InstitutionalCalendarSectionProps) {
  const theme = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState('event');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const typeBadgeColor = (type: string): string => {
    switch (type) {
      case 'term_start': return theme.status.info;
      case 'exam': return theme.status.error;
      case 'holiday': return theme.status.success;
      case 'event': return theme.status.warning;
      default: return theme.text.tertiary;
    }
  };

  async function fetchEvents() {
    try {
      const data = await staffManagementAPI.getUpcomingCalendarEvents(schoolId, 5);
      setEvents(data);
    } catch (err) {
      console.error('InstitutionalCalendar: fetch error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [schoolId]);

  async function handleSave() {
    if (!title.trim() || !startDate.trim()) return;
    setSaving(true);
    try {
      const ok = await staffManagementAPI.createCalendarEvent(schoolId, principalId, {
        title: title.trim(),
        type: selectedType,
        start_date: startDate.trim(),
        end_date: endDate.trim() || undefined
      });
      if (ok) {
        setTitle('');
        setStartDate('');
        setEndDate('');
        setSelectedType('event');
        setShowForm(false);
        await fetchEvents();
      }
    } catch (err) {
      console.error('InstitutionalCalendar: save error', err);
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
    marginBottom: theme.spacing.sm
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
          School Calendar
        </Text>
        <TouchableOpacity
          onPress={() => {
            setShowForm(!showForm);
            onAddEvent?.();
          }}
          activeOpacity={0.8}>
          <Box
            style={{
              backgroundColor: theme.status.info,
              borderRadius: theme.corners.md,
              paddingHorizontal: 10,
              paddingVertical: 4
            }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>+ Add</Text>
          </Box>
        </TouchableOpacity>
      </HStack>

      {loading && (
        <VStack style={{ gap: theme.spacing.sm }}>
          <Box style={{ height: 40, backgroundColor: theme.scene.backgroundBody, borderRadius: theme.corners.md, opacity: 0.5 }} />
          <Box style={{ height: 40, backgroundColor: theme.scene.backgroundBody, borderRadius: theme.corners.md, opacity: 0.3 }} />
        </VStack>
      )}

      {!loading && events.length === 0 && (
        <Text style={{ fontSize: 13, color: theme.text.secondary, textAlign: 'center', paddingVertical: theme.spacing.md }}>
          No upcoming events
        </Text>
      )}

      {!loading && events.map((ev) => (
        <HStack
          key={ev.id}
          style={{ 
            alignItems: 'center', 
            gap: theme.spacing.sm, 
            paddingVertical: theme.spacing.xs, 
            borderBottomWidth: 1, 
            borderBottomColor: theme.scene.border 
          }}>
          <Box
            style={{
              backgroundColor: typeBadgeColor(ev.type),
              borderRadius: 8,
              paddingHorizontal: 7,
              paddingVertical: 2
            }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>
              {TYPE_LABELS[ev.type] || ev.type}
            </Text>
          </Box>
          <Text style={{ flex: 1, fontSize: 13, color: theme.text.primary }} numberOfLines={1}>
            {ev.title}
          </Text>
          <Text style={{ fontSize: 11, color: theme.text.secondary }}>
            {ev.start_date.split('T')[0]}
          </Text>
        </HStack>
      ))}

      {showForm && (
        <VStack style={{ marginTop: theme.spacing.md }}>
          <TextInput
            placeholder="Event title"
            placeholderTextColor={theme.text.tertiary}
            value={title}
            onChangeText={setTitle}
            style={inputStyle}
          />

          <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.sm }}>
            <HStack style={{ gap: theme.spacing.xs }}>
              {TYPE_OPTIONS.map((t) => (
                <TouchableOpacity key={t} onPress={() => setSelectedType(t)} activeOpacity={0.8}>
                  <Box
                    style={{
                      borderRadius: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: selectedType === t ? typeBadgeColor(t) : theme.scene.border
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: selectedType === t ? '#FFFFFF' : theme.text.secondary
                      }}>
                      {TYPE_LABELS[t]}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </HStack>
          </RNScrollView>

          <TextInput
            placeholder="Start date (YYYY-MM-DD)"
            placeholderTextColor={theme.text.tertiary}
            value={startDate}
            onChangeText={setStartDate}
            style={inputStyle}
          />
          <TextInput
            placeholder="End date (YYYY-MM-DD, optional)"
            placeholderTextColor={theme.text.tertiary}
            value={endDate}
            onChangeText={setEndDate}
            style={inputStyle}
          />

          <TouchableOpacity onPress={handleSave} activeOpacity={0.8} disabled={saving}>
            <Box
              style={{
                backgroundColor: theme.status.info,
                borderRadius: theme.corners.md,
                padding: theme.spacing.sm,
                alignItems: 'center',
                opacity: saving ? 0.6 : 1
              }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                {saving ? 'Saving...' : 'Save Event'}
              </Text>
            </Box>
          </TouchableOpacity>
        </VStack>
      )}
    </Box>
  );
}
