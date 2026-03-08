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

export type ProfileStackParamList = {
    ProfileMain: undefined;
    FullProfile: { profile: any };
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
    PDFViewer: undefined;
    VideoPlayer: undefined;
};
