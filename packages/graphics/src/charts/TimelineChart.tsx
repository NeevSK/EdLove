import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VStack, HStack, Card, Theme } from '@repo/ui';

interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  description?: string;
  type?: 'milestone' | 'warning' | 'success' | 'info' | 'error';
  color?: string;
  icon?: string;
}

export interface TimelineChartProps {
  title: string;
  events: TimelineEvent[];
  showDates?: boolean;
  showIcons?: boolean;
  timeFormat?: 'relative' | 'absolute';
  maxHeight?: number;
}

export function TimelineChart({
  title,
  events,
  showDates = true,
  showIcons = true,
  timeFormat = 'relative',
  maxHeight = 400
}: TimelineChartProps) {
  const formatTime = (date: Date) => {
    if (timeFormat === 'absolute') {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${diffMonths} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return Theme.colors.success;
      case 'warning': return Theme.colors.warning;
      case 'success': return Theme.colors.gurudeviBlue;
      case 'info': return Theme.colors.textSecondary;
      case 'error': return Theme.colors.error;
      default: return Theme.colors.text;
    }
  };

  const getEventIcon = (type: TimelineEvent['type'], icon?: string) => {
    if (icon) return icon;
    switch (type) {
      case 'milestone': return '\uD83C\uDFC6';
      case 'warning': return '\u26A0\uFE0F';
      case 'success': return '\u2705';
      case 'info': return '\u2139\uFE0F';
      case 'error': return '\u274C';
      default: return '\uD83D\uDCC5';
    }
  };

  return (
    <Card style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <ScrollView
        style={[styles.timelineContainer, { maxHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md">
          {events.map((event, index) => (
            <View key={event.id} style={styles.eventContainer}>
              {/* Timeline line */}
              {index < events.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              
              {/* Event dot */}
              <View style={styles.eventDot}>
                <View
                  style={[
                    styles.dotInner,
                    { backgroundColor: event.color || getEventColor(event.type) }
                  ]}
                />
                {showIcons && (
                  <Text style={styles.eventIcon}>
                    {getEventIcon(event.type, event.icon)}
                  </Text>
                )}
              </View>

              {/* Event content */}
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>
                  {event.title}
                </Text>
                {event.description && (
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                )}
                
                {showDates && (
                  <Text style={styles.eventDate}>
                    {formatTime(event.date)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </VStack>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  timelineContainer: {
    flex: 1,
    paddingLeft: Theme.spacing.lg,
  },
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 10,
    top: 20,
    bottom: 0,
    width: 2,
    backgroundColor: Theme.colors.border,
  },
  eventDot: {
    position: 'absolute',
    left: 0,
    top: 15,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eventIcon: {
    fontSize: 10,
    position: 'absolute',
  },
  eventContent: {
    marginLeft: Theme.spacing.xl,
    flex: 1,
    paddingTop: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  eventDescription: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  eventDate: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
});
