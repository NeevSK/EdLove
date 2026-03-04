const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const appJsonPath = path.resolve(__dirname, '../app.json');

// 1. Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// 2. Increment version (patch by default)
const parts = currentVersion.split('.');
parts[2] = parseInt(parts[2], 10) + 1;
const newVersion = parts.join('.');

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// 3. Sync with app.json
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.version = newVersion;

// Increment android versionCode if it exists
if (appJson.expo.android && appJson.expo.android.versionCode) {
    appJson.expo.android.versionCode += 1;
}

// Increment ios buildNumber if it exists (assuming it's a string representing a number)
if (appJson.expo.ios && appJson.expo.ios.buildNumber) {
    const buildNum = parseInt(appJson.expo.ios.buildNumber, 10);
    appJson.expo.ios.buildNumber = (buildNum + 1).toString();
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Version incremented: ${currentVersion} -> ${newVersion}`);
console.log(`✅ Synchronized with app.json`);
