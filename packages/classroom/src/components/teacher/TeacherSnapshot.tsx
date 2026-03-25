import React from 'react';
import { useTheme } from '@repo/ui';

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

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="w-16 text-xs opacity-50 py-1">{item.time}</div>
          <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm font-medium">{item.activity}</p>
            <p className="text-[10px] opacity-40 uppercase tracking-tight">{item.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
