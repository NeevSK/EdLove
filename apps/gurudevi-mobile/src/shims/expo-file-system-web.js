/**
 * Web shim for expo-file-system (Modern API).
 *
 * expo-file-system is a native-only module with no web implementation.
 * This shim provides no-op stubs for the modern object-based API (File, Directory, Paths)
 * introduced in SDK 54 and stable in SDK 57.
 *
 * The shim ensures that:
 * 1. Metro can resolve imports without crashing the web build
 * 2. Code using the modern API compiles and runs gracefully on web (operations are no-ops)
 * 3. Type safety is maintained with class-based stubs
 *
 * Legacy API compatibility is also provided for gradual migration.
 */

// Modern API - Paths
const Paths = {
  get cache() {
    return 'file:///cache/';
  },
  get document() {
    return 'file:///documents/';
  },
  get bundle() {
    return 'file:///bundle/';
  },
};

// Modern API - File class
class File {
  constructor(...pathSegments) {
    this.uri = pathSegments.filter(Boolean).join('/');
    this.exists = false;
    this.size = 0;
    this.modificationTime = 0;
    this.type = 'file';
  }

  // Async methods
  async text() {
    return '';
  }

  async bytes() {
    return new Uint8Array(0);
  }

  async base64() {
    return '';
  }

  async write(content) {
    // No-op on web
  }

  async delete() {
    // No-op on web
  }

  async copy(destination) {
    // No-op on web
  }

  async move(destination) {
    // No-op on web
  }

  // Sync methods
  textSync() {
    return '';
  }

  bytesSync() {
    return new Uint8Array(0);
  }

  base64Sync() {
    return '';
  }

  writeSync(content) {
    // No-op on web
  }

  deleteSync() {
    // No-op on web
  }

  copySync(destination) {
    // No-op on web
  }

  moveSync(destination) {
    // No-op on web
  }

  // Blob interface
  async arrayBuffer() {
    return new ArrayBuffer(0);
  }

  get [Symbol.toStringTag]() {
    return 'File';
  }
}

// Modern API - Directory class
class Directory {
  constructor(...pathSegments) {
    this.uri = pathSegments.filter(Boolean).join('/');
    this.exists = false;
    this.type = 'directory';
  }

  async create() {
    // No-op on web
  }

  async delete() {
    // No-op on web
  }

  async copy(destination) {
    // No-op on web
  }

  async move(destination) {
    // No-op on web
  }

  async read() {
    return [];
  }

  createSync() {
    // No-op on web
  }

  deleteSync() {
    // No-op on web
  }

  copySync(destination) {
    // No-op on web
  }

  moveSync(destination) {
    // No-op on web
  }

  readSync() {
    return [];
  }
}

// Legacy API compatibility (for gradual migration)
const LegacyFileSystem = {
  cacheDirectory: null,
  documentDirectory: null,
  bundleDirectory: null,
  bundledAssets: null,

  getInfoAsync: async () => ({
    exists: false,
    isDirectory: false,
    uri: '',
    size: 0,
    modificationTime: 0,
  }),
  readAsStringAsync: async () => '',
  writeAsStringAsync: async () => {},
  deleteAsync: async () => {},
  moveAsync: async () => {},
  copyAsync: async () => {},
  makeDirectoryAsync: async () => {},
  readDirectoryAsync: async () => [],
  createDownloadResumable: () => ({
    downloadAsync: async () => null,
    pauseAsync: async () => null,
    resumeAsync: async () => null,
    savable: () => null,
  }),
  downloadAsync: async () => null,
  uploadAsync: async () => null,
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
  FileSystemSessionType: { BACKGROUND: 'background', FOREGROUND: 'foreground' },
  FileSystemUploadType: { BINARY_DATA: 'binaryData', MULTIPART: 'multipart' },
};

module.exports = {
  // Modern API exports
  File,
  Directory,
  Paths,
  // Legacy API for backward compatibility
  default: LegacyFileSystem,
  // Named legacy exports
  ...LegacyFileSystem,
};
