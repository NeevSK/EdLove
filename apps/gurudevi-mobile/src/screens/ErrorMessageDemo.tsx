/**
 * ERRORMESSAGE DEMO - Visual Test
 *
 * This file demonstrates all three types of ErrorMessage component
 * to ensure they render correctly with proper styling and dismiss functionality.
 */

import { ErrorMessage, mistGray, obsidian, sacredWhite, starlightGray, Theme } from '@repo/ui';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, type TextStyle, View } from 'react-native';

export default function ErrorMessageDemo() {
  const [showGentle, setShowGentle] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showSevere, setShowSevere] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>ErrorMessage Component Demo</Text>

        {/* Gentle Type */}
        <Text style={styles.sectionTitle}>Gentle (Info)</Text>
        {showGentle && (
          <ErrorMessage
            message="Your progress has been saved successfully."
            type="gentle"
            onDismiss={() => setShowGentle(false)}
          />
        )}
        {!showGentle && (
          <Text style={styles.dismissedText}>Gentle message dismissed. Refresh to see again.</Text>
        )}

        {/* Warning Type */}
        <Text style={styles.sectionTitle}>Warning</Text>
        {showWarning && (
          <ErrorMessage
            message="Please review your entries before submitting the form."
            type="warning"
            onDismiss={() => setShowWarning(false)}
          />
        )}
        {!showWarning && (
          <Text style={styles.dismissedText}>Warning message dismissed. Refresh to see again.</Text>
        )}

        {/* Severe Type */}
        <Text style={styles.sectionTitle}>Severe (Error)</Text>
        {showSevere && (
          <ErrorMessage
            message="Connection failed. Please check your internet and try again."
            type="severe"
            onDismiss={() => setShowSevere(false)}
          />
        )}
        {!showSevere && (
          <Text style={styles.dismissedText}>Severe message dismissed. Refresh to see again.</Text>
        )}

        {/* Without Dismiss Button */}
        <Text style={styles.sectionTitle}>Without Dismiss (Warning)</Text>
        <ErrorMessage
          message="This is a persistent warning message without a dismiss button."
          type="warning"
        />

        {/* Long Message Test */}
        <Text style={styles.sectionTitle}>Long Message Test</Text>
        <ErrorMessage
          message="This is a very long error message to test how the component handles text wrapping and layout when the message content is quite extensive and spans multiple lines."
          type="severe"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: obsidian,
  },
  section: {
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.h1.fontSize,
    fontWeight: Theme.typography.h1.fontWeight as TextStyle['fontWeight'],
    color: sacredWhite,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.h3.fontSize,
    fontWeight: Theme.typography.h3.fontWeight as TextStyle['fontWeight'],
    color: starlightGray,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  dismissedText: {
    color: mistGray,
    fontSize: Theme.typography.fontSize.sm,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.md,
  },
});
