import { peopleDirectoryAPI } from './directory';
import { teacherFeedbackAPI } from './feedback';
import { peopleMembershipsAPI } from './memberships';
import { staffAPI } from './staff';

export * from './directory';
export * from './feedback';
export * from './memberships';
export * from './staff';
export * from './components';
export * from './hooks';

export const peopleAPI = {
  directory: peopleDirectoryAPI,
  feedback: teacherFeedbackAPI,
  memberships: peopleMembershipsAPI,
  staff: staffAPI,
};
