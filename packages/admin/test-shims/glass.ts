import React from 'react';

const Glass = ({ children, ...props }: any) => React.createElement('GlassView', props, children);
export const GlassView = Glass;
export const GlassContainer = Glass;
export const isLiquidGlassAvailable = () => false;
export const isGlassEffectAPIAvailable = () => false;
export default Glass;
