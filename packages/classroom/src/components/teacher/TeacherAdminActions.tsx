import React from 'react';
import { Box, Button, ButtonText, Text, Theme, useTheme, VStack } from '@repo/ui';

interface TeacherAdminButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

export const TeacherAdminButton: React.FC<TeacherAdminButtonProps> = ({ label, onClick }) => {
  const theme = useTheme();

  return (
    <Button
      variant="outline"
      action="secondary"
      onPress={onClick}
      sx={{
        width: '100%',
        borderRadius: 18,
        padding: Theme.spacing.md,
        alignItems: 'flex-start',
        borderWidth: 1,
        background: 'linear-gradient(180deg, rgba(250, 247, 237, 0.92) 0%, rgba(233, 241, 232, 0.84) 100%)',
        borderColor: theme.glass.surface.border,
      }}
    >
      <VStack sx={{ alignItems: 'flex-start' }}>
        <Text
          sx={{
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: theme.text.secondary,
          }}
        >
          Admin
        </Text>
        <ButtonText
          sx={{
            marginTop: 8,
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: '600',
            color: theme.text.primary,
          }}
        >
          {label}
        </ButtonText>
      </VStack>
    </Button>
  );
};

interface TeacherAdminActionsProps {
  actions: Array<{
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
  }>;
}

export const TeacherAdminActions: React.FC<TeacherAdminActionsProps> = ({ actions }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          base: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        },
        gap: 12,
      }}
    >
      {actions.map((action) => (
        <TeacherAdminButton key={action.id} {...action} />
      ))}
    </Box>
  );
};
