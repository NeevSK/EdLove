'use client';

import { useId, useState } from 'react';
import styles from './gradebook.module.css';

type GradeLetter = 'A' | 'B' | 'C' | 'S' | 'W';

type StudentEntry = {
  id: string;
  name: string;
  rollNumber: number;
  marks: number;
  feedback: string;
};

const initialStudents: StudentEntry[] = [
  {
    id: 'st-1',
    name: 'Amara Perera',
    rollNumber: 1,
    marks: 88,
    feedback: 'Strong conceptual clarity',
  },
  { id: 'st-2', name: 'Kavi Fernando', rollNumber: 2, marks: 76, feedback: 'Active participation' },
  {
    id: 'st-3',
    name: 'Mihiri Silva',
    rollNumber: 3,
    marks: 62,
    feedback: 'Improving in problem solving',
  },
  { id: 'st-4', name: 'Nila Sen', rollNumber: 4, marks: 94, feedback: 'Exemplary work' },
  {
    id: 'st-5',
    name: 'Ravi Das',
    rollNumber: 5,
    marks: 44,
    feedback: 'Needs additional practice on fractions',
  },
  { id: 'st-6', name: 'Mira Anand', rollNumber: 6, marks: 71, feedback: 'Consistent progress' },
];

function calculateLetter(score: number): GradeLetter {
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'S';
  return 'W';
}

function getBadgeClass(letter: GradeLetter): string {
  switch (letter) {
    case 'A':
      return styles.badgeA ?? '';
    case 'B':
      return styles.badgeB ?? '';
    case 'C':
      return styles.badgeC ?? '';
    case 'S':
      return styles.badgeS ?? '';
    case 'W':
      return styles.badgeW ?? '';
  }
}

interface GradebookFloorProps {
  displayName: string;
  capacity?: string;
}

export function GradebookFloor({ displayName }: GradebookFloorProps) {
  const [students, setStudents] = useState<StudentEntry[]>(initialStudents);
  const [subject, setSubject] = useState('Integrated Mathematics');
  const [assessment, setAssessment] = useState('Mid-Term Assessment 2026');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'marks'>('roll');
  const tableCaptionId = useId();

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'marks') return b.marks - a.marks;
    return a.rollNumber - b.rollNumber;
  });

  const averageScore = Math.round(
    students.reduce((acc, s) => acc + s.marks, 0) / (students.length || 1),
  );
  const passRate = Math.round(
    (students.filter((s) => s.marks >= 35).length / (students.length || 1)) * 100,
  );
  const topScore = Math.max(...students.map((s) => s.marks));

  function handleScoreChange(id: string, newScoreText: string) {
    const parsed = parseInt(newScoreText, 10);
    const valid = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, marks: valid } : s)));
  }

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>Academic Gradebook</h1>
          <p>
            Continuous competency assessments for {displayName}&rsquo;s active classroom circle.
          </p>
        </div>
        <div className={styles.controlsArea}>
          <label className="sr-only" htmlFor="subject-select">
            Select Subject
          </label>
          <select
            id="subject-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={styles.selectInput}
          >
            <option value="Integrated Mathematics">Integrated Mathematics</option>
            <option value="Environmental Studies">Environmental Studies</option>
            <option value="Language & Literacy">Language & Literacy</option>
          </select>

          <label className="sr-only" htmlFor="assessment-select">
            Select Assessment
          </label>
          <select
            id="assessment-select"
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            className={styles.selectInput}
          >
            <option value="Mid-Term Assessment 2026">Mid-Term Assessment 2026</option>
            <option value="Unit 3 Practical Demonstration">Unit 3 Practical Demonstration</option>
            <option value="Reflective Journal Portfolio">Reflective Journal Portfolio</option>
          </select>

          <label className="sr-only" htmlFor="sort-select">
            Sort By
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'roll' | 'name' | 'marks')}
            className={styles.selectInput}
          >
            <option value="roll">Sort: Roll Number</option>
            <option value="name">Sort: Student Name</option>
            <option value="marks">Sort: Highest Marks</option>
          </select>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Enrolled Students</p>
          <p className={styles.statValue}>{students.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Class Average</p>
          <p className={styles.statValue}>{averageScore}%</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Competency Rate</p>
          <p className={styles.statValue}>{passRate}%</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Highest Marks</p>
          <p className={styles.statValue}>{topScore}%</p>
        </div>
      </div>

      {/* Assessment Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.gradeTable} aria-describedby={tableCaptionId}>
          <caption id={tableCaptionId} className="sr-only">
            Assessment scores and competency marks for {subject} - {assessment}
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: '4rem' }}>
                Roll
              </th>
              <th scope="col">Student Name</th>
              <th scope="col" style={{ width: '7rem', textAlign: 'center' }}>
                Score / 100
              </th>
              <th scope="col" style={{ width: '5rem', textAlign: 'center' }}>
                Grade
              </th>
              <th scope="col">Pedagogical Feedback</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((st) => {
              const grade = calculateLetter(st.marks);
              return (
                <tr key={st.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-ink-soft, #453c35)' }}>
                    #{st.rollNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>{st.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={st.marks}
                      onChange={(e) => handleScoreChange(st.id, e.target.value)}
                      aria-label={`Score for ${st.name}`}
                      className={styles.scoreInput}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={getBadgeClass(grade)} aria-label={`Grade ${grade}`}>
                      {grade}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-ink-soft, #453c35)', fontSize: '0.8rem' }}>
                    {st.feedback}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
