'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './builder.module.css';

export interface FormQuestion {
  id: string;
  title: string;
  type: 'text' | 'rating' | 'likert' | 'choice' | 'climate';
  required: boolean;
  options?: string[];
  helpText?: string;
}

const defaultQuestions: FormQuestion[] = [
  {
    id: 'q-1',
    title: 'How grounded and focused did you feel in today’s learning circle?',
    type: 'likert',
    required: true,
    helpText: '1 indicates high mental fatigue, 5 indicates deep contemplative presence.',
  },
  {
    id: 'q-2',
    title: 'Which scientific inquiry topics resonated most with you this week?',
    type: 'choice',
    required: false,
    options: ['Sacred Geometry & Vastu', 'Botanical Ecosystems', 'Astrological Cycles', 'Cellular Dynamics'],
  },
  {
    id: 'q-3',
    title: 'Emotional & communal climate resonance:',
    type: 'climate',
    required: true,
    helpText: 'Anonymous sensory report feeding the classroom climate dial.',
  },
  {
    id: 'q-4',
    title: 'Reflective thoughts or questions for your classroom mentor:',
    type: 'text',
    required: false,
    helpText: 'Confidential message to the educator circle.',
  },
];

interface FormBuilderFloorProps {
  displayName: string;
  capacity?: string;
}

export function FormBuilderFloor({ displayName, capacity }: Readonly<FormBuilderFloorProps>) {
  const [formTitle, setFormTitle] = useState('Weekly Sanctuary Reflection Questionnaire');
  const [formDescription, setFormDescription] = useState('Design dignified, contemplative questionnaires, climate pulses, and student feedback forms.');
  const [questions, setQuestions] = useState<FormQuestion[]>(defaultQuestions);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'designer' | 'preview' | 'schema'>('designer');
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  const addQuestion = () => {
    const newQ: FormQuestion = {
      id: `q-${Date.now()}`,
      title: 'New Reflective Question',
      type: 'text',
      required: false,
      options: ['Option 1', 'Option 2'],
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
    setQuestions(
      questions.map((q) => {
        if (q.id !== id) return q;
        const options = type === 'choice' && (!q.options || q.options.length === 0)
          ? ['Choice A', 'Choice B']
          : q.options;
        return { ...q, type, options };
      }),
    );
  };

  const toggleRequired = (id: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, required: !q.required } : q)));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const reordered = [...questions];
    const [moved] = reordered.splice(index, 1);
    if (moved) {
      reordered.splice(targetIndex, 0, moved);
      setQuestions(reordered);
    }
  };

  const addChoiceOption = (questionId: string) => {
    const text = newOptionInputs[questionId]?.trim();
    if (!text) return;
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: [...(q.options || []), text] } : q,
      ),
    );
    setNewOptionInputs((prev) => ({ ...prev, [questionId]: '' }));
  };

  const removeChoiceOption = (questionId: string, optIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        return { ...q, options: q.options.filter((_, idx) => idx !== optIndex) };
      }),
    );
  };

  const handleSave = () => {
    const payload = {
      version: '1.0',
      title: formTitle,
      description: formDescription,
      creator: displayName,
      updatedAt: new Date().toISOString(),
      questions,
    };
    try {
      localStorage.setItem('gurudevi.sanctuary.form.activeSchema', JSON.stringify(payload));
      setNotice(`Form schema "${formTitle}" saved & published successfully.`);
    } catch {
      setNotice('Published (local session memory).');
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const exportSchemaJson = () => {
    const data = JSON.stringify({ title: formTitle, description: formDescription, questions }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
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
              ← Back to Sanctuary Workspace
            </Link>
          </div>
          <h1>Institutional Form & Survey Designer</h1>
          <p>
            Design contemplative questionnaires, climate pulses, and student feedback forms.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" className={styles.secondaryBtn} onClick={exportSchemaJson}>
            Export JSON Schema
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleSave}>
            Publish & Activate Form
          </button>
        </div>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'designer'}
          className={`${styles.tabBtn} ${activeTab === 'designer' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('designer')}
        >
          Visual Designer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'preview'}
          className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Live Respondent Preview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'schema'}
          className={`${styles.tabBtn} ${activeTab === 'schema' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          JSON Schema Inspector
        </button>
      </div>

      {activeTab === 'designer' && (
        <div className={styles.formCard}>
          <div>
            <label
              htmlFor="form-title-input"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Form Title
            </label>
            <input
              id="form-title-input"
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

          <div>
            <label
              htmlFor="form-desc-input"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Pedagogical Description
            </label>
            <textarea
              id="form-desc-input"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div className={styles.questionsList}>
            {questions.map((q, idx) => (
              <div key={q.id} className={styles.questionItem}>
                <div className={styles.questionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveQuestion(idx, 'up')}
                      aria-label="Move question up"
                      className={styles.dragHandle}
                      style={{ opacity: idx === 0 ? 0.3 : 1 }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => moveQuestion(idx, 'down')}
                      aria-label="Move question down"
                      className={styles.dragHandle}
                      style={{ opacity: idx === questions.length - 1 ? 0.3 : 1 }}
                    >
                      ▼
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '2rem' }}>
                      #{idx + 1}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => updateQuestionTitle(q.id, e.target.value)}
                    className={styles.questionTitleInput}
                    aria-label={`Title for question #${idx + 1}`}
                  />
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => removeQuestion(q.id)}
                    aria-label={`Remove question #${idx + 1}`}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft, #453c35)' }}>
                    Type:
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
                    <option value="rating">Star Rating (1-5)</option>
                    <option value="choice">Multiple Choice</option>
                    <option value="climate">Classroom Climate Sensing</option>
                  </select>

                  <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={() => toggleRequired(q.id)}
                    />
                    Required field
                  </label>
                </div>

                {q.type === 'choice' && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink-soft, #453c35)' }}>
                      Choice Options:
                    </label>
                    <div className={styles.optionChipRow}>
                      {(q.options || []).map((opt, optIdx) => (
                        <span key={optIdx} className={styles.optionChip}>
                          {opt}
                          <button
                            type="button"
                            className={styles.removeOptionBtn}
                            onClick={() => removeChoiceOption(q.id, optIdx)}
                            aria-label={`Remove option ${opt}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <input
                          type="text"
                          placeholder="Add choice..."
                          value={newOptionInputs[q.id] || ''}
                          onChange={(e) => setNewOptionInputs({ ...newOptionInputs, [q.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addChoiceOption(q.id);
                            }
                          }}
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addChoiceOption(q.id)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
      )}

      {activeTab === 'preview' && (
        <div className={styles.formCard}>
          <div style={{ borderBottom: '1px solid var(--color-line, rgba(104, 94, 85, 0.16))', paddingBottom: '1rem' }}>
            <h2>{formTitle}</h2>
            <p style={{ color: 'var(--color-ink-soft, #453c35)', fontSize: '0.85rem' }}>{formDescription}</p>
          </div>

          <div className={styles.questionsList}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {idx + 1}. {q.title} {q.required && <span style={{ color: '#b91c1c' }}>*</span>}
                </label>
                {q.helpText && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-ink-soft, #453c35)' }}>
                    {q.helpText}
                  </p>
                )}

                {q.type === 'text' && (
                  <textarea
                    rows={3}
                    placeholder="Type your response here..."
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                    }}
                  />
                )}

                {q.type === 'choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {(q.options || []).map((opt, oIdx) => (
                      <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input type="radio" name={`preview-${q.id}`} />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'likert' && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label key={val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="radio" name={`preview-${q.id}`} />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'rating' && (
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.25rem' }}>
                    {['★', '★', '★', '★', '★'].map((star, sIdx) => (
                      <span key={sIdx} style={{ color: '#d97706', cursor: 'pointer' }}>
                        {star}
                      </span>
                    ))}
                  </div>
                )}

                {q.type === 'climate' && (
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem', background: 'var(--color-paper, #f7f2e8)', borderRadius: '0.5rem' }}>
                    <span>🌱 Calm & Focused</span>
                    <span>⚡ Energized</span>
                    <span>🌊 Overwhelmed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className={styles.formCard}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft, #453c35)' }}>
            Canonical JSON Schema conforming to @repo/form-builder specification:
          </p>
          <pre className={styles.schemaViewer}>
            {JSON.stringify({ title: formTitle, description: formDescription, questions }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
