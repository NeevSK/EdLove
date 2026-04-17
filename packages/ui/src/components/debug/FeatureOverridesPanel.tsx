import React from 'react';
import { VStack, Text, Switch, HStack, Box, ScrollView } from '../../gluestack';
import { useAuthStore, useFeatureStore, type FeatureFlags } from '@repo/core';

/**
 * FeatureOverridesPanel - Developer Tooling for Flag Toggling.
 * 
 * FAANG Principle: "Fast Iteration". Allow developers to test 'Locked' 
 * features without changing database records.
 * 
 * New Pattern: Using NativeWind (className) instead of legacy sx props.
 */
export const FeatureOverridesPanel: React.FC = () => {
  const { flags, recomputeFlags } = useFeatureStore();
  const { user, setUser } = useAuthStore();

  const toggleFlag = (key: keyof FeatureFlags, value: boolean) => {
    if (!user) return;
    
    // Inject override into user context flags
    const updatedUser = {
      ...user,
      flags: {
         // @ts-ignore - Handle possible missing flags object in older user schema
        ...(user.flags || {}),
        [key]: value
      }
    };
    
    // Update local store - using direct setState to ensure reactivity
    setUser(updatedUser as any);
    
    // Force recompute
    recomputeFlags(updatedUser as any);
  };

  return (
    <ScrollView>
      <Box className="p-4 bg-backgroundLight50 rounded-xl border border-borderLight100">
        <Text className="text-xl font-bold mb-2 text-textLight900">
          Feature Overrides
        </Text>
        <Text className="text-xs text-textLight500 mb-6">
          Toggle features for the current session. These overrides are stored in your local user state.
        </Text>

        <VStack space="lg">
          {Object.entries(flags).map(([key, value]) => (
            <HStack key={key} className="justify-between items-center bg-white p-3 rounded-md shadow-sm">
              <VStack className="flex-1">
                <Text className="text-sm font-bold text-textLight800">{key}</Text>
                <Text className="text-xs text-textLight500">
                  {value ? 'Active' : 'Disabled'}
                </Text>
              </VStack>
              <Switch value={value as boolean} onValueChange={(val: boolean) => toggleFlag(key as keyof FeatureFlags, val)}
              />
            </HStack>
          ))}
        </VStack>
      </Box>
    </ScrollView>
  );
};
