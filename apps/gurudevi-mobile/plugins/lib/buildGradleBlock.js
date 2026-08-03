/**
 * Shared helpers for Gradle build-file mutations.
 *
 * Every android{} block injection in this plugin family MUST use these
 * helpers so that:
 *   - ordering across concerns is stable (the plugin-array order in app.json
 *     plus the snippet order here),
 *   - insertions are idempotent (re-running prebuild never duplicates),
 *   - the file is regenerated safely each time plugins re-run.
 *
 * Breadcrumb: each snippet carries a unique, stable string that, when found
 * in the file, proves the snippet was already applied.  This survives
 * Expo's full-rebuild-from-scratch regeneration because Expo re-applies
 * all plugins in order on the fresh template.
 */

const EXPO_MAVEN_URL = 'https://packages.expo.dev/maven';

/**
 * Idempotently insert one or more code snippets right after the first
 * `android {` line in android/app/build.gradle.
 *
 * @param {string} contents - current build.gradle text
 * @param {{ breadcrumb: string, code: string }[]} snippets
 *   breadcrumb: a unique string already present in `code` used to detect
 *               prior application (idempotency key).
 *   code:       indented Groovy snippet to insert.
 * @returns {string} updated contents
 */
const ensureAndroidBlockSnippets = (contents, snippets) => {
  let out = contents;
  for (const { breadcrumb, code } of snippets) {
    if (out.includes(breadcrumb)) continue;
    const match = out.match(/android\s*\{/);
    if (!match) continue;
    const idx = match.index + match[0].length;
    out = out.slice(0, idx) + '\n' + code + out.slice(idx);
  }
  return out;
};

/**
 * Idempotent string replacement: replace `old` with `rep` only once.
 * No-ops if `old` is absent or `rep` is already present.
 *
 * @param {string} contents
 * @param {string} old - text to search for
 * @param {string} rep - replacement text
 * @returns {string}
 */
const replaceIfFound = (contents, old, rep) => {
  if (!contents.includes(old)) return contents;
  if (contents.includes(rep)) return contents;
  return contents.replace(old, rep);
};

module.exports = {
  EXPO_MAVEN_URL,
  ensureAndroidBlockSnippets,
  replaceIfFound,
};
