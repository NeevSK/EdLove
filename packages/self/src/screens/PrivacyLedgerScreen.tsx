/**
 * PRIVACY LEDGER SCREEN
 * Displays a transparent log of all data access and security events.
 * Standardized to Zero-Legacy: purged corrupted imports and migrated to Sanctuary V3 architecture.
 */

import { type PrivacyLedgerEntry, privacyAPI } from '@repo/core/api/client';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Clock, FileText, Lock, Shield, ShieldCheck } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { useEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PrivacyLedgerScreen() {
  const [entries, setEntries] = useState<PrivacyLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLedger() {
      try {
        const data = await privacyAPI.getPrivacyLedger();
        setEntries(data);
      } catch (err) {
        console.error('[PrivacyLedger] Load Error:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadLedger();
  }, []);

  const renderEntry = ({ item, index }: { item: PrivacyLedgerEntry; index: number }) => {
    const time = new Date(item.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <Box className="mb-3 px-4">
          <SanctuaryCard className="bg-white/5 border-white/5 overflow-hidden">
            <Box className="p-4">
              <HStack className="gap-4 items-start">
                <Box className="p-3 rounded-full bg-sanctuarySaffron/10 border border-sanctuarySaffron/20">
                  <Icon as={Lock} size={16} className="text-sanctuarySaffron" />
                </Box>
                <VStack className="flex-1 gap-2">
                  <HStack className="justify-between items-center">
                    <Text className="text-sacredWhite font-bold text-sm">{item.activity_type}</Text>
                    <HStack className="gap-1 items-center opacity-40">
                      <Icon as={Clock} size={10} className="text-mistGray" />
                      <Text className="text-[10px] font-black uppercase tracking-widest text-mistGray">
                        {time}
                      </Text>
                    </HStack>
                  </HStack>

                  <Text className="text-mistGray/70 text-xs leading-relaxed">
                    {item.description}
                  </Text>

                  <HStack className="gap-1.5 items-center mt-1 bg-white/5 self-start px-2 py-0.5 rounded-md border border-white/5">
                    <Icon as={FileText} size={10} className="text-mistGray/40" />
                    <Text className="text-[9px] font-black uppercase tracking-widest text-mistGray/40 italic">
                      {item.resource_name}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          </SanctuaryCard>
        </Box>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper style={{ flex: 1 }} scroll={false}>
      <GlobalHeader title="Privacy Ledger" subtitle="Your data activity journey" showBack />

      <VStack className="flex-1 pt-6">
        <VStack className="gap-2 px-6 mb-8">
          <HStack className="gap-3 items-center">
            <Box className="w-8 h-8 rounded-lg bg-emeraldGreen/10 items-center justify-center">
              <Icon as={ShieldCheck} size={18} className="text-emeraldGreen" />
            </Box>
            <Heading size="xs" className="text-sacredWhite font-black uppercase tracking-[0.2em]">
              Transparency Circle
            </Heading>
          </HStack>
          <Text className="text-mistGray/60 text-sm leading-relaxed px-1">
            Every time your data is accessed or security settings change, it&apos;s recorded here
            for your peace of mind.
          </Text>
        </VStack>

        {loading ? (
          <Box className="flex-1 justify-center items-center pb-20">
            <BrandPulse size={36} accessibilityLabel="Loading privacy ledger" />
            <Text className="text-mistGray/30 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
              Verifying Integrity
            </Text>
          </Box>
        ) : (
          <SanctuaryFlashList
            data={entries}
            keyExtractor={(item) => (item as PrivacyLedgerEntry).id}
            renderItem={renderEntry as any}
            ListHeaderComponent={<Box className="h-2" />}
            ListFooterComponent={<Box className="h-10" />}
            ListEmptyComponent={
              <Box className="flex-1 items-center justify-center mt-20 opacity-30">
                <Icon as={Shield} size={48} className="text-mistGray" />
                <Text className="text-mistGray text-xs font-bold mt-4">
                  No privacy events recorded yet.
                </Text>
              </Box>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </VStack>
    </ScreenWrapper>
  );
}
