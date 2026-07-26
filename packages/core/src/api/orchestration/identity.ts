import { assertContractCoverage, defineContractCoverage } from '@/api/contractCoverage';
import { identityAPI as rawIdentityAPI } from '@/api/identity';
import { identityContract } from '@/api/identity.contract';
import { profileAPI as rawProfileAPI } from '@/api/profile';
import { profileContract } from '@/api/profile.contract';

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
