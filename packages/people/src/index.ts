import { peopleDirectoryAPI } from './directory';
import { teacherFeedbackAPI } from './feedback';
import { peopleMembershipsAPI } from './memberships';
import { staffAPI } from './staff';

export * from './components';
export * from './directory';
export * from './feedback';
export * from './hooks';
export * from './memberships';
export * from './staff';

export const peopleAPI = {
  directory: peopleDirectoryAPI,
  feedback: teacherFeedbackAPI,
  memberships: peopleMembershipsAPI,
  staff: staffAPI,
};
