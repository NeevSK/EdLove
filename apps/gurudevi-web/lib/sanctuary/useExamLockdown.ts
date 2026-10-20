'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * In-Browser Exam & Quiz Lockdown Sentinel
 *
 * Implements strict examination and laboratory focus invariants:
 * 1. Fullscreen mode request and exit interception.
 * 2. Window blur and tab switch tracking via visibilitychange.
 * 3. Quarantine of clipboard events (copy, cut, paste, contextmenu).
 * 4. Audit warning counter and violation logging.
 */

export interface ExamViolation {
  id: string;
  type: 'blur' | 'visibility_hidden' | 'fullscreen_exit' | 'clipboard_attempt';
  timestamp: string;
  details?: string;
}

export interface UseExamLockdownOptions {
  enabled?: boolean;
  maxWarnings?: number;
  onWarningThresholdReached?: (violations: ExamViolation[]) => void;
  onViolation?: (violation: ExamViolation) => void;
}

export interface ExamLockdownState {
  isFullscreen: boolean;
  isLockedDown: boolean;
  warningCount: number;
  violations: ExamViolation[];
  enterFullscreen: () => Promise<void>;
  resetViolations: () => void;
}

export function useExamLockdown({
  enabled = true,
  maxWarnings = 3,
  onWarningThresholdReached,
  onViolation,
}: UseExamLockdownOptions = {}): ExamLockdownState {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState<ExamViolation[]>([]);
  const violationsRef = useRef<ExamViolation[]>([]);
  violationsRef.current = violations;

  const recordViolation = useCallback(
    (type: ExamViolation['type'], details?: string) => {
      if (!enabled) return;
      const violation: ExamViolation = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        type,
        timestamp: new Date().toISOString(),
        details,
      };

      const updated = [...violationsRef.current, violation];
      violationsRef.current = updated;
      setViolations(updated);
      onViolation?.(violation);

      if (updated.length >= maxWarnings) {
        onWarningThresholdReached?.(updated);
      }
    },
    [enabled, maxWarnings, onViolation, onWarningThresholdReached],
  );

  const enterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('[EXAM SENTINEL] Fullscreen request rejected or unavailable:', err);
    }
  }, []);

  const resetViolations = useCallback(() => {
    violationsRef.current = [];
    setViolations([]);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Fullscreen state tracking
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) {
        recordViolation('fullscreen_exit', 'User exited browser fullscreen mode during active exam');
      }
    };

    // 2. Tab switch & visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('visibility_hidden', 'Document visibility changed to hidden (switched tabs or minimized)');
      }
    };

    // 3. Window blur (clicking outside the window or alt-tabbing)
    const handleWindowBlur = () => {
      recordViolation('blur', 'Window lost focus (alt-tab or external app opened)');
    };

    // 4. Clipboard quarantine
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('clipboard_attempt', 'Attempted to copy exam content to clipboard');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('clipboard_attempt', 'Attempted to cut exam content');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('clipboard_attempt', 'Attempted to paste external content into exam field');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled, recordViolation]);

  return {
    isFullscreen,
    isLockedDown: enabled,
    warningCount: violations.length,
    violations,
    enterFullscreen,
    resetViolations,
  };
}
