import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FounderStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';

const FounderDashboard = React.lazy(() => import('@repo/admin/screens/FounderDashboard.web'));
const FounderSchoolDashboard = React.lazy(() => import('@repo/admin/screens/FounderSchoolDashboard'));
const AdminDashboard = React.lazy(() => import('@repo/admin/screens/AdminDashboard.web'));
const AdminIncidentQueue = React.lazy(() => import('@repo/admin/screens/AdminIncidentQueue'));
const AdminTenantDetail = React.lazy(() => import('@repo/admin/screens/AdminTenantDetail'));
const AdminAuthorityRepair = React.lazy(() => import('@repo/admin/screens/AdminAuthorityRepair'));
const AdminJobControl = React.lazy(() => import('@repo/admin/screens/AdminJobControl'));
const AdminAuditLog = React.lazy(() => import('@repo/admin/screens/AdminAuditLog'));
const AdminReleaseControl = React.lazy(() => import('@repo/admin/screens/AdminReleaseControl'));
const SchoolCreationScreen = React.lazy(() => import('@repo/admin/screens/SchoolCreationScreen'));
const SchoolForestScreen = React.lazy(() => import('@repo/admin/screens/SchoolForestScreen.web'));
const PrincipalDashboardWeb = React.lazy(() => import('@repo/admin/screens/PrincipalDashboard.web'));

const Stack = createNativeStackNavigator<FounderStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="list" />;
}

export default function FounderStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
            <Stack.Navigator
                id="FounderStack"
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: scene.canvas.bg }}}>
                <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
                <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                <Stack.Screen name="AdminIncidentQueue" component={AdminIncidentQueue} />
                <Stack.Screen name="AdminTenantDetail" component={AdminTenantDetail} />
                <Stack.Screen name="AdminAuthorityRepair" component={AdminAuthorityRepair} />
                <Stack.Screen name="AdminJobControl" component={AdminJobControl} />
                <Stack.Screen name="AdminAuditLog" component={AdminAuditLog} />
                <Stack.Screen name="AdminReleaseControl" component={AdminReleaseControl} />
                <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboardWeb} />
                <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
                <Stack.Screen name="SchoolForest" component={SchoolForestScreen} />
            </Stack.Navigator>
        </React.Suspense>
    );
}
