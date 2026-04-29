import type { ImpactRipple } from '@repo/core';
import { impactRipplesAPI } from '@repo/core';
import { warmMirrorAPI } from '@repo/core/api';

import { useEffect, useState } from 'react';

export interface WellbeingEnrichment {
  warmMirrorText: string | null;
  ripples: ImpactRipple[];
}

/** Milliseconds to wait before marking delivered ripples as read. */
const RIPPLE_DELIVERY_DELAY_MS = 3000;

/**
 * useWellbeingEnrichment
 *
 * Logic kernel for fetching the 'Warm Mirror' narrative and pending 'Impact Ripples'.
 * Marks ripples as delivered automatically after a short delay.
 */
export function useWellbeingEnrichment(userId: string | null | undefined): WellbeingEnrichment {
  const [warmMirrorText, setWarmMirrorText] = useState<string | null>(null);
  const [ripples, setRipples] = useState<ImpactRipple[]>([]);

  useEffect(() => {
    if (!userId) return;
    warmMirrorAPI
      .getDataPoints(userId)
      .then((data) => setWarmMirrorText(warmMirrorAPI.generateNarrativeEn(data)))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let deliveryTimer: any;

    impactRipplesAPI
      .getPendingRipples(userId)
      .then((pending) => {
        if (!pending.length) return;
        setRipples(pending);
        deliveryTimer = setTimeout(() => {
          pending.forEach(
            (r) =>
              void impactRipplesAPI
                .markDelivered(r.id)
                .catch((err) =>
                  console.warn('[useWellbeingEnrichment] markDelivered failed:', err),
                ),
          );
        }, RIPPLE_DELIVERY_DELAY_MS);
      })
      .catch(() => {});

    return () => {
      if (deliveryTimer) clearTimeout(deliveryTimer);
    };
  }, [userId]);

  return { warmMirrorText, ripples };
}
