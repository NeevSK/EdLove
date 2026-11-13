import { ScrollArea } from '@repo/ui/components/web';
import { linkOptions, useRouter } from '@tanstack/react-router';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { isOfferedTo } from '../workspace/workspaceFeatureRegistry';

type CommandSection = 'Navigation' | 'Academic' | 'Tools' | 'Account';

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
    id: 'account-profile',
    title: 'Profile & Bonds',
    description: 'Account settings, institutional bonds, and privacy',
    symbol: '◉',
    section: 'Account',
    link: linkOptions({ to: '/profile' }),
  },
] satisfies readonly Readonly<{
  id: string;
  title: string;
  description: string;
  symbol: string;
  section: CommandSection;
  link: { to: string };
}>[];

type CommandItem = (typeof commands)[number];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  /** The person's capacity: Workspace commands come only from its floor. */
  capacity?: string | null;
}

export function CommandPalette({
  isOpen,
  onClose,
  capacity,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const filteredCommands = commands.filter((cmd) => {
    if (!isOfferedTo(capacity, cmd.link.to)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.section.toLowerCase().includes(q)
    );
  });

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
