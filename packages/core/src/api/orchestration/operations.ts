import { attendanceAPI as rawAttendanceAPI } from '../attendance';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { inventoryAPI as rawInventoryAPI } from '../inventory';
import { operationsContract } from '../operations.contract';
import { schoolAPI as rawSchoolAPI } from '../school';
import { staffManagementAPI as _staffManagementAPI } from '../staffManagement';
import { createTemporalPOAProxy } from '../temporalPOAProxy';

export const staffManagementAPI = createTemporalPOAProxy(
  'staffManagement',
  _staffManagementAPI,
  operationsContract,
);

const attendanceCoverage = assertContractCoverage(
  rawAttendanceAPI,
  defineContractCoverage({
    moduleName: 'attendance',
    contract: operationsContract,
    methodMapping: {
      fetchClassroomAttendance: 'getAttendance',
      upsertAttendanceRecord: 'recordAttendance',
      batchRecord: 'batchRecordAttendance',
      getForStudent: 'getAttendanceForStudent',
      getClassroomAttendanceSnapshot: 'getClassroomAttendanceSnapshot',
      getStudentAttendanceTimeline: 'getStudentAttendanceTimeline',
      getSchoolAttendancePulse: 'getSchoolAttendancePulse',
      getAttendanceReport: 'getAttendanceReport',
    },
    internalMethods: ['logAttendanceAudit'],
  }),
);

export const attendanceAPI = createTemporalPOAProxy(
  'attendance',
  rawAttendanceAPI,
  attendanceCoverage.contract,
  attendanceCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const schoolCoverage = assertContractCoverage(
  rawSchoolAPI,
  defineContractCoverage({
    moduleName: 'school',
    contract: operationsContract,
    methodMapping: {
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
    internalMethods: [
      'create',
      'initializePersonalWorkspace',
      'getSchool',
      'update',
      'searchSchools',
      'getSections',
      'getGrades',
      'getSchoolStats',
      'getInviteCodes',
      'createSection',
      'createGrade',
      'generateInviteCode',
    ],
  }),
);

export const schoolAPI = createTemporalPOAProxy(
  'school',
  rawSchoolAPI,
  schoolCoverage.contract,
  schoolCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const inventoryCoverage = assertContractCoverage(
  rawInventoryAPI,
  defineContractCoverage({
    moduleName: 'inventory',
    contract: operationsContract,
    methodMapping: {
      getAll: 'getInventory',
      update: 'updateInventory',
      createRequest: 'createInventoryRequest',
      getSchoolResourceNeeds: 'getSchoolResourceNeeds',
      getSchoolRequests: 'getSchoolRequests',
    },
    internalMethods: [
      'getAll',
      'update',
      'createRequest',
      'getSchoolResourceNeeds',
      'getSchoolRequests',
    ],
  }),
);

export const inventoryAPI = createTemporalPOAProxy(
  'inventory',
  rawInventoryAPI,
  inventoryCoverage.contract,
  inventoryCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
