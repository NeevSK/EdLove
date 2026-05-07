import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminAuditLog from "@repo/admin/screens/AdminAuditLog";
import AdminAuthorityRepair from "@repo/admin/screens/AdminAuthorityRepair";
import AdminDashboard from "@repo/admin/screens/AdminDashboard";
import AdminIncidentQueue from "@repo/admin/screens/AdminIncidentQueue";
import AdminJobControl from "@repo/admin/screens/AdminJobControl";
import AdminReleaseControl from "@repo/admin/screens/AdminReleaseControl";
import AdminTenantDetail from "@repo/admin/screens/AdminTenantDetail";
import FounderDashboard from "@repo/admin/screens/FounderDashboard";
import FounderSchoolDashboard from "@repo/admin/screens/FounderSchoolDashboard";
import PrincipalDashboard from "@repo/admin/screens/PrincipalDashboard";
import SchoolCreationScreen from "@repo/admin/screens/SchoolCreationScreen";
import type { FounderStackParamList } from "@repo/core/types";
import { useTheme } from "@repo/ui/primitives";

const Stack = createNativeStackNavigator<FounderStackParamList>();

export default function FounderStackNavigator() {
	const { scene } = useTheme();

	return (
		<Stack.Navigator
			id="FounderStack"
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: scene.canvas.bg },
			}}
		>
			<Stack.Screen name="FounderDashboard" component={FounderDashboard} />
			<Stack.Screen
				name="FounderSchoolDashboard"
				component={FounderSchoolDashboard as any}
			/>
			<Stack.Screen name="AdminDashboard" component={AdminDashboard} />
			<Stack.Screen name="AdminIncidentQueue" component={AdminIncidentQueue} />
			<Stack.Screen name="AdminTenantDetail" component={AdminTenantDetail as any} />
			<Stack.Screen
				name="AdminAuthorityRepair"
				component={AdminAuthorityRepair}
			/>
			<Stack.Screen name="AdminJobControl" component={AdminJobControl} />
			<Stack.Screen name="AdminAuditLog" component={AdminAuditLog} />
			<Stack.Screen
				name="AdminReleaseControl"
				component={AdminReleaseControl}
			/>
			<Stack.Screen
				name="PrincipalDashboard"
				component={PrincipalDashboard as any}
			/>
			<Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
		</Stack.Navigator>
	);
}
