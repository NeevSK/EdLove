/**
 * Self-Healing Web Shim for react-native-gesture-handler
 */
import bridge from './universal-bridge';

const GestureHandlerRootView = 'div';
const PanGestureHandler = 'div';
const TapGestureHandler = 'div';
const LongPressGestureHandler = 'div';
const PinchGestureHandler = 'div';
const RotationGestureHandler = 'div';
const FlingGestureHandler = 'div';
const RawButton = 'button';
const BaseButton = 'button';
const RectButton = 'button';

const Gesture = bridge('Gesture', {});

const gestureHandlerShim = bridge('react-native-gesture-handler', {
    GestureHandlerRootView,
    PanGestureHandler,
    TapGestureHandler,
    LongPressGestureHandler,
    PinchGestureHandler,
    RotationGestureHandler,
    FlingGestureHandler,
    RawButton,
    BaseButton,
    RectButton,
    Gesture,
    State: {
        UNDETERMINED: 0,
        FAILED: 1,
        BEGAN: 2,
        CANCELLED: 3,
        ACTIVE: 4,
        END: 5,
    },
});

export { 
    GestureHandlerRootView, 
    PanGestureHandler, 
    Gesture, 
    RawButton, 
    BaseButton, 
    RectButton 
};

export default gestureHandlerShim;
