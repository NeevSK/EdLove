import React from 'react';
import { useTheme } from '@repo/ui';

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

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          onClick={() => onAssignmentPress(assignment)}
          className="p-4 rounded-xl cursor-pointer group hover:bg-white/5 transition-colors"
          style={{ border: `1px solid ${theme.glass.surface.border}` }}
        >
          <h4 className="text-sm font-bold mb-2 truncate group-hover:text-amber-400 transition-colors">
            {assignment.title}
          </h4>
          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider opacity-60">
            <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
            <span>{assignment.submittedCount}/{assignment.totalCount} Turned In</span>
          </div>
          <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500/50"
              style={{ width: `${(assignment.submittedCount / assignment.totalCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
