/**
 * Web-specific implementation of share
 */
export async function shareAction(options: {
  title?: string;
  url: string;
  message?: string;
}): Promise<void> {
  const { title, url, message } = options;

  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({
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
