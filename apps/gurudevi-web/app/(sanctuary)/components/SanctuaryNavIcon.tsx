'use client';

import type { ReactNode } from 'react';

const NAV_EMOJI: Readonly<Record<string, string>> = {
  self: '❤️', library: '📚', workspace: '🏫', community: '🤝',
  profile: '🪪', notifications: '🔔', settings: '⚙️', attendance: '🕒',
  submissions: '📥', climate: '🌤️', tuition: '💳', kiosk: '🚪', badges: '🪪',
  claim: '🎓', school: '🏫', editorial: '✍️', plan: '🗓️', notices: '📣',
  events: '🎉', timetable: '📅', gradebook: '📊',
};

export function SanctuaryNavIcon({
  id,
  size = 18,
  strokeWidth = 2,
  className,
  fallback,
}: Readonly<{
  id: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  fallback?: ReactNode;
}>) {
  void strokeWidth;
  void fallback;
  return (
    <span aria-hidden="true" className={className} style={{ fontSize: size }}>
      {NAV_EMOJI[id] ?? '🧭'}
    </span>
  );
}
