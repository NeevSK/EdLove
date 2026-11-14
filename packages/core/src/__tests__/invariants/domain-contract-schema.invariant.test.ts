import {
  buildAccrualInvoiceJournal,
  buildCashSettlementJournal,
  resolveNetStudentFee,
} from '@repo/core/logic/billing/feeExemptionEngine';
import type { ChargeableSchedule, Household } from '@repo/core/types/EducationalEconomics';
import { describe, expect, it } from 'vitest';

describe('Economics balancing invariants', () => {
  describe('Educational Economics & Double-Entry Zero Phantom Debt Invariant', () => {
    const standardFeeSchedule: ChargeableSchedule = {
      id: 'sched-term-1',
      title: 'Term 1 Tuition & Facilities',
      amountCents: 500000, // 5,000 LKR
      scopeType: 'term',
      exemptionsAllowed: {
        aswesumaWaived: true,
        siblingDiscount: true,
        universalFree: false,
      },
    };

    const aswesumaHousehold: Household = {
      id: 'hh-poor-01',
      primaryGuardianId: 'guardian-1',
      welfareProfile: {
        program: 'aswesuma',
        aswesumaTier: 'poor',
        status: 'active',
        expiresAt: '2028-12-31',
      },
      wards: [
        {
          userId: 'student-1',
          dateOfBirth: '2015-05-10',
          isActiveSchoolStudent: true,
        },
      ],
    };

    it('fully waives tuition for active Aswesuma poor household with zero student payable', () => {
      const calculation = resolveNetStudentFee({
        schedule: standardFeeSchedule,
        studentUserId: 'student-1',
        household: aswesumaHousehold,
        assessmentDate: '2026-10-10',
      });

      expect(calculation.isFullyExempt).toBe(true);
      expect(calculation.netPayableCents).toBe(0);
      expect(calculation.waiverAmountCents).toBe(500000);
      expect(calculation.concessionType).toBe('statutory_aswesuma');
    });

    it('produces balanced double-entry accrual invoice with Debit = Credit', () => {
      const calculation = resolveNetStudentFee({
        schedule: standardFeeSchedule,
        studentUserId: 'student-1',
        household: aswesumaHousehold,
        assessmentDate: '2026-10-10',
      });

      const journal = buildAccrualInvoiceJournal(calculation, {
        invoiceId: 'inv-test-001',
        description: 'Term 1 Assessment',
      });

      const debits = journal.entries
        .filter((e) => e.side === 'debit')
        .reduce((sum, e) => sum + e.amountCents, 0);

      const credits = journal.entries
        .filter((e) => e.side === 'credit')
        .reduce((sum, e) => sum + e.amountCents, 0);

      expect(debits).toBe(credits);
      expect(debits).toBe(500000);
      expect(journal.netStudentReceivableCents).toBe(0);
      expect(journal.subsidyCoveredCents).toBe(500000);
    });

    it('produces balanced cash settlement journal upon payment collection', () => {
      const payingCalculation = resolveNetStudentFee({
        schedule: standardFeeSchedule,
        studentUserId: 'student-regular',
        household: null, // Full fee
        assessmentDate: '2026-10-10',
      });

      expect(payingCalculation.netPayableCents).toBe(500000);

      const cashJournal = buildCashSettlementJournal(payingCalculation, {
        studentUserId: 'student-regular',
        payerUserId: 'parent-99',
        invoiceId: 'inv-paying-001',
        paymentMethod: 'bank_transfer',
      });

      const debits = cashJournal.entries
        .filter((e) => e.side === 'debit')
        .reduce((sum, e) => sum + e.amountCents, 0);

      const credits = cashJournal.entries
        .filter((e) => e.side === 'credit')
        .reduce((sum, e) => sum + e.amountCents, 0);

      expect(debits).toBe(credits);
      expect(debits).toBe(500000);
      expect(cashJournal.amountSettledCents).toBe(500000);
    });
  });
});
