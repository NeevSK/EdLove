import React from 'react';
import { Box, Text, Heading, VStack, Icon, Theme } from '@repo/ui';
import { Users2, Hammer } from 'lucide-react-native';
import { FeatureGuard } from '@repo/core/src/permissions/guards/FeatureGuard';

export default function WorkforceShell() {
  return (
    <FeatureGuard feature="isDevelopingWorkforce">
      <VStack
        sx={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
          backgroundColor: '$backgroundLight',
        }}
        space="xl"
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255, 165, 0, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon as={Users2} size={48} color={Theme.colors.sanctuarySaffron} />
        </Box>
        
        <VStack space="sm" alignItems="center">
          <Heading size="xl" textAlign="center">
            Workforce Management
          </Heading>
          <Text
            sx={{
              color: '$textSecondary',
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            Streamline institutional human capital with digital dignity.
          </Text>
        </VStack>

        <Box
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 16,
          }}
        >
          <Icon as={Hammer} size={16} color={Theme.colors.sanctuarySaffron} />
          <Text bold size="xs" sx={{ color: Theme.colors.sanctuarySaffron }}>
            UNDER ACTIVE CONSTRUCTION
          </Text>
        </Box>
      </VStack>
    </FeatureGuard>
  );
}
