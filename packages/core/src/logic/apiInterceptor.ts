import { captureException } from '@repo/core/monitoring';
import { useStore } from '@repo/core/store/useStore';
import { APIError } from '@repo/core/types/API';

/**
 * Global API Interceptor & Error Handler (Layer 1)
 * Wraps promise-based calls to provide consistent error reporting and user feedback.
 */

export interface SanctuaryAPIError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Maps technical error codes/messages to teacher-friendly Sanctuary messages.
 */
function mapErrorToMessage(error: any): string {
  const message = error?.message || '';
  const code = error?.code || '';

  // Network Errors
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'The connection to the Sanctuary was lost. Please check your internet.';
  }

  // Auth Errors
  if (code === 'PGRST116' || message.includes('JWT')) {
    return 'Your session has reached a peaceful end. Please sign in again.';
  }
  if (message.includes('Invalid login credentials')) {
    return "Those credentials don't seem to match our scrolls. Please try again.";
  }

  // PostgREST / Database Errors
  if (code === '23505') return 'This record already exists in our archives.';
  if (code === '23503') return 'This action is restricted by existing relations.';
  if (code === '42P01') return "We couldn't find the requested section in our database.";
  if (code === '42501') return "Huh! You are a newbie aren't you?";

  // Environment / Bootstrap Errors
  if (message.includes('HMRClient')) {
    return ''; // Silence these environment-level bootstrap errors
  }

  // Default Fallback
  if (message.length > 0 && !message.includes('PostgreSQL')) {
    return message; // Keep custom messages if they aren't robotic DB notes
  }

  return 'A peaceful moment was interrupted. Please try again.';
}

/**
 * Handles errors from Supabase or other API calls
 * Logs to console (and Sentry in production) and shows a friendly toast.
 */
export function handleAPIError(error: any, silent = false) {
  const apiError: SanctuaryAPIError = {
    message: mapErrorToMessage(error),
    code: error?.code,
    status: error?.status,
  };

  if (__DEV__) {
    console.error('\uD83D\uDED1 API Error Intercepted:', error); // Log original for debugging
    console.log('\u2728 Friendly Message:', apiError.message);
  }

  if (!(error instanceof APIError && error.reportedToTelemetry)) {
    captureException(error, {
      boundary: 'api-interceptor',
      code: apiError.code,
      status: apiError.status,
      userMessage: apiError.message,
    });
  }

  if (!silent && apiError.message) {
    useStore.getState().showToast(apiError.message, 'error');
  }

  return apiError;
}

/**
 * Wrapper for async operations to provide automatic error handling
 */
export async function withErrorHandling<T>(
  promise: Promise<T>,
  options: { silent?: boolean; toastMessage?: string } = {},
): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    handleAPIError(error, options.silent);
    return null;
  }
}
