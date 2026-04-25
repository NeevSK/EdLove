/**
 * Web shim for expo-image-picker
 */
export const MediaTypeOptions = {
  All: 'All',
  Images: 'Images',
  Videos: 'Videos',
};

export async function requestCameraPermissionsAsync() {
  return { status: 'granted' };
}

export async function requestMediaLibraryPermissionsAsync() {
  return { status: 'granted' };
}

export async function launchImageLibraryAsync(_options) {
  return { canceled: true, assets: null };
}

export async function launchCameraAsync(_options) {
  return { canceled: true, assets: null };
}

export default {
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
};
