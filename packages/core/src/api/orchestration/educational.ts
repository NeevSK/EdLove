import { assignmentsAPI as rawAssignmentsAPI } from '@repo/core/api/assignments';
import { lessonsAPI as rawLessonsAPI, studentsAPI as rawStudentsAPI } from '@repo/core/api/classroom';
import { classroomGroupsAPI as rawClassroomGroupsAPI } from '@repo/core/api/classroomGroups';
import { classroomNotesAPI as rawClassroomNotesAPI } from '@repo/core/api/classroomNotes';
import { classroomStudentsAPI as rawClassroomStudentsAPI } from '@repo/core/api/classroomStudents';
import { classroomsAPI as rawClassroomsAPI } from '@repo/core/api/classrooms';
import { assertContractCoverage, defineContractCoverage } from '@repo/core/api/contractCoverage';
import { educationalContract } from '@repo/core/api/educational.contract';
import { lessonMaterialsAPI as rawLessonMaterialsAPI } from '@repo/core/api/lessonMaterials';
import { createTemporalProxy } from '@repo/core/api/temporalProxy';

const _classroomsCoverage = assertContractCoverage(
  rawClassroomsAPI,
  defineContractCoverage({
    moduleName: 'classrooms',
    contract: educationalContract,
    internalMethods: ['update', 'create', 'delete', 'getTeacherClassrooms'],
  }),
);

export const classroomsAPI = createTemporalProxy('classrooms', rawClassroomsAPI);

const _lessonsCoverage = assertContractCoverage(
  rawLessonsAPI,
  defineContractCoverage({
    moduleName: 'lessons',
    contract: educationalContract,
    methodMapping: {
      create: 'createLesson',
      update: 'updateLesson',
      delete: 'deleteLesson',
    },
  }),
);

export const lessonsAPI = createTemporalProxy('lessons', rawLessonsAPI);

const _studentsCoverage = assertContractCoverage(
  rawStudentsAPI,
  defineContractCoverage({
    moduleName: 'students',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getClassroomStudents',
      enroll: 'enrollClassroomStudent',
      remove: 'removeClassroomStudent',
      create: 'add',
      update: 'updateById',
      getHistoricalAcademicRecords: 'getHistoricalAcademicRecords',
      getHistoricalProfessionalRecords: 'getHistoricalProfessionalRecords',
      getHistoricalGovernanceRecords: 'getHistoricalGovernanceRecords',
      getSchoolLegacyHistory: 'getSchoolLegacyHistory',
      getClassroomLegacyHistory: 'getClassroomLegacyHistory',
    },
    internalMethods: [
      'getAll',
      'enroll',
      'remove',
      'create',
      'update',
      'getHistoricalAcademicRecords',
      'getHistoricalProfessionalRecords',
      'getHistoricalGovernanceRecords',
      'getSchoolLegacyHistory',
      'getClassroomLegacyHistory',
      'removeById',
    ],
  }),
);

export const studentsAPI = createTemporalProxy('students', rawStudentsAPI);

const _assignmentsCoverage = assertContractCoverage(
  rawAssignmentsAPI,
  defineContractCoverage({
    moduleName: 'assignments',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getAssignments',
      getByLesson: 'getByLessonAssignment',
      getUpcomingForStudent: 'getUpcomingAssignmentsForStudent',
      getSubmissionHistoryForStudent: 'getStudentSubmissionHistory',
      submitSubmission: 'submitAssignmentSubmission',
      update: 'updateAssignment',
      delete: 'deleteAssignment',
    },
    internalMethods: [
      'getAll',
      'getByLesson',
      'getUpcomingForStudent',
      'getSubmissionHistoryForStudent',
      'getRecentGradesOverviewForStudent',
      'submitSubmission',
      'create',
      'update',
      'delete',
    ],
  }),
);

export const assignmentsAPI = createTemporalProxy('assignments', rawAssignmentsAPI);

const _classroomGroupsCoverage = assertContractCoverage(
  rawClassroomGroupsAPI,
  defineContractCoverage({
    moduleName: 'classroomGroups',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getClassroomGroups',
      create: 'createClassroomGroup',
      update: 'updateClassroomGroup',
      delete: 'deleteClassroomGroup',
    },
    internalMethods: ['getAll', 'create', 'update', 'delete'],
  }),
);

export const classroomGroupsAPI = createTemporalProxy('classroomGroups', rawClassroomGroupsAPI);

const _classroomStudentsCoverage = assertContractCoverage(
  rawClassroomStudentsAPI,
  defineContractCoverage({
    moduleName: 'classroomStudents',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getEnrollmentRecords',
      update: 'updateEnrollmentRecord',
      remove: 'deleteEnrollmentRecord',
    },
    internalMethods: [
      'getAll',
      'addShadowStudent',
      'claimStudent',
      'add',
      'updateById',
      'update',
      'remove',
    ],
  }),
);

export const classroomStudentsAPI = createTemporalProxy(
  'classroomStudents',
  rawClassroomStudentsAPI,
);

const _lessonMaterialsCoverage = assertContractCoverage(
  rawLessonMaterialsAPI,
  defineContractCoverage({
    moduleName: 'lessonMaterials',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getAllMaterials',
      getByLesson: 'getByLessonMaterial',
      create: 'createMaterial',
      update: 'updateMaterial',
      delete: 'deleteMaterial',
    },
    internalMethods: ['getAll', 'getByLesson', 'create', 'update', 'delete'],
  }),
);

export const lessonMaterialsAPI = createTemporalProxy('lessonMaterials', rawLessonMaterialsAPI);

const _classroomNotesCoverage = assertContractCoverage(
  rawClassroomNotesAPI,
  defineContractCoverage({
    moduleName: 'classroomNotes',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getClassroomNotes',
      getSnapshotAsOf: 'getClassroomNoteSnapshot',
      create: 'createClassroomNote',
      update: 'updateClassroomNote',
      delete: 'deleteClassroomNote',
      getTimeline: 'getClassroomNoteTimeline',
    },
  }),
);

export const classroomNotesAPI = createTemporalProxy('classroomNotes', rawClassroomNotesAPI);
