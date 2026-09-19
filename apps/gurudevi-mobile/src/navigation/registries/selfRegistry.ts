import {
  resolveSelfFeatureManifest,
  type SelfFeatureManifestItem,
} from '@repo/self/features/featureManifest';
import { DEFAULT_SELF_PREFERENCES } from '@repo/self/features/userPreferences';
import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';
import {
  BarChart3,
  Brain,
  Compass,
  FileText,
  Heart,
  HeartPulse,
  Layers,
  Moon,
  Sparkles,
  Sun,
  Wind,
} from '@repo/ui/icons';
import type { MobileDomainRegistry, MobileFeatureItem } from './types';

/** Native navigation adapts the canonical Self manifest to Expo routes. */
function resolveFeatureIcon(feature: SelfFeatureManifestItem) {
  const id = feature.id.toLowerCase();
  if (id.includes('mood') || id.includes('heart')) return Heart;
  if (id.includes('breath') || id.includes('wind')) return Wind;
  if (id.includes('rhythm') || id.includes('flow') || id.includes('journey')) return Compass;
  if (id.includes('voice') || id.includes('journal') || id.includes('fire')) return FileText;
  if (id.includes('decision') || id.includes('architect')) return Layers;
  if (id.includes('wisdom') || id.includes('seed')) return Sparkles;
  if (id.includes('joy') || id.includes('sun') || id.includes('win')) return Sun;
  if (id.includes('sleep') || id.includes('night') || id.includes('prep')) return Moon;
  if (id.includes('reframe') || id.includes('mind') || id.includes('cognitive')) return Brain;
  if (id.includes('pulse') || id.includes('forecast') || id.includes('energy')) return HeartPulse;
  if (id.includes('stat') || id.includes('analytics')) return BarChart3;

  switch (feature.category) {
    case 'wellbeing':
      return Heart;
    case 'practice':
      return Compass;
    case 'growth':
      return Sparkles;
    case 'professional':
      return Layers;
    case 'identity':
      return Compass;
  }
}

function normalizeRole(capacity?: string | null): SelfViewRole {
  const normalized = capacity?.toLowerCase();
  if (normalized === 'teacher') return 'teacher';
  if (normalized === 'student') return 'student';
  if (normalized === 'guardian' || normalized === 'parent') return 'guardian';
  if (
    normalized === 'principal' ||
    normalized === 'assistantprincipal' ||
    normalized === 'admin' ||
    normalized === 'gradehead' ||
    normalized === 'sectionhead'
  ) {
    return normalized === 'admin' ? 'admin' : 'principal';
  }
  if (normalized === 'founder' || normalized === 'developer') return 'founder';
  return 'teacher';
}

const copyForRole: Readonly<
  Record<SelfViewRole, Pick<MobileDomainRegistry, 'title' | 'subtitle' | 'roleBadge'>>
> = {
  admin: {
    title: 'Personal Sanctuary',
    subtitle: 'Mindfulness, growth and daily reflections',
    roleBadge: 'Admin',
  },
  founder: {
    title: "Founder's Vision Lab",
    subtitle: 'Architectural discernment and creative sanctuary',
    roleBadge: 'Founder',
  },
  principal: {
    title: "Principal's Inner Sanctuary",
    subtitle: 'Executive discernment, composure and tenets',
    roleBadge: 'Leadership',
  },
  teacher: {
    title: "Teacher's Sadhana",
    subtitle: 'Working rhythm, energy balance and decompression',
    roleBadge: 'Teacher',
  },
  guardian: {
    title: 'Guardian Sanctuary',
    subtitle: 'Family presence, grounding and mindful pause',
    roleBadge: 'Guardian',
  },
  student: {
    title: 'Mastery & Inner Pulse',
    subtitle: 'Study flow, emotional calm and self-growth',
    roleBadge: 'Student',
  },
};

function orderForRole(features: readonly SelfFeatureManifestItem[], role: SelfViewRole) {
  return [...features].sort((left, right) => {
    const rightWeight = right.roleWeights?.[role] ?? (right.roleWeights ? 0 : 50);
    const leftWeight = left.roleWeights?.[role] ?? (left.roleWeights ? 0 : 50);
    return rightWeight - leftWeight || left.defaultOrder - right.defaultOrder;
  });
}

/**
 * The Overview is the Self floor, not a registry item. Every returned item is
 * a real native-delivered feature with the canonical feature id as its task id.
 */
export function getSelfRegistry(capacity?: string | null): MobileDomainRegistry {
  const role = normalizeRole(capacity);
  const manifest = resolveSelfFeatureManifest(null, DEFAULT_SELF_PREFERENCES.features, 'native');
  const items: MobileFeatureItem[] = orderForRole(
    manifest.all.filter((feature) => feature.delivery === 'runnable'),
    role,
  ).map((feature) => ({
    id: feature.id,
    title: feature.label,
    description: `${feature.category} · ${feature.domain}`,
    route: '/self',
    params: { feature: feature.id },
    icon: resolveFeatureIcon(feature),
    badge: feature.emoji,
    category: feature.category,
  }));

  return { domain: 'self', ...copyForRole[role], items };
}
