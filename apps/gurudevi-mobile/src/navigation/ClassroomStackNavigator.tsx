import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClassroomScreen from '../screens/ClassroomScreen';
import ClassroomDetailsScreen from '../screens/ClassroomDetailsScreen';
import { Theme } from '../constants/Theme';

export type ClassroomStackParamList = {
    ClassroomList: undefined;
    ClassroomDetails: { classroomId: string; classroomName: string };
};

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

export default function ClassroomStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Theme.colors.voidIndigo },
            }}
        >
            <Stack.Screen name="ClassroomList" component={ClassroomScreen} />
            <Stack.Screen name="ClassroomDetails" component={ClassroomDetailsScreen} />
        </Stack.Navigator>
    );
}
