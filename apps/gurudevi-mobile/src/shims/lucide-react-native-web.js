/* eslint-disable */
/**
 * Lucide React Native Shim for Web
 * 
 * Provides a self-healing proxy for lucide-react-native icons.
 * This prevents crashes when an icon is imported but the package is not correctly resolved.
 */
const React = require('react');
const bridge = require('./universal-bridge');

// Generic placeholder icon if the proxy fails or needs a base
const GenericIcon = (props) => {
    const { size = 24, color = 'currentColor', strokeWidth = 2, ...rest } = props;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
                    <circle cx="12" cy="12" r="10" /            <line x1="12" y1="8" x2="12" y2="12" /            <line x1="12" y1="16" x2="12.01" y2="16" /        </svg    );
};

module.exports = bridge('lucide-react-native', {
    default: GenericIcon,
    // Add common ones explicitly if we want better base performance
    User: GenericIcon,
    School: GenericIcon,
    Heart: GenericIcon,
    Users: GenericIcon,
    Library: GenericIcon,
    Bell: GenericIcon,
});
module.exports.__esModule = true;
