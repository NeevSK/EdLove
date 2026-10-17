import {
  buildSettlementJournal,
  resolveNetStudentFee,
} from '@repo/core/logic/billing/feeExemptionEngine';
import type {
  ChargeableSchedule,
  Household,
  RegulatoryNotice,
} from '@repo/core/types/EducationalEconomics';
import { describe, expect, it } from 'vitest';
import { tuitionHexagonalService } from '@/lib/domain/adapters/tuition/tuitionHexagonalService';

/**
 * G2 Scenario Contract: Aswesuma Welfare Exemptions, Household Sibling Cascading & Circular Governance
 *
 * Verifies real-world Sri Lankan educational finance reality:
 * - Low-income / Aswesuma status belongs to the Household, not the individual child.
 * - Sibling concessions cascade automatically across all wards sharing a household.
 * - Ministry Circulars govern statutory fee caps and legal waivers.
 * - Double-entry accounting balances statutory subsidies with zero phantom debt on impoverished children.
 */
describe('Scenario: Aswesuma Welfare Exemptions, Household Sibling Cascading & Circular Governance (G2 Contract)', () => {
  const sdsFeeSchedule: ChargeableSchedule = {
    id: 'sched-sds-royal-2026',
    title: 'School Development Society (SDS) Annual Facilities Fund',
    scopeType: 'school',
    scopeId: 'school-royal-colombo',
    amountCents: 320000,
    amount: 3200,
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

  const moeCircular: RegulatoryNotice = {
    id: 'circ-moe-2018-36',
    referenceNo: 'ED/01/2018/36',
    authority: 'ministry_of_education',
    category: 'fee_cap',
    title: 'Statutory Regulation of SDS Collections & Mandatory Welfare Exemptions',
    effectiveFrom: '2018-01-01',
    rules: {
      maxFeeCapLkr: 3500,
      mandatoryExemptionPrograms: ['aswesuma'],
      mandatoryExemptionTiers: ['severely_poor', 'poor'],
      allowSiblingDiscounts: true,
    },
  };

  it('cascades Aswesuma statutory 100% waiver to all sibling wards in an impoverished household', () => {
    // Household registered under Welfare Benefits Board (WBB) as Severely Poor
    const aswesumaHousehold: Household = {
      id: 'hh-gunasekara-badulla',
      name: 'Gunasekara Family',
      headUserId: 'usr-parent-gunasekara',
      headNic: '815201992V',
      createdAt: '2026-01-10T00:00:00Z',
      welfareProfile: {
        householdId: 'hh-gunasekara-badulla',
        program: 'aswesuma',
        aswesumaTier: 'severely_poor',
        aswesumaRefNo: 'WBB/2026/BD/4412',
        status: 'active',
        verificationStatus: 'official_wbb_verified',
        effectiveFrom: '2026-01-01T00:00:00Z',
        expiresAt: '2027-01-01T00:00:00Z',
      },
      wards: [
        {
          studentUserId: 'stu-dilan-01',
          studentName: 'Dilan Gunasekara',
          dateOfBirth: '2010-05-12',
          isActiveSchoolStudent: true,
          siblingIndex: 1,
          gradeLevel: 'Grade 10-A',
        },
        {
          studentUserId: 'stu-dilani-02',
          studentName: 'Dilani Gunasekara',
          dateOfBirth: '2013-09-23',
          isActiveSchoolStudent: true,
          siblingIndex: 2,
          gradeLevel: 'Grade 7-B',
        },
      ],
    };

    // Evaluate Child 1
    const calcChild1 = resolveNetStudentFee({
      schedule: sdsFeeSchedule,
      studentUserId: aswesumaHousehold.wards[0]!.studentUserId,
      household: aswesumaHousehold,
      siblingIndex: aswesumaHousehold.wards[0]!.siblingIndex,
      regulatoryNotice: moeCircular,
    });

    expect(calcChild1.grossAmount).toBe(3200);
    expect(calcChild1.waiverAmount).toBe(3200);
    expect(calcChild1.netPayable).toBe(0);
    expect(calcChild1.isFullyExempt).toBe(true);
    expect(calcChild1.concessionType).toBe('statutory_aswesuma');

    // Evaluate Child 2 (cascades household status automatically)
    const calcChild2 = resolveNetStudentFee({
      schedule: sdsFeeSchedule,
      studentUserId: aswesumaHousehold.wards[1]!.studentUserId,
      household: aswesumaHousehold,
      siblingIndex: aswesumaHousehold.wards[1]!.siblingIndex,
      regulatoryNotice: moeCircular,
    });

    expect(calcChild2.grossAmount).toBe(3200);
    expect(calcChild2.waiverAmount).toBe(3200);
    expect(calcChild2.netPayable).toBe(0);
    expect(calcChild2.isFullyExempt).toBe(true);
    expect(calcChild2.concessionType).toBe('statutory_aswesuma');
  });

  it('cascades sibling concessions (25% and 50%) across non-exempt households', () => {
    const regularHousehold: Household = {
      id: 'hh-fernando-moratuwa',
      name: 'Fernando Family',
      headUserId: 'usr-parent-fernando',
      createdAt: '2026-01-05T00:00:00Z',
      welfareProfile: {
        householdId: 'hh-fernando-moratuwa',
        program: 'none',
        status: 'active',
        verificationStatus: 'unverified',
        effectiveFrom: '2026-01-01T00:00:00Z',
        expiresAt: '2027-01-01T00:00:00Z',
      },
      wards: [
        { studentUserId: 'stu-elder-01', studentName: 'Eldest', dateOfBirth: '2010-01-01', isActiveSchoolStudent: true, siblingIndex: 1 },
        { studentUserId: 'stu-middle-02', studentName: 'Middle', dateOfBirth: '2012-01-01', isActiveSchoolStudent: true, siblingIndex: 2 },
        { studentUserId: 'stu-young-03', studentName: 'Youngest', dateOfBirth: '2014-01-01', isActiveSchoolStudent: true, siblingIndex: 3 },
      ],
    };

    // Child 1 pays full gross
    const res1 = resolveNetStudentFee({
      schedule: sdsFeeSchedule,
      studentUserId: 'stu-elder-01',
      household: regularHousehold,
      siblingIndex: 1,
    });
    expect(res1.netPayable).toBe(3200);
    expect(res1.waiverAmount).toBe(0);

    // Child 2 gets 25% discount
    const res2 = resolveNetStudentFee({
      schedule: sdsFeeSchedule,
      studentUserId: 'stu-middle-02',
      household: regularHousehold,
      siblingIndex: 2,
    });
    expect(res2.grossAmount).toBe(3200);
    expect(res2.waiverAmount).toBe(800); // 25% of 3200
    expect(res2.netPayable).toBe(2400);
    expect(res2.concessionType).toBe('sibling_discount');

    // Child 3 gets 50% discount
    const res3 = resolveNetStudentFee({
      schedule: sdsFeeSchedule,
      studentUserId: 'stu-young-03',
      household: regularHousehold,
      siblingIndex: 3,
    });
    expect(res3.grossAmount).toBe(3200);
    expect(res3.waiverAmount).toBe(1600); // 50% of 3200
    expect(res3.netPayable).toBe(1600);
    expect(res3.concessionType).toBe('sibling_discount');
  });

  it('generates balanced double-entry accounting journals for statutory waivers with zero student debt', async () => {
    const calc = resolveNetStudentFee({
      schedule: sdsFeeSchedule,
      studentUserId: 'stu-exempt-99',
      household: {
        id: 'hh-poor-test',
        name: 'Poor Test Household',
        headUserId: 'usr-parent-test',
        createdAt: '2026-01-01',
        welfareProfile: {
          householdId: 'hh-poor-test',
          program: 'aswesuma',
          aswesumaTier: 'poor',
          status: 'active',
          verificationStatus: 'school_verified',
          effectiveFrom: '2026-01-01T00:00:00Z',
          expiresAt: '2027-01-01T00:00:00Z',
        },
        wards: [],
      },
      regulatoryNotice: moeCircular,
    });

    // Generate settlement journal
    const journal = buildSettlementJournal(calc, {
      studentUserId: 'stu-exempt-99',
      payerUserId: 'usr-parent-test',
      revenueAccount: 'revenue:sds_facilities',
    });

    expect(journal.netStudentBalance).toBe(0);
    expect(journal.entries.length).toBe(2);

    // Verify Debits === Credits
    const debit = journal.entries.find((e) => e.side === 'debit');
    const credit = journal.entries.find((e) => e.side === 'credit');

    expect(debit?.accountId).toBe('subsidy:statutory_welfare_exemption');
    expect(debit?.amount).toBe(3200);
    expect(credit?.accountId).toBe('receivable:student:stu-exempt-99');
    expect(credit?.amount).toBe(3200);

    // Verify integration through TuitionHexagonalService
    const receipt = await tuitionHexagonalService.issueReceipt({
      feeId: 'fee-exempt-sds',
      studentName: 'Dilan Gunasekara',
      amount: calc.netPayable, // 0
      grossAmount: calc.grossAmount,
      waiverAmount: calc.waiverAmount,
      concessionType: calc.concessionType,
      waiverReason: calc.waiverReason,
      batchId: 'batch-royal-sds',
      payerUserId: 'usr-parent-test',
      feeType: 'School SDS Fund',
    });

    expect(receipt.netPayable).toBe(0);
    expect(receipt.waiverAmount).toBe(3200);
    expect(receipt.concessionType).toBe('statutory_aswesuma');
    expect(receipt.transaction.entries.some((e) => e.accountId.includes('subsidy'))).toBe(true);
  });
});
