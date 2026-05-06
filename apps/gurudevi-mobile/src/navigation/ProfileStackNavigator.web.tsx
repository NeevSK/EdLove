import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@repo/core/types";
import FullProfileScreen from "@repo/profile/screens/FullProfileScreen.web";
// Static imports instead of React.lazy for stability on web
// Direct imports for stability on web, avoiding barrel file bloat
import ProfileScreenWeb from "@repo/profile/screens/ProfileScreen.web";
import PrivacyLedgerScreen from "@repo/self/screens/PrivacyLedgerScreen";
import { useTheme } from "@repo/ui/primitives";

import AppSettingsScreenWeb from "@repo/ui/screens/AppSettingsScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigatorWeb() {
	const colors = useTheme().scene;

	return (
		<Stack.Navigator
			id="ProfileStack"
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: colors.primary.main },
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen name="ProfileMain" component={ProfileScreenWeb} />
			<Stack.Screen name="FullProfile" component={FullProfileScreen} />
			<Stack.Screen name="AppSettings" component={AppSettingsScreenWeb} />
			<Stack.Screen name="PrivacyLedger" component={PrivacyLedgerScreen} />
		</Stack.Navigator>
	);
}
