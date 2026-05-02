import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FounderDashboard from "@repo/admin/screens/FounderDashboard";
import FounderSchoolDashboard from "@repo/admin/screens/FounderSchoolDashboard";
import GuardianDashboard from "@repo/admin/screens/GuardianDashboard";
import GuardianCommunicationBridgeScreen from "@repo/admin/screens/guardian/GuardianCommunicationBridgeScreen";
import GuardianEventsScreen from "@repo/admin/screens/guardian/GuardianEventsScreen";
import GuardianNotificationsScreen from "@repo/admin/screens/guardian/GuardianNotificationsScreen";
import GuardianStudentDetailScreen from "@repo/admin/screens/guardian/GuardianStudentDetailScreen";
import GuardianStudentsScreen from "@repo/admin/screens/guardian/GuardianStudentsScreen";
import PrincipalDashboard from "@repo/admin/screens/PrincipalDashboard";
import SchoolCreationScreen from "@repo/admin/screens/SchoolCreationScreen";
import type { GuardianStackParamList } from "@repo/core/types";
import { useTheme } from "@repo/ui/primitives";

const Stack = createNativeStackNavigator<GuardianStackParamList>();

export default function GuardianStackNavigator() {
	const { scene } = useTheme();
	return (
		<Stack.Navigator
			id="GuardianStack"
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: scene.canvas.bg },
			}}
		>
			<Stack.Screen name="GuardianDashboard" component={GuardianDashboard} />
			<Stack.Screen
				name="GuardianStudents"
				component={GuardianStudentsScreen}
			/>
			<Stack.Screen
				name="GuardianStudentDetail"
				component={GuardianStudentDetailScreen}
			/>
			<Stack.Screen
				name="GuardianNotifications"
				component={GuardianNotificationsScreen}
			/>
			<Stack.Screen name="GuardianEvents" component={GuardianEventsScreen} />
			<Stack.Screen
				name="GuardianCommunicationBridge"
				component={GuardianCommunicationBridgeScreen}
			/>
			<Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard} />
			<Stack.Screen name="FounderDashboard" component={FounderDashboard} />
			<Stack.Screen
				name="FounderSchoolDashboard"
				component={FounderSchoolDashboard}
			/>
			<Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
		</Stack.Navigator>
	);
}
