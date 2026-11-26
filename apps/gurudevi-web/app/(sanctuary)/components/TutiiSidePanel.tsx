import { Link, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ApprovalCard,
  Chip,
  Composer,
  IconButton,
  MessageBubble,
  PrivacyState,
  ScrollArea,
  SegmentedControl,
  ThinkingTrace,
  ToolCallCard,
} from '@repo/ui/components/web';
import { ExternalLink, FileText, Sparkles, X, Zap } from 'lucide-react';
import { type ChatMessage, useCommunityChat } from '@/lib/hooks/useCommunityChat';
import styles from './tutii-side-panel.module.css';

export interface TutiiSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  displayName: string;
  activeCapacity?: string | null;
}

type PanelTab = 'chat' | 'subtasks' | 'info';

interface SubtaskItem {
  key: string;
  label: string;
  desc: string;
  prompt: string;
  group: string;
}

export function TutiiSidePanel({
  isOpen,
  onClose,
  pathname,
  displayName,
  activeCapacity,
}: Readonly<TutiiSidePanelProps>) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');
  const [privacyMode, setPrivacyMode] = useState<'saved' | 'temporary' | 'incognito'>('saved');
  const [draft, setDraft] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingSummary, setThinkingSummary] = useState('');
  const [thinkingDetail, setThinkingDetail] = useState('');
  const [pendingApproval, setPendingApproval] = useState<{
    id: string;
    title: string;
    desc: string;
    action: string;
  } | null>(null);

  // Durable chat synchronized with community Tutii DM
  const { messages, sendMessage } = useCommunityChat('dm-tutii', displayName);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, activeTab]);

  // Floor context detection
  const floorName = useMemo(() => {
    if (pathname.startsWith('/workspace')) return 'Workspace (Teaching & Ops)';
    if (pathname.startsWith('/self')) return 'Self (Reflection & Wellbeing)';
    if (pathname.startsWith('/community')) return 'Community (Forest & Circles)';
    if (pathname.startsWith('/library')) return 'Library (Curricula & Texts)';
    if (pathname.startsWith('/profile')) return 'Profile & Bonds';
    return 'Sanctuary Ground';
  }, [pathname]);

  // Dynamic Notion-style subtasks based on active floor
  const subtasks = useMemo<SubtaskItem[]>(() => {
    const list: SubtaskItem[] = [];

    if (pathname.startsWith('/workspace')) {
      list.push(
        {
          key: 'ws-rollcall',
          label: 'Roll Call & Attendance Audit',
          desc: 'Audit attendance records for today and flag missing marks',
          prompt: 'Please audit today’s attendance records on the Workspace floor and flag any discrepancies or unconfirmed absences.',
          group: 'Floor Subtasks',
        },
        {
          key: 'ws-lesson',
          label: 'Lesson Plan & Pacing Draft',
          desc: 'Draft structured lesson goals and timing for this week’s unit',
          prompt: 'Draft a 45-minute lesson pacing guide for Grade 7 Science on biodiversity with a 5-minute reflection at the end.',
          group: 'Floor Subtasks',
        },
        {
          key: 'ws-circular',
          label: 'Draft Parent & Staff Notice',
          desc: 'Compose a formal bilingual circular notice for upcoming events',
          prompt: 'Draft an official school circular announcing next Friday’s parent-teacher coordination morning.',
          group: 'Floor Subtasks',
        },
      );
    } else if (pathname.startsWith('/self')) {
      list.push(
        {
          key: 'self-journal',
          label: 'Fire Journal Sadhana Prompt',
          desc: 'Deep philosophical inquiry to guide today’s reflection',
          prompt: 'Offer a thoughtful reflection inquiry for my Fire Journal today based on pedagogical patience and mindfulness.',
          group: 'Floor Subtasks',
        },
        {
          key: 'self-breath',
          label: 'Somatic Rhythm Calibration',
          desc: '2-minute nervous system breath pacing sequence',
          prompt: 'Guide me through a 2-minute 4-7-8 somatic breath calibration to reset focus.',
          group: 'Floor Subtasks',
        },
      );
    } else if (pathname.startsWith('/community')) {
      list.push(
        {
          key: 'comm-digest',
          label: 'Community Circles Digest',
          desc: 'Summarize key questions and insights from peer circles',
          prompt: 'Summarize the primary discussion topics and teacher questions raised in the Community circles today.',
          group: 'Floor Subtasks',
        },
        {
          key: 'comm-welcome',
          label: 'Staff Welcome Note',
          desc: 'Draft a warm greeting for new visiting teachers',
          prompt: 'Draft a welcoming message for incoming teachers joining our academic circle this term.',
          group: 'Floor Subtasks',
        },
      );
    } else {
      list.push(
        {
          key: 'floor-explain',
          label: 'Explain Active Floor',
          desc: 'High-level architectural overview and navigation keys',
          prompt: `Explain the purpose and key capabilities of the ${floorName} floor in Gurudevi.`,
          group: 'Floor Subtasks',
        },
        {
          key: 'floor-gaps',
          label: 'Find Active Duty Gaps',
          desc: 'Detect any pending actions or unfinished tasks',
          prompt: 'Review my active permissions and schedule to highlight any pending duties requiring attention today.',
          group: 'Floor Subtasks',
        },
      );
    }

    // Universal Subtasks
    list.push(
      {
        key: 'uni-explain',
        label: 'Explain This Floor',
        desc: `Walkthrough of controls, shortcuts, and purpose of ${floorName}`,
        prompt: `Give me a quick 3-bullet summary of what I can accomplish on this ${floorName} floor.`,
        group: 'Universal Tools',
      },
      {
        key: 'uni-action',
        label: 'Actionable Next Step',
        desc: 'Recommend the single most impactful action right now',
        prompt: 'Based on my role and context, what is the single most important task I should tackle right now?',
        group: 'Universal Tools',
      },
    );

    return list;
  }, [pathname, floorName]);

  // Execute message turn
  const handleSend = useCallback(
    async (textToSend?: string) => {
      const content = (textToSend ?? draft).trim();
      if (!content) return;

      setDraft('');
      setActiveTab('chat');

      try {
        await sendMessage(content);
        setIsStreaming(true);
        setThinkingSummary('Reviewing sanctuary state & pedagogical guidelines...');
        setThinkingDetail(
          `Context: ${floorName}\nUser: ${displayName} (${activeCapacity ?? 'Educator'})\nPrivacy: ${privacyMode}`,
        );

        setTimeout(async () => {
          let tutiiReply = `I received your request: "${content}".\n\n`;

          if (content.toLowerCase().includes('attendance') || content.toLowerCase().includes('roll call')) {
            tutiiReply += 'I audited the active roll call records for Grade 7A & 7B. Attendance is currently at 94.2%. Two students have unexcused absences requiring follow-up.';
            setPendingApproval({
              id: 'appr-attendance',
              title: 'Dispatch Absentee SMS Notices',
              desc: 'Send automated bilingual attendance alert to parents of 2 unexcused students.',
              action: 'dispatch_sms',
            });
          } else if (content.toLowerCase().includes('lesson') || content.toLowerCase().includes('science')) {
            tutiiReply += 'Here is a recommended 45-minute pacing outline:\n• 00-10m: Foveal observation of botanical specimens\n• 10-25m: Guided categorization in student notebooks\n• 25-40m: Group synthesis and peer review\n• 40-45m: Mindful reflection closure';
            setPendingApproval({
              id: 'appr-lesson',
              title: 'Pin Lesson Draft to Workspace',
              desc: 'Save this 45-minute pacing outline to the Grade 7 Science curriculum schedule.',
              action: 'save_lesson',
            });
          } else if (content.toLowerCase().includes('breath') || content.toLowerCase().includes('somatic')) {
            tutiiReply += 'Let us take a mindful breath together.\n\nInhale slowly through the nose (4s)... Hold with gentle stillness (7s)... Exhale with quiet release (8s).\n\nYour pulse rhythm is settling.';
          } else {
            tutiiReply += `Analyzing ${floorName} data. As your companion, I am aligned to support your classroom and self practice without friction.`;
          }

          await sendMessage(tutiiReply);
          setIsStreaming(false);
          setThinkingSummary('');
        }, 900);
      } catch {
        setDraft(content);
        setIsStreaming(false);
      }
    },
    [draft, sendMessage, floorName, displayName, activeCapacity, privacyMode],
  );

  // Pop out to full community DM floor
  const handlePopOut = useCallback(() => {
    onClose();
    void router.navigate({ to: '/community', search: { pillar: 'messages', dm: 'tutii' } });
  }, [onClose, router]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Tutii Companion Side Panel"
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.lampGlyph}>
              <Sparkles size={18} color="currentColor" aria-hidden />
            </div>
            <div className={styles.titleMeta}>
              <h2 className={styles.title}>Tutii Companion</h2>
              <span className={styles.contextTag}>{floorName}</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <IconButton
              icon={ExternalLink}
              label="Open full screen in Community DM"
              onClick={handlePopOut}
            />
            <IconButton icon={X} label="Close side panel (Esc)" onClick={onClose} />
          </div>
        </header>

        {/* Tab Switcher */}
        <div className={styles.navTabs}>
          <SegmentedControl<PanelTab>
            label="Tutii View"
            value={activeTab}
            onChange={(tab) => setActiveTab(tab)}
            options={[
              { value: 'chat', label: 'Chat' },
              { value: 'subtasks', label: 'Subtasks' },
              { value: 'info', label: 'Floor Info' },
            ]}
          />
        </div>

        {/* Body */}
        <div className={styles.body}>
          {activeTab === 'chat' && (
            <div className={styles.chatContainer}>
              <ScrollArea orientation="vertical" className={styles.messagesScroll}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--w-ink-soft)' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--w-ink)' }}>
                      Tutii is listening
                    </p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                      Ask anything about your students, attendance, or reflection practice on this floor.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      author={m.isSelf ? 'self' : 'assistant'}
                      content={m.text}
                      state="complete"
                    />
                  ))
                )}

                {isStreaming && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <ThinkingTrace content={thinkingDetail || thinkingSummary} state={isStreaming ? 'thinking' : 'done'} />
                    <MessageBubble
                      author="assistant"
                      content="Composing companion response..."
                      state="streaming"
                    />
                  </div>
                )}

                {pendingApproval && (
                  <ApprovalCard
                    title={pendingApproval.title}
                    changes={pendingApproval.desc}
                    state="pending"
                    onAccept={() => {
                      setPendingApproval(null);
                      handleSend(`Approved action: ${pendingApproval.title}`);
                    }}
                    onDiscard={() => setPendingApproval(null)}
                  />
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Quick Prompt Chips */}
              <div className={styles.chipsRow}>
                <Chip
                  label="Explain this floor"
                  onClick={() => handleSend(`Explain the purpose and actions on ${floorName}`)}
                />
                <Chip
                  label="What needs attention?"
                  onClick={() => handleSend('What requires my urgent attention on this floor?')}
                />
                <Chip
                  label="2-min breath pause"
                  onClick={() => handleSend('Guide me through a 2-minute mindful breathing sequence.')}
                />
              </div>

              {/* Composer */}
              <div className={styles.composerDock}>
                <Composer
                  label="Ask Tutii"
                  value={draft}
                  onChange={setDraft}
                  onSend={() => handleSend()}
                  placeholder={`Ask Tutii about ${floorName}...`}
                  busy={isStreaming}
                  onStop={() => setIsStreaming(false)}
                />
              </div>
            </div>
          )}

          {activeTab === 'subtasks' && (
            <ScrollArea orientation="vertical" className={styles.subtasksScroll}>
              <div className={styles.subtaskSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Contextual Subtasks (Notion Style)</h3>
                </div>
                {subtasks.map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    className={styles.subtaskCard}
                    onClick={() => handleSend(st.prompt)}
                  >
                    <Zap size={18} className={styles.subtaskIcon} aria-hidden />
                    <div className={styles.subtaskMeta}>
                      <span className={styles.subtaskLabel}>{st.label}</span>
                      <span className={styles.subtaskDesc}>{st.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {activeTab === 'info' && (
            <ScrollArea orientation="vertical" className={styles.infoScroll}>
              <div className={styles.infoBlock}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--w-ink)' }}>
                  Active Floor Telemetry
                </h4>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Current Route:</span>
                  <span className={styles.infoValue}>{pathname}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Assigned Floor:</span>
                  <span className={styles.infoValue}>{floorName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>User Capacity:</span>
                  <span className={styles.infoValue}>{activeCapacity ?? 'Educator'}</span>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--w-ink)' }}>
                  Privacy & Memory Regime
                </h4>
                <PrivacyState mode={privacyMode} onChange={setPrivacyMode} />
              </div>

              <div style={{ padding: '0.5rem' }}>
                <Link
                  to="/community"
                  search={{ pillar: 'messages', dm: 'tutii' }}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'var(--w-surface)',
                    border: '1px solid var(--w-line)',
                    borderRadius: 'var(--w-radius-md, 8px)',
                    color: 'var(--w-lamp-deep, var(--w-lamp))',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={16} aria-hidden />
                  Open Full Screen Workspace
                </Link>
              </div>
            </ScrollArea>
          )}
        </div>
      </aside>
    </>
  );
}
