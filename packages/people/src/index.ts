import { peopleDirectoryAPI } from './directory';
import { teacherFeedbackAPI } from './feedback';
import { peopleMembershipsAPI } from './memberships';
import { staffOperationsAPI } from './staff';

export * from './directory';
export * from './feedback';
export * from './memberships';
export * from './staff';
export * from './components';
export * from './hooks/useStaffPresence';
export * from './hooks/useSchoolPulse';
export * from './hooks/useSchoolProfile';
export * from './api/staff';
export * from './lib/vows';

export const peopleAPI = {
  directory: peopleDirectoryAPI,
  feedback: teacherFeedbackAPI,
  memberships: peopleMembershipsAPI,
  staff: staffOperationsAPI,
};
