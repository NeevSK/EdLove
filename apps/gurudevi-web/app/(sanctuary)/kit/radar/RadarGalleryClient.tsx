'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Radar, Text } from '@repo/ui/components/web';
import type { RadarObservation, RadarState } from '@repo/ui/theme/contracts';
import { WORLD_IDS, type WorldId, type WorldMode } from '@repo/ui/theme';
import { WorldScope } from '@repo/ui/theme/web';
import styles from './radar-gallery.module.css';

type Example = 'a' | 'b';
type Perspective = 'self' | 'observer';
type ExampleState = RadarState['kind'] | 'partial' | 'historical';

function example(measure: Example, perspective: Perspective): RadarObservation {
  const max = measure === 'a' ? 100 : 5;
  return {
    subject: { id: 'synthetic-person', label: 'Example person' },
    measure: {
      id: `example-${measure}`,
      label: `Example measure ${measure.toUpperCase()}`,
      version: 'demo-1',
    },
    perspective: {
      id: `example-${perspective}`,
      label: perspective === 'self' ? 'Own observation' : 'Example observer',
      kind: perspective,
    },
    sourceLabel: 'Synthetic development fixture',
    observedAt: '2026-11-11',
    synthetic: true,
    stale: false,
    plotPolicy: 'declared-comparable',
    axes: [
      'First dimension',
      'Second dimension',
      'Third dimension',
      'Fourth dimension',
      'Fifth dimension',
    ].map((label, index) => ({
      id: `${measure}-${index}`,
      label,
      min: 0,
      max,
      value:
        max *
        (perspective === 'self' ? [0, 0.4, 0.8, 0.6, 1][index]! : [0.8, 0.2, 0.4, 1, 0.6][index]!),
    })),
  };
}

export function RadarGalleryClient() {
  const [world, setWorld] = useState<WorldId>('sanctuary');
  const [mode, setMode] = useState<WorldMode>('light');
  const [measure, setMeasure] = useState<Example>('a');
  const [perspective, setPerspective] = useState<Perspective>('self');
  const [kind, setKind] = useState<ExampleState>('ready');
  const observation = example(measure, perspective);
  const state: RadarState =
    kind === 'partial'
      ? {
          kind: 'ready',
          observation: {
            ...observation,
            axes: observation.axes.map((axis, index) =>
              index === 2 ? { ...axis, value: null } : axis,
            ),
          },
        }
      : kind === 'historical'
        ? { kind: 'ready', observation: { ...observation, stale: true } }
        : kind === 'ready'
          ? { kind, observation }
          : {
              kind,
              message: {
                loading: 'Loading example…',
                empty: 'No observation recorded.',
                denied: 'You do not have access to this observation.',
                unavailable: 'This measure is unavailable.',
                error: 'The example could not be loaded.',
              }[kind],
            };
  return (
    <WorldScope world={world} mode={mode}>
      <main className={styles.page}>
        <Link href="/kit">Back to UI kit</Link>
        <Text as="h1" kind="display">
          Radar experience
        </Text>
        <Text>
          Example data only. These dimensions are placeholders, not a common assessment model or a
          person’s profile.
        </Text>
        <Text>
          Choose a measure and a perspective independently. Values are never averaged across them.
        </Text>
        <fieldset className={styles.controls}>
          <legend>World preview</legend>
          {WORLD_IDS.map((id) => (
            <Button
              key={id}
              label={id}
              size="sm"
              variant={world === id ? 'primary' : 'secondary'}
              aria-pressed={world === id}
              onClick={() => setWorld(id)}
            />
          ))}
          <Button
            label={mode === 'light' ? 'Preview dark mode' : 'Preview light mode'}
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          />
        </fieldset>
        <fieldset className={styles.controls}>
          <legend>Measure</legend>
          {(['a', 'b'] as const).map((id) => (
            <Button
              key={id}
              variant={measure === id ? 'primary' : 'secondary'}
              label={`Measure ${id.toUpperCase()} (${id === 'a' ? '0–100' : '0–5'})`}
              onClick={() => setMeasure(id)}
              aria-pressed={measure === id}
            />
          ))}
        </fieldset>
        <fieldset className={styles.controls}>
          <legend>Perspective</legend>
          {(['self', 'observer'] as const).map((id) => (
            <Button
              key={id}
              variant={perspective === id ? 'primary' : 'secondary'}
              label={id === 'self' ? 'Own observation' : 'Other observation'}
              onClick={() => setPerspective(id)}
              aria-pressed={perspective === id}
            />
          ))}
        </fieldset>
        <fieldset className={styles.controls}>
          <legend>Display state</legend>
          {(
            [
              'ready',
              'partial',
              'historical',
              'loading',
              'empty',
              'denied',
              'unavailable',
              'error',
            ] as const
          ).map((id) => (
            <Button
              key={id}
              size="sm"
              variant={kind === id ? 'primary' : 'secondary'}
              label={id}
              aria-pressed={kind === id}
              onClick={() => setKind(id)}
            />
          ))}
        </fieldset>
        <Radar label="Attributed observation" state={state} onRetry={() => setKind('ready')} />
      </main>
    </WorldScope>
  );
}
