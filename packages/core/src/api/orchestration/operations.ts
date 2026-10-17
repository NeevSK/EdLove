import { attendanceAPI as rawAttendanceAPI } from '@repo/core/api/attendance';
import { assertContractCoverage, defineContractCoverage } from '@repo/core/api/contractCoverage';
import { inventoryAPI as rawInventoryAPI } from '@repo/core/api/inventory';
import { operationsContract } from '@repo/core/api/operations.contract';
import { schoolAPI as rawSchoolAPI } from '@repo/core/api/school';
import { staffManagementAPI as _staffManagementAPI } from '@repo/core/api/staffManagement';
import { createTemporalProxy } from '@repo/core/api/temporalProxy';

export const staffManagementAPI = createTemporalProxy('staffManagement', _staffManagementAPI);

const _attendanceCoverage = assertContractCoverage(
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
    // Served by the oRPC attendanceORPCContract (model A), not the legacy operations contract.
    internalMethods: [
      'logAttendanceAudit',
      'getMyGradeClasses',
      'getGradeClassRoster',
      'getGradeClassAttendanceSnapshot',
      'getClassroomAttendanceSnapshot',
    ],
  }),
);

export const attendanceAPI = createTemporalProxy('attendance', rawAttendanceAPI);

const _schoolCoverage = assertContractCoverage(
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
      // Canonical school search remains an internal adapter method until the
      // operations contract gains a dedicated typed endpoint entry.
      'searchCanonicalSchools',
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

export const schoolAPI = createTemporalProxy('school', rawSchoolAPI);

const _inventoryCoverage = assertContractCoverage(
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

export const inventoryAPI = createTemporalProxy('inventory', rawInventoryAPI);
