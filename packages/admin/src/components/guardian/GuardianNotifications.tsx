
import { View, Text, Pressable } from 'react-native';
import type React from 'react';

interface GuardianNotificationsProps {
  notifications: any[];
  onNotificationPress: (notification: any) => void;
  limit?: number;
}

export const GuardianNotifications: React.FC<GuardianNotificationsProps> = ({
  notifications,
  onNotificationPress,
  limit = 5,
}) => {
  const renderNotificationItem = (notification: any) => (
    <Pressable
      key={notification.id}
      onPress={() => onNotificationPress(notification)}
      className="active:opacity-85"
    >
      <View
        className={`p-3 rounded-lg mb-2 border border-border ${
          notification.isRead ? 'bg-transparent' : 'bg-primary/5 border-l-4 border-l-primary'
        }`}
      >
        <View className="flex-1">
          <Text
            className={`text-primary mb-1 text-sm ${
              notification.isRead ? 'font-normal' : 'font-semibold'
            }`}
          >
            {notification.title}
          </Text>
          <Text className="text-secondary text-xs opacity-80 mb-1">{notification.message}</Text>
          <Text className="text-secondary/60 text-[10px]">
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="gap-2">{notifications.slice(0, limit).map(renderNotificationItem)}</View>
  );
};
