import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { identityAPI as rawIdentityAPI } from '../identity';
import { identityContract } from '../identity.contract';
import { profileAPI as rawProfileAPI } from '../profile';
import { profileContract } from '../profile.contract';

const _identityCoverage = assertContractCoverage(
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
      'getMyInternalId',
      'updateProfile',
    ], // Explicitly internal or handled via POA
  }),
);

export const identityAPI = rawIdentityAPI;

const _profileCoverage = assertContractCoverage(
  rawProfileAPI,
  defineContractCoverage({
    moduleName: 'profile',
    contract: profileContract,
    methodMapping: {
      getUserProfile: 'getUserProfile',
      updateProfile: 'updateProfile',
      getJourneySnapshot: 'getJourneySnapshot',
      getSchoolPulse: 'getSchoolPulse',
    },
    internalMethods: [
      'getCommunityProfileAsOf',
      'getCommunityProfile',
      'updateCommunityProfile',
      'getCommunityProfileHistory',
      'getUserProfileAsOf',
      'uploadAvatar',
      'getUserProfileHistory',
      'getSocialLinks',
      'upsertSocialLink',
      'deleteSocialLink',
    ],
  }),
);

export const profileAPI = rawProfileAPI;
