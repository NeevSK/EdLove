
import { View, Text, Pressable } from 'react-native';
import type React from 'react';
import { useTranslation } from 'react-i18next';

interface GuardianEventsProps {
  events: any[];
  onEventPress: (event: any) => void;
  limit?: number;
}

export const GuardianEvents: React.FC<GuardianEventsProps> = ({
  events,
  onEventPress,
  limit = 5,
}) => {
  const { t } = useTranslation();

  const renderEventItem = (event: any) => {
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('en', { month: 'short' });

    return (
      <Pressable key={event.id} onPress={() => onEventPress(event)} className="active:opacity-85">
        <View className="flex-row p-3 rounded-lg mb-2 items-center bg-white/60 border border-border">
          <View className="items-center mr-3 min-w-[40px]">
            <Text className="text-primary font-bold text-lg leading-tight">{day}</Text>
            <Text className="text-secondary text-[10px] uppercase leading-tight font-medium">
              {month}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-primary font-semibold text-sm mb-1">{event.title}</Text>
            <Text className="text-secondary text-xs opacity-70">
              {event.time}
              {event.location ? ` · ${event.location}` : ''}
            </Text>
          </View>

          {event.requiresRsvp && (
            <View className="px-2 py-1 rounded-xl bg-primary/10">
              <Text className="text-primary text-[10px] font-bold">RSVP</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return <View className="gap-2">{events.slice(0, limit).map(renderEventItem)}</View>;
};
