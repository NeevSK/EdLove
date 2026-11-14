import { AppHeader } from '@repo/ui/components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@repo/ui/components/native';
import React from 'react';
import { View } from 'react-native';

export type ClassroomAccessStateKind = 'missing' | 'unavailable';

export function ClassroomAccessState({
  kind,
  onBack,
  onRetry,
}: {
  kind: ClassroomAccessStateKind;
  onBack: () => void;
  onRetry?: () => void;
}) {
  const missing = kind === 'missing';

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">
      <AppHeader
        title={missing ? 'Choose a classroom' : 'Classroom unavailable'}
        onBack={onBack}
      />
      <View className="flex-1 justify-center items-center p-6">
        <View className="gap-3 items-center max-w-[420px]">
          <Text kind="title" align="center">
            {missing ? 'No classroom selected' : 'This classroom cannot be opened'}
          </Text>
          <Text kind="body" tone="soft" align="center" style={{ lineHeight: 24 }}>
            {missing
              ? 'Return to your workspace and choose a classroom to continue.'
              : 'It may no longer exist, or your current access does not include it. Return to the workspace to choose an available classroom.'}
          </Text>
          {onRetry ? (
            <View style={{ marginTop: 8 }}>
              <Button
                label="Try again"
                onPress={onRetry}
                variant="primary"
              />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ClassroomAccessState;
