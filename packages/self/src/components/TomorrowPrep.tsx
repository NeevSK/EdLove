import { TodoView } from './TodoView';
import { EmptyState } from '@repo/ui/components/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

interface TomorrowPrepProps {
  userId?: string;
}

export default function TomorrowPrep({ userId }: TomorrowPrepProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!userId) {
    return <EmptyState
        title="Sign in to use this"
        message="Everything else in Self keeps working on this device."
        action={{ label: 'Sign in', onPress: () => router.push('/auth') }}
      />;
  }

  return (
    <View style={styles.container}>
      <TodoView
        listName="Tomorrow Prep"
        displayTitle={t('self.tomorrowPrep') || "Tomorrow's Preparation"}
        userId={userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
});
