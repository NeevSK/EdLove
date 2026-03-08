export type ClassroomStackParamList = {
    ClassroomList: undefined;
    ClassroomDetails: { classroomId: string; classroomName?: string };
    Attendance: { classroomId: string; classroomName?: string; date?: string };
    Gradebook: { classroomId: string; classroomName?: string };
    StudentProfile: { studentId: string; classroomId: string; studentName?: string; classroomStudentId: string };
    SchoolCreation: undefined;
    FounderDashboard: undefined;
    FounderSchoolView: { schoolId: string; userId: string };
    Timetable: { schoolId?: string };
    SchoolForest: undefined;
};

/** Minimal profile shape passed to FullProfile screen.  Use proper fields instead of `any`. */
export type FullProfileParams = {
    userId: string;
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
};
export type CommunityStackParamList = {
    CommunityMain: undefined;
    GroupDetails: { groupId: string; groupName?: string };
    GroupChat: { groupId: string; groupName: string };
    Announcements: undefined;
    /** Public profile viewer — tapping any user avatar in community navigates here */
    UserProfile: { userId: string; userName: string };
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
    /** Inline PDF viewer — resourceId is used to mark resource_read growth signal */
    PDFViewer: { resourceId: string; title: string; url: string; creator?: string };
    /** Inline video player */
    VideoPlayer: { resourceId: string; title: string; url: string; creator?: string };
};
