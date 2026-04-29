import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FounderDashboard from '@repo/admin/screens/FounderDashboard';
import FounderSchoolDashboard from '@repo/admin/screens/FounderSchoolDashboard';
import {
  AttendanceScreen,
  TeacherClassroomDashboard as ClassroomDashboard,
  GradebookScreen,
} from '@repo/classroom';
import type { ClassroomStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui';
import { ClassroomScreen, SchoolCreationScreen } from '../screens';

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

export default function ClassroomStackNavigator() {
  const { gradientNodes } = useTheme();

  return (
    <Stack.Navigator
      id="ClassroomStack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: gradientNodes[0] },
      }}
    >
      <Stack.Screen name="ClassroomList" component={ClassroomScreen} />
      <Stack.Screen name="ClassroomDetails" component={ClassroomDashboard} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="Gradebook" component={GradebookScreen} />
      <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
      <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
      <Stack.Screen name="FounderSchoolView" component={FounderSchoolDashboard} />
    </Stack.Navigator>
  );
}
