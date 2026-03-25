import React from 'react';
import { useTheme } from '@repo/ui';

interface Classroom {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  nextSession: string;
}

interface TeacherClassroomListProps {
  classrooms: Classroom[];
  onClassroomPress: (classroom: Classroom) => void;
}

export const TeacherClassroomList: React.FC<TeacherClassroomListProps> = ({
  classrooms,
  onClassroomPress
}) => {
  const theme = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {classrooms.map((classroom) => (
        <div
          key={classroom.id}
          onClick={() => onClassroomPress(classroom)}
          className="p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
          style={{ 
            backgroundColor: theme.glass.surface.bg,
            border: `1px solid ${theme.glass.surface.border}`,
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 
                className="text-lg font-bold mb-1"
                style={{ color: theme.text.primary }}
              >
                {classroom.name}
              </h3>
              <p 
                className="text-sm opacity-70"
                style={{ color: theme.text.secondary }}
              >
                {classroom.subject}
              </p>
            </div>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: theme.accent.action + '20',
                color: theme.accent.action
              }}
            >
              {classroom.studentCount} Students
            </span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs opacity-50 mb-1">Next Session</p>
            <p className="text-sm font-medium">{classroom.nextSession}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
