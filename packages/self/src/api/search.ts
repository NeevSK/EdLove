export { searchWisdomNotes, searchVoiceJournals, indexWisdomNotes, indexVoiceJournals, initSelfFts } from '@repo/self/lib/selfFts';
import { searchWisdomNotes, searchVoiceJournals } from '@repo/self/lib/selfFts';

export async function searchSelf(query: string) {
  const [wisdom, voice] = await Promise.all([searchWisdomNotes(query), searchVoiceJournals(query)]);
  return { wisdom, voice };
}
