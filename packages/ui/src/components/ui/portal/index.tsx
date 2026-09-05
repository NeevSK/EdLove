import React, { createContext, useContext, useEffect, useId, useMemo, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type PortalNode = React.ReactNode;

class PortalStore {
  private portals = new Map<string, PortalNode>();
  private version = 0;
  private listeners = new Set<() => void>();

  register(id: string, portal: PortalNode) {
    if (this.portals.get(id) === portal) return;
    this.portals.set(id, portal);
    this.version++;
    this.notify();
  }

  unregister(id: string) {
    if (!this.portals.has(id)) return;
    this.portals.delete(id);
    this.version++;
    this.notify();
  }

  getVersion = (): number => {
    return this.version;
  };

  getPortals = (): Map<string, PortalNode> => {
    return this.portals;
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

const portalStore = new PortalStore();

const PortalContext = createContext<{
  register: (id: string, children: React.ReactNode) => void;
  unregister: (id: string) => void;
}>({
  register: (id, node) => portalStore.register(id, node),
  unregister: (id) => portalStore.unregister(id),
});

const PortalHost = () => {
  useSyncExternalStore(portalStore.subscribe, portalStore.getVersion);
  const portals = portalStore.getPortals();

  if (Platform.OS === 'web') return null;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {Array.from(portals.entries()).map(([id, portal]) => (
        <React.Fragment key={id}>{portal}</React.Fragment>
      ))}
    </View>
  );
};

export const PortalProvider = ({ children }: { children: React.ReactNode }) => {
  const contextValue = useMemo(
    () => ({
      register: (id: string, node: React.ReactNode) => portalStore.register(id, node),
      unregister: (id: string) => portalStore.unregister(id),
    }),
    [],
  );

  return (
    <PortalContext.Provider value={contextValue}>
      {children}
      <PortalHost />
    </PortalContext.Provider>
  );
};

export const Portal = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(PortalContext);
  const id = useId();
  const isWeb = Platform.OS === 'web';

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isWeb) return;
    context.register(id, children);
  }, [children, context, id, isWeb]);

  useEffect(() => {
    if (isWeb) return;
    return () => {
      context.unregister(id);
    };
  }, [context, id, isWeb]);

  if (isWeb) {
    if (!mounted) return null;
    try {
      const ReactDOM = require('react-dom');
      return ReactDOM.createPortal(children, document.body);
    } catch {
      return <View>{children}</View>;
    }
  }

  return null;
};
