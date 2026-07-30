import { peopleDirectoryAPI } from '@repo/people/directory';
import { teacherFeedbackAPI } from '@repo/people/feedback';
import { peopleMembershipsAPI } from '@repo/people/memberships';
import { staffAPI } from '@repo/people/staff';

export * from '@repo/people/components';
export * from '@repo/people/directory';
export * from '@repo/people/feedback';
export * from '@repo/people/hooks';
export * from '@repo/people/memberships';
export * from '@repo/people/staff';

export const peopleAPI = {
  directory: peopleDirectoryAPI,
  feedback: teacherFeedbackAPI,
  memberships: peopleMembershipsAPI,
  staff: staffAPI,
};
