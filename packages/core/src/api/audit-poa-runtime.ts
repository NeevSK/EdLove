import { assignmentsAPI } from './assignments';
import { classroomGroupsAPI } from './classroomGroups';
import { classroomNotesAPI } from './classroomNotes';
import { classroomStudentsAPI } from './classroomStudents';
import { communityAPI } from './community';
import { founderAPI } from './founder';
import { gradingAPI } from './grading';
import { guardianAPI } from './guardian';
import { identityAPI } from './identity';
import { api } from './index';
import { inventoryAPI } from './inventory';
import { lessonMaterialsAPI } from './lessonMaterials';
import { longitudinalAPI } from './longitudinal';
import { principalWorkspaceAPI } from './principalWorkspace';
import { profileAPI } from './profile';
import { schoolAPI } from './school';
import { teacherInsightsAPI } from './teacherInsights';

const {
  growth: growthAPI,
  pro: proAPI,
  missions: missionsAPI,
  ripples: ripplesAPI,
  growthState: growthStateAPI,
  students: studentsAPI,
  lessons: lessonsAPI,
  classrooms: classroomsAPI,
  attendance: attendanceAPI,
} = api;

import { classroomNotesContract } from './classroomNotes.contract';
import { communityContract } from './community.contract';
import { assertContractCoverage } from './contractCoverage';
import { educationalContract } from './educational.contract';
import { founderContract } from './founder.contract';
import { gradingContract } from './grading.contract';
import { growthContract } from './growth.contract';
import { guardianContract } from './guardian.contract';
import { identityContract } from './identity.contract';
import { longitudinalContract } from './longitudinal.contract';
import { operationsContract } from './operations.contract';
import { principalWorkspaceContract } from './principalWorkspace.contract';
import { proContract } from './pro.contract';
import { profileContract } from './profile.contract';
import { teacherInsightsContract } from './teacherInsights.contract';

const modules: Array<{
  name: string;
  api: any;
  contract: any;
  mapping?: any;
  internal?: string[];
}> = [
  {
    name: 'identity',
    api: identityAPI,
    contract: identityContract,
    mapping: {
      resolveInternalId: 'resolveIdentity',
      getMyInternalId: 'resolveIdentity',
      updateProfile: 'updateProfile',
    },
    internal: ['linkIdentity', 'clearCache'],
  },
  {
    name: 'school',
    api: schoolAPI,
    contract: operationsContract,
    mapping: {
      create: 'createSchool',
      searchSchools: 'searchSchools',
      getSchool: 'getSchool',
      getSchoolStats: 'getSchoolStats',
      getSections: 'getSchoolSections',
      getGrades: 'getSectionGrades',
      getInviteCodes: 'getInviteCodes',
      generateInviteCode: 'generateInviteCode',
      update: 'updateSchool',
      createSection: 'createSchoolSection',
      createGrade: 'createSectionGrade',
    },
  },
  {
    name: 'inventory',
    api: inventoryAPI,
    contract: operationsContract,
    mapping: {
      getAll: 'getInventory',
      update: 'updateInventory',
      createRequest: 'createInventoryRequest',
      getSchoolResourceNeeds: 'getSchoolResourceNeeds',
      getSchoolRequests: 'getSchoolRequests',
    },
  },
  {
    name: 'profile',
    api: profileAPI,
    contract: profileContract,
    mapping: { getSchoolPulse: 'getSchoolPulse' },
  },
  {
    name: 'attendance',
    api: attendanceAPI,
    contract: operationsContract,
    mapping: {
      getByDate: 'getAttendance',
      record: 'recordAttendance',
      batchRecord: 'batchRecordAttendance',
      getForStudent: 'getAttendanceForStudent',
      getClassroomAttendanceSnapshot: 'getClassroomAttendanceSnapshot',
      getStudentAttendanceTimeline: 'getStudentAttendanceTimeline',
      getSchoolAttendancePulse: 'getSchoolAttendancePulse',
      getAttendanceReport: 'getAttendanceReport',
    },
    internal: ['logAttendanceAudit'],
  },
  { name: 'classrooms', api: classroomsAPI, contract: educationalContract },
  {
    name: 'lessons',
    api: lessonsAPI,
    contract: educationalContract,
    mapping: {
      create: 'createLesson',
      update: 'updateLesson',
      delete: 'deleteLesson',
    },
  },
  {
    name: 'students',
    api: studentsAPI,
    contract: educationalContract,
    mapping: {
      getAll: 'getClassroomStudents',
      enroll: 'enrollClassroomStudent',
      remove: 'removeClassroomStudent',
      create: 'add',
      update: 'updateById',
    },
  },
  {
    name: 'assignments',
    api: assignmentsAPI,
    contract: educationalContract,
    mapping: {
      getAll: 'getAssignments',
      getByLesson: 'getByLessonAssignment',
      getUpcomingForStudent: 'getUpcomingAssignmentsForStudent',
      getSubmissionHistoryForStudent: 'getStudentSubmissionHistory',
      submitSubmission: 'submitAssignmentSubmission',
      update: 'updateAssignment',
      delete: 'deleteAssignment',
    },
  },
  {
    name: 'classroomGroups',
    api: classroomGroupsAPI,
    contract: educationalContract,
    mapping: {
      getAll: 'getClassroomGroups',
      create: 'createClassroomGroup',
      update: 'updateClassroomGroup',
      delete: 'deleteClassroomGroup',
    },
  },
  {
    name: 'classroomStudents',
    api: classroomStudentsAPI,
    contract: educationalContract,
    mapping: {
      getAll: 'getClassroomStudents',
      enroll: 'enrollClassroomStudent',
      remove: 'removeClassroomStudent',
    },
  },
  {
    name: 'lessonMaterials',
    api: lessonMaterialsAPI,
    contract: educationalContract,
    mapping: {
      getAll: 'getAllMaterials',
      getByLesson: 'getByLessonMaterial',
      create: 'createMaterial',
      update: 'updateMaterial',
      delete: 'deleteMaterial',
    },
  },
  {
    name: 'grading',
    api: gradingAPI,
    contract: gradingContract,
    mapping: {
      saveGradeDraft: 'saveGradeDraft',
      getGradebookSnapshot: 'getGradebookSnapshot',
      getStudentGradeTimeline: 'getStudentGradeTimeline',
      getPublishedStudentGrades: 'getPublishedStudentGrades',
      getSchoolGradingCompletion: 'getSchoolGradingCompletion',
      getSchoolPublishedGradingCompletion: 'getSchoolPublishedGradingCompletion',
      publishGrade: 'publishGrade',
      revisePublishedGrade: 'revisePublishedGrade',
      overrideGrade: 'overrideGrade',
    },
    internal: ['getGradeLifecycleRows'],
  },
  {
    name: 'community',
    api: communityAPI,
    contract: communityContract,
    mapping: {
      getGroupById: 'getGroup',
      get: 'getGroup',
      getGroupMessages: 'getMessages',
      sendGroupMessage: 'sendMessage',
      togglePostReaction: 'toggleReaction',
      createGroupWithOwner: 'createGroup',
    },
  },
  { name: 'founder', api: founderAPI, contract: founderContract },
  {
    name: 'guardian',
    api: guardianAPI,
    contract: guardianContract,
    mapping: {
      createProfile: 'createGuardianProfile',
      getProfile: 'getGuardianProfile',
      updateProfile: 'updateGuardianProfile',
      getStudents: 'getGuardianStudents',
      getDashboard: 'getGuardianDashboard',
      updatePermissions: 'updateGuardianPermissions',
      terminateRelationship: 'terminateGuardianRelationship',
      updateNotificationSettings: 'updateGuardianNotificationSettings',
    },
  },
  {
    name: 'principalWorkspace',
    api: principalWorkspaceAPI,
    contract: principalWorkspaceContract,
  },
  {
    name: 'teacherInsights',
    api: teacherInsightsAPI,
    contract: teacherInsightsContract,
  },
  {
    name: 'longitudinal',
    api: longitudinalAPI,
    contract: longitudinalContract,
  },
  {
    name: 'classroomNotes',
    api: classroomNotesAPI,
    contract: classroomNotesContract,
    mapping: {
      getAll: 'listVisibleNotes',
      getSnapshotAsOf: 'getVisibleNotesSnapshot',
      create: 'createClassroomNote',
      update: 'updateClassroomNote',
      delete: 'deleteClassroomNote',
      getTimeline: 'getClassroomNoteTimeline',
    },
  },
  { name: 'growth', api: growthAPI, contract: growthContract },
  { name: 'pro', api: proAPI, contract: proContract },
  { name: 'missions', api: missionsAPI, contract: growthContract },
  { name: 'ripples', api: ripplesAPI, contract: growthContract },
  { name: 'growthState', api: growthStateAPI, contract: growthContract },
];

console.log('--- POA AUTHENTIC AUDIT ---');
const report = [];

for (const mod of modules) {
  try {
    assertContractCoverage(mod.api, {
      moduleName: mod.name,
      contract: mod.contract,
      methodMapping: mod.mapping || {},
      internalMethods: mod.internal || [],
    });
    report.push({ module: mod.name, status: 'OK' });
  } catch (e: any) {
    report.push({ module: mod.name, status: 'ERROR', message: e.message });
  }
}

console.log(JSON.stringify(report, null, 2));
