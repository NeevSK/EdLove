import { EmptyState } from '@repo/ui/components/native';
import { View } from 'react-native';

/** A tab whose domain has no v1 procedures yet: a real place, honest about being empty. */
export function UnbuiltPlace({ title, message }: { title: string; message: string }) {
  return (
    <View className="flex-1 justify-center p-6">
      <EmptyState title={title} message={message} />
    </View>
  );
}
