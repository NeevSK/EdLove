import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { getTouchHitSlop } from '@repo/ui/utils';
import { hapticLight } from '@repo/ui/utils/haptics';
import { memo, useCallback } from 'react';

export interface SanctuaryRealmItem {
  id: string;
  label: string;
  title: string;
  desc: string;
  tone: string;
}

export interface SanctuaryRealmSelectorProps {
  realms: readonly SanctuaryRealmItem[];
  selectedRealmId: string;
  onSelectRealm: (realmId: string) => void;
  className?: string;
}

export const SanctuaryRealmSelector = memo(
  ({
    realms,
    selectedRealmId,
    onSelectRealm,
    className = '',
  }: SanctuaryRealmSelectorProps) => {
    const activeRealm = realms.find((r) => r.id === selectedRealmId) ?? realms[0];

    const handleSelect = useCallback(
      (id: string) => {
        hapticLight();
        onSelectRealm(id);
      },
      [onSelectRealm],
    );

    return (
      <VStack className={`gap-3 w-full ${className}`}>
        {/* Navigation chips */}
        <HStack className="justify-center gap-2">
          {realms.map((realm) => {
            const isSelected = realm.id === selectedRealmId;
            return (
              <Pressable
                key={realm.id}
                onPress={() => handleSelect(realm.id)}
                hitSlop={getTouchHitSlop(40, 36)}
                accessibilityRole="button"
                accessibilityLabel={`View ${realm.label} Realm`}
                accessibilityState={{ selected: isSelected }}
                className={`h-[40px] px-4 rounded-full justify-center items-center border transition-all ${
                  isSelected
                    ? 'bg-phase-surface border-phase-accent shadow-sm'
                    : 'bg-phase-surface/40 border-phase-border/40'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-phase-text-primary' : 'text-phase-text-secondary'
                  }`}
                >
                  {realm.label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>

        {/* Selected Realm Preview Banner */}
        {activeRealm && (
          <Box className="p-5 rounded-3xl bg-phase-surface/95 border border-phase-border/80 shadow-sm">
            <HStack className="items-center gap-2 mb-1.5">
              <Box
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeRealm.tone }}
              />
              <Text className="text-base font-bold text-phase-text-primary">
                {activeRealm.title}
              </Text>
            </HStack>
            <Text className="text-sm text-phase-text-secondary leading-relaxed pl-4.5">
              {activeRealm.desc}
            </Text>
          </Box>
        )}
      </VStack>
    );
  },
);

SanctuaryRealmSelector.displayName = 'SanctuaryRealmSelector';

export default SanctuaryRealmSelector;
