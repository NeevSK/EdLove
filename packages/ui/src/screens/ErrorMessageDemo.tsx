import React, { useState } from 'react';
import { Box, VStack, Heading, Text, ScrollView } from '../gluestack';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../hooks/useTheme';
import ScreenWrapper from '../components/ScreenWrapper';

export default function ErrorMessageDemo() {
  const [showGentle, setShowGentle] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showSevere, setShowSevere] = useState(true);
  const { text } = useTheme();

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1">
        <VStack className="p-6 gap-8">
          <Heading size="xl" className="mb-4">
            ErrorMessage Component Demo
          </Heading>

          {/* Gentle Type */}
          <VStack className="gap-2">
            <Text size="sm" className="font-bold text-phase-muted uppercase tracking-widest">
              Gentle (Info)
            </Text>
            {showGentle && (
              <ErrorMessage
                message="Your progress has been saved successfully."
                type="gentle"
                onDismiss={() => setShowGentle(false)}
              />
            )}
            {!showGentle && (
              <Text className="italic opacity-50">
                Gentle message dismissed. Refresh to see again.
              </Text>
            )}
          </VStack>

          {/* Warning Type */}
          <VStack className="gap-2">
            <Text size="sm" className="font-bold text-phase-muted uppercase tracking-widest">
              Warning
            </Text>
            {showWarning && (
              <ErrorMessage
                message="Please review your entries before submitting the form."
                type="warning"
                onDismiss={() => setShowWarning(false)}
              />
            )}
            {!showWarning && (
              <Text className="italic opacity-50">
                Warning message dismissed. Refresh to see again.
              </Text>
            )}
          </VStack>

          {/* Severe Type */}
          <VStack className="gap-2">
            <Text size="sm" className="font-bold text-phase-muted uppercase tracking-widest">
              Severe (Error)
            </Text>
            {showSevere && (
              <ErrorMessage
                message="Connection failed. Please check your internet and try again."
                type="severe"
                onDismiss={() => setShowSevere(false)}
              />
            )}
            {!showSevere && (
              <Text className="italic opacity-50">
                Severe message dismissed. Refresh to see again.
              </Text>
            )}
          </VStack>

          {/* Without Dismiss Button */}
          <VStack className="gap-2">
            <Text size="sm" className="font-bold text-phase-muted uppercase tracking-widest">
              Without Dismiss (Warning)
            </Text>
            <ErrorMessage
              message="This is a persistent warning message without a dismiss button."
              type="warning"
            />
          </VStack>

          {/* Long Message Test */}
          <VStack className="gap-2">
            <Text size="sm" className="font-bold text-phase-muted uppercase tracking-widest">
              Long Message Test
            </Text>
            <ErrorMessage
              message="This is a very long error message to test how the component handles text wrapping and layout when the message content is quite extensive and spans multiple lines."
              type="severe"
            />
          </VStack>
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
}
