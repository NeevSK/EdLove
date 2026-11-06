export {
  indexVoiceJournals,
  indexWisdomNotes,
  initSelfFts,
  searchVoiceJournals,
  searchWisdomNotes,
} from '@repo/self/lib/selfFts';

import { searchVoiceJournals, searchWisdomNotes } from '@repo/self/lib/selfFts';

export async function searchSelf(query: string) {
  const [wisdom, voice] = await Promise.all([searchWisdomNotes(query), searchVoiceJournals(query)]);
  return { wisdom, voice };
}
