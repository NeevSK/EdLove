'use client';

import { Moon, Sparkles, Sun, X, Zap } from '@repo/ui/icons';
import { useEffect, useMemo, useState } from 'react';
import styles from './shadow-agent-drawer.module.css';

interface ShadowAgentDrawerProps {
  userId?: string;
}

const THOUGHT_SEEDS = [
  'What feels heavy today that you might set down?',
  'Where did you notice a moment of stillness or peace?',
  'What is an expectation you can gently release?',
  'What truth did a student or interaction reveal today?',
  'Recall a small gesture of kindness you witnessed.',
];

export function ShadowAgentDrawer({ userId }: ShadowAgentDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNudge, setActiveNudge] = useState<string>('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 5) {
      setActiveNudge('The sanctuary is quiet. Release the mental weight of today.');
    } else if (hour < 10) {
      setActiveNudge('A fresh dawn. Enter your classrooms with grounded pace.');
    } else {
      setActiveNudge('Take a moment between periods to recalibrate your breath.');
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={styles.triggerPill}
        aria-label="Open Shadow Sanctuary Guidance"
      >
        <Sparkles size={14} color="#0284c7" />
        <span>Shadow Reflection</span>
      </button>

      {isOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>The Quiet Sanctuary</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.orbContainer}>
              <div className={styles.luminousOrb} />
              <div className={styles.nudgeBox}>
                <Moon size={18} color="#0284c7" />
                <span>{activeNudge}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Thought Seeds for Contemplation
              </div>
              <div className={styles.seedList}>
                {THOUGHT_SEEDS.map((seed, idx) => (
                  <div key={idx} className={styles.seedPrompt}>
                    "{seed}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
