/**
 * ERRORMESSAGE DEMO - Visual Test (Zero-Legacy Ready)
 *
 * This file demonstrates all three types of ErrorMessage component
 * to ensure they render correctly with proper styling and dismiss functionality.
 */

import { View, Text, ScrollView } from 'react-native';
import ErrorMessage from '@repo/ui/components/ErrorMessage';

import { useState } from 'react';

export default function ErrorMessageDemo() {
  const [showGentle, setShowGentle] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showSevere, setShowSevere] = useState(true);

  return (
    <ScrollView className="flex-1 bg-obsidian">
      <View className="p-lg">
        <View className="gap-5">
          <Text className="text-3xl font-bold text-sacredWhite">ErrorMessage Component Demo</Text>

          {/* Gentle Type */}
          <View>
            <Text className="text-xl font-bold text-starlightGray mb-sm">Gentle (Info)</Text>
            {showGentle && (
              <ErrorMessage
                message="Your progress has been saved successfully."
                type="gentle"
                onDismiss={() => setShowGentle(false)}
              />
            )}
            {!showGentle && (
              <Text className="text-sm italic text-mistGray mt-sm">
                Gentle message dismissed. Refresh to see again.
              </Text>
            )}
          </View>

          {/* Warning Type */}
          <View>
            <Text className="text-xl font-bold text-starlightGray mb-sm">Warning</Text>
            {showWarning && (
              <ErrorMessage
                message="Please review your entries before submitting the form."
                type="warning"
                onDismiss={() => setShowWarning(false)}
              />
            )}
            {!showWarning && (
              <Text className="text-sm italic text-mistGray mt-sm">
                Warning message dismissed. Refresh to see again.
              </Text>
            )}
          </View>

          {/* Severe Type */}
          <View>
            <Text className="text-xl font-bold text-starlightGray mb-sm">Severe (Error)</Text>
            {showSevere && (
              <ErrorMessage
                message="Connection failed. Please check your internet and try again."
                type="severe"
                onDismiss={() => setShowSevere(false)}
              />
            )}
            {!showSevere && (
              <Text className="text-sm italic text-mistGray mt-sm">
                Severe message dismissed. Refresh to see again.
              </Text>
            )}
          </View>

          {/* Without Dismiss Button */}
          <View>
            <Text className="text-xl font-bold text-starlightGray mb-sm">
              Without Dismiss (Warning)
            </Text>
            <ErrorMessage
              message="This is a persistent warning message without a dismiss button."
              type="warning"
            />
          </View>

          {/* Long Message Test */}
          <View>
            <Text className="text-xl font-bold text-starlightGray mb-sm">Long Message Test</Text>
            <ErrorMessage
              message="This is a very long error message to test how the component handles text wrapping and layout when the message content is quite extensive and spans multiple lines."
              type="severe"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
