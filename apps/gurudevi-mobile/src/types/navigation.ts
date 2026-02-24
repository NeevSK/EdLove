export type ClassroomStackParamList = {
    ClassroomList: undefined;
    ClassroomDetails: { classroomId: string; classroomName: string };
    Attendance: { classroomId: string; classroomName: string };
    Gradebook: { classroomId: string; classroomName: string };
};

export type ProfileStackParamList = {
    ProfileMain: undefined;
    FullProfile: { profile: any };
};
