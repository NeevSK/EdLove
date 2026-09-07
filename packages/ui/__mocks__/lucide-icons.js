import React from 'react';
import { View } from 'react-native';

const Icon = ({ size = 24, color, testID: _testID, ...props }) =>
  React.createElement(View, {
    ...props,
    accessibilityRole: 'image',
    style: [{ width: size, height: size }, props.style],
    testID: props.testID ?? 'lucide-icon-mock',
    ...(color ? { accessibilityLabel: color } : {}),
  });

export { Icon, Icon as LucideIcon };
export default Icon;
