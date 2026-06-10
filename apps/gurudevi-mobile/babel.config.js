module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // zustand@5 (and similar packages) ship pre-compiled code that uses
          // `import.meta.env.MODE` for dev/prod detection.  Metro serves the
          // web bundle as a classic <script> (no type="module"), so any bare
          // `import.meta` reference causes:
          //   SyntaxError: Cannot use 'import.meta' outside a module
          //
          // Setting this to true makes babel-preset-expo's
          // import-meta-transform-plugin replace every `import.meta` with
          // `globalThis.__ExpoImportMetaRegistry`, which Expo's winter runtime
          // sets up before the app boots.  This keeps the classic-script bundle
          // compatible without changing the output format.
          unstable_transformImportMeta: true,
          reactCompiler: true,
        },
      ],
      'nativewind/babel',
    ],
    plugins: [require('react-native-worklets/plugin')],
  };
};
