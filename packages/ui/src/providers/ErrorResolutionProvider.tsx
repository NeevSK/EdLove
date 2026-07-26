import type { ISovereignError } from '@repo/core/lib';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { UniversalModal } from '@/components/UniversalModal';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

interface ErrorResolutionContextType {
  resolveError: (error: ISovereignError) => void;
  dismissError: () => void;
}

const ErrorResolutionContext = createContext<ErrorResolutionContextType | undefined>(undefined);

/**
 * ErrorResolutionProvider (2026 UX Standard)
 *
 * A global orchestrator for structured error recovery.
 * Provides high-fidelity feedback with resolution guides and actionable recovery steps.
 */
export const ErrorResolutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeError, setActiveError] = useState<ISovereignError | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const resolveError = useCallback((error: ISovereignError) => {
    setActiveError(error);
    setShowDetails(false);
  }, []);

  const dismissError = useCallback(() => {
    setActiveError(null);
    setShowDetails(false);
  }, []);

  const contextValue = useMemo(
    () => ({ resolveError, dismissError }),
    [resolveError, dismissError],
  );

  return (
    <ErrorResolutionContext.Provider value={contextValue}>
      {children}
      <UniversalModal isOpen={!!activeError} onClose={dismissError}>
        {activeError && (
          <View className="flex-1 bg-black/60 items-center justify-center p-4">
            <VStack className="bg-phase-surface w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-phase-interactive/20">
              <HStack className="justify-between items-center mb-4">
                <Text className="text-phase-danger font-bold text-xl tracking-tight">
                  Resolution Required
                </Text>
                <Text className="text-phase-text-secondary text-[10px] opacity-60">
                  {new Date(activeError.timestamp).toLocaleTimeString()}
                </Text>
              </HStack>

              <ScrollView className="max-h-60 mb-6" showsVerticalScrollIndicator={false}>
                <Text className="text-phase-text-primary font-bold text-base mb-1">
                  {activeError.message}
                </Text>
                <Text className="text-phase-text-secondary text-xs mb-4 font-mono opacity-80">
                  Code: {activeError.code}
                </Text>

                <VStack className="bg-phase-interactive/5 p-4 rounded-xl border border-phase-interactive/10">
                  <Text className="text-phase-text-primary font-bold text-sm mb-2">
                    Next Steps:
                  </Text>
                  <Text className="text-phase-text-secondary leading-5">{activeError.guide}</Text>
                </VStack>

                <Button
                  variant="ghost"
                  onPress={() => setShowDetails(!showDetails)}
                  className="mt-4 self-start p-0"
                >
                  <ButtonText className="text-[10px] text-phase-interactive opacity-60">
                    {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
                  </ButtonText>
                </Button>

                {showDetails && (
                  <VStack className="mt-4 p-3 bg-black/10 rounded-lg border border-white/5">
                    <Text className="text-[10px] font-bold text-phase-text-primary mb-1 uppercase tracking-widest">
                      Agent Resolution Guide
                    </Text>
                    <Text className="text-[10px] text-phase-text-secondary font-mono leading-4">
                      {activeError.agentGuide || 'No agent resolution provided.'}
                    </Text>
                    {activeError.agentHint && (
                      <HStack className="mt-2 items-center gap-2">
                        <View className="px-1.5 py-0.5 bg-phase-interactive/20 rounded border border-phase-interactive/30">
                          <Text className="text-[8px] font-bold text-phase-interactive">
                            {activeError.agentHint}
                          </Text>
                        </View>
                      </HStack>
                    )}
                  </VStack>
                )}
              </ScrollView>

              <VStack className="gap-3">
                {activeError.actions?.map((action, i) => (
                  <Button
                    key={i}
                    variant={(action.variant as any) || 'solid'}
                    onPress={() => {
                      void (async () => {
                        await action.onPress();
                        dismissError();
                      })();
                    }}
                  >
                    <ButtonText>{action.label}</ButtonText>
                  </Button>
                ))}
                <Button variant="outline" onPress={dismissError}>
                  <ButtonText>Dismiss</ButtonText>
                </Button>
              </VStack>

              <HStack className="mt-6 justify-center items-center opacity-40">
                <Text className="text-[10px] text-phase-text-secondary font-mono">
                  TRACE::{activeError.id.toUpperCase()}
                </Text>
              </HStack>
            </VStack>
          </View>
        )}
      </UniversalModal>
    </ErrorResolutionContext.Provider>
  );
};

export const useErrorResolution = () => {
  const context = useContext(ErrorResolutionContext);
  if (!context) {
    throw new Error('useErrorResolution must be used within ErrorResolutionProvider');
  }
  return context;
};
