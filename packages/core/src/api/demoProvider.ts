import { isDemo } from '@repo/core/api/demo';
import * as MOCK from '@repo/core/api/mockData';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useStore } from '@repo/core/store/useStore';

/**
 * Registry of mock data getters.
 * This allows us to decouple the production API modules from the mock data.
 */
const MOCK_DATA_REGISTRY: Record<string, (...args: any[]) => any> = {
  // Classrooms & Schools
  'classrooms.getByTeacher': () => MOCK.MOCK_CLASSROOMS,
  'classrooms.getByStudent': () => MOCK.MOCK_CLASSROOMS,
  'classrooms.getBySchool': () => MOCK.MOCK_CLASSROOMS,
  'classrooms.getById': (id?: string) =>
    MOCK.MOCK_CLASSROOMS.find((c: any) => c.id === id) || MOCK.MOCK_CLASSROOMS[0],
  'school.getSchool': () => MOCK.MOCK_SCHOOL,
  'school.getSchoolStats': () => MOCK.MOCK_SCHOOL_STATS,

  // Students & Attendance
  'students.getAll': () => MOCK.MOCK_STUDENTS,
  'classroomStudents.getAll': (classroomId?: string) => {
    if (!classroomId) return MOCK.MOCK_STUDENTS;
    const filtered = MOCK.MOCK_STUDENTS.filter((s: any) => s.classroom_id === classroomId);
    return filtered.length > 0 ? filtered : MOCK.MOCK_STUDENTS;
  },
  'attendance.getClassroomAttendanceSnapshot': (classroomId?: string) => {
    const key = classroomId && MOCK.MOCK_ATTENDANCE_SNAPSHOTS[classroomId] ? classroomId : 'sample-c1';
    return MOCK.MOCK_ATTENDANCE_SNAPSHOTS[key] || { records: [] };
  },

  // Lessons, Assignments, Resources
  'lessons.getAll': () => MOCK.MOCK_LESSONS,
  'lessons.getByClassroom': (classroomId?: string) => {
    if (!classroomId) return MOCK.MOCK_LESSONS;
    const filtered = MOCK.MOCK_LESSONS.filter((l: any) => l.classroom_id === classroomId);
    return filtered.length > 0 ? filtered : MOCK.MOCK_LESSONS;
  },
  'assignments.getAll': () => MOCK.MOCK_ASSIGNMENTS,
  'assignments.getByClassroom': (classroomId?: string) => {
    if (!classroomId) return MOCK.MOCK_ASSIGNMENTS;
    const filtered = MOCK.MOCK_ASSIGNMENTS.filter((a: any) => a.classroom_id === classroomId);
    return filtered.length > 0 ? filtered : MOCK.MOCK_ASSIGNMENTS;
  },
  'resources.getAll': () => MOCK.MOCK_RESOURCES,

  // Staff management (principal demo)
  'staffManagement.getStaffPresenceSummary': () => MOCK.MOCK_STAFF_PRESENCE,
  'staffManagement.getTeacherCarousel': () => MOCK.MOCK_TEACHER_CAROUSEL,
  'staffManagement.getStudentAttendancePulse': () => MOCK.MOCK_STUDENT_PULSE,
  'staffManagement.getPendingLeaves': () => MOCK.MOCK_PENDING_LEAVES,

  // Library
  'library.getResources': () => MOCK.MOCK_LIBRARY_RESOURCES,
  'library.getCollections': () => MOCK.MOCK_LIBRARY_COLLECTIONS,
  'library.getResourcesCount': () => MOCK.MOCK_LIBRARY_RESOURCES.length,
  'library.getCollectionsCount': () => MOCK.MOCK_LIBRARY_COLLECTIONS.length,
  'library.getResourceById': (id?: string) =>
    MOCK.MOCK_LIBRARY_RESOURCES.find((resource) => resource.id === id) ??
    MOCK.MOCK_LIBRARY_RESOURCES[0],
  'library.getCollectionById': (id?: string) =>
    MOCK.MOCK_LIBRARY_COLLECTIONS.find((collection) => collection.id === id) ??
    MOCK.MOCK_LIBRARY_COLLECTIONS[0],
  'library.getBookmarkedResources': () => [],
  'library.searchLibrary': (params?: { query?: string }) => {
    const query = params?.query?.trim().toLowerCase();
    if (!query) return MOCK.MOCK_LIBRARY_RESOURCES;
    return MOCK.MOCK_LIBRARY_RESOURCES.filter((resource) =>
      resource.title.toLowerCase().includes(query),
    );
  },

  // Community
  'community.getGroups': () => MOCK.MOCK_COMMUNITY_GROUPS,
  'community.getPosts': () => MOCK.MOCK_COMMUNITY_POSTS,
  'community.getComments': () => MOCK.MOCK_COMMUNITY_COMMENTS,
  'community.getAnnouncements': () => MOCK.MOCK_ANNOUNCEMENTS,
  'community.getGroup': () => MOCK.MOCK_COMMUNITY_GROUPS[0],
  'community.getMessages': () => MOCK.MOCK_GROUP_MESSAGES,
  'community.getGroupMessages': () => MOCK.MOCK_GROUP_MESSAGES,
  'community.getDirectConversations': () => MOCK.MOCK_DIRECT_CONVERSATIONS,
  'community.getCommunityResonance': () => ({
    score: 92,
    activeStreaks: 14,
    sharedReflections: 28,
  }),
  'community.getNotifications': () => MOCK.MOCK_NOTIFICATIONS,
  'community.getUnreadNotificationCount': () =>
    MOCK.MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
  'notification.getNotifications': () => MOCK.MOCK_NOTIFICATIONS,
  'notification.getUnreadCount': () =>
    MOCK.MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,

  // Student Echoes (Resonance Signals)
  'echo.getTeacherEchoes': () => MOCK.MOCK_ECHOES,
  'echo.getEchoesByClassroom': () => MOCK.MOCK_ECHOES,
  'echo.getMyEchoes': () => MOCK.MOCK_ECHOES,
  'echoes.getTeacherEchoes': () => MOCK.MOCK_ECHOES,
  'echoes.getEchoesByClassroom': () => MOCK.MOCK_ECHOES,
  'echoes.getMyEchoes': () => MOCK.MOCK_ECHOES,

  // Teacher & Student Stats
  'classrooms.getTeacherStats': () => MOCK.MOCK_TEACHER_STATS,
  'classrooms.getStudentStats': () => MOCK.MOCK_STUDENT_STATS,
  'educational.getTeacherStats': () => MOCK.MOCK_TEACHER_STATS,

  // Teacher Insights & Student Observations
  'teacherInsights.listStudentObservations': () => MOCK.MOCK_STUDENT_OBSERVATIONS,
  'teacherInsights.listStudentObservationsForEnrollment': () => MOCK.MOCK_STUDENT_OBSERVATIONS,
  'teacherInsights.listStudentObservationsForStudent': () => MOCK.MOCK_STUDENT_OBSERVATIONS,
  'studentObservations.listStudentObservations': () => MOCK.MOCK_STUDENT_OBSERVATIONS,

  // Classroom Notes
  'classroomNotes.getAll': () => MOCK.MOCK_CLASSROOM_NOTES,
  'classroomNotes.getSnapshotAsOf': () => MOCK.MOCK_CLASSROOM_NOTES,

  // Lesson Materials
  'lessonMaterials.getAll': () => MOCK.MOCK_LESSON_MATERIALS,
  'lessonMaterials.getByLesson': () => MOCK.MOCK_LESSON_MATERIALS,

  // Submissions & Student Quests
  'assignments.getSubmissionHistoryForStudent': () => MOCK.MOCK_STUDENT_SUBMISSIONS,
  'assignments.getUpcomingForStudent': () => MOCK.MOCK_ASSIGNMENTS,
  'assignments.getRecentGradesOverviewForStudent': () => MOCK.MOCK_STUDENT_GRADES,
  'student.getGoals': () => MOCK.MOCK_STUDENT_GOALS,
  'student.getGrades': () => MOCK.MOCK_STUDENT_GRADES,

  // Self & Temporal Dashboard
  'self.getMoodHistory': () => MOCK.MOCK_SELF_MOOD_HISTORY,
  'self.getJournalEntries': () => MOCK.MOCK_JOURNAL_ENTRIES,
  'teacherDashboard.getTemporalSnapshot': () => MOCK.MOCK_TEMPORAL_MILESTONES,
};

/**
 * Handles the interception logic for the API Proxy.
 */
export function interceptApiCall(moduleName: string, methodName: string, originalArgs: any[] = []) {
  const registryKey = `${moduleName}.${methodName}`;
  const state = useStore.getState();

  // If we are currently bridging demo data to reality, DO NOT intercept.
  if (state.isBridging) {
    return null;
  }

  // Check if call targets a known sample/mock entity ID (e.g. sample-c1, mock-school)
  const targetId = originalArgs[0];
  const isTargetingSampleEntity =
    typeof targetId === 'string' &&
    (targetId.startsWith('sample-') || targetId.startsWith('mock-'));

  if (isTargetingSampleEntity) {
    const isDemoAllowed =
      process.env.NODE_ENV !== 'production' ||
      process.env.EDLOVE_DEMO === '1' ||
      isDemo();

    if (isDemoAllowed) {
      const mockGetter = MOCK_DATA_REGISTRY[registryKey];
      if (mockGetter) {
        return Promise.resolve(mockGetter(...originalArgs));
      }
    }
  }

  // GHOST SEEDING: Proactive injection for Classrooms (let real DB query run first)
  if (
    registryKey === 'classrooms.getByTeacher' ||
    registryKey === 'classrooms.getByStudent' ||
    registryKey === 'classrooms.getBySchool'
  ) {
    // In global demo mode, intercept directly; otherwise let original call proceed to check for real data
    if (!isDemo()) {
      return null;
    }
  }

  // Traditional isDemoMode (Global Sandbox Toggle)
  if (isDemo()) {
    const mockGetter = MOCK_DATA_REGISTRY[registryKey];
    if (
      mockGetter &&
      (methodName.startsWith('get') || methodName.startsWith('list') || methodName === 'getAll')
    ) {
      return Promise.resolve(mockGetter(...originalArgs));
    }

    if (
      methodName.startsWith('create') ||
      methodName.startsWith('update') ||
      methodName.startsWith('delete') ||
      methodName.startsWith('add')
    ) {
      // Block write operations in demo mode
      console.log(`[DEMO MODE] Blocked write operation: ${registryKey}.${methodName}`);
      return Promise.resolve({
        success: true,
        message: 'Demo mode: Operation simulated successfully',
        data: null,
      });
    }
  }

  return null;
}

/**
 * Enhanced Proxy specifically for "Ghost" merging.
 * This is called after a real API result to inject samples if user is exploring and database is empty.
 */
export function processGhostData(moduleName: string, methodName: string, realData: any) {
  const state = useStore.getState();
  const authState = useAuthStore.getState();
  const shouldProvideSample = authState.isExplorerMode || state.isExplorerMode || state.isDemoMode;
  const dismissedIds =
    authState.dismissedSampleIds && authState.dismissedSampleIds.length > 0
      ? authState.dismissedSampleIds
      : state.dismissedSampleIds || [];

  if (!shouldProvideSample) return realData;

  // 1. GHOST CLASSROOMS (when teacher/student has 0 real classrooms)
  if (
    moduleName === 'classrooms' &&
    methodName.startsWith('get') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const registryKey = `${moduleName}.${methodName}`;
    const mockGetter = MOCK_DATA_REGISTRY[registryKey] || MOCK_DATA_REGISTRY['classrooms.getByTeacher'];

    if (mockGetter) {
      const rawMocks = mockGetter();
      return rawMocks
        .filter((m: any) => !dismissedIds.includes(m.id))
        .map((m: any) => ({ ...m, is_sample: true }));
    }
  }

  // 2. GHOST SCHOOL STATS (when school has 0 records)
  if (moduleName === 'school' && methodName === 'getSchoolStats') {
    const stats = realData;
    const isEmpty =
      !stats ||
      (stats.total_students === 0 && stats.total_teachers === 0 && stats.total_classrooms === 0);

    if (isEmpty) {
      const mockGetter = MOCK_DATA_REGISTRY['school.getSchoolStats'];
      if (mockGetter) {
        const mockStats = mockGetter();
        return { ...mockStats, is_sample: true };
      }
    }
  }

  // 3. GHOST SCHOOL DETAILS
  if (moduleName === 'school' && methodName === 'getSchool') {
    if (!realData || !realData.id) {
      return { ...MOCK.MOCK_SCHOOL, is_sample: true };
    }
  }

  // 4. GHOST LESSONS (when classroom has 0 real lessons)
  if (
    moduleName === 'lessons' &&
    methodName.startsWith('get') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks = MOCK.MOCK_LESSONS;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  // 5. GHOST ASSIGNMENTS (when classroom has 0 real assignments)
  if (
    moduleName === 'assignments' &&
    methodName.startsWith('get') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks = MOCK.MOCK_ASSIGNMENTS;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  // 6. GHOST RESOURCES (when classroom/school has 0 real resources)
  if (
    moduleName === 'resources' &&
    methodName.startsWith('get') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks = MOCK.MOCK_RESOURCES;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  // 7. GHOST ECHOES (student resonance signals)
  if (
    (moduleName === 'echo' || moduleName === 'echoes') &&
    methodName.startsWith('get') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks = MOCK.MOCK_ECHOES;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  // 8. GHOST OBSERVATIONS (teacher insights)
  if (
    (moduleName === 'teacherInsights' || moduleName === 'studentObservations') &&
    methodName.startsWith('list') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks = MOCK.MOCK_STUDENT_OBSERVATIONS;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  // 9. GHOST CLASSROOM NOTES
  if (
    moduleName === 'classroomNotes' &&
    methodName.startsWith('get') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks = MOCK.MOCK_CLASSROOM_NOTES;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  // 10. GHOST LESSON MATERIALS
  if (
    moduleName === 'lessonMaterials' &&
    methodName.startsWith('get') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks = MOCK.MOCK_LESSON_MATERIALS;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  // 11. GHOST COMMUNITY (groups, posts, announcements, comments)
  if (
    moduleName === 'community' &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const registryKey = `community.${methodName}`;
    const mockGetter = MOCK_DATA_REGISTRY[registryKey];
    if (mockGetter) {
      const rawMocks = mockGetter();
      if (Array.isArray(rawMocks)) {
        return rawMocks
          .filter((m: any) => !dismissedIds.includes(m.id))
          .map((m: any) => ({ ...m, is_sample: true }));
      }
    }
  }

  // 12. GHOST LIBRARY (resources, collections)
  if (
    moduleName === 'library' &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const registryKey = `library.${methodName}`;
    const mockGetter = MOCK_DATA_REGISTRY[registryKey];
    if (mockGetter) {
      const rawMocks = mockGetter();
      if (Array.isArray(rawMocks)) {
        return rawMocks
          .filter((m: any) => !dismissedIds.includes(m.id))
          .map((m: any) => ({ ...m, is_sample: true }));
      }
    }
  }

  // 13. GHOST TEACHER STATS
  if (
    moduleName === 'classrooms' &&
    methodName === 'getTeacherStats' &&
    (!realData || realData.active_classes === 0)
  ) {
    return { ...MOCK.MOCK_TEACHER_STATS, is_sample: true };
  }

  // 14. GHOST STUDENT STATS
  if (
    moduleName === 'classrooms' &&
    methodName === 'getStudentStats' &&
    (!realData || (realData.active_sanctuaries === 0 && realData.goals_set === 0))
  ) {
    return { ...MOCK.MOCK_STUDENT_STATS, is_sample: true };
  }

  // 15. GHOST STUDENT GRADES & SUBMISSIONS
  if (
    moduleName === 'assignments' &&
    (methodName === 'getRecentGradesOverviewForStudent' ||
      methodName === 'getSubmissionHistoryForStudent') &&
    Array.isArray(realData) &&
    realData.length === 0
  ) {
    const rawMocks =
      methodName === 'getRecentGradesOverviewForStudent'
        ? MOCK.MOCK_STUDENT_GRADES
        : MOCK.MOCK_STUDENT_SUBMISSIONS;
    return rawMocks
      .filter((m: any) => !dismissedIds.includes(m.id))
      .map((m: any) => ({ ...m, is_sample: true }));
  }

  return realData;
}

/**
 * Public canonical helpers for UI components
 */
export function getDemoClassrooms() {
  const state = useStore.getState();
  const authState = useAuthStore.getState();
  const dismissed =
    authState.dismissedSampleIds && authState.dismissedSampleIds.length > 0
      ? authState.dismissedSampleIds
      : state.dismissedSampleIds || [];
  return MOCK.MOCK_CLASSROOMS.filter((c: any) => !dismissed.includes(c.id)).map((c: any) => ({
    ...c,
    is_sample: true,
  }));
}

export function getDemoSchoolStats() {
  return { ...MOCK.MOCK_SCHOOL_STATS, is_sample: true };
}

export function getDemoStudentStats() {
  return { ...MOCK.MOCK_STUDENT_STATS, is_sample: true };
}

export function getDemoAssignments() {
  const state = useStore.getState();
  const authState = useAuthStore.getState();
  const dismissed =
    authState.dismissedSampleIds && authState.dismissedSampleIds.length > 0
      ? authState.dismissedSampleIds
      : state.dismissedSampleIds || [];
  return MOCK.MOCK_ASSIGNMENTS.filter((a: any) => !dismissed.includes(a.id)).map((a: any) => ({
    ...a,
    is_sample: true,
  }));
}

export function getDemoGrades() {
  return MOCK.MOCK_STUDENT_GRADES.map((g: any) => ({ ...g, is_sample: true }));
}

export function getDemoGoals() {
  return MOCK.MOCK_STUDENT_GOALS.map((g: any) => ({ ...g, is_sample: true }));
}
