import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'GURUDEVI_SCHOOL_CREATION_STATE';

export interface SchoolCreationState {
    step: number;
    basicInfo: {
        name: string;
        handle: string;
        officialType: string;
        contactEmail: string;
        contactPhone: string;
        website?: string;
    };
    location: {
        provinceId: string;
        districtId: string;
        city: string;
        address: string;
    };
    demographics: {
        studentType: 'mixed' | 'boys' | 'girls' | '';
        religiousAffiliation: string;
        studentCount: string;
    };
    hierarchy: {
        levels: string[]; // e.g., ['Primary', 'Secondary', 'AL']
        gradeRange: { start: number; end: number };
        sections: { name: string; headName?: string }[];
    };
}

const initialState: SchoolCreationState = {
    step: 1,
    basicInfo: {
        name: '',
        handle: '',
        officialType: '',
        contactEmail: '',
        contactPhone: '',
    },
    location: {
        provinceId: '',
        districtId: '',
        city: '',
        address: '',
    },
    demographics: {
        studentType: '',
        religiousAffiliation: 'secular',
        studentCount: '',
    },
    hierarchy: {
        levels: [],
        gradeRange: { start: 1, end: 13 },
        sections: [],
    },
};

export function useSchoolCreation() {
    const [state, setState] = useState<SchoolCreationState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load persisted state on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                const savedState = await AsyncStorage.getItem(PERSISTENCE_KEY);
                if (savedState) {
                    setState(JSON.parse(savedState));
                }
            } catch (e) {
                console.error('Failed to load school creation state', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadState();
    }, []);

    // Persist state whenever it changes
    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const updateStep = (step: number) => {
        setState(prev => ({ ...prev, step }));
    };

    const updateBasicInfo = (info: Partial<SchoolCreationState['basicInfo']>) => {
        setState(prev => ({
            ...prev,
            basicInfo: { ...prev.basicInfo, ...info },
        }));
    };

    const updateLocation = (loc: Partial<SchoolCreationState['location']>) => {
        setState(prev => ({
            ...prev,
            location: { ...prev.location, ...loc },
        }));
    };

    const updateDemographics = (demo: Partial<SchoolCreationState['demographics']>) => {
        setState(prev => ({
            ...prev,
            demographics: { ...prev.demographics, ...demo },
        }));
    };

    const updateHierarchy = (hier: Partial<SchoolCreationState['hierarchy']>) => {
        setState(prev => ({
            ...prev,
            hierarchy: { ...prev.hierarchy, ...hier },
        }));
    };

    const resetProgress = async () => {
        await AsyncStorage.removeItem(PERSISTENCE_KEY);
        setState(initialState);
    };

    return {
        state,
        isLoaded,
        updateStep,
        updateBasicInfo,
        updateLocation,
        updateDemographics,
        updateHierarchy,
        resetProgress,
    };
}
