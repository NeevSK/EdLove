module.exports = {
    hooks: {
        readPackage(pkg) {
            // Fix jest-watch-typeahead peer dependency on jest
            if (pkg.name === 'jest-watch-typeahead') {
                pkg.peerDependencies['jest'] = '>=27.0.0 || ^30.0.0';
            }

            // Fix eslint-plugin-react-native-a11y peer dependency on eslint
            if (pkg.name === 'eslint-plugin-react-native-a11y') {
                pkg.peerDependencies['eslint'] = '>=3.0.0';
            }

            // Suppress @gluestack-ui/themed missing peer dependency warning
            // We handle this via root overrides and the @repo/types-shim
            if (pkg.name === '@gluestack-ui/themed') {
                if (pkg.peerDependencies) {
                    delete pkg.peerDependencies['@types/react-native'];
                }
            }

            // Fix ZenStack peer dependency on zod (ZenStack 3.5.1 incorrectly flags zod ^4.0.0)
            if (pkg.name && pkg.name.startsWith('@zenstackhq/')) {
                if (pkg.peerDependencies && pkg.peerDependencies['zod']) {
                    pkg.peerDependencies['zod'] = '^3.23.8 || ^4.0.0';
                }
            }

            // Fix zod-validation-error peer dependency range
            if (pkg.name === 'zod-validation-error') {
                if (pkg.peerDependencies && pkg.peerDependencies['zod']) {
                    pkg.peerDependencies['zod'] = '^3.23.8 || ^4.0.0';
                }
            }

            // Fix ts-rest core peer dependency
            if (pkg.name === '@ts-rest/core') {
                if (pkg.peerDependencies && pkg.peerDependencies['zod']) {
                    pkg.peerDependencies['zod'] = '^3.23.8 || ^4.0.0';
                }
            }

            return pkg;
        }
    }
};
