import { getDomainEntry } from '@/logic/registry/appCatalog';
import { resolveFeatureFlagValue } from '@/logic/registry/featureLifecycleManifest';
import { useFeatureStore } from '@/store/useFeatureStore';

/** Resolve a domain rollout through the AppCatalog-owned flag mapping. */
export function useDomainRollout(domainId: string): boolean {
  const flagSnapshot = useFeatureStore((state) => state.flags);
  const entry = getDomainEntry(domainId);

  if (!entry.flagKey) return true;
  return resolveFeatureFlagValue(flagSnapshot, entry.flagKey);
}
