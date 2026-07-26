import type React from 'react';
import { Box } from '@/components/ui/box';
import type { UnifiedMarkerProps } from '@/components/maps/UnifiedMarker.types';

/**
 * UnifiedMarker.web - Web-sovereign map marker.
 * Prevents native dependency pollution in browser builds.
 */
export const UnifiedMarker: React.FC<UnifiedMarkerProps> = ({
  coordinate,
  title,
  description,
  onPress,
  pinColor,
  children,
}) => {
  return (
    <Box
      className="cursor-pointer"
      onPress={onPress}
      style={{ position: 'absolute' }} // Logic for placement in web maps would go here
    >
      {children || (
        <Box
          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: pinColor || '#FF0000' }}
        />
      )}
      {/* Tooltip emulation for web if needed */}
    </Box>
  );
};

export default UnifiedMarker;
