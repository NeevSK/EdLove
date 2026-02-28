export type ClassroomStackParamList = {
    ClassroomList: undefined;
    ClassroomDetails: { classroomId: string; classroomName?: string };
    Attendance: { classroomId: string; classroomName?: string; date?: string };
    Gradebook: { classroomId: string; classroomName?: string };
    SchoolCreation: undefined;
};

export type ProfileStackParamList = {
    ProfileMain: undefined;
    FullProfile: { profile: any };
};
export type CommunityStackParamList = {
    CommunityMain: undefined;
    GroupDetails: { groupId: string; groupName?: string };
    GroupChat: { groupId: string; groupName: string };
    Announcements: undefined;
    /** Public profile viewer — tapping any user avatar in community navigates here */
    UserProfile: { userId: string; userName: string };
};
