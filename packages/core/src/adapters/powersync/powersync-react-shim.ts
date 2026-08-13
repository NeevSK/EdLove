/**
 * Compatibility barrel for older @repo/core imports.
 * The implementation now comes from the official PowerSync React v2 hooks;
 * keeping this path avoids a broad import migration across the app surface.
 */
export { PowerSyncContext, useQuery, useStatus } from '@powersync/react';
