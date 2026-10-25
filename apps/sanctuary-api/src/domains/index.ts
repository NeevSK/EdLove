import { o } from '../core/orpc';
import { communityDomainRouter } from './community';
import { identityDomainRouter } from './identity';
import { libraryDomainRouter } from './library';
import { selfDomainRouter } from './self';
import { workspaceDomainRouter } from './workspace';

export * from './community';
export * from './identity';
export * from './library';
export * from './self';
export * from './workspace';

/**
 * Canonical Sanctuary Domain Router
 * 
 * Organizes the entirety of Sanctuary capabilities into the 5 core Bounded Contexts
 * established by the Sanctuary Covenant and Monorepo Package Topology:
 * 
 * 1. Self (@repo/self) - Private life, practice, wellbeing
 * 2. Workspace (@repo/classroom, @repo/workforce, @repo/admin, @repo/accounting) - Institutional learning & operations
 * 3. Library (@repo/library, @repo/editorial) - Epistemic Commons & knowledge atlas
 * 4. Community (@repo/community) - Relational fabric & communication
 * 5. Identity (@repo/core, @repo/profile, @repo/policies) - Account, bonds & governance
 */
export const canonicalDomainRouter = o.router({
  self: selfDomainRouter,
  workspace: workspaceDomainRouter,
  library: libraryDomainRouter,
  community: communityDomainRouter,
  identity: identityDomainRouter,
});
