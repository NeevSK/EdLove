import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { FounderStackParamList } from "@repo/core/types";
import { useTheme } from "@repo/ui/primitives";

import React from "react";
import { StackFallback } from "../components/web/WebScreenShimmer";

const FounderDashboard = React.lazy(
	() => import("@repo/admin/screens/FounderDashboard.web"),
);
const FounderSchoolDashboard = React.lazy(
	() => import("@repo/admin/screens/FounderSchoolDashboard"),
);
const GuardianDashboard = React.lazy(
	() => import("@repo/admin/screens/GuardianDashboard"),
);
const PrincipalDashboardWeb = React.lazy(
	() => import("@repo/admin/screens/PrincipalDashboard.web"),
);
const SchoolCreationScreen = React.lazy(
	() => import("@repo/admin/screens/SchoolCreationScreen"),
);

const Stack = createNativeStackNavigator<FounderStackParamList>();

function ScreenFallback() {
	return <StackFallback variant="list" />;
}

export default function PrincipalStackNavigatorWeb() {
	const { scene } = useTheme();
	return (
		<React.Suspense fallback={<ScreenFallback />}>
			<Stack.Navigator
				id="PrincipalStack"
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: scene.canvas.bg },
				}}
			>
				<Stack.Screen
					name="PrincipalDashboard"
					component={PrincipalDashboardWeb as any}
				/>
				<Stack.Screen name="GuardianDashboard" component={GuardianDashboard} />
				<Stack.Screen name="FounderDashboard" component={FounderDashboard} />
				<Stack.Screen
					name="FounderSchoolDashboard"
					component={FounderSchoolDashboard as any}
				/>
				<Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
			</Stack.Navigator>
		</React.Suspense>
	);
}
