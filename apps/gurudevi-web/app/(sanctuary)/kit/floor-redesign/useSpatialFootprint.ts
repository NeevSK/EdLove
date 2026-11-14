import { useState, useEffect, useRef, type RefObject } from 'react';

export interface SpatialFootprint {
  width: number;
  height: number;
  area: number;
  aspectRatio: string;
  viewportWidth: number;
  viewportHeight: number;
  viewportArea: number;
  vsr: number; // Viewport Surface Ratio percentage (0 - 100%)
  gear: 'G3-Full' | 'G2-Medium' | 'G1-Compact' | 'G0-Nano';
  isBulky: boolean;
}

/**
 * Intelligent self-measuring hook that continuously monitors an element's
 * geometry, aspect ratio, and Viewport Surface Ratio (VSR).
 */
export function useSpatialFootprint(ref: RefObject<HTMLElement | null>): SpatialFootprint {
  const [footprint, setFootprint] = useState<SpatialFootprint>({
    width: 0,
    height: 0,
    area: 0,
    aspectRatio: '1.00:1',
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    viewportArea: 1920 * 1080,
    vsr: 0,
    gear: 'G3-Full',
    isBulky: false,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const compArea = Math.round(rect.width * rect.height);
      const vpArea = Math.round(vw * vh);
      const vsrVal = vpArea > 0 ? (compArea / vpArea) * 100 : 0;
      const aspectVal = rect.height > 0 ? (rect.width / rect.height).toFixed(2) : '1.00';

      // Automatic discrete gear classification
      let calculatedGear: SpatialFootprint['gear'] = 'G3-Full';
      if (rect.width < 320) calculatedGear = 'G0-Nano';
      else if (rect.width < 380) calculatedGear = 'G1-Compact';
      else if (rect.width < 520) calculatedGear = 'G2-Medium';

      setFootprint({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        area: compArea,
        aspectRatio: `${aspectVal}:1`,
        viewportWidth: vw,
        viewportHeight: vh,
        viewportArea: vpArea,
        vsr: Number(vsrVal.toFixed(2)),
        gear: calculatedGear,
        isBulky: vsrVal > 2.5,
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return footprint;
}

