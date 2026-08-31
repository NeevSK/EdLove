import React, { createContext, useContext, useEffect, useId, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

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
      {Platform.OS !== 'web' && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {Object.entries(portals).map(([id, portal]) => (
            <React.Fragment key={id}>{portal}</React.Fragment>
          ))}
        </View>
      )}
    </PortalContext.Provider>
  );
};

export const Portal = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(PortalContext);
  const id = useId();
  const isWeb = Platform.OS === 'web';

  // Hooks are called unconditionally on both platforms; the platform branch
  // below only decides rendering, never hook order.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isWeb || !context) {
      return;
    }
    context.register(id, children);
    return () => {
      context.unregister(id);
    };
  }, [children, context, id, isWeb]);

  if (isWeb) {
    // Avoid SSR hydration mismatch: only mount portal on client side
    if (!mounted) return null;

    // Direct DOM escape on web
    try {
      const ReactDOM = require('react-dom');
      return ReactDOM.createPortal(children, document.body);
    } catch {
      // Fallback if react-dom is not available
      return <View>{children}</View>;
    }
  }

  if (!context) {
    // Fallback if no provider exists
    return <View>{children}</View>;
  }

  return null;
};
