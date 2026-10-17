import type { ExploreStorage } from '../../../lib/explore/types';
import {
  createAccountSafeTrySelfPracticeAdapter,
  createExploreSelfPracticeAdapter,
} from '../../../lib/sanctuary/selfExplore';
import {
  type BurnedJournalEntry,
  burnJournal,
  loadBurnedJournalHistory,
} from '../../../lib/sanctuary/selfJournal';

export type FireJournalAdapter = Readonly<{
  loadJournal(): Promise<readonly BurnedJournalEntry[]>;
  burnJournal(content: string): Promise<BurnedJournalEntry>;
  reset?(): Promise<void>;
}>;

export type FireJournalRuntime = Readonly<{
  initialMode: 'live' | 'practice';
  live: FireJournalAdapter | null;
  practice: FireJournalAdapter | null;
  canPractice: boolean;
}>;

export function createFireJournalRuntime(
  input: Readonly<{
    accountId?: string;
    workspaceId?: string;
    isExploreSurface: boolean;
    exploreStorage?: ExploreStorage | null;
  }>,
): FireJournalRuntime {
  const practice = input.isExploreSurface
    ? input.exploreStorage
      ? (() => {
          const adapter = createExploreSelfPracticeAdapter({ storage: input.exploreStorage });
          return {
            loadJournal: async () => adapter.loadJournal(),
            burnJournal: async (content: string) => adapter.burnJournal(content),
            reset: async () => adapter.reset(),
          };
        })()
      : null
    : input.accountId && input.workspaceId
      ? (() => {
          const adapter = createAccountSafeTrySelfPracticeAdapter({
            accountId: input.accountId,
            workspaceId: input.workspaceId,
          });
          return {
            loadJournal: async () => adapter.loadJournal(),
            burnJournal: async (content: string) => adapter.burnJournal(content),
            reset: async () => adapter.reset(),
          };
        })()
      : null;
  const live = input.isExploreSurface
    ? null
    : {
        loadJournal: async () => (await loadBurnedJournalHistory(12)) ?? [],
        burnJournal: async (content: string) => {
          const entry = await burnJournal(content);
          if (!entry) throw new Error('Sanctuary did not confirm this Fire Journal release.');
          return entry;
        },
      };
  return {
    initialMode: input.isExploreSurface ? 'practice' : 'live',
    live,
    practice,
    canPractice: practice !== null,
  };
}
