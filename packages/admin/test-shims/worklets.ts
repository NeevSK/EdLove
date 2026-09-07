export const createSerializable = <T>(value: T) => value;
export const Worklets = {
  createRunInContextFn: <T>(factory: T) => factory,
  createRunInJSFn: <T>(factory: T) => factory,
};
