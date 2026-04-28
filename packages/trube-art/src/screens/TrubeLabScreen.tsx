import { Box, ScreenWrapper, Text, useTheme, VStack } from '@repo/ui';
import React from 'react';

export default function TrubeLabScreen() {
  const { text } = useTheme();

  return (
    <ScreenWrapper      <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 16 }}        <VStack sx={{ gap: 16, alignItems: 'center' }}          <Text sx={{ color: text.primary, fontSize: 24, fontWeight: '700' }}            Trube Lab
          </Text          <Text sx={{ color: text.secondary, textAlign: 'center' }}            The Tr\u00FCbe-Art engine is currently under heavy native development. 
            This screen is temporarily disabled to ensure monorepo build stability.
          </Text          <Text sx={{ color: text.secondary, fontSize: 14, fontStyle: 'italic' }}            (Stand-alone development in progress)
          </Text        </VStack      </Box    </ScreenWrapper  );
}
