import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useReducer, useCallback, useRef } from 'react';

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
    levels: string[];
    gradeRange: { start: number; end: number };
    sections: { name: string; headName?: string }[];
  };
}

type Action =
  | { type: 'SET_STATE'; payload: SchoolCreationState }
  | { type: 'UPDATE_STEP'; payload: number }
  | { type: 'UPDATE_BASIC_INFO'; payload: Partial<SchoolCreationState['basicInfo']> }
  | { type: 'UPDATE_LOCATION'; payload: Partial<SchoolCreationState['location']> }
  | { type: 'UPDATE_DEMOGRAPHICS'; payload: Partial<SchoolCreationState['demographics']> }
  | { type: 'UPDATE_HIERARCHY'; payload: Partial<SchoolCreationState['hierarchy']> }
  | { type: 'RESET' };

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

function creationReducer(state: SchoolCreationState, action: Action): SchoolCreationState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'UPDATE_STEP':
      return { ...state, step: action.payload };
    case 'UPDATE_BASIC_INFO':
      return { ...state, basicInfo: { ...state.basicInfo, ...action.payload } };
    case 'UPDATE_LOCATION':
      return { ...state, location: { ...state.location, ...action.payload } };
    case 'UPDATE_DEMOGRAPHICS':
      return { ...state, demographics: { ...state.demographics, ...action.payload } };
    case 'UPDATE_HIERARCHY':
      return { ...state, hierarchy: { ...state.hierarchy, ...action.payload } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useSchoolCreation() {
  const [state, dispatch] = useReducer(creationReducer, initialState);
  const isLoaded = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    async function loadState() {
      try {
        const savedState = await AsyncStorage.getItem(PERSISTENCE_KEY);
        if (savedState) {
          dispatch({ type: 'SET_STATE', payload: JSON.parse(savedState) });
        }
      } catch (e) {
        console.error('[useSchoolCreation] Load error:', e);
      } finally {
        isLoaded.current = true;
      }
    }
    loadState();
  }, []);

  // Persist state changes
  useEffect(() => {
    if (isLoaded.current) {
      AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const updateStep = useCallback((step: number) => {
    dispatch({ type: 'UPDATE_STEP', payload: step });
  }, []);

  const updateBasicInfo = useCallback((info: Partial<SchoolCreationState['basicInfo']>) => {
    dispatch({ type: 'UPDATE_BASIC_INFO', payload: info });
  }, []);

  const updateLocation = useCallback((loc: Partial<SchoolCreationState['location']>) => {
    dispatch({ type: 'UPDATE_LOCATION', payload: loc });
  }, []);

  const updateDemographics = useCallback((demo: Partial<SchoolCreationState['demographics']>) => {
    dispatch({ type: 'UPDATE_DEMOGRAPHICS', payload: demo });
  }, []);

  const updateHierarchy = useCallback((hier: Partial<SchoolCreationState['hierarchy']>) => {
    dispatch({ type: 'UPDATE_HIERARCHY', payload: hier });
  }, []);

  const resetProgress = useCallback(async () => {
    await AsyncStorage.removeItem(PERSISTENCE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    isLoaded: isLoaded.current,
    updateStep,
    updateBasicInfo,
    updateLocation,
    updateDemographics,
    updateHierarchy,
    resetProgress,
  };
}
