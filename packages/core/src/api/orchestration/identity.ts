import { identityAPI as rawIdentityAPI } from '../identity';
import { identityContract } from '../identity.contract';
import { profileAPI as rawProfileAPI } from '../profile';
import { profileContract } from '../profile.contract';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { createPOAProxy } from '../poaProxy';

const identityCoverage = assertContractCoverage(
  rawIdentityAPI,
  defineContractCoverage({
    moduleName: 'identity',
    contract: identityContract,
    methodMapping: {
      identifyActiveCitizen: 'identifyActiveCitizen',
      fetchUserProfile: 'fetchUserProfile',
      modifyUserProfile: 'modifyUserProfile',
      resolveWorkspaceContext: 'resolveWorkspaceContext',
    },
    internalMethods: [
      'linkIdentity',
      'getBonds',
      'getActivePerspective',
      'switchPerspective',
    ], // Explicitly internal or handled via POA
  }),
);

export const identityAPI = createPOAProxy(
  'identity',
  rawIdentityAPI,
  identityCoverage.contract,
  identityCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
    ignoredMethods: identityCoverage.internalMethods as string[],
  },
);

const profileCoverage = assertContractCoverage(
  rawProfileAPI,
  defineContractCoverage({
    moduleName: 'profile',
    contract: profileContract,
    methodMapping: {
      getSchoolPulse: 'getSchoolPulse',
    },
  }),
);

export const profileAPI = createPOAProxy(
  'profile',
  rawProfileAPI,
  profileCoverage.contract,
  profileCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
