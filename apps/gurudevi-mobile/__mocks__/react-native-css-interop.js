module.exports = {
  cssInterop: (component) => component,
  remapProps: (component) => component,
  StyleSheet: {
    create: (styles) => styles,
  },
};
