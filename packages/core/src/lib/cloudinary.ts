/**
 * Cloudinary Integration Utility
 * Handles asset uploads to Cloudinary with auto-transcoding support via presets.
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Upload a file to Cloudinary
 * @param fileUri Local file URI from image picker or filesystem
 * @param resourceType 'image' | 'video' | 'auto'
 * @returns Promise<string> The secure URL of the uploaded asset
 */
export async function uploadToCloudinary(
  fileUri: string,
  resourceType: 'image' | 'video' | 'auto' = 'image',
): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'neevsk';
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'gurudevi_unsigned';

  if (!fileUri) {
    throw new Error('No file URI provided for upload');
  }

  const formData = new FormData();

  // Create the file object for FormData
  // In React Native/Expo, this is the standard way to handle file uploads via fetch
  const filename = fileUri.split('/').pop() || 'upload';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `${resourceType}/${match[1]}` : resourceType;

  if (
    fileUri.startsWith('data:') ||
    fileUri.startsWith('http://') ||
    fileUri.startsWith('https://')
  ) {
    formData.append('file', fileUri);
  } else {
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: type,
    } as any);
  }

  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (__DEV__) {
        console.error('\uD83D\uDCE6 Cloudinary Upload Error Details:', errorData);
      }
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data: CloudinaryUploadResponse = await response.json();
    if (__DEV__) {
      console.log(`\u2705 Asset uploaded successfully to Cloudinary: ${data.secure_url}`);
    }
    return data.secure_url;
  } catch (error) {
    if (__DEV__) {
      console.error('\uD83D\uDCE6 Cloudinary Upload Exception:', error);
    }
    throw error;
  }
}
