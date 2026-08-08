import { type AiPersistencePort, type PersistMessageInput } from '../ports/AiPersistencePort';

const TEMPORARY_TTL_MS = 24 * 60 * 60 * 1000; // temporary messages expire after 24h

export class DbAiPersistenceAdapter implements AiPersistencePort {
  constructor(private db: any) {}

  async persistMessage(input: PersistMessageInput): Promise<void> {
    if (!this.db) return;
    // incognito messages are never persisted
    if (input.privacyMode === 'incognito') return;

    try {
      await this.db.aiMessage.create({
        data: {
          thread_id: input.threadId,
          user_id: input.userId,
          role: input.role,
          content: input.content,
          privacy_mode: input.privacyMode,
          expires_at:
            input.privacyMode === 'temporary' ? new Date(Date.now() + TEMPORARY_TTL_MS) : null,
          created_at: input.createdAt ?? new Date(),
        },
      });
    } catch (err) {
      console.error('[AiPersistence] Failed to persist AI message:', err);
    }
  }
}
