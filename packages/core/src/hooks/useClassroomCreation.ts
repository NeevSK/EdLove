import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'GURUDEVI_CLASSROOM_CREATION_STATE';

export interface ClassroomCreationState {
    step: number;
    details: {
        name: string;
        handle: string;
        description: string;
    };
    academic: {
        sectionId: string;
        gradeId: string;
        subject: string;
        syllabusId: string;
    };
    aesthetics: {
        themeId: string;
        classType: 'own' | 'subject';
    };
}

const initialState: ClassroomCreationState = {
    step: 1,
    details: {
        name: '',
        handle: '',
        description: '',
    },
    academic: {
        sectionId: '',
        gradeId: '',
        subject: '',
        syllabusId: 'legacy',
    },
    aesthetics: {
        themeId: 'saffron',
        classType: 'own',
    },
};

export function useClassroomCreation() {
    const [state, setState] = useState<ClassroomCreationState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadState = async () => {
            try {
                const savedState = await AsyncStorage.getItem(PERSISTENCE_KEY);
                if (savedState) {
                    setState(JSON.parse(savedState));
                }
            } catch (e) {
                console.error('Failed to load classroom creation state', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadState();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const updateStep = (step: number) => setState(prev => ({ ...prev, step }));
    
    const updateDetails = (details: Partial<ClassroomCreationState['details']>) => 
        setState(prev => ({ ...prev, details: { ...prev.details, ...details } }));
        
    const updateAcademic = (academic: Partial<ClassroomCreationState['academic']>) => 
        setState(prev => ({ ...prev, academic: { ...prev.academic, ...academic } }));
        
    const updateAesthetics = (aesthetics: Partial<ClassroomCreationState['aesthetics']>) => 
        setState(prev => ({ ...prev, aesthetics: { ...prev.aesthetics, ...aesthetics } }));

    const resetProgress = async () => {
        await AsyncStorage.removeItem(PERSISTENCE_KEY);
        setState(initialState);
    };

    return {
        state,
        isLoaded,
        updateStep,
        updateDetails,
        updateAcademic,
        updateAesthetics,
        resetProgress,
    };
}
