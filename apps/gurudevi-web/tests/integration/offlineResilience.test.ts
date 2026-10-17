import { storage } from '@repo/core/lib/storage';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadDurableSubmissions,
  saveDurableSubmissions,
} from '@/lib/repositories/academicSubmissionsRepository';
import {
  loadDurableClimate,
  saveDurableClimate,
} from '@/lib/repositories/climateSensingRepository';
import { loadDurableChat, saveDurableChat } from '@/lib/repositories/communityChatRepository';
import { loadDurableFees, saveDurableFees } from '@/lib/repositories/tuitionRepository';

describe('Offline Resilience & Hexagonal Repositories Integration', () => {
  beforeEach(() => {
    storage.clearAll();
    useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
  });

  describe('Tuition Repository (Accounting / Payments Domain)', () => {
    it('seeds and loads durable tuition records when storage is empty', () => {
      const records = loadDurableFees('acct-test-1');
      expect(records.length).toBeGreaterThan(0);
      expect(records[0]?.studentName).toBe('Amara Perera');
    });

    it('persists and recovers modified tuition records', () => {
      const initial = loadDurableFees('acct-test-1');
      const updated = initial.map((rec) =>
        rec.id === 'fee-1' ? { ...rec, status: 'paid' as const } : rec,
      );
      saveDurableFees('acct-test-1', updated);

      const recovered = loadDurableFees('acct-test-1');
      expect(recovered.find((r) => r.id === 'fee-1')?.status).toBe('paid');
    });

    it('enqueues payment receipt issuance into mutation queue under accounting scope', async () => {
      const mockInvoice = {
        invoiceId: 'inv-offline-99',
        studentName: 'Amara Perera',
        amount: 45000,
        currency: 'LKR',
        term: 'Term 3 (2026)',
        issuedAt: new Date().toISOString(),
      };

      await useMutationQueue.getState().addToQueue({
        name: 'issueTuitionReceipt',
        scope: 'accounting',
        variables: mockInvoice,
        type: 'CUSTOM',
      });

      const queue = useMutationQueue.getState().queue;
      expect(queue.length).toBe(1);
      expect(queue[0]?.scope).toBe('accounting');
      expect(queue[0]?.name).toBe('issueTuitionReceipt');
      expect(queue[0]?.variables).toEqual(mockInvoice);
    });
  });

  describe('Academic Submissions Repository (Classroom Domain)', () => {
    it('persists and restores student submissions durably without network', () => {
      const initial = loadDurableSubmissions('class-10a');
      expect(initial.length).toBeGreaterThan(0);

      const newSubmission = {
        id: 'sub-test-offline-1',
        studentName: 'Test Student',
        rollNo: 'STD-1099',
        assignmentTitle: 'Wetland Ecology & Botanical Field Study',
        assignmentId: 'asg-1',
        submittedAt: 'Just now',
        status: 'pending_review' as const,
        fileName: 'Test_Submission.pdf',
        fileSize: '1.2 MB',
      };

      saveDurableSubmissions('class-10a', [newSubmission, ...initial]);

      const restored = loadDurableSubmissions('class-10a');
      expect(restored.length).toBe(initial.length + 1);
      expect(restored[0]?.id).toBe('sub-test-offline-1');
    });

    it('enqueues assignment submissions into mutation queue under classroom scope', async () => {
      await useMutationQueue.getState().addToQueue({
        name: 'submitAssignment',
        scope: 'classroom',
        variables: {
          classroomId: 'class-10a',
          assignmentId: 'asg-1',
          studentName: 'Nila Sen',
          fileName: 'ecology_report.pdf',
        },
        type: 'CUSTOM',
      });

      const queue = useMutationQueue.getState().queue;
      const classroomItems = queue.filter((item) => item.scope === 'classroom');
      expect(classroomItems.length).toBe(1);
      expect(classroomItems[0]?.name).toBe('submitAssignment');
    });
  });

  describe('Climate Sensing Repository (Classroom Reflection Domain)', () => {
    it('persists anonymous Likert climate ratings and updates rolling metrics', () => {
      const data = loadDurableClimate('class-10a');
      expect(data.metrics.psychologicalSafety).toBeDefined();

      const customData = {
        metrics: {
          psychologicalSafety: 4.8,
          academicPacing: 4.0,
          peerBelonging: 4.9,
          teacherWarmth: 5.0,
          cognitiveChallenge: 4.2,
        },
        history: [
          {
            id: 'climate-1',
            metrics: {
              psychologicalSafety: 4.8,
              academicPacing: 4.0,
              peerBelonging: 4.9,
              teacherWarmth: 5.0,
              cognitiveChallenge: 4.2,
            },
            submittedAt: new Date().toISOString(),
          },
        ],
      };

      saveDurableClimate('class-10a', customData);
      const reloaded = loadDurableClimate('class-10a');
      expect(reloaded.metrics.psychologicalSafety).toBe(4.8);
      expect(reloaded.history.length).toBe(1);
    });

    it('enqueues climate sensing pulse to mutation queue without network', async () => {
      await useMutationQueue.getState().addToQueue({
        name: 'submitClimateSensing',
        scope: 'classroom',
        variables: {
          classroomId: 'class-10a',
          ratings: {
            psychologicalSafety: 5,
            academicPacing: 4,
            peerBelonging: 5,
            teacherWarmth: 5,
            cognitiveChallenge: 4,
          },
        },
        type: 'CUSTOM',
      });

      const queue = useMutationQueue.getState().queue;
      expect(queue.some((i) => i.name === 'submitClimateSensing')).toBe(true);
    });
  });

  describe('Community Chat Repository (Community Domain)', () => {
    it('persists message threads locally across reloads', () => {
      const initial = loadDurableChat('class-10a');
      expect(initial.length).toBeGreaterThan(0);

      const customMsg = {
        id: 'msg-local-1',
        senderName: 'Amara Perera',
        senderInitials: 'AP',
        text: 'Persisted offline test message',
        time: '12:00 PM',
        isSelf: true,
        status: 'pending_sync' as const,
      };

      saveDurableChat('class-10a', [...initial, customMsg]);
      const reloaded = loadDurableChat('class-10a');
      expect(reloaded.some((m) => m.id === 'msg-local-1')).toBe(true);
    });

    it('enqueues offline chat messages with community scope in mutation queue', async () => {
      await useMutationQueue.getState().addToQueue({
        name: 'sendChatMessage',
        scope: 'community',
        variables: {
          threadId: 'class-10a',
          messageId: 'msg-offline-1',
          text: 'Hello from offline mode',
        },
        type: 'CUSTOM',
      });

      const queue = useMutationQueue.getState().queue;
      const communityItems = queue.filter((i) => i.scope === 'community');
      expect(communityItems.length).toBe(1);
      expect(communityItems[0]?.name).toBe('sendChatMessage');
    });
  });
});
