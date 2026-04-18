export type ClassroomStackParamList = {
    ClassroomList: undefined;
    TeacherClassroomDashboard: { classroomId: string; classroomName?: string };
    StudentClassroomDashboard: { classroomId: string; classroomName?: string };
    Attendance: { classroomId: string; classroomName?: string; date?: string };
    Gradebook: { classroomId: string; classroomName?: string };
    ContentLibrary: { classroomId: string; classroomName?: string };
    StudentProfile: { studentId: string; classroomId: string; studentName?: string; classroomStudentId: string };
    Timetable: { schoolId?: string };
    PublicProfile: { id: string; type: 'user' | 'school' | 'classroom' | 'community' };
    FormBuilder: undefined;
    PublicForm: { slug: string };
    // Missing routes used in mobile app
    ClassroomDetails: { classroomId: string };
    FounderDashboard: undefined;
    FounderSchoolView: { schoolId: string; userId: string };
    SchoolCreation: undefined;
    SchoolForest: undefined;
    KnowledgeBase: undefined;
    LiveSession: { sessionId: string };
    ResourceCenter: undefined;
    Assignment: { assignmentId: string };
};

export type FounderStackParamList = {
    FounderDashboard: undefined;
    FounderSchoolDashboard: { schoolId: string; userId: string };
    PrincipalDashboard: { schoolId: string; userId: string; forceDemo?: boolean; onRefresh?: () => void };
    SchoolCreation: undefined;
    SchoolForest: undefined;
};

/** Minimal profile shape passed to FullProfile screen.  Use proper fields instead of `any`. */
export type FullProfileParams = {
    id: string;
    userId?: string;
    full_name: string;
    role?: string;
    school_name?: string;
    avatar_url?: string | null;
    bio?: string | null;
    is_thuthimal?: boolean;
    [key: string]: unknown;
};

export type ProfileStackParamList = {
    ProfileMain: undefined;
    FullProfile: { profile: FullProfileParams };
    AppSettings: undefined;
    PrivacyLedger: undefined;
    MuteHub: undefined;
    TrubeLab: undefined;
    PublicProfile: { id: string; type: 'user' | 'school' | 'classroom' | 'community' };
};
export type CommunityStackParamList = {
    CommunityMain: undefined;
    GroupDetails: { groupId: string; groupName?: string };
    GroupChat: { groupId: string; groupName: string };
    Announcements: undefined;
    /** Public profile viewer  tapping any user avatar in community navigates here */
    UserProfile: { userId: string; userName: string };
    PublicProfile: { id: string; type: 'user' | 'school' | 'classroom' | 'community' };
    /** 1:1 Direct Messaging */
    DirectMessagesList: undefined;
    DirectMessage: { conversationId: string; userName: string };
};

export type SelfStackParamList = {
    SelfMain: undefined;
    AIAssistant: undefined;
};

export type LibraryStackParamList = {
    LibraryHome: undefined;
    LibraryMap: undefined;
    CuratorReview: undefined;
    /** Inline PDF viewer  resourceId is used to mark resource_read growth signal */
    PDFViewer: { resourceId: string; title: string; url: string; creator?: string };
    /** Inline video player */
    VideoPlayer: { resourceId: string; title: string; url: string; creator?: string };
    /** Collection detail view */
    CollectionDetail: { id: string; title: string };
};

export type GuardianStackParamList = {
    GuardianDashboard: undefined;
    GuardianStudents: undefined;
    GuardianStudentDetail: { studentId: string; studentName?: string };
    GuardianNotifications: undefined;
    GuardianEvents: undefined;
    GuardianCommunicationBridge: undefined;
    PrincipalDashboard: { schoolId: string; userId: string; forceDemo?: boolean };
    FounderDashboard: undefined;
    FounderSchoolDashboard: { schoolId: string; userId: string };
    SchoolCreation: undefined;
};
