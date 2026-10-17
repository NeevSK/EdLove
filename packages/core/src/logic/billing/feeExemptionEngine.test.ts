import { describe, expect, it } from 'vitest';
import type {
  ChargeableSchedule,
  Household,
  RegulatoryNotice,
} from '../../types/EducationalEconomics';
import {
  buildAccrualInvoiceJournal,
  buildCashSettlementJournal,
  buildSettlementJournal,
  deriveDeterministicSiblingIndex,
  resolveNetStudentFee,
} from './feeExemptionEngine';

describe('Hardened Bitemporal Fee Exemption Engine & Regulatory Scenarios (G1 Contracts)', () => {
  const publicSchoolSdsSchedule: ChargeableSchedule = {
    id: 'sched-sds-2026',
    title: 'School Development Society (SDS) Annual Facilities Fund',
    scopeType: 'school',
    scopeId: 'school-ananda-colombo',
    amountCents: 300000, // Rs. 3,000.00
    amount: 3000,
    currency: 'LKR',
    frequency: 'annual',
    isMandatory: true,
    regulatoryNoticeId: 'circ-moe-2018-36',
    exemptionsAllowed: {
      aswesumaWaived: true,
      clergyWaived: true,
      scholarshipWaived: true,
      siblingDiscountsEnabled: true,
    },
    splitRules: {
      secondChildDiscountPercent: 25,
      thirdChildDiscountPercent: 50,
    },
  };

  const moeCircularNotice: RegulatoryNotice = {
    id: 'circ-moe-2018-36',
    referenceNo: 'ED/01/2018/36',
    authority: 'ministry_of_education',
    category: 'fee_cap',
    title: 'Collection of School Facilities & SDS Fees in Government Schools',
    effectiveFrom: '2018-01-01',
    statutoryFeeCapCents: 350000, // Rs. 3,500.00 ceiling
    rules: {
      maxFeeCapLkr: 3500,
      mandatoryExemptionPrograms: ['aswesuma', 'samurdhi'],
      mandatoryExemptionTiers: ['severely_poor', 'poor'],
    },
  };

  const strictCappedCircularNotice: RegulatoryNotice = {
    id: 'circ-moe-cap-2026',
    referenceNo: 'ED/05/2026/02',
    authority: 'ministry_of_education',
    category: 'fee_cap',
    title: 'Mandatory Statutory Cap on Extracurricular Sports Facilities Fees',
    effectiveFrom: '2026-01-01',
    statutoryFeeCapCents: 200000, // Rs. 2,000.00 hard statutory cap
    rules: {
      maxFeeCapLkr: 2000,
    },
  };

  const commercialTuitionSchedule: ChargeableSchedule = {
    id: 'sched-math-masterclass',
    title: 'Pure Mathematics Grade 12 Weekend Masterclass',
    scopeType: 'classroom',
    scopeId: 'class-math-apex',
    amountCents: 1250000, // Rs. 12,500.00
    amount: 12500,
    currency: 'LKR',
    frequency: 'monthly',
    isMandatory: true,
    exemptionsAllowed: {
      aswesumaWaived: false,
      clergyWaived: true,
      scholarshipWaived: true,
      siblingDiscountsEnabled: true,
    },
    splitRules: {
      tutorPercent: 75,
      institutePercent: 25,
      secondChildDiscountPercent: 20,
      thirdChildDiscountPercent: 40,
    },
  };

  describe('Universal Free Education Baseline', () => {
    it('defaults zero-price classroom schedules to 100% free with zero net payable', () => {
      const freeClassSchedule: ChargeableSchedule = {
        id: 'sched-grade-10a-history',
        title: 'Grade 10-A Sri Lankan & World History',
        scopeType: 'classroom',
        scopeId: 'class-history-10a',
        amountCents: 0,
        amount: 0,
        currency: 'LKR',
        frequency: 'none',
        isMandatory: false,
        exemptionsAllowed: {
          aswesumaWaived: true,
          clergyWaived: true,
          scholarshipWaived: true,
          siblingDiscountsEnabled: false,
        },
      };

      const result = resolveNetStudentFee({
        schedule: freeClassSchedule,
        studentUserId: 'stu-kasun-01',
      });

      expect(result.grossAmountCents).toBe(0);
      expect(result.netPayableCents).toBe(0);
      expect(result.isFullyExempt).toBe(true);
      expect(result.concessionType).toBe('universal_free');
    });
  });

  describe('MOE Gazette Statutory Fee Cap Clamping', () => {
    it('actively clamps gross fee when schedule exceeds statutory fee cap', () => {
      const overpricedActivitySchedule: ChargeableSchedule = {
        id: 'sched-sports-pool',
        title: 'School Swimming Pool & Sports Maintenance Levy',
        scopeType: 'activity',
        scopeId: 'act-swimming-pool',
        amountCents: 500000, // Rs. 5,000.00 (configured higher than gazette cap)
        amount: 5000,
        currency: 'LKR',
        frequency: 'annual',
        isMandatory: true,
        exemptionsAllowed: {
          aswesumaWaived: true,
          clergyWaived: true,
          scholarshipWaived: true,
          siblingDiscountsEnabled: true,
        },
      };

      const result = resolveNetStudentFee({
        schedule: overpricedActivitySchedule,
        studentUserId: 'stu-sports-01',
        regulatoryNotice: strictCappedCircularNotice, // Capped at Rs. 2,000.00
      });

      // Clamped to Rs. 2,000.00 (200000 cents)
      expect(result.statutoryCapApplied).toBe(true);
      expect(result.effectiveCapCents).toBe(200000);
      expect(result.grossAmountCents).toBe(200000);
      expect(result.grossAmount).toBe(2000);
      expect(result.netPayableCents).toBe(200000);
    });
  });

  describe('Deterministic Sibling Index Derivation', () => {
    const verifiedHousehold: Household = {
      id: 'hh-chronological-family',
      name: 'Chronological Family',
      headUserId: 'parent-chrono',
      createdAt: '2026-01-01',
      wards: [
        {
          studentUserId: 'child-middle',
          studentName: 'Middle Child',
          dateOfBirth: '2014-06-15',
          isActiveSchoolStudent: true,
        },
        {
          studentUserId: 'child-youngest',
          studentName: 'Youngest Child',
          dateOfBirth: '2018-09-20',
          isActiveSchoolStudent: true,
        },
        {
          studentUserId: 'child-eldest',
          studentName: 'Eldest Child',
          dateOfBirth: '2010-02-11',
          isActiveSchoolStudent: true,
        },
        {
          studentUserId: 'child-graduated',
          studentName: 'Adult Graduate (Not In School)',
          dateOfBirth: '2004-01-01',
          isActiveSchoolStudent: false, // Inactive
        },
      ],
    };

    it('derives correct sibling index chronologically by birthdate ignoring inactive wards', () => {
      const idxEldest = deriveDeterministicSiblingIndex(
        verifiedHousehold,
        'child-eldest',
        '2026-10-10',
      );
      const idxMiddle = deriveDeterministicSiblingIndex(
        verifiedHousehold,
        'child-middle',
        '2026-10-10',
      );
      const idxYoungest = deriveDeterministicSiblingIndex(
        verifiedHousehold,
        'child-youngest',
        '2026-10-10',
      );

      expect(idxEldest).toBe(1); // Oldest active student
      expect(idxMiddle).toBe(2); // Second active student
      expect(idxYoungest).toBe(3); // Third active student
    });

    it('cascades sibling discounts using the verified deterministic index regardless of caller spoofing', () => {
      // Caller attempts to spoof siblingIndex = 3 for child-eldest
      const result = resolveNetStudentFee({
        schedule: publicSchoolSdsSchedule,
        studentUserId: 'child-eldest',
        household: verifiedHousehold,
        siblingIndex: 3, // Spoofed hint
      });

      // Engine derives verified index = 1, denying fraudulent sibling discount
      expect(result.derivedSiblingIndex).toBe(1);
      expect(result.netPayableCents).toBe(300000); // Full price
      expect(result.concessionType).toBe('none');

      // Youngest child legitimately gets child #3 discount (50%)
      const youngestResult = resolveNetStudentFee({
        schedule: publicSchoolSdsSchedule,
        studentUserId: 'child-youngest',
        household: verifiedHousehold,
      });

      expect(youngestResult.derivedSiblingIndex).toBe(3);
      expect(youngestResult.waiverAmountCents).toBe(150000); // 50% of 3,000.00
      expect(youngestResult.netPayableCents).toBe(150000);
      expect(youngestResult.concessionType).toBe('sibling_discount');
    });
  });

  describe('Aswesuma Temporal Validity & Recertification Deadlines', () => {
    it('applies 100% waiver when Aswesuma certification is currently active', () => {
      const activePoorHousehold: Household = {
        id: 'hh-active-poor',
        name: 'Active Welfare Household',
        headUserId: 'parent-active',
        createdAt: '2026-01-01',
        welfareProfile: {
          householdId: 'hh-active-poor',
          program: 'aswesuma',
          aswesumaTier: 'poor',
          status: 'active',
          verificationStatus: 'official_wbb_verified',
          effectiveFrom: '2026-01-01',
          expiresAt: '2026-12-31', // Active through end of 2026
        },
        wards: [
          {
            studentUserId: 'stu-active-01',
            studentName: 'Active Student',
            dateOfBirth: '2012-01-01',
            isActiveSchoolStudent: true,
          },
        ],
      };

      const result = resolveNetStudentFee({
        schedule: publicSchoolSdsSchedule,
        studentUserId: 'stu-active-01',
        household: activePoorHousehold,
        assessmentDate: '2026-05-15',
        regulatoryNotice: moeCircularNotice,
      });

      expect(result.isFullyExempt).toBe(true);
      expect(result.waiverAmountCents).toBe(300000);
      expect(result.netPayableCents).toBe(0);
      expect(result.concessionType).toBe('statutory_aswesuma');
    });

    it('rejects statutory waiver and charges standard rate when Aswesuma certification has expired', () => {
      const expiredHousehold: Household = {
        id: 'hh-expired-poor',
        name: 'Expired Welfare Household',
        headUserId: 'parent-expired',
        createdAt: '2025-01-01',
        welfareProfile: {
          householdId: 'hh-expired-poor',
          program: 'aswesuma',
          aswesumaTier: 'severely_poor',
          status: 'expired', // Expired status
          verificationStatus: 'official_wbb_verified',
          effectiveFrom: '2025-01-01',
          expiresAt: '2025-12-31', // Expired last year
        },
        wards: [
          {
            studentUserId: 'stu-expired-01',
            studentName: 'Expired Student',
            dateOfBirth: '2012-01-01',
            isActiveSchoolStudent: true,
          },
        ],
      };

      const result = resolveNetStudentFee({
        schedule: publicSchoolSdsSchedule,
        studentUserId: 'stu-expired-01',
        household: expiredHousehold,
        assessmentDate: '2026-10-10', // Evaluated after expiration
        regulatoryNotice: moeCircularNotice,
      });

      // Statutory exemption denied due to expired certification
      expect(result.isFullyExempt).toBe(false);
      expect(result.netPayableCents).toBe(300000);
      expect(result.concessionType).toBe('none');
    });
  });

  describe('Decoupled Accounting Journals & Exact Penny Balancing', () => {
    it('generates balanced accrual invoice entries with zero phantom debt on the student', () => {
      const poorHousehold: Household = {
        id: 'hh-poor-01',
        name: 'Poor Household',
        headUserId: 'parent-poor',
        createdAt: '2026-01-01',
        welfareProfile: {
          householdId: 'hh-poor-01',
          program: 'aswesuma',
          aswesumaTier: 'severely_poor',
          status: 'active',
          verificationStatus: 'official_wbb_verified',
          effectiveFrom: '2026-01-01',
          expiresAt: '2026-12-31',
        },
        wards: [
          {
            studentUserId: 'stu-exempt-01',
            studentName: 'Exempt Ward',
            dateOfBirth: '2012-01-01',
            isActiveSchoolStudent: true,
          },
        ],
      };

      const calc = resolveNetStudentFee({
        schedule: publicSchoolSdsSchedule,
        studentUserId: 'stu-exempt-01',
        household: poorHousehold,
      });

      const invoiceJournal = buildAccrualInvoiceJournal(calc, {
        studentUserId: 'stu-exempt-01',
        revenueAccount: 'revenue:sds_facilities',
      });

      expect(invoiceJournal.netStudentReceivableCents).toBe(0); // Zero phantom debt
      expect(invoiceJournal.subsidyCoveredCents).toBe(300000);

      // Verify balanced double-entry
      const debits = invoiceJournal.entries
        .filter((e) => e.side === 'debit')
        .reduce((sum, e) => sum + e.amountCents, 0);
      const credits = invoiceJournal.entries
        .filter((e) => e.side === 'credit')
        .reduce((sum, e) => sum + e.amountCents, 0);

      expect(debits).toBe(300000);
      expect(credits).toBe(300000);
    });

    it('guarantees exact zero-leak integer-cents penny balancing on recurring splits (Rs. 3,333.33 with 70/30 split)', () => {
      const oddAmountSchedule: ChargeableSchedule = {
        id: 'sched-odd-tuition',
        title: 'Specialist Science Seminar',
        scopeType: 'classroom',
        scopeId: 'class-sci-odd',
        amountCents: 333333, // Rs. 3,333.33
        amount: 3333.33,
        currency: 'LKR',
        frequency: 'one_off',
        isMandatory: true,
        exemptionsAllowed: {
          aswesumaWaived: false,
          clergyWaived: false,
          scholarshipWaived: false,
          siblingDiscountsEnabled: false,
        },
      };

      const calc = resolveNetStudentFee({
        schedule: oddAmountSchedule,
        studentUserId: 'stu-odd-payer',
      });

      const settlement = buildCashSettlementJournal(calc, {
        studentUserId: 'stu-odd-payer',
        payerUserId: 'parent-odd',
        tutorSplitPercent: 70,
        instituteSplitPercent: 30,
        revenueAccount: 'revenue:seminar',
      });

      const debits = settlement.entries
        .filter((e) => e.side === 'debit')
        .reduce((sum, e) => sum + e.amountCents, 0);
      const credits = settlement.entries
        .filter((e) => e.side === 'credit')
        .reduce((sum, e) => sum + e.amountCents, 0);

      expect(debits).toBe(333333);
      expect(credits).toBe(333333);

      const tutor = settlement.entries.find((e) => e.accountId.includes('tutor'));
      const inst = settlement.entries.find((e) => e.accountId.includes('institute'));

      // 70% of 333333 = 233333.1 -> floor 233333
      // Remainder to institute = 333333 - 233333 = 100000
      expect(tutor?.amountCents).toBe(233333);
      expect(inst?.amountCents).toBe(100000);
      expect((tutor?.amountCents ?? 0) + (inst?.amountCents ?? 0)).toBe(333333);
    });
  });
});
