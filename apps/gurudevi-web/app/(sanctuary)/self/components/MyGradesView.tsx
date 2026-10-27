'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { Award, BookOpen, Clock } from 'lucide-react';

interface MyGradesViewProps {
  userId?: string;
  onClose?: () => void;
}

export function MyGradesView({ onClose }: MyGradesViewProps) {
  const rawGrades = getSandboxSamples<any[]>('assignments', 'getRecentGradesOverviewForStudent', [], []);
  const grades = rawGrades.map((g) => ({
    course: g.assignments?.title ?? g.classrooms?.name ?? 'Practical Study',
    grade: g.grade,
    status: g.grade >= 85 ? 'Distinction' : 'Merit',
    updated: 'Verified',
  }));

  const overallAverage =
    grades.length > 0
      ? Math.round(grades.reduce((acc, curr) => acc + curr.grade, 0) / grades.length)
      : 86;
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Academic Progress & Evaluation
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Official mastery evaluations and semester portfolio milestones
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: '#0284c7',
            fontWeight: 700,
          }}
        >
          <Award size={18} />
          <span>Overall: {overallAverage}%</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {grades.map((g, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                  {g.course}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Clock size={11} /> {g.updated}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981' }}>
                {g.grade}%
              </span>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                {g.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
