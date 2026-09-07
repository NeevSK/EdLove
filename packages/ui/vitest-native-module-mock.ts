import React from 'react';

const NativeModuleMock = React.forwardRef<unknown, Record<string, unknown>>(
  ({ children, ...props }, ref) => React.createElement('NativeModuleMock', { ...props, ref }, children),
);

export default NativeModuleMock;
export { NativeModuleMock as Slider };
