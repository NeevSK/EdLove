import { FEATURE_CATALOG, type SelfFeatureDefinition } from '@repo/self/features/featureCatalog';
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

function resolveFeatureIcon(f: SelfFeatureDefinition) {
  const id = f.id.toLowerCase();
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

  switch (f.category) {
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
    default:
      return Sparkles;
  }
}

function normalizeRole(capacity?: string | null): SelfViewRole {
  const cap = (capacity || '').toLowerCase();
  if (cap === 'teacher') return 'teacher';
  if (cap === 'student') return 'student';
  if (cap === 'guardian' || cap === 'parent') return 'guardian';
  if (
    cap === 'principal' ||
    cap === 'assistantprincipal' ||
    cap === 'admin' ||
    cap === 'gradehead' ||
    cap === 'sectionhead'
  ) {
    return 'principal';
  }
  if (cap === 'founder' || cap === 'developer') return 'founder';
  return 'teacher';
}

export function getSelfRegistry(capacity?: string | null): MobileDomainRegistry {
  const role = normalizeRole(capacity);

  // Role-tailored Domain Titles
  let title = 'Personal Sanctuary';
  let subtitle = 'Mindfulness, Growth & Daily Reflections';
  let roleBadge: string | undefined = undefined;

  if (role === 'teacher') {
    title = "Teacher's Sadhana";
    subtitle = 'Working Rhythm, Energy Balance & Decompression';
    roleBadge = 'Teacher';
  } else if (role === 'student') {
    title = 'Mastery & Inner Pulse';
    subtitle = 'Study Flow, Emotional Calm & Self-Growth';
    roleBadge = 'Student';
  } else if (role === 'guardian') {
    title = 'Guardian Sanctuary';
    subtitle = 'Family Presence, Grounding & Mindful Pause';
    roleBadge = 'Guardian';
  } else if (role === 'principal') {
    title = "Principal's Inner Sanctuary";
    subtitle = 'Executive Discernment, Composure & Tenets';
    roleBadge = 'Leadership';
  } else if (role === 'founder') {
    title = "Founder's Vision Lab";
    subtitle = 'Architectural Discernment & Creative Sanctuary';
    roleBadge = 'Founder';
  }

  // 1. Root Overview Hub item (Always anchor 0)
  const overviewItem: MobileFeatureItem = {
    id: 'self-overview',
    title: 'Overview',
    description: 'Sanctuary Overview Hub, Daily Pulse & Pinned Shortcuts',
    route: '/self',
    icon: Sparkles,
    badge: 'Hub',
    category: 'identity',
    defaultSubTab: true,
  };

  // 2. Canonical features from FEATURE_CATALOG sorted by role affinity
  const catalogList = Object.values(FEATURE_CATALOG);

  const weightedFeatures = catalogList
    .map((f) => {
      const weight = f.roleWeights?.[role] ?? (f.roleWeights ? 30 : 50);
      return { def: f, weight };
    })
    .filter((item) => item.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const featureItems: MobileFeatureItem[] = weightedFeatures.map(({ def }) => ({
    id: def.id,
    title: def.label,
    description: `${def.emoji} ${def.category.toUpperCase()} · ${def.domain}`,
    route: '/self',
    params: { feature: def.id },
    icon: resolveFeatureIcon(def),
    badge: def.emoji,
    category: def.category,
    defaultSubTab: false,
  }));

  return {
    domain: 'self',
    title,
    subtitle,
    roleBadge,
    items: [overviewItem, ...featureItems],
  };
}
