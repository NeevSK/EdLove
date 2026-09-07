import { deepLink } from '@repo/core/logic';
import { BrandPulse } from '@repo/ui';
import { Button, ButtonText, Center, Text, VStack } from '@repo/ui/primitives';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

export default function WebAuthCallbackRoute() {
  const startedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void deepLink.handleURL(window.location.href).then((result) => {
      setFailed(!result.isHandled);
    });
  }, []);

  if (failed) {
    return (
      <Center className="flex-1 bg-obsidian px-6">
        <VStack space="md" className="items-center">
          <Text className="text-center text-sacred-white">Unable to complete sign-in.</Text>
          <Button onPress={() => router.replace('/auth')}>
            <ButtonText>Try again</ButtonText>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Completing sign-in" />
    </Center>
  );
}
