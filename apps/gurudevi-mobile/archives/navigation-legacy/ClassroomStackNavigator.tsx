import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SchoolCreationScreen from '@repo/admin/screens/SchoolCreationScreen';
import {
  AttendanceScreen,
  TeacherClassroomDashboard as ClassroomDashboard,
  ClassroomScreen,
  GradebookScreen,
} from '@repo/classroom';
import type { ClassroomStackParamList } from '@repo/core/types';
import { useTheme } from '@repo/ui/primitives';

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
      <Stack.Screen name="TeacherClassroomDashboard" component={ClassroomDashboard as any} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="Gradebook" component={GradebookScreen as any} />
      <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
    </Stack.Navigator>
  );
}
