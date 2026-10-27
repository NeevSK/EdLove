'use client';

import { History, Send } from 'lucide-react';
import { useState } from 'react';
import { useDecisionJournal } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './decision-journal.module.css';

interface DecisionJournalProps {
  userId?: string;
  onClose?: () => void;
}

export function DecisionJournalSection({ userId, onClose }: DecisionJournalProps) {
  const { decisions = [], addDecision, isLoading } = useDecisionJournal(userId);
  const [decisionText, setDecisionText] = useState('');
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionText.trim()) return;

    setSaving(true);
    try {
      await addDecision({
        decision_text: decisionText.trim(),
        context: context.trim() || undefined,
        is_reviewed: false,
      });
      setDecisionText('');
      setContext('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Decision Journal</h2>
        <p className={styles.subtitle}>
          Document choices and rationale so future retrospectives reveal clarity rather than
          hindsight bias
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          rows={2}
          placeholder="What decision are you committing to?"
          value={decisionText}
          onChange={(e) => setDecisionText(e.target.value)}
          className={styles.textarea}
          required
        />
        <textarea
          rows={2}
          placeholder="What context, alternatives, or trade-offs led to this choice?"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className={styles.textarea}
        />
        <button type="submit" disabled={saving} className={styles.submitBtn}>
          <Send size={15} />
          <span>{saving ? 'Logging…' : 'Log Decision'}</span>
        </button>
      </form>

      <div className={styles.list}>
        {decisions.map((d) => (
          <div key={d.id} className={styles.card}>
            <div className={styles.decisionText}>🎯 {d.decision_text}</div>
            {d.context && <div className={styles.contextText}>{d.context}</div>}
            <div className={styles.date}>
              {new Date(d.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
