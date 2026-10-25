import { dailyContentRouter } from '../../core/handlers/dailyContent';
import { editorialRouter } from '../../core/handlers/editorial';
import { libraryRouter } from '../../core/handlers/library';
import { mappingRouter } from '../../core/handlers/mapping';
import { mediaRouter } from '../../core/handlers/media';
import { schoolForestRouter } from '../../core/handlers/schoolForest';
import { o } from '../../core/orpc';

/**
 * Library Bounded Context (Epistemic Commons & Knowledge Atlas)
 * 
 * Grounded in @repo/library, @repo/editorial, @repo/scanner-kit:
 * Public knowledge commons, educational resource curation, concept mapping, and natural atlas.
 */
export const libraryDomainRouter = o.router({
  // Direct procedures from libraryRouter (catalog, search, engagement, etc.)
  ...libraryRouter,

  // Explicit sub-capabilities within the Library Bounded Context
  catalog: libraryRouter,
  library: libraryRouter,
  dailyContent: dailyContentRouter,
  editorial: editorialRouter,
  media: mediaRouter,
  mapping: mappingRouter,
  schoolForest: schoolForestRouter,
});

export {
  libraryRouter,
  dailyContentRouter,
  editorialRouter,
  mediaRouter,
  mappingRouter,
  schoolForestRouter,
};
