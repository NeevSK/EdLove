import { createSecureContext, type SecureContextOptions } from 'node:tls';
import { requiresHttps, resolveTlsTerminationMode } from './transportSecurity';

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

export function loadServerTlsOptions(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ProductionTlsOptions | undefined {
  const mode = resolveTlsTerminationMode(environment);
  if (!requiresHttps(environment.NODE_ENV ?? '') || mode === 'render') return undefined;
  return loadProductionTlsOptions(environment.SANCTUARY_TLS_KEY, environment.SANCTUARY_TLS_CERT);
}
