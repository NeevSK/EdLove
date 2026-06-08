import { AIAssistantScreen } from '@repo/ai';
import { Center, Spinner } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner />
    </Center>
  );
}

export default function AIAssistantRoute() {
  return (
    <Suspense fallback={<Fallback />}>
      <AIAssistantScreen />
    </Suspense>
  );
}
