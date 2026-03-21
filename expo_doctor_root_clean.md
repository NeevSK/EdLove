Running 17 checks on your project...
14/17 checks passed. 3 checks failed. Possible issues detected:
Use the --verbose flag to see more details about passed checks.

Γ£û Check that no duplicate dependencies are installed
Your project contains duplicate native module dependencies, which should be de-duplicated.
Native builds may only contain one version of any given native module, and having multiple versions of a single Native module installed may lead to unexpected build errors.
Found duplicates for expo:
  Γö£ΓöÇ expo@55.0.4 (at: node_modules\expo)
  Γöé  ΓööΓöÇ linked to: node_modules\.pnpm\expo@55.0.4_@babel+core@7.2_f8fac7206640ac3e4040301a3837703d\node_modules\expo
  Γö£ΓöÇ expo@55.0.4 (at: node_modules\.pnpm\@expo+log-box@55.0.7_@expo+_2a680c249470cdcd4287e390a8ce0151\node_modules\expo)
  Γöé  ΓööΓöÇ linked to a different installation
  ΓööΓöÇ expo@55.0.4 (at: node_modules\.pnpm\expo-asset@55.0.8_expo@55.0_a717c3068fa49c195e349d79d6c95fbb\node_modules\expo)
     ΓööΓöÇ linked to a different installation
Found duplicates for expo-asset:
  Γö£ΓöÇ expo-asset@55.0.8 (at: node_modules\.pnpm\expo@55.0.4_@babel+core@7.2_f8fac7206640ac3e4040301a3837703d\node_modules\expo-asset)
  Γöé  ΓööΓöÇ linked to a different installation
  ΓööΓöÇ expo-asset@55.0.8 (at: node_modules\.pnpm\expo@55.0.4_@babel+core@7.2_255ca5516aa93870c38c7ecdf0b79003\node_modules\expo-asset)
     ΓööΓöÇ linked to a different installation
Found duplicates for expo-constants:
  Γö£ΓöÇ expo-constants@55.0.7 (at: node_modules\.pnpm\expo@55.0.4_@babel+core@7.2_f8fac7206640ac3e4040301a3837703d\node_modules\expo-constants)
  Γöé  ΓööΓöÇ linked to a different installation
  ΓööΓöÇ expo-constants@55.0.7 (at: node_modules\.pnpm\expo@55.0.4_@babel+core@7.2_255ca5516aa93870c38c7ecdf0b79003\node_modules\expo-constants)
     ΓööΓöÇ linked to a different installation
Advice:
Your node_modules folder may be corrupted. Multiple copies of the same version exist for: expo, expo-asset, expo-constants.
- Try deleting your node_modules folders and reinstall your dependencies after.
- If this error persists, delete your node_modules as well as your lockfile and reinstall.
Resolve your dependency issues and deduplicate your dependencies. Learn more: https://expo.fyi/resolving-dependency-issues

Γ£û Check for app config fields that may not be synced in a non-CNG project
This project contains native project folders but also has native configuration properties in app.json, indicating it is configured to use Prebuild. When the android/ios folders are present, if you don't run prebuild in your build pipeline, the following properties will not be synced: android. 


Γ£û Check that packages match versions required by installed Expo SDK

≡ƒöº Patch version mismatches
package    expected  found   
expo       ~55.0.5   55.0.4  
jest-expo  ~55.0.11  55.0.9  



2 packages out of date.
Advice:
Use 'npx expo install --check' to review and upgrade your dependencies.
To ignore specific packages, add them to "expo.install.exclude" in package.json. Learn more: https://expo.fyi/dependency-validation

