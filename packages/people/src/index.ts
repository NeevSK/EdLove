import { peopleDirectoryAPI } from '@people/directory';
import { teacherFeedbackAPI } from '@people/feedback';
import { peopleMembershipsAPI } from '@people/memberships';
import { staffAPI } from '@people/staff';

export * from '@people/components';
export * from '@people/directory';
export * from '@people/feedback';
export * from '@people/hooks';
export * from '@people/memberships';
export * from '@people/staff';

export const peopleAPI = {
  directory: peopleDirectoryAPI,
  feedback: teacherFeedbackAPI,
  memberships: peopleMembershipsAPI,
  staff: staffAPI,
};
