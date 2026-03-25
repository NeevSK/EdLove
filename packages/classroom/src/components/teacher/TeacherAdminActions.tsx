import React from 'react';
import { useTheme } from '@repo/ui';

interface TeacherAdminButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

export const TeacherAdminButton: React.FC<TeacherAdminButtonProps> = ({ label, icon, onClick }) => {
  const theme = useTheme();
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 active:scale-95"
      style={{ 
        backgroundColor: theme.accent.action + '10',
        border: `1px solid ${theme.accent.action}30`,
        width: '100%'
      }}
    >
      <span className="text-sm font-semibold" style={{ color: theme.accent.action }}>
        {label}
      </span>
    </button>
  );
};

interface TeacherAdminActionsProps {
  actions: Array<{
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
  }>;
}

export const TeacherAdminActions: React.FC<TeacherAdminActionsProps> = ({ actions }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <TeacherAdminButton key={action.id} {...action} />
      ))}
    </div>
  );
};
