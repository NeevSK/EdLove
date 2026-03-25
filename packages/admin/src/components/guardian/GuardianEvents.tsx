import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@repo/ui';

interface GuardianEventsProps {
  events: any[];
  onEventPress: (event: any) => void;
  limit?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const GuardianEvents: React.FC<GuardianEventsProps> = ({
  events,
  onEventPress,
  limit = 5
}) => {
  const theme = useTheme();
  const isDesktop = screenWidth > 1024;

  const renderEventItem = (event: any) => (
    <TouchableOpacity
      key={event.id}
      style={[
        styles.eventItem,
        {
          backgroundColor: theme.glass.surface.bg,
          borderColor: theme.glass.surface.border,
          borderWidth: 1,
        }
      ]}
      onPress={() => onEventPress(event)}
    >
      <View style={styles.eventDate}>
        <Text 
          style={[
            styles.eventDateDay,
            { 
              color: theme.accent.action,
              fontFamily: 'System',
              fontWeight: '700',
              fontSize: isDesktop ? 18 : 14
            }
          ]}
        >
          {new Date(event.date).getDate()}
        </Text>
        <Text 
          style={[
            styles.eventDateMonth,
            { 
              color: theme.text.secondary,
              fontFamily: 'System',
              fontSize: isDesktop ? 10 : 8
            }
          ]}
        >
          {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
        </Text>
      </View>
      <View style={styles.eventDetails}>
        <Text 
          style={[
            styles.eventTitle,
            { 
              color: theme.text.primary,
              fontFamily: 'System',
              fontWeight: '600',
              fontSize: isDesktop ? 14 : 12
            }
          ]}
        >
          {event.title}
        </Text>
        <Text 
          style={[
            styles.eventTime,
            { 
              color: theme.text.secondary,
              fontFamily: 'System',
              fontSize: isDesktop ? 12 : 10
            }
          ]}
        >
          {event.time} • {event.location}
        </Text>
      </View>
      {event.requiresRsvp && (
        <View style={[
          styles.rsvpBadge,
          { backgroundColor: theme.accent.action + '20' }
        ]}>
          <Text 
            style={[
              styles.rsvpText,
              { color: theme.accent.action }
            ]}
          >
            RSVP
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.eventsList}>
      {events.slice(0, limit).map(renderEventItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  eventsList: {
    gap: 8,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  eventDateDay: {
    marginBottom: 2,
  },
  eventDateMonth: {
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    marginBottom: 4,
  },
  eventTime: {
    opacity: 0.7,
  },
  rsvpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rsvpText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
