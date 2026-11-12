import { persistStorage } from '@repo/core/effect/bindings/state';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ConsentState {
  hasDecidedConsent: boolean;
  analyticsConsentGranted: boolean;
  grantConsent: () => void;
  denyConsent: () => void;
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      hasDecidedConsent: false,
      analyticsConsentGranted: false,
      grantConsent: () => set({ hasDecidedConsent: true, analyticsConsentGranted: true }),
      denyConsent: () => set({ hasDecidedConsent: true, analyticsConsentGranted: false }),
    }),
    {
      name: 'gurudevi-pdpa-consent-storage',
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({
        hasDecidedConsent: state.hasDecidedConsent,
        analyticsConsentGranted: state.analyticsConsentGranted,
      }),
    },
  ),
);
