import { Text } from '@repo/ui/components/native';

/**
 * Says plainly that a room is showing sample records while its server module
 * is not open yet, so nobody mistakes them for their school's own.
 */
export function SampleNote({ what }: { what: string }) {
  return (
    <Text kind="caption" tone="soft">
      {`These are sample ${what}. Your school's own will show here once the server is ready.`}
    </Text>
  );
}
