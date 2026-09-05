import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { Text, View } from '@repo/ui/primitives';
import { useMascot } from './Mascot';

export function VisualCapabilityInspector({ visible = false }: { visible?: boolean }) {
  const capabilities = useVisualCapabilities();
  const mascot = useMascot();

  if (!visible) return null;

  return (
    <View className="absolute left-3 right-3 bottom-3 rounded-xl bg-black/85 p-3 z-50">
      <Text className="text-white font-bold">Visual runtime</Text>
      <Text className="text-white text-xs">
        {mascot.id} · {mascot.role ?? 'guide'} · {capabilities.deviceTier} ·{' '}
        {capabilities.effectiveFidelity}
      </Text>
      <Text className="text-white text-xs">
        quality={capabilities.quality} blur={String(capabilities.allowBlur)} ambient=
        {String(capabilities.allowAmbientEffects)} motion=
        {String(capabilities.allowSubtleAnimation)}
      </Text>
      <Text className="text-white text-xs">
        cache={capabilities.imageCachePolicy} decode={capabilities.imageDecodeFormat} prefetch=
        {String(capabilities.shouldPrefetchAssets)}
      </Text>
      <Text className="text-white text-xs">
        levels: motion={capabilities.experience.motion} visual=
        {capabilities.experience.visualEffects} haptics={capabilities.experience.haptics} sound=
        {capabilities.experience.sound} celebration=
        {capabilities.experience.celebration}
      </Text>
      <Text className="text-white text-xs">
        budgets: particles={capabilities.experience.maxParticles} sounds=
        {capabilities.experience.maxConcurrentSounds}
      </Text>
    </View>
  );
}
