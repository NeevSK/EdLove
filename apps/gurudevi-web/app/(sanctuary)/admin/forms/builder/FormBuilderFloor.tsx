'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './builder.module.css';

interface FormQuestion {
  id: string;
  title: string;
  type: 'text' | 'rating' | 'likert' | 'choice';
  required: boolean;
}

const defaultQuestions: FormQuestion[] = [
  {
    id: 'q-1',
    title: 'How grounded and focused did you feel in today&rsquo;s learning circle?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q-2',
    title: 'Which scientific inquiry topics resonated most with you this week?',
    type: 'choice',
    required: false,
  },
  {
    id: 'q-3',
    title: 'Reflective thoughts or questions for your classroom mentor:',
    type: 'text',
    required: false,
  },
];

interface FormBuilderFloorProps {
  displayName: string;
  capacity?: string;
}

export function FormBuilderFloor({ displayName, capacity }: Readonly<FormBuilderFloorProps>) {
  const [formTitle, setFormTitle] = useState('Weekly Sanctuary Reflection Questionnaire');
  const [questions, setQuestions] = useState<FormQuestion[]>(defaultQuestions);
  const [notice, setNotice] = useState<string | null>(null);

  const addQuestion = () => {
    const newQ: FormQuestion = {
      id: `q-${Date.now()}`,
      title: 'New Reflective Question',
      type: 'text',
      required: false,
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestionTitle = (id: string, title: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, title } : q)));
  };

  const updateQuestionType = (id: string, type: FormQuestion['type']) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, type } : q)));
  };

  const handleSave = () => {
    setNotice(`Form schema "${formTitle}" saved successfully. Active for student response.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/workspace"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Sanctuary
            </Link>
          </div>
          <h1>Institutional Form & Survey Builder</h1>
          <p>
            Design dignified, contemplative questionnaires, climate pulses, and student feedback
            forms.
          </p>
        </div>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      <div className={styles.formCard}>
        <div>
          <label
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'block',
              marginBottom: '0.25rem',
            }}
          >
            Questionnaire Title
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            style={{
              width: '100%',
              minHeight: 44,
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
              fontSize: '1rem',
              fontWeight: 650,
            }}
          />
        </div>

        <div className={styles.questionsList}>
          {questions.map((q, idx) => (
            <div key={q.id} className={styles.questionItem}>
              <div className={styles.questionHeader}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '2rem' }}>
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={q.title}
                  onChange={(e) => updateQuestionTitle(q.id, e.target.value)}
                  className={styles.questionTitleInput}
                />
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => removeQuestion(q.id)}
                  aria-label="Remove question"
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft, #453c35)' }}>
                  Question Type:
                </label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestionType(q.id, e.target.value as FormQuestion['type'])}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="text">Open Text Response</option>
                  <option value="likert">Likert Scale (1-5)</option>
                  <option value="rating">Star Rating</option>
                  <option value="choice">Multiple Choice</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
          }}
        >
          <button type="button" className={styles.addBtn} onClick={addQuestion}>
            + Add Question Item
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleSave}>
            Publish & Activate Form
          </button>
        </div>
      </div>
    </div>
  );
}
