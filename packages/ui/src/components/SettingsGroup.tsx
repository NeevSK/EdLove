import { tokens } from '@repo/ui/tokens';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import type { ReactNode } from 'react';

export interface SettingsGroupProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export interface SettingsRowProps {
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value?: string;
  badge?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  testID?: string;
}

function SettingsGroup({ title, subtitle, children }: SettingsGroupProps) {
  return (
    <VStack
      style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.radii.lg,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        overflow: 'hidden',
      }}
      accessibilityLabel={title}
    >
      {title ? (
        <Box style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
          <Text
            style={{
              color: tokens.colors.inkSubtle,
              fontSize: tokens.typography.sizes.xs,
              fontWeight: '700',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: tokens.colors.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
          ) : null}
        </Box>
      ) : null}
      <VStack style={{ paddingBottom: 4 }}>{children}</VStack>
    </VStack>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  badge,
  trailing,
  onPress,
  destructive,
  testID,
}: SettingsRowProps) {
  const content = (
    <HStack
      style={{
        minHeight: 52,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 12,
      }}
    >
      {Icon ? <Icon size={18} color={destructive ? tokens.colors.error : tokens.colors.ink} /> : null}
      <Text
        style={{
          flex: 1,
          color: destructive ? tokens.colors.error : tokens.colors.ink,
          fontSize: tokens.typography.sizes.sm,
          fontWeight: '600',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {badge ? (
        <Box
          style={{
            backgroundColor: tokens.colors.primary,
            borderRadius: tokens.radii.full,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: tokens.colors.textInverse, fontSize: 10, fontWeight: '800' }}>{badge}</Text>
        </Box>
      ) : null}
      {value ? (
        <Text style={{ color: tokens.colors.textMuted, fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing ? trailing : null}
    </HStack>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{ opacity: 1 }}
      >
        {content}
      </Pressable>
    );
  }

  return <Box testID={testID}>{content}</Box>;
}

function SettingsDivider() {
  return <Box style={{ height: 1, backgroundColor: tokens.colors.border, marginHorizontal: 16, opacity: 0.6 }} />;
}

SettingsGroup.Row = SettingsRow;
SettingsGroup.Divider = SettingsDivider;

export default SettingsGroup;
export { SettingsGroup, SettingsRow, SettingsDivider };
