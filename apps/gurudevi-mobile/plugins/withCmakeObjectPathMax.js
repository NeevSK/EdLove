const { createRunOncePlugin, withAppBuildGradle } = require('expo/config-plugins');

/**
 * Keeps generated C++ object paths below CMake's Windows-safe limit.
 *
 * pnpm's virtual-store paths make the Nitro module's C++ source paths long
 * enough for CMake/Ninja to repeatedly regenerate build.ninja on Windows.
 * A shorter object-path ceiling makes CMake hash object directories earlier.
 */
const withCmakeObjectPathMax = (config) =>
  withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy' && !cfg.modResults.contents.includes('CMAKE_OBJECT_PATH_MAX=128')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /defaultConfig\s*\{/,
        [
          'defaultConfig {',
          '        externalNativeBuild {',
          '            cmake {',
          '                arguments.add("-DCMAKE_OBJECT_PATH_MAX=128")',
          '            }',
          '        }',
        ].join('\n'),
      );
    }
    return cfg;
  });

module.exports = createRunOncePlugin(withCmakeObjectPathMax, 'withCmakeObjectPathMax', '1.0.0');
