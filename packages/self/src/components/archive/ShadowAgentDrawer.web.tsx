/**
 * ShadowAgentDrawer.web.tsx
 *
 * Web override for the ShadowAgentDrawer.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and migrated to @repo/ui primitives and NativeWind v4.
 */

import { Box, Heading, HStack, Icon, Text, VStack } from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';

import { Quote, Sparkles, X, Zap } from 'lucide-react-native';
import { useMemo, useState } from 'react';

const THOUGHT_SEEDS = [
  "What is weighing on you that you haven't spoken aloud?",
  'Where do you feel peace right now — even a flicker of it?',
  "What are you holding for others that isn't yours to carry?",
  'What would you let go of, if you knew it was safe to?',
  'Where did joy surprise you today?',
  'What does your body need right now?',
  'What truth are you dancing around?',
  'Who have you been, today?',
  'What forgiveness is waiting — for yourself or another?',
  'What is asking to be seen?',
];

export default function ShadowAgentDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const seed = useMemo(() => THOUGHT_SEEDS[Math.floor(Math.random() * THOUGHT_SEEDS.length)], []);

  return (
    <>
      {/* Floating orb trigger */}
      <Box className="fixed bottom-20 right-6 z-[100]">
        <Pressable
          onPress={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-sanctuarySaffron items-center justify-center cursor-pointer shadow-xl shadow-sanctuarySaffron/40 hover:scale-110 active:scale-90 transition-all duration-300"
          style={{ animation: 'orb-pulse 4s ease-in-out infinite' } as any}
        >
          <Icon as={Sparkles} size={24} className="text-obsidian" />
        </Pressable>
      </Box>

      {/* Drawer overlay */}
      {isOpen && (
        <Pressable
          className="fixed inset-0 bg-black/60 z-[200] flex flex-col justify-end items-center px-4 md:px-0"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="w-full max-w-2xl bg-obsidian rounded-t-[40px] border-t border-white/10 p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom duration-500"
            onPress={(e: any) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <Box className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10 opacity-50" />

            {/* Close Button */}
            <Pressable
              onPress={() => setIsOpen(false)}
              className="absolute top-10 right-10 p-2 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors"
            >
              <Icon as={X} size={20} className="text-mistGray/50" />
            </Pressable>

            <VStack className="gap-10">
              {/* Header */}
              <VStack className="gap-2">
                <Text className="text-sanctuarySaffron text-[10px] font-black uppercase tracking-[0.3em]">
                  The Quiet Space
                </Text>
                <Heading size="2xl" className="text-sacredWhite font-black tracking-tight">
                  Shadow Agent
                </Heading>
              </VStack>

              {/* Thought seed */}
              <Box className="p-8 bg-white/5 rounded-3xl border-l-4 border-sanctuarySaffron border-y border-r border-white/5 shadow-inner">
                <VStack className="gap-4">
                  <HStack className="items-center gap-2 opacity-50">
                    <Icon as={Zap} size={12} className="text-sanctuarySaffron" />
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuarySaffron">
                      A seed for reflection
                    </Text>
                  </HStack>
                  <HStack className="gap-3">
                    <Icon
                      as={Quote}
                      size={16}
                      className="text-sanctuarySaffron mt-1 opacity-40 shrink-0"
                    />
                    <Text className="text-sacredWhite/90 text-xl font-bold italic leading-relaxed">
                      {seed}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Footer context */}
              <VStack className="items-center gap-2 border-t border-white/5 pt-8 mb-4">
                <Text className="text-mistGray/40 text-[11px] font-medium text-center leading-relaxed">
                  This is not a conversation. It is a mirror.
                </Text>
                <Text className="text-mistGray/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Whatever arises is yours alone.
                </Text>
              </VStack>
            </VStack>
          </Pressable>
        </Pressable>
      )}

      <style>{`
                @keyframes orb-pulse { 
                    0%, 100% { box-shadow: 0 0 20px rgba(246, 191, 140, 0.4); } 
                    50% { box-shadow: 0 0 40px rgba(246, 191, 140, 0.7); } 
                }
            `}</style>
    </>
  );
}
