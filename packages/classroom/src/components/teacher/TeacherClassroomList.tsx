import React from 'react';
import { Theme, useTheme } from '@repo/ui';

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

  if (classrooms.length === 0) {
    return (
      <div
        className="rounded-[28px] border p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(250, 247, 237, 0.9) 0%, rgba(245, 237, 214, 0.86) 100%)',
          borderColor: theme.glass.surface.border,
        }}
      >
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: theme.text.secondary }}>
            Classroom Registry
          </p>
          <h3 className="mt-3 text-2xl font-bold" style={{ color: theme.text.primary }}>
            Your sanctuaries will gather here.
          </h3>
          <p className="mt-3 text-sm leading-6" style={{ color: theme.text.secondary }}>
            Create or join a classroom to begin the teacher workspace flow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {classrooms.map((classroom, index) => (
        <button
          key={classroom.id}
          onClick={() => onClassroomPress(classroom)}
          className="group rounded-[28px] border p-6 text-left transition-transform duration-200 hover:-translate-y-0.5"
          style={{
            background: index % 2 === 0
              ? 'linear-gradient(180deg, rgba(250, 247, 237, 0.96) 0%, rgba(245, 237, 214, 0.9) 100%)'
              : 'linear-gradient(180deg, rgba(250, 247, 237, 0.94) 0%, rgba(232, 242, 241, 0.88) 100%)',
            borderColor: theme.glass.surface.border,
            boxShadow: '0 18px 30px rgba(107, 100, 128, 0.08)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: theme.text.secondary }}
              >
                {classroom.subject}
              </p>
              <h3
                className="mt-3 text-xl font-bold leading-tight"
                style={{ color: theme.text.primary }}
              >
                {classroom.name}
              </h3>
            </div>
            <span
              className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: 'rgba(125, 212, 192, 0.14)',
                color: Theme.colors.gurudeviBlue,
                border: '1px solid rgba(125, 212, 192, 0.2)',
              }}
            >
              {classroom.studentCount} students
            </span>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: 'rgba(84, 74, 61, 0.08)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.text.secondary }}>
                Next Session
              </p>
              <p className="mt-2 text-sm font-medium" style={{ color: theme.text.primary }}>
                {classroom.nextSession}
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                backgroundColor: 'rgba(246, 191, 140, 0.16)',
                color: Theme.colors.sanctuarySaffron,
              }}
            >
              Open workspace
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
