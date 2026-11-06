import type { UnifiedMarkerProps } from '@repo/ui/components/maps/UnifiedMarker.types';
import type React from 'react';
import { Marker } from 'react-native-maps';

export const UnifiedMarker: React.FC<UnifiedMarkerProps> = ({
  id,
  coordinate,
  title,
  description,
  onPress,
  pinColor,
  children,
}) => {
  return (
    <Marker
      identifier={id}
      coordinate={coordinate}
      title={title}
      description={description}
      onPress={onPress}
      pinColor={pinColor}
    >
      {children}
    </Marker>
  );
};

export default UnifiedMarker;
