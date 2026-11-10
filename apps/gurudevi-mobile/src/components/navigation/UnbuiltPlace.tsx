import { EmptyState } from '@repo/ui/components/native';
import { View } from 'react-native';

/** A tab whose domain has no v1 procedures yet: a real place, honest about being empty. */
export function UnbuiltPlace({ title, message }: { title: string; message: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <EmptyState title={title} message={message} />
    </View>
  );
}
