import React from 'react';
import { Theme, useTheme } from '@repo/ui';

interface SnapshotItem {
  time: string;
  activity: string;
  location: string;
}

interface TeacherSnapshotProps {
  items: SnapshotItem[];
}

export const TeacherSnapshot: React.FC<TeacherSnapshotProps> = ({ items }) => {
  const theme = useTheme();

  if (items.length === 0) {
    return (
      <div
        className="rounded-[22px] border p-5"
        style={{
          background: 'rgba(250, 247, 237, 0.82)',
          borderColor: theme.glass.surface.border,
        }}
              <p className="text-sm font-medium" style={{ color: theme.text.primary }}          No temporal moments are surfaced yet.
        </p        <p className="mt-2 text-xs leading-5" style={{ color: theme.text.secondary }}          Snapshot context will appear here as the day gathers more classroom signal.
        </p      </div    );
  }

  return (
    <div className="space-y-3"      {items.map((item, index) => (
        <div key={`${item.time}-${index}`} className="flex gap-3"          <div
            className="shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: 'rgba(184, 169, 224, 0.14)',
              color: Theme.colors.gurudeviViolet,
              alignSelf: 'flex-start',
            }}
                      {item.time}
          </div          <div
            className="flex-1 rounded-[18px] border p-4"
            style={{
              backgroundColor: 'rgba(250, 247, 237, 0.82)',
              borderColor: theme.glass.surface.border,
            }}
                      <p className="text-sm font-semibold" style={{ color: theme.text.primary }}              {item.activity}
            </p            <p className="mt-1 text-[11px] uppercase tracking-[0.14em]" style={{ color: theme.text.secondary }}              {item.location}
            </p          </div        </div      ))}
    </div  );
};
