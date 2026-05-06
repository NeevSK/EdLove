/**
 * Web-specific implementation of share
 */
interface NavigatorShare {
  share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
}

export async function shareAction(options: {
  title?: string;
  url: string;
  message?: string;
}): Promise<void> {
  const { title, url, message } = options;

  const nav = navigator as unknown as NavigatorShare;

  if (typeof navigator !== 'undefined' && nav.share) {
    try {
      await nav.share({
        title,
        text: message,
        url,
      });
    } catch {
      // Fail silently
    }
  } else {
    // Fallback to clipboard or other web-specific behavior if needed
    // But for now, just a placeholder.
  }
}
