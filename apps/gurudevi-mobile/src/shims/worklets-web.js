/**
 * Web shim for react-native-worklets
 */
export const createSerializable = (value) => value;
export const serializableMappingCache = new Map();
export const callMicrotasks = () => { };
export const createWorkletRuntime = () => ({});
export const executeOnUIRuntimeSync = () => { };
export const isWorkletFunction = () => false;
export const runOnJS = (fn) => fn;
export const runOnRuntime = () => () => { };
export const runOnUI = (fn) => fn;
export const scheduleOnRN = () => { };
export const scheduleOnUI = () => { };
export const makeShareable = (value) => value;
export const createSynchronizable = (value) => value;
export const runOnUISync = () => { };
export const RuntimeKind = { ReactNative: 1, Worklet: 2 };
export const WorkletsModule = {};
export const Worklets = {};

export default {
    createSerializable,
    serializableMappingCache,
    callMicrotasks,
    createWorkletRuntime,
    executeOnUIRuntimeSync,
    isWorkletFunction,
    runOnJS,
    runOnRuntime,
    runOnUI,
    scheduleOnRN,
    scheduleOnUI,
    makeShareable,
    createSynchronizable,
    runOnUISync,
    RuntimeKind,
    WorkletsModule,
    Worklets,
};
