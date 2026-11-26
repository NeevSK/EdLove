import { ScrollArea } from '@repo/ui/components/web';
import { linkOptions, useRouter } from '@tanstack/react-router';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isOfferedTo } from '../workspace/workspaceFeatureRegistry';

type CommandSection = 'Navigation' | 'Academic' | 'Tools' | 'Account' | 'Admin';

const commands = [
  {
    id: 'nav-self',
    title: 'Self Floor',
    description: 'Personal reflection, fire journal, and wellbeing practice',
    symbol: '♥',
    section: 'Navigation',
    link: linkOptions({ to: '/self' }),
  },
  {
    id: 'nav-workspace',
    title: 'Workspace Floor',
    description: 'Classroom attendance, circles, and active duties',
    symbol: '◇',
    section: 'Navigation',
    link: linkOptions({ to: '/workspace' }),
  },
  {
    id: 'nav-community',
    title: 'Community Floor',
    description: 'School forest, peer circles, and shared spaces',
    symbol: '○',
    section: 'Navigation',
    link: linkOptions({ to: '/community' }),
  },
  {
    id: 'nav-library',
    title: 'Library Floor',
    description: 'Curricula, pedagogical books, and shared materials',
    symbol: '▤',
    section: 'Navigation',
    link: linkOptions({ to: '/library' }),
  },
  {
    id: 'academic-attendance',
    title: 'Daily Attendance Roll Call',
    description: 'Pastoral morning census, head-count, and presence register',
    symbol: '🗓️',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/attendance' }),
  },
  {
    id: 'academic-gradebook',
    title: 'Gradebook',
    description: 'Student competencies, evaluations, and grading matrix',
    symbol: '📊',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/gradebook' }),
  },
  {
    id: 'academic-timetable',
    title: 'Timetable',
    description: 'Weekly schedule, periods, and room assignments',
    symbol: '📅',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/timetable' }),
  },
  {
    id: 'academic-submissions',
    title: 'Homework Submissions',
    description: 'Review student work, worksheets, assignments, and grades',
    symbol: '📥',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/submissions' }),
  },
  {
    id: 'academic-plan',
    title: 'Curriculum & Term Planner',
    description: 'Term scheme of work, learning competency pacing, and syllabus',
    symbol: '📝',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/plan' }),
  },
  {
    id: 'academic-workforce',
    title: 'Staff Relief & Substitution',
    description: 'Manage teacher absences, relief allocations, and campus duties',
    symbol: '👥',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/workforce' }),
  },
  {
    id: 'academic-climate',
    title: 'Class Climate Sensing',
    description: 'Classroom sentiment, somatic energy, and drift awareness',
    symbol: '🌱',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/climate' }),
  },
  {
    id: 'academic-events',
    title: 'School Events Calendar',
    description: 'Inter-house meets, term exams, excursions, and public holidays',
    symbol: '🎪',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/events' }),
  },
  {
    id: 'self-breathing',
    title: 'Mindful Breathing Practice',
    description: 'Somatic pacing, grounding breaths, and restorative pause',
    symbol: '🌬️',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'breath' } }),
  },
  {
    id: 'self-journal',
    title: 'Fire Journal',
    description: 'Private cathartic release, evening unburdening, and sacred burning',
    symbol: '🔥',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'journal' } }),
  },
  {
    id: 'self-mood',
    title: 'Mood Lotus Check-In',
    description: 'Emotional weather sensing, petal reflections, and somatic anchoring',
    symbol: '🪷',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'mood' } }),
  },
  {
    id: 'self-pulse',
    title: 'Daily Pulse Dashboard',
    description: 'Living morning threshold, daily energy forecast, and focus anchors',
    symbol: '⚡',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'pulse' } }),
  },
  {
    id: 'self-sleep',
    title: 'Sleep & Rest Tracker',
    description: 'Restorative cycles, evening unwind journal, and circadian rhythm',
    symbol: '🌙',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'sleep' } }),
  },
  {
    id: 'self-prep',
    title: 'Tomorrow Preparation Ritual',
    description: 'Next-day pedagogy prep, mental clarity, and daily rhythm',
    symbol: '🌅',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'prep' } }),
  },
  {
    id: 'self-goals',
    title: 'Personal & Student Goals',
    description: 'Academic objectives, competency milestones, and growth tracking',
    symbol: '🎯',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'goals' } }),
  },
  {
    id: 'self-seeds',
    title: 'Wisdom Seeds',
    description: 'Spontaneous pedagogical insights, grounding reminders, and daily quotes',
    symbol: '🌱',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'seeds' } }),
  },
  {
    id: 'self-joy',
    title: 'Joy Jar Moments',
    description: 'Preserve classroom breakthrough moments and joyful connections',
    symbol: '🍯',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'joy' } }),
  },
  {
    id: 'self-gratitude',
    title: 'Gratitude Glimmers',
    description: 'Capture student growth, colleague support, and quiet personal wins',
    symbol: '✨',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'gratitude' } }),
  },
  {
    id: 'self-decisions',
    title: 'Decision Journal',
    description: 'Structured pedagogical and leadership decisions with rationale',
    symbol: '⚖️',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'decisions' } }),
  },
  {
    id: 'self-rhythm',
    title: 'Daily Rhythm & Sadhana',
    description: 'Diurnal schedule, morning/evening practices, and focus cycles',
    symbol: '⌛',
    section: 'Tools',
    link: linkOptions({ to: '/self', search: { practice: 'rhythm' } }),
  },
  {
    id: 'library-map',
    title: 'Library Map & Centers',
    description: 'Interactive visual geography of island knowledge centers',
    symbol: '🗺️',
    section: 'Navigation',
    link: linkOptions({ to: '/library/map' }),
  },
  {
    id: 'library-tools',
    title: 'Tools Workbench',
    description: 'Pedagogical tools, calculators, and teaching appliances',
    symbol: '📐',
    section: 'Tools',
    link: linkOptions({ to: '/library/tools' }),
  },
  {
    id: 'library-curator',
    title: 'Curator Review Studio',
    description: 'Inspect staged resources, repair broken links, and publish to the live library',
    symbol: '✨',
    section: 'Tools',
    link: linkOptions({ to: '/library/curator' }),
  },
  {
    id: 'academic-classroom',
    title: 'Grade 10-A Classroom Hub',
    description: 'Student roster, lessons, assignments, and holistic observations',
    symbol: '🏫',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/classroom/$id', params: { id: 'cls_10a_math' } }),
  },
  {
    id: 'academic-notices',
    title: 'School Notices & Circulars',
    description: 'Official department circulars, bulletins, and staff announcements',
    symbol: '📢',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/notices' }),
  },
  {
    id: 'academic-badges',
    title: 'Student Badges & Recognitions',
    description: 'Merit badges, competency awards, and student commendations',
    symbol: '🏅',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/badges' }),
  },
  {
    id: 'nav-notifications',
    title: 'Notifications & Dispatches',
    description: 'System alerts, school broadcasts, and activity alerts',
    symbol: '🔔',
    section: 'Navigation',
    link: linkOptions({ to: '/notifications' }),
  },
  {
    id: 'nav-support',
    title: 'Support & Care Desk',
    description: 'Help docs, platform feedback, and sanctuary guidance',
    symbol: '💬',
    section: 'Navigation',
    link: linkOptions({ to: '/support' }),
  },
  {
    id: 'account-security',
    title: 'Security & Recovery Keys',
    description: 'Session security, passkeys, and account recovery bonds',
    symbol: '🔒',
    section: 'Account',
    link: linkOptions({ to: '/profile/security' }),
  },
  {
    id: 'tools-atlas',
    title: 'Screen & Capability Atlas',
    description: 'Complete directory and functional cartography of all school screens',
    symbol: '🧭',
    section: 'Tools',
    link: linkOptions({ to: '/atlas' }),
  },
  {
    id: 'ai-tutii-dm',
    title: 'Tutii AI Companion',
    description: 'Direct mentor conversation with persistent memory and guidance',
    symbol: '✨',
    section: 'Tools',
    link: linkOptions({ to: '/community', search: { pillar: 'messages', dm: 'tutii' } }),
  },
  {
    id: 'ai-workspace',
    title: 'AI Workspace Floor',
    description: 'Multi-turn agent reasoning, tool proposals, and human-in-the-loop plans',
    symbol: '⚡',
    section: 'Tools',
    link: linkOptions({ to: '/community', search: { pillar: 'messages' } }),
  },
  {
    id: 'ai-incognito',
    title: 'Incognito AI Session',
    description: 'Zero-trace, non-persisted inquiry with instant ephemeral scratchpad',
    symbol: '🕶️',
    section: 'Tools',
    link: linkOptions({ to: '/community', search: { pillar: 'messages', mode: 'incognito' } }),
  },
  {
    id: 'tools-agent-lab',
    title: 'Agent Lab',
    description: 'Durable Agent scenario executions and runtime traces',
    symbol: '✦',
    section: 'Tools',
    link: linkOptions({ to: '/agent-lab' }),
  },
  {
    id: 'tools-icon-lab',
    title: 'Icon & Token Lab',
    description: 'Brand design tokens, icons, and APCA contrast inspector',
    symbol: '🎨',
    section: 'Tools',
    link: linkOptions({ to: '/icon-lab' }),
  },
  {
    id: 'admin-principal',
    title: 'Principal Command Center',
    description: 'Executive oversight, school census, faculty relief, and institutional policies',
    symbol: '🏛️',
    section: 'Admin',
    link: linkOptions({ to: '/admin/principal' }),
  },
  {
    id: 'admin-analytics',
    title: 'Institutional Analytics',
    description: 'Longitudinal attendance, cohort velocity, and academic performance telemetry',
    symbol: '📈',
    section: 'Admin',
    link: linkOptions({ to: '/admin/analytics' }),
  },
  {
    id: 'admin-documents',
    title: 'Circulars & Documents Management',
    description: 'Ministry regulations, circular archive, and school-wide documentation',
    symbol: '📁',
    section: 'Admin',
    link: linkOptions({ to: '/admin/documents' }),
  },
  {
    id: 'admin-founder',
    title: 'Founder Command Studio',
    description: 'System-level authority, platform governance, and architecture control',
    symbol: '👑',
    section: 'Admin',
    link: linkOptions({ to: '/admin/founder' }),
  },
  {
    id: 'admin-forms-builder',
    title: 'Form Builder & Surveys',
    description: 'Author custom institutional forms, student surveys, and consent requests',
    symbol: '📋',
    section: 'Admin',
    link: linkOptions({ to: '/admin/forms/builder' }),
  },
  {
    id: 'workspace-guardian',
    title: 'Guardian & Parent Portal',
    description: 'Ward attendance tracking, medical excuses, and school communications',
    symbol: '👨‍👩‍👧',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/guardian' }),
  },
  {
    id: 'workspace-tuition',
    title: 'Tuition & Fees Ledger',
    description: 'Student term fees, facilities dues, and receipt tracking',
    symbol: '💳',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/tuition' }),
  },
  {
    id: 'workspace-kiosk',
    title: 'Doorway Ingress Kiosk',
    description: 'Rapid barcode/QR badge scanner for morning school entry gates',
    symbol: '🚪',
    section: 'Tools',
    link: linkOptions({ to: '/workspace/kiosk' }),
  },
  {
    id: 'workspace-editorial',
    title: 'Editorial Commons',
    description: 'Pedagogical writings, essays, and faculty research journal',
    symbol: '📰',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/editorial' }),
  },
  {
    id: 'workspace-school',
    title: 'School Profile & Campus Grounds',
    description: 'School institutional identity, crest, history, and official leadership',
    symbol: '🏫',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/school' }),
  },
  {
    id: 'workspace-claim',
    title: 'Student Spot Claiming',
    description: 'Claim shadow student profiles and link provisional records to identity',
    symbol: '🎟️',
    section: 'Academic',
    link: linkOptions({ to: '/workspace/claim' }),
  },
  {
    id: 'community-forest',
    title: 'Community Forest & Circles',
    description: 'Open peer dialogue, collective wisdom, and regional educator circles',
    symbol: '🌳',
    section: 'Navigation',
    link: linkOptions({ to: '/community/forest' }),
  },
  {
    id: 'community-announcements',
    title: 'School Announcements',
    description: 'Broadcast notices, pastoral updates, and assembly announcements',
    symbol: '📣',
    section: 'Navigation',
    link: linkOptions({ to: '/community/announcements' }),
  },
  {
    id: 'account-profile',
    title: 'Profile & Bonds',
    description: 'Account settings, institutional bonds, and privacy',
    symbol: '◉',
    section: 'Account',
    link: linkOptions({ to: '/profile' }),
  },
  {
    id: 'account-settings',
    title: 'Comfort & Settings',
    description: 'Diurnal theme preferences, sensory comforts, and display sizing',
    symbol: '⚙',
    section: 'Account',
    link: linkOptions({ to: '/settings' }),
  },
] satisfies readonly Readonly<{
  id: string;
  title: string;
  description: string;
  symbol: string;
  section: CommandSection;
  link: { to: string; search?: Record<string, unknown>; params?: Record<string, unknown> };
}>[];

type CommandItem = (typeof commands)[number];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  /** The person's capacity: Workspace commands come only from its floor. */
  capacity?: string | null;
  /** In Explore mode, allow searching and test-driving all sandbox features. */
  isExplore?: boolean;
}

export function CommandPalette({
  isOpen,
  onClose,
  capacity,
  isExplore = false,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const filteredCommands = useMemo(() => {
    const list = commands.filter((cmd) => {
      if (!isExplore && !isOfferedTo(capacity, cmd.link.to)) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        cmd.title.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.section.toLowerCase().includes(q)
      );
    });

    const q = query.toLowerCase().trim();
    if (!q) return list;

    return [...list].sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aStarts = aTitle.startsWith(q);
      const bStarts = bTitle.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      const aIncludes = aTitle.includes(q);
      const bIncludes = bTitle.includes(q);
      if (aIncludes && !bIncludes) return -1;
      if (!aIncludes && bIncludes) return 1;
      return 0;
    });
  }, [capacity, isExplore, query]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[aria-selected="true"]`);
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSelectedIndex(0);
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      onClose();
      void router.navigate(cmd.link);
    },
    [onClose, router],
  );

  function handleKeyDown(event: ReactKeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (filteredCommands.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        executeCommand(selected);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sanctuary Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-line bg-sacred-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        style={{
          backgroundColor: 'var(--color-sacred-white, #fffdf8)',
          borderColor: 'var(--color-line, rgba(104, 94, 85, 0.2))',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-line"
          style={{ borderColor: 'var(--color-line, rgba(104, 94, 85, 0.15))' }}
        >
          <span className="text-ink-soft select-none font-mono text-base" aria-hidden="true">
            ⌘
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to floor..."
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={
              filteredCommands[selectedIndex]
                ? `cmd-${filteredCommands[selectedIndex].id}`
                : undefined
            }
            className="flex-1 bg-transparent border-0 outline-none text-ink text-sm placeholder:text-ink-soft/70 font-sans"
            style={{ color: 'var(--color-ink, #131e27)' }}
          />
          <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded border border-line text-ink-soft">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <ScrollArea orientation="vertical" style={{ height: '340px', maxHeight: '50vh' }} label="Available commands">
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            aria-label="Available commands"
            className="p-2 m-0 list-none space-y-1"
          >
          {filteredCommands.length === 0 ? (
            <li className="py-8 text-center text-xs text-ink-soft font-sans">
              No matching commands or floors found for &ldquo;{query}&rdquo;
            </li>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <li
                  id={`cmd-${cmd.id}`}
                  key={cmd.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-100/60 dark:bg-amber-900/30' : 'hover:bg-paper/60'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'rgba(168, 80, 34, 0.08)' : undefined,
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-sans shrink-0 border border-line/60"
                    style={{
                      borderColor: 'var(--color-line, rgba(104, 94, 85, 0.15))',
                      color: 'var(--color-action, #a85022)',
                    }}
                    aria-hidden="true"
                  >
                    {cmd.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold font-sans text-ink">{cmd.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded text-ink-soft border border-line/40">
                        {cmd.section}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-soft truncate m-0 font-sans">
                      {cmd.description}
                    </p>
                  </div>
                  {isSelected && (
                    <span
                      className="text-xs text-ink-soft font-mono select-none"
                      aria-hidden="true"
                    >
                      ↵
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
        </ScrollArea>

        {/* Footer shortcuts */}
        <div
          className="flex items-center justify-between px-4 py-2 border-t border-line text-[11px] text-ink-soft font-sans bg-paper/30"
          style={{ borderColor: 'var(--color-line, rgba(104, 94, 85, 0.12))' }}
        >
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> select
            </span>
            <span>
              <kbd className="font-mono">esc</kbd> close
            </span>
          </div>
          <span className="font-mono text-[10px]">Gurudevi Web 1.0</span>
        </div>
      </div>
    </div>
  );
}
