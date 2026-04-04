import { peopleDirectoryAPI } from './directory';
import { teacherFeedbackAPI } from './feedback';
import { peopleMembershipsAPI } from './memberships';

export * from './directory';
export * from './feedback';
export * from './memberships';
export * from './directory';
export * from './feedback';
export * from './memberships';
export * from './components';

export const peopleAPI = {
  directory: peopleDirectoryAPI,
  feedback: teacherFeedbackAPI,
  memberships: peopleMembershipsAPI,
};
