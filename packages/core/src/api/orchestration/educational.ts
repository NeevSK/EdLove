import { classroomsAPI as rawClassroomsAPI } from '../classrooms';
import { lessonsAPI as rawLessonsAPI, studentsAPI as rawStudentsAPI } from '../classroom';
import { assignmentsAPI as rawAssignmentsAPI } from '../assignments';
import { classroomGroupsAPI as rawClassroomGroupsAPI } from '../classroomGroups';
import { classroomStudentsAPI as rawClassroomStudentsAPI } from '../classroomStudents';
import { lessonMaterialsAPI as rawLessonMaterialsAPI } from '../lessonMaterials';
import { educationalContract } from '../educational.contract';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { createTemporalPOAProxy } from '../temporalPOAProxy';

const classroomsCoverage = assertContractCoverage(
  rawClassroomsAPI,
  defineContractCoverage({
    moduleName: 'classrooms',
    contract: educationalContract,
  }),
);

export const classroomsAPI = createTemporalPOAProxy(
  'classrooms',
  rawClassroomsAPI,
  classroomsCoverage.contract,
  classroomsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const lessonsCoverage = assertContractCoverage(
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

export const lessonsAPI = createTemporalPOAProxy(
  'lessons',
  rawLessonsAPI,
  lessonsCoverage.contract,
  lessonsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const studentsCoverage = assertContractCoverage(
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
  }),
);

export const studentsAPI = createTemporalPOAProxy(
  'students',
  rawStudentsAPI,
  studentsCoverage.contract,
  studentsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const assignmentsCoverage = assertContractCoverage(
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
    internalMethods: ['getRecentGradesOverviewForStudent'],
  }),
);

export const assignmentsAPI = createTemporalPOAProxy(
  'assignments',
  rawAssignmentsAPI,
  assignmentsCoverage.contract,
  assignmentsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const classroomGroupsCoverage = assertContractCoverage(
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
  }),
);

export const classroomGroupsAPI = createTemporalPOAProxy(
  'classroomGroups',
  rawClassroomGroupsAPI,
  classroomGroupsCoverage.contract,
  classroomGroupsCoverage.methodMapping,
  { strictUnmappedMethods: true },
);

const classroomStudentsCoverage = assertContractCoverage(
  rawClassroomStudentsAPI,
  defineContractCoverage({
    moduleName: 'classroomStudents',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getEnrollmentRecords',
      update: 'updateEnrollmentRecord',
      remove: 'deleteEnrollmentRecord',
    },
  }),
);

export const classroomStudentsAPI = createTemporalPOAProxy(
  'classroomStudents',
  rawClassroomStudentsAPI,
  classroomStudentsCoverage.contract,
  classroomStudentsCoverage.methodMapping,
  { strictUnmappedMethods: true },
);

const lessonMaterialsCoverage = assertContractCoverage(
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
  }),
);

export const lessonMaterialsAPI = createTemporalPOAProxy(
  'lessonMaterials',
  rawLessonMaterialsAPI,
  lessonMaterialsCoverage.contract,
  lessonMaterialsCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
