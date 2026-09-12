import type { MascotArtworkSource, MascotState } from '@repo/ui';
import comingSoonArtwork from '../../assets/mascot/firefly-guide-coming-soon-light-cutout-v2.webp';
import comingSoonSceneArtwork from '../../assets/mascot/firefly-guide-coming-soon-light-v2.png';
import emptyArtwork from '../../assets/mascot/firefly-guide-empty-light-cutout-v2.webp';
import emptySceneArtwork from '../../assets/mascot/firefly-guide-empty-light-scene.webp';
import errorArtwork from '../../assets/mascot/firefly-guide-error-light-cutout-v2.webp';
import errorSceneArtwork from '../../assets/mascot/firefly-guide-error-light-scene.webp';
import exploreArtwork from '../../assets/mascot/firefly-guide-explore-light-cutout-v2.webp';
import exploreSceneArtwork from '../../assets/mascot/firefly-guide-explore-light-v2.png';
import offlineArtwork from '../../assets/mascot/firefly-guide-offline-light-cutout-v2.webp';
import offlineSceneArtwork from '../../assets/mascot/firefly-guide-offline-light-scene.webp';
import onboardingArtwork from '../../assets/mascot/firefly-guide-onboarding-light-cutout-v2.webp';
import onboardingSceneArtwork from '../../assets/mascot/firefly-guide-onboarding-light-v2.png';
import proArtwork from '../../assets/mascot/firefly-guide-pro-light-cutout-v2.webp';
import proSceneArtwork from '../../assets/mascot/firefly-guide-pro-light-v2.png';
import welcomeArtwork from '../../assets/mascot/firefly-guide-welcome-light-cutout-v2.webp';
import welcomeSceneArtwork from '../../assets/mascot/firefly-guide-welcome-light-scene.webp';
import guideArtwork from '../../assets/mascot/Gemini_Generated_Image_ezd4cqezd4cqezd4.webp';
import cleanExploreArtwork from '../../assets/mascot/firefly-guide-explore-light-cutout-clean-v1.png';

/** The supplied Gemini artwork remains the guide fallback for unassigned states. */
export const fireflyGuideArtwork: MascotArtworkSource = {
  source: guideArtwork,
  accessibilityLabel: 'Gurudevi firefly guide with a welcoming gesture',
};

export const fireflyArtworkByState = {
  guiding: {
    source: welcomeArtwork,
    accessibilityLabel: 'Gurudevi firefly opening the sanctuary',
  },
  curious: {
    source: emptyArtwork,
    accessibilityLabel: 'Gurudevi firefly tending an unopened lotus',
  },
  resting: {
    source: offlineArtwork,
    accessibilityLabel: 'Gurudevi firefly resting beside a lotus lantern',
  },
  interrupted: {
    source: errorArtwork,
    accessibilityLabel: 'Gurudevi firefly pausing at an interrupted path',
  },
  complete: {
    source: welcomeArtwork,
    accessibilityLabel: 'Gurudevi firefly celebrating a completed journey',
  },
} satisfies Partial<Record<MascotState, MascotArtworkSource>>;

/** Role-specific art is opt-in until the corresponding role sheet exists. */
export const fireflyArtworkByRole = {
  guide: fireflyGuideArtwork,
} as const;

export const fireflyProductArtwork = {
  comingSoon: {
    source: comingSoonArtwork,
    accessibilityLabel: 'Gurudevi firefly tending a lotus that is not yet open',
  },
  pro: {
    source: proArtwork,
    accessibilityLabel: 'Gurudevi firefly opening a deeper sanctuary doorway',
  },
  onboarding: {
    source: onboardingArtwork,
    accessibilityLabel: 'Gurudevi firefly welcoming the learner onto a new path',
  },
  explore: {
    source: exploreArtwork,
    accessibilityLabel: 'Gurudevi firefly following a trail of light through lotus leaves',
  },
} satisfies Record<'comingSoon' | 'pro' | 'onboarding' | 'explore', MascotArtworkSource>;

export const fireflyPrototypeArtwork: MascotArtworkSource = {
  source: cleanExploreArtwork,
  accessibilityLabel: 'Gurudevi firefly guiding the learner with a living light',
};


export const fireflyProductSceneArtwork = {
  comingSoon: {
    source: comingSoonSceneArtwork,
    accessibilityLabel: 'Gurudevi firefly beside a lotus that is not yet open',
  },
  pro: {
    source: proSceneArtwork,
    accessibilityLabel: 'Gurudevi firefly opening a deeper sanctuary doorway',
  },
  onboarding: {
    source: onboardingSceneArtwork,
    accessibilityLabel: 'Gurudevi firefly welcoming the learner onto a new path',
  },
  explore: {
    source: exploreSceneArtwork,
    accessibilityLabel: 'Gurudevi firefly following a trail of light through lotus leaves',
  },
  welcome: {
    source: welcomeSceneArtwork,
    accessibilityLabel: 'Gurudevi firefly opening the sanctuary',
  },
  empty: {
    source: emptySceneArtwork,
    accessibilityLabel: 'Gurudevi firefly tending an unopened lotus',
  },
  error: {
    source: errorSceneArtwork,
    accessibilityLabel: 'Gurudevi firefly pausing at an interrupted path',
  },
  offline: {
    source: offlineSceneArtwork,
    accessibilityLabel: 'Gurudevi firefly resting beside a lotus lantern',
  },
} satisfies Record<
  'comingSoon' | 'pro' | 'onboarding' | 'explore' | 'welcome' | 'empty' | 'error' | 'offline',
  MascotArtworkSource
>;
