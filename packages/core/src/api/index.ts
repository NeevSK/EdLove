import { authAPI } from './auth';
import { identityAPI as rawIdentityAPI } from './identity';
import { rewardsAPI } from './rewards';
import { trackingAPI } from './tracking';
import { tasksAPI, notesAPI } from './teacher';
import { lessonsAPI as rawLessonsAPI, studentsAPI as rawStudentsAPI } from './classroom';
import { gradingAPI as rawGradingAPI } from './grading';
import { schoolAPI as rawSchoolAPI } from './school';
import { attendanceAPI as rawAttendanceAPI } from './attendance';
import { resourcesAPI } from './resources';
import { groupsAPI } from './groups';
import { lessonMaterialsAPI as rawLessonMaterialsAPI } from './lessonMaterials';
import { assignmentsAPI as rawAssignmentsAPI } from './assignments';
import { classroomStudentsAPI as rawClassroomStudentsAPI } from './classroomStudents';
import { classroomsAPI as rawClassroomsAPI } from './classrooms';
import { classroomGroupsAPI as rawClassroomGroupsAPI } from './classroomGroups';
import { onboardingAPI } from './onboarding';
import { inventoryAPI as rawInventoryAPI } from './inventory';
import { dailyContentAPI } from './dailyContent';
import { thuthimalAPI } from './thuthimal';
import { classroomNotesAPI as rawClassroomNotesAPI } from './classroomNotes';
import { principalNotesAPI } from './principalNotes';
import { communityAPI as rawCommunityAPI } from './community';
import { founderAPI as rawFounderAPI } from './founder';
import { guardianAPI as rawGuardianAPI } from './guardian';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from './principalWorkspace';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from './teacherInsights';
import { longitudinalAPI as rawLongitudinalAPI } from './longitudinal';
import { staffManagementAPI as _staffManagementAPI } from './staffManagement';
import { profileAPI as rawProfileAPI } from './profile';
import { createTemporalProxy } from './temporalProxy';
import { createTemporalPOAProxy } from './temporalPOAProxy';
import { createPOAProxy } from './poaProxy';
import { assertContractCoverage, defineContractCoverage } from './contractCoverage';

// Scattered imports moved to top
import { sacredMissionsAPI } from './sacredMissions';
import { demoAPI } from './demo';
import { growthSignalsAPI } from './growthSignals';
import { userGrowthStateAPI } from './userGrowthState';
import { impactRipplesAPI } from './impactRipples';
import { warmMirrorAPI } from './warmMirror';
import { naturePathsAPI } from './naturePaths';
import { moonPhaseAPI } from './moonPhase';
import { schoolForestAPI } from './schoolForest';
import { contextualChallengesAPI } from './contextualChallenges';
import { academicCyclesAPI } from './academicCycles';
import { studentObservationsAPI } from './studentObservations';
import { privacyAPI } from './privacy';
import { echoAPI } from './echo';
import { studentPotentialAPI } from './studentPotential';
import { mappingAPI } from './mapping';
import { historyAPI } from './history';
import { formTemplatesAPI } from './formTemplates';
import { socialAPI } from './social';

// Contracts for POA Enforcement
import { identityContract } from './identity.contract';
import { educationalContract } from './educational.contract';
import { gradingContract } from './grading.contract';
import { operationsContract } from './operations.contract';
import { communityContract } from './community.contract';
import { classroomNotesContract } from './classroomNotes.contract';
import { founderContract } from './founder.contract';
import { guardianContract } from './guardian.contract';
import { principalWorkspaceContract } from './principalWorkspace.contract';
import { teacherInsightsContract } from './teacherInsights.contract';
import { longitudinalContract } from './longitudinal.contract';
import { profileContract } from './profile.contract';

const staffManagementAPI = createTemporalPOAProxy(
    'staffManagement', 
    _staffManagementAPI,
    operationsContract
);
const identityAPI = createPOAProxy('identity', rawIdentityAPI, identityContract, {
    resolveInternalId: 'resolveIdentity',
    getMyInternalId: 'resolveIdentity',
    getClassroomRoleSummary: 'getClassroomRoleSummary',
});
const attendanceCoverage = assertContractCoverage(rawAttendanceAPI, defineContractCoverage({
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
}));
const attendanceAPI = createTemporalPOAProxy('attendance', rawAttendanceAPI, attendanceCoverage.contract, attendanceCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const classroomsCoverage = assertContractCoverage(rawClassroomsAPI, defineContractCoverage({
    moduleName: 'classrooms',
    contract: educationalContract,
}));
const classroomsAPI = createTemporalPOAProxy('classrooms', rawClassroomsAPI, classroomsCoverage.contract, classroomsCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const lessonsCoverage = assertContractCoverage(rawLessonsAPI, defineContractCoverage({
    moduleName: 'lessons',
    contract: educationalContract,
    methodMapping: {
        create: 'createLesson',
        update: 'updateLesson',
        delete: 'deleteLesson',
    },
}));
const lessonsAPI = createTemporalPOAProxy('lessons', rawLessonsAPI, lessonsCoverage.contract, lessonsCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const studentsCoverage = assertContractCoverage(rawStudentsAPI, defineContractCoverage({
    moduleName: 'students',
    contract: educationalContract,
    methodMapping: {
        getAll: 'getClassroomStudents',
        enroll: 'enrollClassroomStudent',
        remove: 'removeClassroomStudent',
        create: 'add',
        update: 'updateById',
    },
}));
const studentsAPI = createTemporalPOAProxy('students', rawStudentsAPI, studentsCoverage.contract, studentsCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const assignmentsCoverage = assertContractCoverage(rawAssignmentsAPI, defineContractCoverage({
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
}));
const assignmentsAPI = createTemporalPOAProxy('assignments', rawAssignmentsAPI, assignmentsCoverage.contract, assignmentsCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const classroomGroupsCoverage = assertContractCoverage(rawClassroomGroupsAPI, defineContractCoverage({
    moduleName: 'classroomGroups',
    contract: educationalContract,
    methodMapping: {
        getAll: 'getClassroomGroups',
        create: 'createClassroomGroup',
        update: 'updateClassroomGroup',
        delete: 'deleteClassroomGroup',
    },
}));
const classroomGroupsAPI = createTemporalPOAProxy(
    'classroomGroups',
    rawClassroomGroupsAPI,
    classroomGroupsCoverage.contract,
    classroomGroupsCoverage.methodMapping,
    { strictUnmappedMethods: true }
);
const classroomStudentsCoverage = assertContractCoverage(rawClassroomStudentsAPI, defineContractCoverage({
    moduleName: 'classroomStudents',
    contract: educationalContract,
    methodMapping: {
        getAll: 'getEnrollmentRecords',
        update: 'updateEnrollmentRecord',
        remove: 'deleteEnrollmentRecord',
    },
}));
const classroomStudentsAPI = createTemporalPOAProxy(
    'classroomStudents',
    rawClassroomStudentsAPI,
    classroomStudentsCoverage.contract,
    classroomStudentsCoverage.methodMapping,
    { strictUnmappedMethods: true }
);
const lessonMaterialsCoverage = assertContractCoverage(rawLessonMaterialsAPI, defineContractCoverage({
    moduleName: 'lessonMaterials',
    contract: educationalContract,
    methodMapping: {
        getAll: 'getAllMaterials',
        getByLesson: 'getByLessonMaterial',
        create: 'createMaterial',
        update: 'updateMaterial',
        delete: 'deleteMaterial',
    },
}));
const lessonMaterialsAPI = createTemporalPOAProxy(
    'lessonMaterials',
    rawLessonMaterialsAPI,
    lessonMaterialsCoverage.contract,
    lessonMaterialsCoverage.methodMapping,
    { strictUnmappedMethods: true }
);
const gradingCoverage = assertContractCoverage(rawGradingAPI, defineContractCoverage({
    moduleName: 'grading',
    contract: gradingContract,
    methodMapping: {
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
}));
const gradingAPI = createTemporalPOAProxy('grading', rawGradingAPI, gradingCoverage.contract, gradingCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const schoolAPI = createTemporalPOAProxy('school', rawSchoolAPI, operationsContract, {
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
});
const inventoryAPI = createTemporalPOAProxy('inventory', rawInventoryAPI, operationsContract, {
    getAll: 'getInventory',
    update: 'updateInventory',
    createRequest: 'createInventoryRequest',
});
const communityCoverage = assertContractCoverage(rawCommunityAPI, defineContractCoverage({
    moduleName: 'community',
    contract: communityContract,
    methodMapping: {
        getGroupById: 'getGroup',
        get: 'getGroup',
        getGroupMessages: 'getMessages',
        sendGroupMessage: 'sendMessage',
        togglePostReaction: 'toggleReaction',
        createGroupWithOwner: 'createGroup',
    },
}));
const communityAPI = createTemporalPOAProxy('community', rawCommunityAPI, communityCoverage.contract, communityCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const founderCoverage = assertContractCoverage(rawFounderAPI, defineContractCoverage({
    moduleName: 'founder',
    contract: founderContract,
}));
const founderAPI = createPOAProxy('founder', rawFounderAPI, founderCoverage.contract, founderCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const guardianCoverage = assertContractCoverage(rawGuardianAPI, defineContractCoverage({
    moduleName: 'guardian',
    contract: guardianContract,
    methodMapping: {
        createProfile: 'createGuardianProfile',
        getProfile: 'getGuardianProfile',
        updateProfile: 'updateGuardianProfile',
        getStudents: 'getGuardianStudents',
        getDashboard: 'getGuardianDashboard',
        updatePermissions: 'updateGuardianPermissions',
        terminateRelationship: 'terminateGuardianRelationship',
        updateNotificationSettings: 'updateGuardianNotificationSettings',
    },
}));
const guardianAPI = createPOAProxy('guardian', rawGuardianAPI, guardianCoverage.contract, guardianCoverage.methodMapping, {
    strictUnmappedMethods: true,
});
const principalWorkspaceCoverage = assertContractCoverage(rawPrincipalWorkspaceAPI, defineContractCoverage({
    moduleName: 'principalWorkspace',
    contract: principalWorkspaceContract,
}));
const principalWorkspaceAPI = createPOAProxy(
    'principalWorkspace',
    rawPrincipalWorkspaceAPI,
    principalWorkspaceCoverage.contract,
    principalWorkspaceCoverage.methodMapping,
    { strictUnmappedMethods: true }
);
const teacherInsightsCoverage = assertContractCoverage(rawTeacherInsightsAPI, defineContractCoverage({
    moduleName: 'teacherInsights',
    contract: teacherInsightsContract,
}));
const teacherInsightsAPI = createPOAProxy(
    'teacherInsights',
    rawTeacherInsightsAPI,
    teacherInsightsCoverage.contract,
    teacherInsightsCoverage.methodMapping,
    { strictUnmappedMethods: true }
);
const longitudinalCoverage = assertContractCoverage(rawLongitudinalAPI, defineContractCoverage({
    moduleName: 'longitudinal',
    contract: longitudinalContract,
}));
const longitudinalAPI = createTemporalPOAProxy(
    'longitudinal',
    rawLongitudinalAPI,
    longitudinalCoverage.contract,
    longitudinalCoverage.methodMapping,
    { strictUnmappedMethods: true }
);
const classroomNotesCoverage = assertContractCoverage(rawClassroomNotesAPI, defineContractCoverage({
    moduleName: 'classroomNotes',
    contract: classroomNotesContract,
    methodMapping: {
        getAll: 'listVisibleNotes',
        getSnapshotAsOf: 'getVisibleNotesSnapshot',
        create: 'createClassroomNote',
        update: 'updateClassroomNote',
        delete: 'deleteClassroomNote',
        getTimeline: 'getClassroomNoteTimeline',
    },
}));
const notesWithPOA = createTemporalPOAProxy(
    'classroomNotes',
    rawClassroomNotesAPI,
    classroomNotesCoverage.contract,
    classroomNotesCoverage.methodMapping,
    { strictUnmappedMethods: true }
);
const profileAPI = createPOAProxy(
    'profile',
    rawProfileAPI,
    profileContract,
    {},
    { strictUnmappedMethods: true }
);

// Simplified named exports for direct access
export {
    authAPI,
    identityAPI,
    lessonsAPI,
    studentsAPI,
    tasksAPI,
    notesAPI,
    rewardsAPI,
    trackingAPI,
    inventoryAPI,
    classroomsAPI,
    gradingAPI,
    schoolAPI,
    attendanceAPI,
    resourcesAPI,
    groupsAPI,
    lessonMaterialsAPI,
    assignmentsAPI,
    classroomGroupsAPI,
    classroomStudentsAPI,
    onboardingAPI,
    dailyContentAPI,
    thuthimalAPI,
    principalNotesAPI,
    communityAPI,
    guardianAPI,
    staffManagementAPI,
    sacredMissionsAPI,
    demoAPI,
    growthSignalsAPI,
    userGrowthStateAPI,
    impactRipplesAPI,
    warmMirrorAPI,
    naturePathsAPI,
    moonPhaseAPI,
    schoolForestAPI,
    contextualChallengesAPI,
    founderAPI,
    principalWorkspaceAPI,
    teacherInsightsAPI,
    longitudinalAPI,
    notesWithPOA as classroomNotesAPI,
    academicCyclesAPI,
    studentObservationsAPI,
    privacyAPI,
    echoAPI,
    studentPotentialAPI,
    mappingAPI,
    historyAPI,
    formTemplatesAPI,
    socialAPI,
    profileAPI,
};

export * from './mockData';
export * from './types';
export * from './assignments'; // Export assignments/submissions API
export * from './classroomGroups';
export * from './thuthimal'; // Restore types and thuthimalAPI
export * from './grading.contract';
export * from './identity.contract';
export * from './educational.contract';
export * from './operations.contract';
export * from './community.contract';
export * from './classroomNotes.contract';
export * from './founder.contract';
export * from './guardian.contract';
export * from './principalWorkspace.contract';
export * from './teacherInsights.contract';
export * from './longitudinal.contract';
export * from './profile.contract';
export * from './self.contract';
export * from './library.contract';
export * from './sacredMissions'; // Export mission types
export * from './temporalProxy';
export * from './temporalPOAProxy';
export * from './poaProxy';
export * from './contractCoverage';
export type { ClassroomNote } from './classroomNotes';
export * from './principalNotes';
export * from './studentObservations';
export * from './studentPotential';
export * from './community'; // Export community types/API
export * from './guardian';
export * from './principalWorkspace';
export * from './teacherInsights';
export * from './longitudinal';
export * from './schemas/temporal.schema';
export * from './staffManagement'; // Export staff management types
export * from './schemas/staff.schema';
export * from './growthSignals';
export * from './userGrowthState';
export * from './impactRipples';
export * from './warmMirror';
export * from './naturePaths';
export * from './moonPhase';
export * from './schoolForest';
export * from './contextualChallenges';
export * from './privacy';
export * from './mapping';
export * from './history';

/**
 * Unified API Object
 * 
 * IMPORTANT: This is defined as a plain object to ensure 
 * Hermes handles it as a non-writable module property.
 */
export const api = {
    auth: authAPI,
    identity: identityAPI,
    tasks: tasksAPI,
    notes: notesAPI,
    lessons: lessonsAPI,
    students: studentsAPI,
    attendance: attendanceAPI,
    resources: resourcesAPI,
    groups: groupsAPI,
    lessonMaterials: lessonMaterialsAPI,
    assignments: assignmentsAPI,
    classroomGroups: classroomGroupsAPI,
    classroomStudents: classroomStudentsAPI,
    classrooms: classroomsAPI,
    grading: gradingAPI,
    school: schoolAPI,
    inventory: inventoryAPI,
    rewards: rewardsAPI,
    tracking: trackingAPI,
    onboarding: onboardingAPI,
    dailyContent: dailyContentAPI,
    thuthimal: thuthimalAPI,
    classroomNotes: notesWithPOA,
    principalNotes: principalNotesAPI,
    community: communityAPI,
    community_group: communityAPI,
    guardian: guardianAPI,
    staffManagement: staffManagementAPI,
    missions: sacredMissionsAPI,
    demo: demoAPI,
    // Growth Model v3.0  Full Nature-Inspired Growth Ecosystem
    growth: growthSignalsAPI,
    growthState: userGrowthStateAPI,
    ripples: impactRipplesAPI,
    warmMirror: warmMirrorAPI,
    naturePaths: naturePathsAPI,
    moonPhase: moonPhaseAPI,
    schoolForest: schoolForestAPI,
    challenges: contextualChallengesAPI,
    founder: founderAPI,
    principalWorkspace: principalWorkspaceAPI,
    teacherInsights: teacherInsightsAPI,
    longitudinal: longitudinalAPI,
    academicCycles: academicCyclesAPI,
    studentObservations: studentObservationsAPI,
    privacy: privacyAPI,
    echo: echoAPI,
    studentPotential: studentPotentialAPI,
    mapping: mappingAPI,
    history: historyAPI,
    forms: formTemplatesAPI,
    socialAPI,
    profile: profileAPI,
};

export default api;
