import { View, Text, Pressable } from 'react-native';
import { useThemedColors } from '@repo/ui/hooks';
import { ArrowLeft, History } from '@repo/ui/icons';
import { Theme } from '@repo/ui/theme/Theme';

interface LegacyDashboardProps {
  schoolId: string;
  onBack: () => void;
}

export const LegacyDashboard = ({ schoolId, onBack }: LegacyDashboardProps) => {
  const colors = useThemedColors();

  return (
    <View className="flex-1 gap-md">
      <View
        className="rounded-generous border p-lg"
        style={{
          backgroundColor: Theme.colors.silk,
          borderColor: Theme.colors.linen,
        }}
      >
        <View className="flex-row items-center items-center justify-between gap-md">
          <View className="flex-row items-center items-center gap-md">
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to principal workspace"
              accessibilityHint="Returns to the previous admin view"
            >
              <View
                className="p-sm rounded-full border"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.border,
                }}
              >
                <ArrowLeft size={20} color={colors.text} />
              </View>
            </Pressable>
            <View className="gap-1">
              <View className="flex-row items-center items-center gap-2">
                <History size={24} color={Theme.colors.gurudeviBlue} />
                <Text className="text-xl" style={{ color: colors.text }}>
                  Institutional Legacy
                </Text>
              </View>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Longitudinal institutional memory and historical milestones for this sanctuary.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <View
          className="rounded-generous border p-lg"
          style={{
            backgroundColor: Theme.colors.silk,
            borderColor: Theme.colors.linen,
          }}
        >
          <View className="gap-2">
            <Text className="text-lg" style={{ color: colors.text }}>
              Legacy timeline
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Historical institutional memory is temporarily detached from the admin workspace
              package. Reattach the dedicated legacy surface to restore the full timeline for school
              ID `{schoolId}`.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
