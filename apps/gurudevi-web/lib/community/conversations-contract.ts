import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import '@repo/core/api/community';
import type { MockDirectConversation } from '@repo/core/api/mockData';

export interface DMConversation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isSpecial?: boolean;
  snippet: string;
}

export function getExploreSampleConversations(): readonly DMConversation[] {
  const raw = getSandboxSamples<MockDirectConversation[]>(
    'community',
    'getDirectConversations',
    [],
    [],
  );
  return raw.map((c) => ({
    id: c.participant_id || c.id,
    name: c.participant_name,
    role: c.role || 'Member',
    avatar: c.is_special ? (c.id === 'tutii' ? '✨' : '📌') : '👤',
    isSpecial: Boolean(c.is_special),
    snippet: c.last_message,
  }));
}
