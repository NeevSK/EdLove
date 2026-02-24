import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ProfileScreen from '../screens/ProfileScreen';
import FullProfileScreen from '../screens/profile/FullProfileScreen';
import { useThemedColors } from '@repo/ui';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
    const { t } = useTranslation();
    const colors = useThemedColors();

    return (
        <Stack.Navigator
            id="ProfileStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.secondary }, // contentStyle for native-stack
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen
                name="FullProfile"
                component={FullProfileScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack.Navigator>
    );
}
