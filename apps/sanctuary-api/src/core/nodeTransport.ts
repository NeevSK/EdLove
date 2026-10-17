import { createSecureContext, type SecureContextOptions } from 'node:tls';

export type ProductionTlsOptions = Pick<SecureContextOptions, 'key' | 'cert' | 'minVersion'> & {
  key: string;
  cert: string;
  minVersion: 'TLSv1.2';
};

export function loadProductionTlsOptions(
  key: string | undefined,
  cert: string | undefined,
): ProductionTlsOptions {
  if (!key || !cert) {
    throw new Error('Production HTTPS requires SANCTUARY_TLS_KEY and SANCTUARY_TLS_CERT.');
  }

  const options: ProductionTlsOptions = { key, cert, minVersion: 'TLSv1.2' };
  try {
    createSecureContext(options);
  } catch {
    throw new Error('Production HTTPS certificate configuration is invalid.');
  }
  return options;
}
