module.exports = (api) => {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache.using(() => isWeb);

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
