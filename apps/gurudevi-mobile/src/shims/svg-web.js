/* eslint-disable */
/**
 * React Native SVG Shim for Web
 * 
 * Provides a self-healing proxy for react-native-svg components.
 * In a web environment, we want to prevent crashes when native SVG components are required.
 */
const bridge = require('./universal-bridge');

// Base mocks for common SVG components
const Svg = (props) => {
    const { children, style, ...rest } = props;
    return <svg {...rest} style={style}>{children}</svg>;
};

const Path = (props) => <path {...props} />;
const Circle = (props) => <circle {...props} />;
const Rect = (props) => <rect {...props} />;
const G = (props) => <g {...props} />;
const Defs = (props) => <defs {...props} />;
const LinearGradient = (props) => <linearGradient {...props} />;
const Stop = (props) => <stop {...props} />;

module.exports = bridge('react-native-svg', {
    default: Svg,
    Svg,
    Path,
    Circle,
    Rect,
    G,
    Defs,
    LinearGradient,
    Stop,
});
module.exports.__esModule = true;
