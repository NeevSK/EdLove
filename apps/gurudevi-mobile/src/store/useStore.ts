import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types/User';
import { SchoolType } from '../constants/SriLankanSchools';

interface AppState {
    teacherName: string;
    setTeacherName: (name: string) => void;
    userRole: UserRole | null;
    setUserRole: (role: UserRole) => void;
    schoolType: SchoolType | null;
    setSchoolType: (type: SchoolType) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            teacherName: 'Gurudevi',
            setTeacherName: (name) => set({ teacherName: name }),
            userRole: null,
            setUserRole: (role) => set({ userRole: role }),
            schoolType: null,
            setSchoolType: (type) => set({ schoolType: type }),
        }),
        {
            name: 'gurudevi-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
