/**
 * A queued mutation is an intent to save, not proof that the server accepted it.
 * Keep that distinction at the Profile boundary so callers cannot accidentally
 * show confirmation feedback for an offline write.
 */
export type ProfileFieldUpdateResult =
  | { status: 'confirmed' }
  | { status: 'queued'; error: string }
  | { status: 'failed'; error: string };

export function isConfirmedProfileFieldUpdate(
  result: ProfileFieldUpdateResult,
): result is Extract<ProfileFieldUpdateResult, { status: 'confirmed' }> {
  return result.status === 'confirmed';
}
