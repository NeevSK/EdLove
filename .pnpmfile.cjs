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

            return pkg;
        }
    }
};
