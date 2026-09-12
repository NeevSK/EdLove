export function isNetworkOrOfflineError(error: unknown): boolean {
  if (!error) return false;
  const message = getErrorMessageString(error).toLowerCase();

  return (
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('internet') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('enotfound') ||
    message.includes('abort') ||
    ((error as any)?.name === 'TypeError' && message.includes('fetch'))
  );
}

export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;
  const message = getErrorMessageString(error).toLowerCase();
  const status = (error as any)?.status || (error as any)?.statusCode;
  return status === 429 || message.includes('too many requests') || message.includes('rate limit');
}

export function isAnonymousAuthDisabledError(error: unknown): boolean {
  if (!error) return false;
  const message = getErrorMessageString(error).toLowerCase();
  return (
    message.includes('anonymous_provider_disabled') ||
    message.includes('anonymous sign-in is disabled') ||
    message.includes('provider is disabled')
  );
}

export function isServerError(error: unknown): boolean {
  if (!error) return false;
  const message = getErrorMessageString(error).toLowerCase();
  const status = (error as any)?.status || (error as any)?.statusCode;
  return (
    (typeof status === 'number' && status >= 500 && status < 600) ||
    message.includes('internal server error') ||
    message.includes('bad gateway') ||
    message.includes('service unavailable')
  );
}

function getErrorMessageString(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof (error as any)?.message === 'string') return (error as any).message;
  if (typeof (error as any)?.error_description === 'string') return (error as any).error_description;
  return '';
}

export interface GuestEntryErrorMessages {
  offline?: string;
  rateLimit?: string;
  anonymousDisabled?: string;
  serverError?: string;
  fallback?: string;
}

export function getGuestEntryErrorMessage(
  error: unknown,
  fallbackMessage: string,
  offlineFallbackMessage?: string,
  options?: GuestEntryErrorMessages,
): string {
  if (isNetworkOrOfflineError(error)) {
    return (
      options?.offline ||
      offlineFallbackMessage ||
      'You appear to be offline. Please check your internet connection and try again.'
    );
  }

  if (isRateLimitError(error)) {
    return (
      options?.rateLimit ||
      'Too many attempts right now. Please wait a moment before trying again.'
    );
  }

  if (isAnonymousAuthDisabledError(error)) {
    return (
      options?.anonymousDisabled ||
      'Guest access is currently unavailable. Please sign in with an account.'
    );
  }

  if (isServerError(error)) {
    return (
      options?.serverError ||
      'The sanctuary is experiencing temporary maintenance. Please try again shortly.'
    );
  }

  const rawMsg = getErrorMessageString(error).trim();
  if (rawMsg && !rawMsg.toLowerCase().includes('unknown error')) {
    return rawMsg;
  }

  return options?.fallback || fallbackMessage;
}


