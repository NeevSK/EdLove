const fs = require('node:fs');
const path = require('node:path');

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
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

// 3. Sync with app.json
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.version = newVersion;

// Ensure android object exists
if (!appJson.expo.android) {
  appJson.expo.android = {};
}

// Increment or initialize android versionCode
if (appJson.expo.android.versionCode) {
  appJson.expo.android.versionCode += 1;
} else {
  appJson.expo.android.versionCode = 1;
}

// Ensure ios object exists
if (!appJson.expo.ios) {
  appJson.expo.ios = {};
}

// Increment or initialize ios buildNumber
if (appJson.expo.ios.buildNumber) {
  const buildNum = parseInt(appJson.expo.ios.buildNumber, 10);
  appJson.expo.ios.buildNumber = (buildNum + 1).toString();
} else {
  appJson.expo.ios.buildNumber = '1';
}

fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

console.log(` Version incremented: ${currentVersion} -> ${newVersion}`);
console.log(` Synchronized with app.json`);
