'use client';

import { storage } from '@repo/core/lib/storage';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useOfflineStatus } from '@repo/core/offline/resilience';
import { useCallback, useEffect, useState } from 'react';

export interface FeeRecord {
  id: string;
  studentName: string;
  grade: string;
  feeType: string;
  amount: number;
  grossAmount?: number;
  waiverAmount?: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'statutory_exempt';
  receiptNo?: string;
  paidAt?: string;
  concessionType?: 'statutory_aswesuma' | 'sibling_discount' | 'universal_free' | 'none';
  waiverReason?: string;
}

export interface TuitionBatch {
  id: string;
  subjectName: string;
  gradeLevel: string;
  medium: string;
  schedule: string;
  monthlyFee: number;
  activeStudents: number;
}

const DEFAULT_BATCHES: TuitionBatch[] = [
  {
    id: 'batch-10a-math',
    subjectName: 'Mathematics',
    gradeLevel: 'Grade 10-A',
    medium: 'Sinhala & English',
    schedule: 'Saturday 08:30 AM - 11:30 AM',
    monthlyFee: 12500,
    activeStudents: 42,
  },
  {
    id: 'batch-11a-science',
    subjectName: 'Science & Technology',
    gradeLevel: 'Grade 11-A',
    medium: 'English',
    schedule: 'Sunday 01:00 PM - 04:00 PM',
    monthlyFee: 14000,
    activeStudents: 38,
  },
];

const INITIAL_FEES: FeeRecord[] = [
  {
    id: 'fee-1',
    studentName: 'Amara Perera',
    grade: 'Grade 10-A',
    feeType: 'Term 1 Tuition & Learning Kit',
    amount: 12500,
    dueDate: '2026-10-15',
    status: 'paid',
    receiptNo: 'REC-2026-081',
    paidAt: '2026-10-01T09:30:00.000Z',
  },
  {
    id: 'fee-2',
    studentName: 'Kavi Fernando',
    grade: 'Grade 10-A',
    feeType: 'Science Laboratory & Practical Deposit',
    amount: 4500,
    dueDate: '2026-10-20',
    status: 'pending',
  },
  {
    id: 'fee-3',
    studentName: 'Mihiri Silva',
    grade: 'Grade 10-B',
    feeType: 'Term 1 Tuition & Learning Kit',
    amount: 12500,
    dueDate: '2026-09-30',
    status: 'overdue',
  },
  {
    id: 'fee-4',
    studentName: 'Nila Sen',
    grade: 'Grade 10-A',
    feeType: 'Term 1 Tuition & Learning Kit',
    amount: 12500,
    dueDate: '2026-10-15',
    status: 'paid',
    receiptNo: 'REC-2026-092',
    paidAt: '2026-10-03T11:15:00.000Z',
  },
  {
    id: 'fee-5',
    studentName: 'Ravi Das',
    grade: 'Grade 10-B',
    feeType: 'Library Security Deposit',
    amount: 2000,
    dueDate: '2026-10-25',
    status: 'pending',
  },
];

function getStorageKey(batchId: string): string {
  return `tuition:fees:${batchId}`;
}

export function loadDurableFees(batchId: string): FeeRecord[] {
  const key = getStorageKey(batchId);
  const raw = storage.getString(key);
  if (!raw) {
    storage.set(key, JSON.stringify(INITIAL_FEES));
    return INITIAL_FEES;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Fall back if corrupted
  }
  return INITIAL_FEES;
}

export function saveDurableFees(batchId: string, records: FeeRecord[]): void {
  storage.set(getStorageKey(batchId), JSON.stringify(records));
}

/**
 * useTuition
 *
 * Decoupled domain hook connecting UI to durable offline persistence,
 * optimistic updates, and the background mutation queue.
 */
export function useTuition(batchId = 'batch-10a-math') {
  const { isOffline, isOnline } = useOfflineStatus();
  const [fees, setFees] = useState<FeeRecord[]>(() => loadDurableFees(batchId));
  const [batches] = useState<TuitionBatch[]>(DEFAULT_BATCHES);
  const pendingCount = useMutationQueue(
    (s) => s.queue.filter((item) => item.scope === 'accounting').length,
  );

  useEffect(() => {
    setFees(loadDurableFees(batchId));
  }, [batchId]);

  const issueReceipt = useCallback(
    async (feeId: string, paymentMethod = 'Cash Counter'): Promise<FeeRecord> => {
      const nowIso = new Date().toISOString();
      const receiptNo = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;

      const current = loadDurableFees(batchId);
      const target = current.find((f) => f.id === feeId);
      if (!target) throw new Error('Fee record not found.');

      const updatedRecord: FeeRecord = {
        ...target,
        status: 'paid',
        receiptNo,
        paidAt: nowIso,
      };

      const updatedList = current.map((f) => (f.id === feeId ? updatedRecord : f));

      // 1. Persist to local durable storage immediately
      saveDurableFees(batchId, updatedList);
      setFees(updatedList);

      // 2. Register double-entry transaction with Hexagonal Domain Service
      try {
        const { tuitionHexagonalService } = await import(
          '../domain/adapters/tuition/tuitionHexagonalService'
        );
        await tuitionHexagonalService.issueReceipt({
          feeId,
          studentName: target.studentName,
          amount: target.amount,
          batchId,
          payerUserId: `student-${target.studentName.toLowerCase().replace(/\s+/g, '-')}`,
          feeType: target.feeType,
        });
      } catch {
        // Safe fallback in isolated environments
      }

      // 3. Enqueue into background mutation queue for synchronization
      await useMutationQueue.getState().addToQueue({
        name: 'issueTuitionReceipt',
        scope: 'accounting',
        variables: {
          feeId,
          batchId,
          receiptNo,
          amount: target.amount,
          studentName: target.studentName,
          paymentMethod,
          paidAt: nowIso,
        },
        type: 'CUSTOM',
      });

      return updatedRecord;
    },
    [batchId],
  );

  return {
    fees,
    batches,
    activeBatch: batches.find((b) => b.id === batchId) ?? batches[0],
    issueReceipt,
    isOffline,
    isOnline,
    pendingCount,
  };
}
