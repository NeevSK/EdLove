module.exports = (api) => {
  api.cache(true);

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
    plugins: [
      require('react-native-worklets/plugin'),
      [
        'transform-imports',
        {
          'lucide-react-native': {
            transform: (member) => `lucide-react-native/dist/esm/icons/${kebabCase(member)}`,
            preventFullImport: true,
          },
          '@repo/ui/icons': {
            transform: (member) => `lucide-react-native/dist/esm/icons/${kebabCase(member)}`,
            preventFullImport: true,
          },
        },
      ],
    ],
  };
};
