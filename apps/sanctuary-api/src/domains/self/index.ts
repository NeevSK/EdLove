import { decisionJournalRouter } from '../../core/handlers/decisionJournal';
import { echoRouter } from '../../core/handlers/echo';
import { journalEntriesRouter } from '../../core/handlers/journalEntries';
import { learningReflectionsRouter } from '../../core/handlers/learningReflections';
import { sacredMissionsRouter } from '../../core/handlers/sacredMissions';
import { selfRouter } from '../../core/handlers/self';
import { warmMirrorRouter } from '../../core/handlers/warmMirror';
import { o } from '../../core/orpc';

/**
 * Self Bounded Context (Wellbeing, Inner Practice, Reflections)
 * 
 * Grounded in @repo/self and Sanctuary Soul Covenant:
 * Private, person-owned by default. Not surveilled by institutions.
 */
export const selfDomainRouter = o.router({
  // Direct procedures from selfRouter (logMood, getMoodHistory, getMoodAnalytics, etc.)
  ...selfRouter,

  // Explicit sub-capabilities within the Self Bounded Context
  wellbeing: selfRouter,
  learningReflections: learningReflectionsRouter,
  decisionJournal: decisionJournalRouter,
  journalEntries: journalEntriesRouter,
  sacredMissions: sacredMissionsRouter,
  warmMirror: warmMirrorRouter,
  echoes: echoRouter,
});

export {
  selfRouter,
  learningReflectionsRouter,
  decisionJournalRouter,
  journalEntriesRouter,
  sacredMissionsRouter,
  warmMirrorRouter,
  echoRouter,
};
