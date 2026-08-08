/**
 * The marketing site does not perform client-side authorization checks.
 * Keep the optional Cedar WASM import out of its browser bundle and fail closed
 * if an authorization-only module is accidentally reached from this surface.
 */
export async function evaluate(): Promise<never> {
  throw new Error('Cedar authorization is not available in the marketing site.');
}
