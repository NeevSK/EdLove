import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Portal Registry Context
 */
const PortalContext = createContext<{
  register: (id: string, children: React.ReactNode) => void;
  unregister: (id: string) => void;
} | null>(null);

/**
 * PortalProvider
 * Place this high in the component tree (e.g. in GluestackUIProvider).
 * It hosts all Portals rendered within its tree.
 */
export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portals, setPortals] = useState<Record<string, React.ReactNode>>({});

  const register = useCallback((id: string, children: React.ReactNode) => {
    setPortals((prev) => ({ ...prev, [id]: children }));
  }, []);

  const unregister = useCallback((id: string) => {
    setPortals((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <PortalContext.Provider value={{ register, unregister }}>
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none" collapsable={false}>
        {Object.entries(portals).map(([id, node]) => (
          <React.Fragment key={id}>{node}</React.Fragment>
        ))}
      </View>
    </PortalContext.Provider>
  );
};

/**
 * Portal Component
 * Renders children into the PortalProvider's host View.
 */
export const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(PortalContext);
  const [id] = useState(() => Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (!context) {
      console.error(
        'Portal: Could not find PortalProvider context. Ensure your app is wrapped in <PortalProvider />.',
      );
      return;
    }
    context.register(id, children);
    return () => context.unregister(id);
  }, [context, id, children]);

  return null;
};
