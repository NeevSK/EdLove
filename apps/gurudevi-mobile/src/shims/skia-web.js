/**
 * Web shim for @shopify/react-native-skia
 */

const React = require('react');

const View = (props) => React.createElement('div', props, props.children);
const Group = (props) => React.createElement('div', props, props.children);

const Skia = {
    Color: () => '#000000',
    Paint: () => ({}),
    Font: () => ({}),
    Path: {
        Make: () => ({
            moveTo: () => { },
            lineTo: () => { },
            quadTo: () => { },
            cubicTo: () => { },
            close: () => { },
            simplify: () => true,
            toSVGString: () => '',
        }),
    },
};

const Canvas = (props) => React.createElement('div', props, props.children);
const Circle = () => null;
const Rect = () => null;
const Path = () => null;
const Image = () => null;
const Text = () => null;
const DropShadow = () => null;
const Blur = () => null;
const LinearGradient = () => null;
const RadialGradient = () => null;
const SweepGradient = () => null;
const ImageShader = () => null;
const ColorMatrix = () => null;
const BackdropFilter = () => null;
const BackdropBlur = () => React.createElement('div', { style: { backdropFilter: `blur(10px)` } });
const Mask = () => null;
const Fill = () => null;
const FitBox = () => null;
const Box = () => null;
const BoxShadow = () => null;
const mix = (value, x, y) => x * (1 - value) + y * value;

module.exports = {
    Skia,
    Canvas,
    Group,
    Circle,
    Rect,
    Path,
    Image,
    Text,
    DropShadow,
    Blur,
    LinearGradient,
    RadialGradient,
    SweepGradient,
    ImageShader,
    ColorMatrix,
    BackdropFilter,
    BackdropBlur,
    Mask,
    Fill,
    FitBox,
    Box,
    BoxShadow,
    mix,
    useFont: () => null,
    useImage: () => null,
    usePath: () => null,
    useRSXformBuffer: () => null,
    useValue: (v) => ({ current: v }),
    useComputedValue: (v) => ({ current: null }),
    useTouchHandler: () => null,
    runSpring: () => { },
    runTiming: () => { },
    useSpring: () => null,
    useTiming: () => null,
    interpolate: () => null,
    interpolateColors: () => null,
};
