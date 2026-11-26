/**
 * The API whose health the status page shows. The build sets it (`PUBLIC_SANCTUARY_API_ORIGIN`);
 * the content policy lets the status page reach exactly this origin.
 */
export const DEFAULT_STATUS_API = 'https://sanctuary-api-tpj7.onrender.com';

export function statusApiOrigin(configured: string | undefined): string {
  return new URL(configured?.trim() || DEFAULT_STATUS_API).origin;
}
