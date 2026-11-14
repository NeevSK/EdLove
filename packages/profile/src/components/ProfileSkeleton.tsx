import { WorldSkeleton } from '@repo/ui/components/native';
import { useWindowDimensions, View } from 'react-native';

/**
 * PROFILE SKELETON
 * Sanctuary V3 standard for profile loading states.
 */
export default function ProfileSkeleton() {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-1 bg-phase-canvas p-4">
      <View className="gap-6">
        {/* Identity Card Placeholder */}
        <View className="items-center justify-center">
          <WorldSkeleton width={width - 48} height={200} radius={24} />
        </View>

        {/* Stats Card Placeholder */}
        <View>
          <WorldSkeleton height={120} />
        </View>

        {/* Achievements Placeholder */}
        <View>
          <WorldSkeleton width={150} height={14} className="mb-3" />
          <View className="flex-row items-center gap-3">
            <WorldSkeleton width={60} height={60} radius={30} />
            <WorldSkeleton width={60} height={60} radius={30} />
            <WorldSkeleton width={60} height={60} radius={30} />
            <WorldSkeleton width={60} height={60} radius={30} />
          </View>
        </View>

        {/* Contact Info Placeholder */}
        <View className="p-5 rounded-2xl border border-phase-surface">
          <WorldSkeleton width={100} height={14} className="mb-4" />
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <WorldSkeleton width={18} height={18} radius={9} />
              <View className="flex-1">
                <WorldSkeleton width={60} height={14} className="mb-1" />
                <WorldSkeleton width="80%" height={14} />
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <WorldSkeleton width={18} height={18} radius={9} />
              <View className="flex-1">
                <WorldSkeleton width={60} height={14} className="mb-1" />
                <WorldSkeleton width="60%" height={14} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
