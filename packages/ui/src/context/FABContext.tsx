import type { ActionItem, TabType } from '@repo/ui/types/fab';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

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
  visible: false,
};

const FABContext = createContext<FABContextType | undefined>(undefined);

export const FABProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FABState>(defaultState);

  const registerFAB = useCallback((config: Partial<FABState>) => {
    setState((prev) => ({
      ...prev,
      ...config,
      visible: config.visible ?? true,
    }));
  }, []);

  const unregisterFAB = useCallback(() => {
    setState((prev) =>
      prev.actions.length === 0 && !prev.visible ? prev : { ...prev, actions: [], visible: false },
    );
  }, []);

  const setVisibility = useCallback((visible: boolean) => {
    setState((prev) => ({ ...prev, visible }));
  }, []);

  const value = useMemo(
    () => ({ state, registerFAB, unregisterFAB, setVisibility }),
    [state, registerFAB, unregisterFAB, setVisibility],
  );

  return <FABContext value={value}>{children}</FABContext>;
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
  const configRef = React.useRef(config);

  React.useEffect(() => {
    configRef.current = config;
  });

  React.useEffect(() => {
    registerFAB(configRef.current);
    return () => unregisterFAB();
  }, [registerFAB, unregisterFAB, config.tabType, config.visible]);
};
