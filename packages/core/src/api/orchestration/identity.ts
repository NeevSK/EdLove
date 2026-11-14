import { assertContractCoverage, defineContractCoverage } from '@repo/core/api/contractCoverage';
import { identityAPI as rawIdentityAPI } from '@repo/core/api/identity';
import { identityContract } from '@repo/core/api/identity.contract';
import { profileAPI as rawProfileAPI } from '@repo/core/api/profile';
import { profileContract } from '@repo/core/api/profile.contract';

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
      'getClassroomCapacitySummary',
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
