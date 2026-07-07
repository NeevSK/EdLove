module.exports = (api) => {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache.using(() => isWeb);

  const kebabCase = (str) =>
    str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
      .toLowerCase();

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // unstable_transformImportMeta: true
          unstable_transformImportMeta: true,
          reactCompiler: true,
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      require('react-native-worklets/plugin'),
      !isWeb && [
        'transform-imports',
        {
          'lucide-react-native': {
            transform: (member) => `lucide-react-native/dist/esm/icons/${kebabCase(member)}`,
            preventFullImport: true,
          },
        },
      ],
    ].filter(Boolean),
  };
};
