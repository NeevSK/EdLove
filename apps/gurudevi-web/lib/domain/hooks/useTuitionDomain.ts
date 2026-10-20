'use client';

import { useOfflineStatus } from '@repo/core/offline/resilience';
import type { CommercialPerspective } from '@repo/core/types/Perspective';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue, useThrottledInvalidate } from '../../pacer/usePacer';
import {
  DEFAULT_CANONICAL_BATCHES,
  tuitionHexagonalService,
} from '../adapters/tuition/tuitionHexagonalService';
import type { FeeReceiptResult, TuitionBatchSummary } from '../ports/tuition.port';

export interface FeeViewModel {
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

const INITIAL_FEE_ROWS: FeeViewModel[] = [
  {
    id: 'fee-1',
    studentName: 'Amara Perera',
    grade: 'Grade 10-A',
    feeType: 'Term 1 Tuition & Learning Kit',
    amount: 12500,
    grossAmount: 12500,
    waiverAmount: 0,
    dueDate: '2026-10-15',
    status: 'paid',
    receiptNo: 'REC-2026-081',
    paidAt: '2026-10-05',
    concessionType: 'none',
  },
  {
    id: 'fee-2',
    studentName: 'Kasun Bandara',
    grade: 'Grade 10-A',
    feeType: 'School Facilities & SDS Fund',
    amount: 0,
    grossAmount: 3000,
    waiverAmount: 3000,
    dueDate: '2026-10-15',
    status: 'statutory_exempt',
    concessionType: 'statutory_aswesuma',
    waiverReason: 'Statutory Aswesuma Welfare Exemption (Circular ED/01/2018/36)',
  },
  {
    id: 'fee-3',
    studentName: 'Nimasha Fernando',
    grade: 'Grade 11-A',
    feeType: 'School Facilities & SDS Fund',
    amount: 2250,
    grossAmount: 3000,
    waiverAmount: 750,
    dueDate: '2026-10-12',
    status: 'pending',
    concessionType: 'sibling_discount',
    waiverReason: 'Sibling Concession (Child #2 - 25% Off)',
  },
  {
    id: 'fee-4',
    studentName: 'Tharindu Jayasuriya',
    grade: 'Grade 11-A',
    feeType: 'Senior Secondary Science Term Fee',
    amount: 14000,
    grossAmount: 14000,
    waiverAmount: 0,
    dueDate: '2026-10-20',
    status: 'pending',
    concessionType: 'none',
  },
  {
    id: 'fee-5',
    studentName: 'Kavi Wickramasinghe',
    grade: 'Grade 10-A',
    feeType: 'Universal Core Curriculum',
    amount: 0,
    grossAmount: 0,
    waiverAmount: 0,
    dueDate: '2026-10-30',
    status: 'paid',
    concessionType: 'universal_free',
    waiverReason: 'Universal Free Education (Default Zero Price)',
  },
];

const DEFAULT_SUMMARY: TuitionBatchSummary = {
  enrolledStudents: 248,
  todayAttendancePercent: 92,
  monthlyFeesPaidPercent: 88,
  totalCollected: 156250,
  pendingCount: 14,
};

export function useTuitionDomain() {
  const { isOnline } = useOfflineStatus();
  const [fees, setFees] = useState<FeeViewModel[]>(INITIAL_FEE_ROWS);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const throttledRefresh = useThrottledInvalidate(500);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('batch-10a-math');
  const [isProcessing, setIsProcessing] = useState(false);

  // TanStack Query: Batches catalog caching & revalidation
  const { data: batches = DEFAULT_CANONICAL_BATCHES } = useQuery({
    queryKey: ['tuition', 'batches'],
    queryFn: () => tuitionHexagonalService.getBatches(),
    initialData: DEFAULT_CANONICAL_BATCHES,
    staleTime: 60_000,
  });

  // TanStack Query: Cached receipts
  const { data: receipts = [] } = useQuery({
    queryKey: ['tuition', 'receipts'],
    queryFn: () => tuitionHexagonalService.loadCachedReceipts(),
    initialData: () => tuitionHexagonalService.loadCachedReceipts(),
    staleTime: 30_000,
  });

  // TanStack Query: Aggregate summary by batch
  const { data: summary = DEFAULT_SUMMARY } = useQuery({
    queryKey: ['tuition', 'summary', selectedBatchId],
    queryFn: () => tuitionHexagonalService.getBatchSummary(selectedBatchId),
    initialData: DEFAULT_SUMMARY,
    staleTime: 30_000,
  });

  const filteredFees = useMemo(() => {
    if (!debouncedSearch.trim()) return fees;
    const lower = debouncedSearch.toLowerCase();
    return fees.filter(
      (f) =>
        f.studentName.toLowerCase().includes(lower) ||
        f.feeType.toLowerCase().includes(lower) ||
        (f.receiptNo && f.receiptNo.toLowerCase().includes(lower)),
    );
  }, [fees, debouncedSearch]);

  const issueReceipt = useCallback(
    async (feeId: string) => {
      const targetFee = fees.find((f) => f.id === feeId);
      if (!targetFee) return null;

      setIsProcessing(true);
      try {
        const result = await tuitionHexagonalService.issueReceipt({
          feeId,
          studentName: targetFee.studentName,
          amount: targetFee.amount,
          batchId: selectedBatchId,
          payerUserId: `student-${targetFee.studentName.toLowerCase().replace(/\s+/g, '-')}`,
          feeType: targetFee.feeType,
        });

        // Optimistically update fee status in UI
        setFees((prev) =>
          prev.map((f) =>
            f.id === feeId
              ? {
                  ...f,
                  status: 'paid',
                  receiptNo: result.receiptNo,
                  paidAt: new Date().toISOString().split('T')[0],
                }
              : f,
          ),
        );

        // Throttle invalidation notification for background queries using TanStack Pacer
        void throttledRefresh(['tuition', 'summary', selectedBatchId]);
        void throttledRefresh(['tuition', 'receipts']);

        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [fees, selectedBatchId, throttledRefresh],
  );

  return {
    batches,
    fees,
    filteredFees,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    summary,
    receipts,
    selectedBatchId,
    setSelectedBatchId,
    issueReceipt,
    isProcessing,
    isOnline,
    throttledRefresh,
  };
}
