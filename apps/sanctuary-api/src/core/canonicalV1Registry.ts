import type { CapabilityDescriptor } from '@repo/core/api/capabilityFoundation';
import { attendanceBatchRecordCapability } from '@repo/core/api/attendance-v1.orpc.contract';
import type { AnyRouter } from '@orpc/server';
import { o } from './orpc';
import { attendanceV1Router } from './handlers/attendanceV1';

/**
 * The only composition point for admitted canonical v1 capabilities. A
 * capability remains independently owned by its domain; this registry makes
 * its public admission explicit without changing the native oRPC/v0 surface.
 */
const canonicalV1Registrations = [
  {
    key: 'attendance',
    descriptor: attendanceBatchRecordCapability,
    router: attendanceV1Router,
  },
] as const;

export const canonicalV1Capabilities = canonicalV1Registrations.map(
  ({ descriptor }) => descriptor,
) satisfies readonly CapabilityDescriptor[];

export function assertUniqueCanonicalV1Registrations(
  registrations: readonly { key: string; descriptor: CapabilityDescriptor }[],
): void {
  const keys = new Set<string>();
  const ids = new Set<string>();
  for (const registration of registrations) {
    if (keys.has(registration.key)) {
      throw new Error(`Canonical v1 registration has a duplicate key: ${registration.key}`);
    }
    if (ids.has(registration.descriptor.id)) {
      throw new Error(
        `Canonical v1 registration has a duplicate descriptor id: ${registration.descriptor.id}`,
      );
    }
    keys.add(registration.key);
    ids.add(registration.descriptor.id);
  }
}

assertUniqueCanonicalV1Registrations(canonicalV1Registrations);

export const canonicalV1Router = o.router(
  Object.fromEntries(
    canonicalV1Registrations.map(({ key, router }) => [key, router]),
  ) as Record<string, AnyRouter>,
);
