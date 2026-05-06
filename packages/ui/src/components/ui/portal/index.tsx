import React, { createContext, useContext, useEffect, useState, useId } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Portal Registry System
 *
 * A hardened, non-legacy portal system for layering.
 * Handles multiple portals via a central registry.
 */

type PortalContextType = {
  register: (id: string, children: React.ReactNode) => void;
  unregister: (id: string) => void;
};

const PortalContext = createContext<PortalContextType | null>(null);

export const PortalProvider = ({ children }: { children: React.ReactNode }) => {
  const [portals, setPortals] = useState<Record<string, React.ReactNode>>({});

  const register = (id: string, portal: React.ReactNode) => {
    setPortals((prev) => ({ ...prev, [id]: portal }));
  };

  const unregister = (id: string) => {
    setPortals((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <PortalContext.Provider value={{ register, unregister }}>
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {Object.entries(portals).map(([id, portal]) => (
          <React.Fragment key={id}>{portal}</React.Fragment>
        ))}
      </View>
    </PortalContext.Provider>
  );
};

export const Portal = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(PortalContext);
  const id = useId();

  useEffect(() => {
    if (context) {
      context.register(id, children);
    }
    return () => {
      if (context) {
        context.unregister(id);
      }
    };
  }, [children, context, id]);

  if (!context) {
    // Fallback if no provider exists
    return <View>{children}</View>;
  }

  return null;
};
