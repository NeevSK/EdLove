export type PlatformProvisionConfig = {
  environment: string | undefined;
  founderSubjects: string | undefined;
  developerSubjects: string | undefined;
};

export type PlatformCapacity = 'founder' | 'developer';
export type InitialBondAuthority = {
  primaryCapacity: string;
  personalBondCapacity: string;
  platformCapacities: PlatformCapacity[];
};

function subjectSet(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((subject) => subject.trim())
      .filter(Boolean),
  );
}

export function configuredPlatformCapacities(
  authenticatedSubjectId: string,
  config: PlatformProvisionConfig,
): PlatformCapacity[] {
  const capacities: PlatformCapacity[] = [];
  if (subjectSet(config.founderSubjects).has(authenticatedSubjectId)) {
    capacities.push('founder');
  }
  const supportedEnvironment =
    config.environment === 'development' || config.environment === 'production';
  if (supportedEnvironment && subjectSet(config.developerSubjects).has(authenticatedSubjectId)) {
    capacities.push('developer');
  }
  return capacities;
}

export function resolveInitialBondAuthority(
  requestedPrimaryCapacity: string,
  authenticatedSubjectId: string,
  config: PlatformProvisionConfig,
): InitialBondAuthority | null {
  if (['admin', 'founder', 'developer'].includes(requestedPrimaryCapacity)) return null;
  return {
    primaryCapacity: requestedPrimaryCapacity,
    personalBondCapacity: requestedPrimaryCapacity,
    platformCapacities: configuredPlatformCapacities(authenticatedSubjectId, config),
  };
}

function serverEnvironmentValue(key: string): string | undefined {
  const runtimeEnvironment = globalThis as typeof globalThis & {
    ENV?: Record<string, string | undefined>;
  };
  return process.env[key] ?? runtimeEnvironment.ENV?.[key];
}

export function currentPlatformProvisionConfig(): PlatformProvisionConfig {
  return {
    environment: serverEnvironmentValue('NODE_ENV'),
    founderSubjects: serverEnvironmentValue('SANCTUARY_PLATFORM_FOUNDER_SUBJECTS'),
    developerSubjects: serverEnvironmentValue('SANCTUARY_PLATFORM_DEVELOPER_SUBJECTS'),
  };
}
