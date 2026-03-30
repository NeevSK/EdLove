import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@repo/ui';

interface GuardianHeaderProps {
  studentCount: number;
  isDesktop?: boolean;
}

export const GuardianHeader: React.FC<GuardianHeaderProps> = ({ studentCount, isDesktop }) => {
  const theme = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: theme.glass.surface.border }]}      <Text 
        style={[
          styles.title,
          { 
            color: theme.text.primary,
            fontWeight: '700',
            fontSize: isDesktop ? 32 : 24
          }
        ]}
              Guardian Dashboard
      </Text      <Text 
        style={[
          styles.subtitle,
          { 
            color: theme.text.secondary,
            fontSize: isDesktop ? 16 : 14
          }
        ]}
              {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
      </Text    </View  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
});
