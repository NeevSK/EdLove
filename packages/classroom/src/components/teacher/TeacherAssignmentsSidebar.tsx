import React from 'react';
import { Theme, useTheme } from '@repo/ui';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submittedCount: number;
  totalCount: number;
}

interface TeacherAssignmentsSidebarProps {
  assignments: Assignment[];
  onAssignmentPress: (assignment: Assignment) => void;
}

export const TeacherAssignmentsSidebar: React.FC<TeacherAssignmentsSidebarProps> = ({
  assignments,
  onAssignmentPress
}) => {
  const theme = useTheme();

  if (assignments.length === 0) {
    return (
      <div
        className="rounded-[22px] border p-5"
        style={{
          background: 'rgba(255, 249, 242, 0.9)',
          borderColor: theme.glass.surface.border,
        }}
              <p className="text-sm font-medium" style={{ color: theme.text.primary }}          No active assignments need attention.
        </p        <p className="mt-2 text-xs leading-5" style={{ color: theme.text.secondary }}          This sidebar stays ready for submissions and due-date pressure when the rhythm changes.
        </p      </div    );
  }

  return (
    <div className="space-y-3"      {assignments.map((assignment) => {
        const totalCount = assignment.totalCount || 0;
        const ratio = totalCount > 0 ? (assignment.submittedCount / totalCount) * 100 : 0;

        return (
          <button
            key={assignment.id}
            onClick={() => onAssignmentPress(assignment)}
            className="w-full rounded-[20px] border p-4 text-left transition-colors duration-150 hover:bg-[rgba(250,247,237,0.96)]"
            style={{
              borderColor: theme.glass.surface.border,
              backgroundColor: 'rgba(250, 247, 237, 0.82)',
            }}
                      <h4 className="text-sm font-bold leading-5" style={{ color: theme.text.primary }}              {assignment.title}
            </h4            <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: theme.text.secondary }}              <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span              <span>{assignment.submittedCount}/{assignment.totalCount} turned in</span            </div            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full"
              style={{ backgroundColor: 'rgba(84, 74, 61, 0.08)' }}
                          <div
                className="h-full rounded-full"
                style={{
                  width: `${ratio}%`,
                  background: `linear-gradient(90deg, ${Theme.colors.sanctuarySaffron} 0%, ${Theme.colors.gurudeviBlue} 100%)`,
                }}
              /            </div          </button        );
      })}
    </div  );
};
