export type ClassroomStackParamList = {
    ClassroomList: undefined;
    ClassroomDetails: { classroomId: string; classroomName: string };
    Attendance: { classroomId: string; classroomName: string };
    Gradebook: { classroomId: string; classroomName: string };
    SchoolCreation: undefined;
};

export type CommunityStackParamList = {
    CommunityMain: undefined;
    GroupDetails: { groupId: string; groupName?: string };
    GroupChat: { groupId: string; groupName: string };
    Announcements: undefined;
};
