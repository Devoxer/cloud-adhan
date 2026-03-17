// Eagerly define globals that Expo SDK 55 installs as lazy getters.
// The lazy getters use dynamic require() which Jest blocks when triggered
// outside normal test execution. By defining these eagerly, the lazy
// getters are never installed.

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val))
}

if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
  globalThis.__ExpoImportMetaRegistry = { register: () => {} }
}
