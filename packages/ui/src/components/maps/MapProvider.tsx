import React, { createContext, type ReactNode, useContext, useState } from 'react';

export type MapProviderType = 'google' | 'apple';

interface MapContextProps {
  provider: MapProviderType;
  setProvider: (provider: MapProviderType) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{
  children: ReactNode;
  initialProvider?: MapProviderType;
}> = ({ children, initialProvider = 'apple' }) => {
  const [provider, setProvider] = useState<MapProviderType>(initialProvider);

  return <MapContext.Provider value={{ provider, setProvider }}>{children}</MapContext.Provider>;
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

export const useOptionalMap = () => useContext(MapContext);
