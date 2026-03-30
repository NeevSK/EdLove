import React from 'react';
import { useTheme } from '@repo/ui';

interface TeacherAdminButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

export const TeacherAdminButton: React.FC<TeacherAdminButtonProps> = ({ label, onClick }) => {
  const theme = useTheme();

  return (
    <button
      onClick={onClick}
      className="w-full rounded-[18px] border px-4 py-4 text-left transition-transform duration-150 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(180deg, rgba(250, 247, 237, 0.92) 0%, rgba(233, 241, 232, 0.84) 100%)',
        borderColor: theme.glass.surface.border,
      }}
          <span
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: theme.text.secondary }}
              Admin
      </span      <div className="mt-2 text-sm font-semibold" style={{ color: theme.text.primary }}        {label}
      </div    </button  );
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"      {actions.map((action) => (
        <TeacherAdminButton key={action.id} {...action} /      ))}
    </div  );
};
