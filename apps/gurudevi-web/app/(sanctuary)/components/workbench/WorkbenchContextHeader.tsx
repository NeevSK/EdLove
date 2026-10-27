'use client';

import type { TemporalIntent } from '@repo/core/logic/workbench';
import type { ReactNode } from 'react';
import styles from './workbench.module.css';

type WorkbenchContextHeaderProps = Readonly<{
  greeting: string;
  intent: TemporalIntent;
  domain: 'self' | 'workspace';
  dateControl: ReactNode;
  selectedDate: string;
  homeActive?: boolean;
  renderExtra?: () => ReactNode;
}>;

const selfPrompts: Record<TemporalIntent, readonly string[]> = {
  current: [
    'A gentle beginning is still a beginning.',
    'Notice one small thing worth carrying forward.',
    'Let the next step be enough for now.',
    'There is room to begin again today.',
  ],
  review: [
    'Look back with kindness; notice what has changed.',
    'Even a quiet day can hold something meaningful.',
    'You can learn from the past without staying there.',
    'Give yourself credit for making it through.',
  ],
  plan: [
    'Make room for what matters most.',
    'A little intention can steady the days ahead.',
    'Choose a pace you can return to.',
    'Leave space for the unexpected, too.',
  ],
};

const workspacePrompts: Record<TemporalIntent, readonly string[]> = {
  current: [
    'Steady, thoughtful work makes room for everyone.',
    'One clear next step can help the whole day flow.',
    'Make space for learning and for the people in it.',
    'Small acts of care shape a strong classroom.',
  ],
  review: [
    'Notice what supported people and learning today.',
    'A thoughtful review can make tomorrow easier.',
    'Celebrate progress, then learn from what was hard.',
    'Look for the moments that brought people together.',
  ],
  plan: [
    'Plan with care, and leave room to adapt.',
    'A clear intention can steady a busy week.',
    'Build a day that works for the people in it.',
    'Start with what matters most to your community.',
  ],
};

export function timeGreeting(name: string): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      hourCycle: 'h23',
      timeZone: 'Asia/Colombo',
    }).format(new Date()),
  );
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name}`;
}

function contextDescription(domain: 'self' | 'workspace', intent: TemporalIntent, date: string): string {
  const prompts = domain === 'self' ? selfPrompts[intent] : workspacePrompts[intent];
  const month = Number.parseInt(date.slice(5, 7), 10) || 1;
  const day = Number.parseInt(date.slice(-2), 10) || 1;
  return prompts[(month + day - 2) % prompts.length] ?? 'Take one thoughtful step at a time.';
}

export function WorkbenchContextHeader({
  greeting,
  intent,
  domain,
  dateControl,
  selectedDate,
  homeActive = true,
  renderExtra,
}: WorkbenchContextHeaderProps) {
  return (
    <div className={styles.contextHeader} data-intent={intent}>
      {homeActive ? (
        <div className={styles.contextGreeting}>
          <h2>{greeting}</h2>
          <div className={styles.contextDetailRow}>
            <div className={styles.contextMeaning} aria-live="polite">
              <p>{contextDescription(domain, intent, selectedDate)}</p>
            </div>
            <div className={styles.contextDate}>{dateControl}</div>
            {renderExtra?.()}
          </div>
        </div>
      ) : (
        <div className={styles.taskTemporalControl}>
          {dateControl}
          {renderExtra?.()}
        </div>
      )}
    </div>
  );
}
