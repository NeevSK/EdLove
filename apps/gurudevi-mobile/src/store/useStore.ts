import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
    teacherName: string;
    setTeacherName: (name: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            teacherName: 'Gurudevi',
            setTeacherName: (name) => set({ teacherName: name }),
        }),
        {
            name: 'gurudevi-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
