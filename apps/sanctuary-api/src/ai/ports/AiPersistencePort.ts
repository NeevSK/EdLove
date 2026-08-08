export type AiPrivacyMode = 'saved' | 'temporary' | 'incognito';

export interface PersistMessageInput {
  userId: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  privacyMode: AiPrivacyMode;
  createdAt?: Date;
}

export interface AiPersistencePort {
  persistMessage(input: PersistMessageInput): Promise<void>;
}
