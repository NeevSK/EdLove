import { staffManagementAPI as _staffManagementAPI } from '../staffManagement';
import { attendanceAPI as rawAttendanceAPI } from '../attendance';
import { schoolAPI as rawSchoolAPI } from '../school';
import { inventoryAPI as rawInventoryAPI } from '../inventory';
import { operationsContract } from '../operations.contract';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { createPOAProxy } from '../poaProxy';
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
      getByDate: 'getAttendance',
      record: 'recordAttendance',
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
