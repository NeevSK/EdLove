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
    ],
    plugins: [require('react-native-worklets/plugin')],
  };
};
