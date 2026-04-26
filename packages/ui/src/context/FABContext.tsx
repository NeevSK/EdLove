import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { ActionItem, TabType } from '../types/fab';
export type { ActionItem, TabType };

interface FABState {
  actions: ActionItem[];
  tabType: TabType;
  icon?: ReactNode;
  visible: boolean;
  onPress?: () => void;
  onBreathingReset?: () => void;
  hasActiveGaps?: boolean;
  gapPriority?: 'low' | 'medium' | 'high';
}

interface FABContextType {
  state: FABState;
  registerFAB: (config: Partial<FABState>) => void;
  unregisterFAB: () => void;
  setVisibility: (visible: boolean) => void;
}

const defaultState: FABState = {
  actions: [],
  tabType: 'self',
  visible: true,
};

const FABContext = createContext<FABContextType | undefined>(undefined);

export const FABProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FABState>(defaultState);

  const registerFAB = useCallback((config: Partial<FABState>) => {
    setState((prev) => ({ ...prev, ...config, visible: config.visible ?? true }));
  }, []);

  const unregisterFAB = useCallback(() => {
    setState((prev) => ({ ...prev, actions: [], visible: true }));
  }, []);

  const setVisibility = useCallback((visible: boolean) => {
    setState((prev) => ({ ...prev, visible }));
  }, []);

  const value = useMemo(
    () => ({ state, registerFAB, unregisterFAB, setVisibility }),
    [state, registerFAB, unregisterFAB, setVisibility],
  );

  return <FABContext.Provider value={value}>{children}</FABContext.Provider>;
};

export const useFAB = () => {
  const context = useContext(FABContext);
  if (!context) {
    throw new Error('useFAB must be used within a FABProvider (or SanctuaryProvider)');
  }
  return context;
};

/**
 * Hook to register FAB actions for a screen.
 * Automatically unregisters when the component unmounts.
 */
export const useRegisterFAB = (config: Partial<FABState>) => {
  const { registerFAB, unregisterFAB } = useFAB();

  React.useEffect(() => {
    registerFAB(config);
    // return () => unregisterFAB();
  }, [
    registerFAB,
    JSON.stringify(config.actions),
    config.tabType,
    config.visible,
    config.onPress,
    // config.icon, // REMOVED: This causes infinite loops if the icon is a new JSX element
    config.onBreathingReset,
    config.hasActiveGaps,
  ]);
};
