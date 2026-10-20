'use client';

import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { QuickAccessItem } from '../../(sanctuary)/components/workbench/QuickAccessRail';
import { QuickAccessRail } from '../../(sanctuary)/components/workbench/QuickAccessRail';
import { TaskStrip } from '../../(sanctuary)/components/workbench/TaskStrip';
import styles from './prototype.module.css';

const features: readonly QuickAccessItem[] = [
  { id: 'fire_journal', label: 'Fire Journal', emoji: '🔥' },
  { id: 'breath_guide', label: 'Breathing', emoji: '🌬️' },
  { id: 'attendance', label: 'Attendance', emoji: '🗓️' },
  { id: 'ideas', label: 'Ideas', emoji: '🌱' },
];

type Placement = 'beside-menu' | 'right-side' | 'top' | 'bottom';
const placements: readonly Placement[] = ['top', 'bottom', 'beside-menu', 'right-side'];
const placementQueryValues: Readonly<Record<Placement, string>> = {
  'beside-menu': '1',
  'right-side': '2',
  top: '3',
  bottom: '4',
};

function createTask(item: QuickAccessItem): WorkbenchTaskDescriptor {
  const now = new Date().toISOString();
  return {
    domain: 'self',
    featureId: item.id,
    route: '/self',
    title: item.label,
    icon: item.emoji,
    temporalBinding: { kind: 'follow-domain' },
    localStatePolicy: 'restore-permitted',
    taskKey: 'self:' + item.id,
    openedAt: now,
    lastFocusedAt: now,
  };
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

export default function SelfQuickAccessPrototypePage() {
  const [placement, setPlacement] = useState<Placement>('top');
  const [ready, setReady] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<readonly string[]>(['fire_journal', 'breath_guide']);
  const [tasks, setTasks] = useState<readonly WorkbenchTaskDescriptor[]>([]);
  const [focusedTaskKey, setFocusedTaskKey] = useState<string | null>(null);
  const [overviewActive, setOverviewActive] = useState(true);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const activeIndex = placements.indexOf(placement);

  const updateUrl = useCallback((next: Placement) => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', placementQueryValues[next]);
    window.history.replaceState(null, '', url);
  }, []);

  const switchPlacement = useCallback(
    (next: Placement) => {
      setPlacement(next);
      updateUrl(next);
    },
    [updateUrl],
  );

  useEffect(() => {
    const variant = new URLSearchParams(window.location.search).get('v');
    const legacyPlacement: Readonly<Record<string, Placement>> = {
      '1': 'beside-menu',
      '2': 'right-side',
      '3': 'top',
      '4': 'bottom',
    };
    setPlacement(variant ? legacyPlacement[variant] ?? 'top' : 'top');
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  }, []);

  useEffect(() => {
    const active = itemRefs.current[activeIndex];
    if (!active || !highlightRef.current) return;
    highlightRef.current.style.width = active.offsetWidth + 'px';
    highlightRef.current.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  }, [activeIndex, ready]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      if (event.key === '1') switchPlacement('top');
      else if (event.key === '2') switchPlacement('bottom');
      else if (event.key === '3') switchPlacement('beside-menu');
      else if (event.key === '4') switchPlacement('right-side');
      else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const nextIndex = (placements.indexOf(placement) + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
        switchPlacement(placements[nextIndex] ?? 'top');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [placement, switchPlacement]);

  const activeTask = useMemo(
    () => tasks.find((task) => task.taskKey === focusedTaskKey) ?? null,
    [focusedTaskKey, tasks],
  );

  function openFeature(item: QuickAccessItem) {
    const existing = tasks.find((task) => task.featureId === item.id);
    const task = existing ?? createTask(item);
    if (!existing) setTasks((current) => [task, ...current]);
    setFocusedTaskKey(task.taskKey);
    setOverviewActive(false);
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const remaining = tasks.filter((candidate) => candidate.taskKey !== task.taskKey);
    setTasks(remaining);
    if (focusedTaskKey === task.taskKey) {
      const next = remaining.at(-1);
      setFocusedTaskKey(next?.taskKey ?? null);
      setOverviewActive(!next);
    }
  }

  function togglePin(id: string) {
    setPinnedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 5
          ? [...current, id]
          : current,
    );
  }

  const rail = (
    <QuickAccessRail
      activeId={activeTask?.featureId}
      domain="self"
      editorPlacement={placement === 'right-side' ? 'left' : 'right'}
      items={features}
      onOpen={openFeature}
      onTogglePin={togglePin}
      pinnedIds={pinnedIds}
      orientation={placement === 'top' || placement === 'bottom' ? 'horizontal' : 'vertical'}
      visible
    />
  );

  return (
    <main className={styles.prototypePage}>
      <header className={styles.pageHeading}>
        <span>Gurudevi · Self</span>
        <h1>Quick access placement</h1>
        <p>Choose a shortcut to open or focus its task tab. Pin and unpin tools with ＋.</p>
      </header>
      <div
        className={`${styles.appFrame} ${placement === 'right-side' ? styles.rightSide : ''} ${placement === 'top' ? styles.topPlacement : ''} ${placement === 'bottom' ? styles.bottomPlacement : ''}`}
      >
        <aside aria-label="Main menu" className={styles.mainRail}>
          <div aria-label="Gurudevi" className={styles.lotus}>
            🪷
          </div>
          <span aria-current="page">🏠</span>
          <span>👥</span>
          <span>📚</span>
          <span>💬</span>
        </aside>
        {placement === 'beside-menu' ? <div className={styles.contextRail}>{rail}</div> : null}
        <section className={styles.workArea}>
          <div className={styles.greeting}>
            <div>
              <p>Good morning, Maya</p>
              <span>A calm day builds a meaningful week.</span>
            </div>
            <button type="button" className={styles.dateButton}>
              🗓️ Mon, Oct 12
            </button>
          </div>
          {placement === 'top' ? <div className={styles.shortcutTopBar}>{rail}</div> : null}
          <TaskStrip
            focusedTaskKey={focusedTaskKey}
            onCloseTask={closeTask}
            onFocusTask={(task) => {
              setFocusedTaskKey(task.taskKey);
              setOverviewActive(false);
            }}
            onReorderTask={(taskKey, destinationIndex) => {
              setTasks((current) => {
                const sourceIndex = current.findIndex((task) => task.taskKey === taskKey);
                if (sourceIndex < 0 || destinationIndex < 0 || destinationIndex >= current.length) {
                  return current;
                }
                const next = [...current];
                const [task] = next.splice(sourceIndex, 1);
                if (!task) return current;
                next.splice(destinationIndex, 0, task);
                return next;
              });
            }}
            onOpenOverview={() => setOverviewActive(true)}
            overviewActive={overviewActive}
            tasks={tasks}
          />
          <div className={styles.content}>
            {overviewActive ? (
              <>
                <p className={styles.eyebrow}>MONDAY · OCTOBER 12</p>
                <h2>Make room for what matters.</h2>
                <p className={styles.intro}>
                  Your Home stays here as the coordination point. Open a shortcut to give the task
                  its own tab.
                </p>
                <div className={styles.cards}>
                  <article>
                    <span>🌿</span>
                    <h3>Step outside</h3>
                    <p>Notice one small change in the garden.</p>
                  </article>
                  <article>
                    <span>📖</span>
                    <h3>Read together</h3>
                    <p>Choose a story to share at your own pace.</p>
                  </article>
                </div>
              </>
            ) : (
              <div className={styles.taskPreview}>
                <span>{activeTask?.icon}</span>
                <p className={styles.eyebrow}>TASK TAB · OPEN</p>
                <h2>{activeTask?.title}</h2>
                <p>This shortcut focused or opened a task tab. Home remains available beside it.</p>
                <button type="button" onClick={() => setOverviewActive(true)}>
                  Return to Home
                </button>
              </div>
            )}
          </div>
          {placement === 'bottom' ? <div className={styles.shortcutBottomBar}>{rail}</div> : null}
        </section>
        {placement === 'right-side' || placement === 'beside-menu' ? (
          <div className={styles.contextRail}>{rail}</div>
        ) : null}
      </div>
      <nav
        aria-label="Prototype variants"
        className={styles.protoPicker}
        data-ready={ready || undefined}
      >
        <span className={styles.protoPickerHighlight} ref={highlightRef} aria-hidden="true" />
        {placements.map((value, index) => (
          <button
            aria-current={placement === value ? 'true' : undefined}
            className={styles.protoPickerItem}
            data-active={placement === value ? '' : undefined}
            key={value}
            onClick={() => switchPlacement(value)}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
          >
            {value === 'top' ? 'Top bar' : value === 'bottom' ? 'Bottom bar' : value === 'beside-menu' ? 'Left rail' : 'Right rail'}
          </button>
        ))}
      </nav>
    </main>
  );
}
