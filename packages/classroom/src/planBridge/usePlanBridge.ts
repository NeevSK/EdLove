import {
  type CreatePlanEventInput,
  planBridgeAPI,
  type ScheduleNoticeInput,
} from '@repo/core/api/planBridge';
import { useStore } from '@repo/core/store/useStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const planBridgeKeys = {
  all: ['planBridge'] as const,
  classes: () => [...planBridgeKeys.all, 'gradeClasses'] as const,
  settings: () => [...planBridgeKeys.all, 'settings'] as const,
  events: (gradeClassId: string | null) => [...planBridgeKeys.all, 'events', gradeClassId] as const,
  notices: (gradeClassId: string | null) =>
    [...planBridgeKeys.all, 'notices', gradeClassId] as const,
};

/** Data + actions for the plan > compose > schedule flow of one grade class. */
/**
 * @param selectedGradeClassId the class the user picked; falls back to the first
 *   class they can plan for, so the screen never needs an effect to pick one.
 */
export function usePlanBridge(selectedGradeClassId: string | null) {
  const queryClient = useQueryClient();
  const isOnline = useStore((state) => state.isOnline);
  const enabled = isOnline !== false;

  const gradeClasses = useQuery({
    queryKey: planBridgeKeys.classes(),
    queryFn: () => planBridgeAPI.listMyGradeClasses(),
    enabled,
    staleTime: 5 * 60_000,
  });
  const gradeClassId = selectedGradeClassId ?? gradeClasses.data?.[0]?.id ?? null;
  const settings = useQuery({
    queryKey: planBridgeKeys.settings(),
    queryFn: () => planBridgeAPI.getSettings(),
    enabled,
    staleTime: 5 * 60_000,
  });
  const events = useQuery({
    queryKey: planBridgeKeys.events(gradeClassId),
    queryFn: () => planBridgeAPI.listEvents(gradeClassId ? { gradeClassId } : {}),
    enabled: enabled && !!gradeClassId,
  });
  const notices = useQuery({
    queryKey: planBridgeKeys.notices(gradeClassId),
    queryFn: () => planBridgeAPI.listNotices(gradeClassId ? { gradeClassId } : {}),
    enabled: enabled && !!gradeClassId,
    refetchInterval: 60_000,
  });

  const refreshPlan = () => queryClient.invalidateQueries({ queryKey: planBridgeKeys.all });

  const createEvent = useMutation({
    mutationFn: (input: CreatePlanEventInput) => planBridgeAPI.createEvent(input as any),
    onSuccess: refreshPlan,
  });
  const preview = useMutation({
    mutationFn: (input: { gradeClassId: string; sendAt?: string | null }) =>
      planBridgeAPI.previewNotice(input),
  });
  const schedule = useMutation({
    mutationFn: (input: ScheduleNoticeInput) => planBridgeAPI.scheduleNotice(input as any),
    onSuccess: refreshPlan,
  });
  const cancel = useMutation({
    mutationFn: (noticeId: string) => planBridgeAPI.cancelNotice(noticeId),
    onSuccess: refreshPlan,
  });
  const updateQuietHours = useMutation({
    mutationFn: (input: { start: string; end: string; lock?: 'locked' | 'suggested' | 'off' }) =>
      planBridgeAPI.updateQuietHours(input),
    onSuccess: refreshPlan,
  });

  return {
    gradeClassId,
    isOffline: isOnline === false,
    gradeClasses,
    settings,
    events,
    notices,
    createEvent,
    preview,
    schedule,
    cancel,
    updateQuietHours,
  };
}
