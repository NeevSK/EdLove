/**
 * @repo/ui/icons
 *
 * Centralized Icon Bridge for the Polymath Platform.
 * By re-exporting through this bridge, we ensure that:
 * 1. Packages do not have direct dependencies on 'lucide-react-native' (Mitigating Native Pollution).
 * 2. We can swap icon sets or inject platform-specific overrides in one place.
 * 3. The hardened <Icon /> primitive has a stable companion for its 'as' prop.
 */

export * from 'lucide-react-native';
