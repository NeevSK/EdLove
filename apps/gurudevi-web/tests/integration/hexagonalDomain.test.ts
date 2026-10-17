import { storage } from '@repo/core/lib/storage';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { beforeEach, describe, expect, it } from 'vitest';
import { academicHexagonalService } from '../../lib/domain/adapters/academic/academicHexagonalService';
import { tuitionHexagonalService } from '../../lib/domain/adapters/tuition/tuitionHexagonalService';

describe('Hexagonal Domain Integration: Tuition & Accounting', () => {
  beforeEach(() => {
    // Reset mutation queue
    useMutationQueue.setState({ queue: [], isSyncing: false });
  });

  it('loads canonical commercial tuition batches matching mobile CommercialPerspective', async () => {
    const batches = await tuitionHexagonalService.getBatches();
    expect(batches.length).toBeGreaterThanOrEqual(2);

    const mathBatch = batches.find((b) => b.id === 'batch-10a-math');
    expect(mathBatch).toBeDefined();
    expect(mathBatch?.kind).toBe('commercial');
    expect(mathBatch?.subjectName).toBe('Mathematics');
    expect(mathBatch?.grade).toBe('Grade 10');
    expect(mathBatch?.medium).toBe('sinhala');
    expect(mathBatch?.instituteName).toBe('Apex Institute Colombo');
  });

  it('issues fee receipt with balanced double-entry ledger entries adhering to @repo/accounting', async () => {
    const input = {
      feeId: 'fee-test-1',
      studentName: 'Amara Perera',
      amount: 12500,
      batchId: 'batch-10a-math',
      payerUserId: 'student-amara-perera',
      feeType: 'Term 1 Tuition',
    };

    const receipt = await tuitionHexagonalService.issueReceipt(input);
    expect(receipt.receiptNo).toMatch(/^REC-2026-\d{4}$/);
    expect(receipt.status).toBe('queued_offline');

    // Verify balanced double entry: Debits === Credits
    const tx = receipt.transaction;
    expect(tx.entries).toHaveLength(2);

    const debitEntry = tx.entries.find((e) => e.side === 'debit');
    const creditEntry = tx.entries.find((e) => e.side === 'credit');

    expect(debitEntry).toBeDefined();
    expect(creditEntry).toBeDefined();
    expect(debitEntry?.amount).toBe(12500);
    expect(creditEntry?.amount).toBe(12500);
    expect(debitEntry?.accountId).toBe('user:student-amara-perera:wallet');
    expect(creditEntry?.accountId).toBe('revenue:tuition_fees');

    // Verify durable storage persistence
    const cachedReceipts = tuitionHexagonalService.loadCachedReceipts();
    expect(cachedReceipts.some((r) => r.receiptNo === receipt.receiptNo)).toBe(true);

    // Verify mutation outbox queue
    const queue = useMutationQueue.getState().queue;
    const queuedItem = queue.find((item) => item.scope === 'accounting');
    expect(queuedItem).toBeDefined();
    expect(queuedItem?.name).toBe('accounting/record_fee_transaction');
  });

  it('computes batch metrics summary with total collected and attendance percentage', async () => {
    const summary = await tuitionHexagonalService.getBatchSummary('batch-10a-math');
    expect(summary.enrolledStudents).toBe(248);
    expect(summary.todayAttendancePercent).toBe(92);
    expect(summary.monthlyFeesPaidPercent).toBe(88);
    expect(summary.totalCollected).toBeGreaterThan(0);
  });
});

describe('Hexagonal Domain Integration: Academic & Classroom', () => {
  beforeEach(() => {
    useMutationQueue.setState({ queue: [], isSyncing: false });
  });

  it('loads canonical classroom assignments adhering to @repo/core schema', async () => {
    const assignments = await academicHexagonalService.getAssignments();
    expect(assignments.length).toBeGreaterThanOrEqual(3);

    const wetland = assignments.find((a) => a.id === 'asg-wetland-study');
    expect(wetland).toBeDefined();
    expect(wetland?.classroom_id).toBe('class-env-10');
    expect(wetland?.status).toBe('published');
    expect(wetland?.rubric?.maxMarks).toBe(100);
  });

  it('submits assignment work, persists locally, and enqueues to mutation queue under classroom scope', async () => {
    const input = {
      assignmentId: 'asg-wetland-study',
      studentId: 'stu-hiruni',
      studentName: 'Hiruni Silva',
      content: 'Field sampling observations at Muthurajawela marsh.',
    };

    const { submission, status } = await academicHexagonalService.submitAssignment(input);
    expect(submission.id).toMatch(/^sub-\d+/);
    expect(submission.assignment_id).toBe('asg-wetland-study');
    expect(submission.student_id).toBe('stu-hiruni');
    expect(status).toBe('queued_offline');

    // Verify local storage update
    const submissions = academicHexagonalService.loadCachedSubmissions();
    const found = submissions.find((s) => s.id === submission.id);
    expect(found).toBeDefined();
    expect(found?.status).toBe('pending_review');

    // Verify mutation queue
    const queue = useMutationQueue.getState().queue;
    const queuedItem = queue.find(
      (item) =>
        item.scope === 'classroom' && item.name === 'classroom/create_assignment_submission',
    );
    expect(queuedItem).toBeDefined();
  });

  it('grades submission with GPA and feedback, updating submission state and queuing to classroom outbox', async () => {
    const { submission } = await academicHexagonalService.submitAssignment({
      assignmentId: 'asg-thermo-problems',
      studentId: 'stu-sahan',
      content: 'Thermodynamics derivations.',
    });

    const gradeInput = {
      submissionId: submission.id,
      studentId: 'stu-sahan',
      classroomId: 'class-phy-11',
      assignmentId: 'asg-thermo-problems',
      marks: 88,
      letterGrade: 'A',
      feedback: 'Excellent reasoning and unit conversions.',
      gradedBy: 'teacher-kamal',
    };

    const { grade, status } = await academicHexagonalService.gradeSubmission(gradeInput);
    expect(grade.marks).toBe(88);
    expect(grade.grade).toBe('A');
    expect(grade.gpa).toBe(4.0);
    expect(grade.graded_by).toBe('teacher-kamal');
    expect(status).toBe('queued_offline');

    // Verify updated submission view
    const submissions = academicHexagonalService.loadCachedSubmissions();
    const updated = submissions.find((s) => s.id === submission.id);
    expect(updated?.status).toBe('graded');
    expect(updated?.grade).toBe('A');
    expect(updated?.marks).toBe(88);

    // Verify mutation queue has upsert_grade
    const queue = useMutationQueue.getState().queue;
    const gradeQueueItem = queue.find((item) => item.name === 'classroom/upsert_grade');
    expect(gradeQueueItem).toBeDefined();
  });
});
