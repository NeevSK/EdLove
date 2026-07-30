import { create } from 'zustand';

interface ConsentState {
  hasDecidedConsent: boolean;
  analyticsConsentGranted: boolean;
  grantConsent: () => void;
  denyConsent: () => void;
}

export const useConsentStore = create<ConsentState>((set) => ({
  hasDecidedConsent: false,
  analyticsConsentGranted: false,
  grantConsent: () => set({ hasDecidedConsent: true, analyticsConsentGranted: true }),
  denyConsent: () => set({ hasDecidedConsent: true, analyticsConsentGranted: false }),
}));
