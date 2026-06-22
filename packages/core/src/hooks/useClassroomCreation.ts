import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
    loadState().catch((e) => {
      console.error('ClassroomCreation: Failed to load state', e);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state)).catch((e) => {
        console.error('ClassroomCreation: Failed to save state', e);
      });
    }
  }, [state, isLoaded]);

  const updateStep = useCallback((step: number) => setState((prev) => ({ ...prev, step })), []);

  const updateDetails = useCallback(
    (details: Partial<ClassroomCreationState['details']>) =>
      setState((prev) => ({ ...prev, details: { ...prev.details, ...details } })),
    [],
  );

  const updateAcademic = useCallback(
    (academic: Partial<ClassroomCreationState['academic']>) =>
      setState((prev) => ({
        ...prev,
        academic: { ...prev.academic, ...academic },
      })),
    [],
  );

  const updateAesthetics = useCallback(
    (aesthetics: Partial<ClassroomCreationState['aesthetics']>) =>
      setState((prev) => ({
        ...prev,
        aesthetics: { ...prev.aesthetics, ...aesthetics },
      })),
    [],
  );

  const resetProgress = useCallback(async () => {
    await AsyncStorage.removeItem(PERSISTENCE_KEY);
    setState(initialState);
  }, []);

  return useMemo(
    () => ({
      state,
      isLoaded,
      updateStep,
      updateDetails,
      updateAcademic,
      updateAesthetics,
      resetProgress,
    }),
    [state, isLoaded, updateAcademic, updateStep, updateAesthetics, updateDetails, resetProgress],
  );
}
