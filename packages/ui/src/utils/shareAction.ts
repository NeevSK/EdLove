import { Share } from 'react-native';

/**
 * Native-specific share implementation
 */
export async function shareAction(options: {
  title?: string;
  url: string;
  message?: string;
}): Promise<void> {
  const { title, url, message } = options;
  try {
    await Share.share({
      title,
      message: message ? `${message} ${url}` : url,
    });
  } catch {
    // Fail silently
  }
}
