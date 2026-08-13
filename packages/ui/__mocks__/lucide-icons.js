const React = require('react');
const { View } = require('react-native');

const Icon = ({ size = 24, color, testID: _testID, ...props }) =>
  React.createElement(View, {
    ...props,
    accessibilityRole: 'image',
    style: [{ width: size, height: size }, props.style],
    testID: props.testID ?? 'lucide-icon-mock',
    ...(color ? { accessibilityLabel: color } : {}),
  });

module.exports = new Proxy(
  { Icon, LucideIcon: Icon },
  {
    get(target, property) {
      return target[property] ?? Icon;
    },
  },
);
