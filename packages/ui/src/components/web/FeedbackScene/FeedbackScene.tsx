'use client';

import { useId } from 'react';
import type { FeedbackSceneContract } from '../../../theme/contracts';
import { FEEDBACK_SCENE_GEOMETRY as geometry, feedbackScene } from '../../shared/feedbackScene';
import { Perch } from '../Perch/Perch';

/** Existing static Tutii fallback over the world's perch; the adjacent state supplies the words. */
export interface FeedbackSceneProps extends FeedbackSceneContract {}

export function FeedbackScene({ state, size = geometry.defaultSize }: FeedbackSceneProps) {
  const id = useId();
  const presentation = feedbackScene(state);
  const mascot = `var(--w-${presentation.mascotInk === 'inkFaint' ? 'ink-faint' : presentation.mascotInk})`;
  const path = `var(--w-${presentation.pathInk === 'inkFaint' ? 'ink-faint' : presentation.pathInk})`;
  return (
    <div
      className="gd-feedback-scene"
      data-feedback-state={state}
      aria-hidden="true"
      style={{ width: size, height: size * (164 / 220) }}
    >
      <Perch />
      <svg className="gd-feedback-path" viewBox="0 0 220 164" aria-hidden="true" focusable="false">
        <path
          d="M 20 119 C 56 95, 80 147, 115 112 S 166 87, 202 113"
          fill="none"
          stroke={path}
          strokeDasharray="2 12"
          strokeLinecap="round"
          strokeOpacity={presentation.outerOpacity}
          strokeWidth="5"
        />
        <circle cx="194" cy="111" r="5" fill={path} opacity={presentation.outerOpacity} />
      </svg>
      <svg
        className="gd-feedback-mascot"
        viewBox={geometry.viewBox}
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
            {geometry.haloStops.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={mascot}
                stopOpacity={stop.opacity}
              />
            ))}
          </radialGradient>
          <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
            {geometry.coreStops.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.offset === 0 ? 'var(--w-raised)' : mascot}
                stopOpacity={stop.opacity}
              />
            ))}
          </radialGradient>
        </defs>
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r={geometry.haloRadius}
          fill={`url(#${id}-halo)`}
        />
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r={geometry.coreRadius}
          fill={`url(#${id}-core)`}
        />
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r={geometry.outerRadius}
          fill={mascot}
          opacity={presentation.outerOpacity}
        />
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r={geometry.innerRadius}
          fill="var(--w-raised)"
          opacity={geometry.innerOpacity}
        />
      </svg>
    </div>
  );
}
