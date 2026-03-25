import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@repo/ui';

interface GuardianNotificationsProps {
  notifications: any[];
  onNotificationPress: (notification: any) => void;
  limit?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const GuardianNotifications: React.FC<GuardianNotificationsProps> = ({
  notifications,
  onNotificationPress,
  limit = 5
}) => {
  const theme = useTheme();
  const isDesktop = screenWidth > 1024;

  const renderNotificationItem = (notification: any) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        {
          backgroundColor: notification.isRead ? 'transparent' : theme.accent.action + '10',
          borderLeftColor: notification.isRead ? 'transparent' : theme.accent.action,
          borderLeftWidth: notification.isRead ? 0 : 3,
        }
      ]}
      onPress={() => onNotificationPress(notification)}
    >
      <View style={styles.notificationContent}>
        <Text 
          style={[
            styles.notificationTitle,
            { 
              color: theme.text.primary,
              fontFamily: 'System',
              fontWeight: notification.isRead ? '400' : '600',
              fontSize: isDesktop ? 14 : 12
            }
          ]}
        >
          {notification.title}
        </Text>
        <Text 
          style={[
            styles.notificationMessage,
            { 
              color: theme.text.secondary,
              fontFamily: 'System',
              fontSize: isDesktop ? 12 : 10
            }
          ]}
        >
          {notification.message}
        </Text>
        <Text 
          style={[
            styles.notificationTime,
            { 
              color: theme.text.muted,
              fontFamily: 'System',
              fontSize: isDesktop ? 10 : 8
            }
          ]}
        >
          {new Date(notification.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.notificationsList}>
      {notifications.slice(0, limit).map(renderNotificationItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  notificationsList: {
    gap: 8,
  },
  notificationItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: 4,
  },
  notificationMessage: {
    marginBottom: 4,
    opacity: 0.8,
  },
  notificationTime: {
    opacity: 0.6,
    fontSize: 10,
  },
});
