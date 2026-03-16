import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'GURUDEVI_GROUP_CREATION_STATE';

export interface GroupCreationState {
    step: number;
    details: {
        name: string;
        handle: string;
        description: string;
        avatarUrl: string | null;
    };
    setup: {
        groupType: 'general' | 'club' | 'interest' | 'subject';
        joinPolicy: 'open' | 'approval_required' | 'invite_only';
    };
}

const initialState: GroupCreationState = {
    step: 1,
    details: {
        name: '',
        handle: '',
        description: '',
        avatarUrl: null,
    },
    setup: {
        groupType: 'general',
        joinPolicy: 'open',
    },
};

export function useGroupCreation() {
    const [state, setState] = useState<GroupCreationState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadState = async () => {
            try {
                const savedState = await AsyncStorage.getItem(PERSISTENCE_KEY);
                if (savedState) {
                    setState(JSON.parse(savedState));
                }
            } catch (e) {
                console.error('Failed to load group creation state', e);
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
    
    const updateDetails = (details: Partial<GroupCreationState['details']>) => 
        setState(prev => ({ ...prev, details: { ...prev.details, ...details } }));
        
    const updateSetup = (setup: Partial<GroupCreationState['setup']>) => 
        setState(prev => ({ ...prev, setup: { ...prev.setup, ...setup } }));

    const resetProgress = async () => {
        await AsyncStorage.removeItem(PERSISTENCE_KEY);
        setState(initialState);
    };

    return {
        state,
        isLoaded,
        updateStep,
        updateDetails,
        updateSetup,
        resetProgress,
    };
}
