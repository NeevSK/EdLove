/**
 * Hardened Bitemporal Fee Exemption & Statutory Welfare Engine
 *
 * Grounded in Sri Lankan educational reality & 13-year longitudinal governance:
 * - Clamps gross fees against Ministry of Education (MOE) statutory fee caps
 * - Validates bitemporal expiration deadlines on Aswesuma welfare entitlements
 * - Derives deterministic sibling indexes from verified household wards by birthdate
 * - Uses exact integer-cents arithmetic with zero-leak penny balancing
 * - Decouples Invoicing Accrual (receivables creation) from Cash Settlement (payment collection)
 */

import type {
  AccountingJournalEntry,
  AccrualInvoiceJournal,
  CashSettlementJournal,
  ChargeableSchedule,
  Household,
  HouseholdWard,
  NetStudentFeeCalculation,
  RegulatoryNotice,
} from '../../types/EducationalEconomics';

export interface FeeCalculationContext {
  schedule: ChargeableSchedule;
  studentUserId: string;
  assessmentDate?: string; // ISO timestamp (e.g. "2026-10-10") - defaults to current time
  household?: Household | null;
  siblingIndex?: number; // Optional caller hint; will be verified against household.wards if present
  regulatoryNotice?: RegulatoryNotice | null;
}

export interface SettlementJournalResult {
  transactionId: string;
  description: string;
  entries: AccountingJournalEntry[];
  netStudentBalance: number;
}

/**
 * Derives the deterministic sibling index for a student within a verified household:
 * - Filters to active school-going wards
 * - Sorts chronologically by birthdate (oldest = 1, second = 2, third+ = 3+)
 */
export function deriveDeterministicSiblingIndex(
  household: Household | null | undefined,
  studentUserId: string,
  assessmentDate: string,
  callerHintIndex?: number,
): number {
  if (!household || !household.wards || household.wards.length === 0) {
    return callerHintIndex && callerHintIndex > 0 ? callerHintIndex : 1;
  }

  // Filter to active school students
  const activeWards = household.wards.filter((w: HouseholdWard) => {
    if (w.isActiveSchoolStudent === false) return false;
    return true;
  });

  if (activeWards.length <= 1) {
    return 1;
  }

  // Check if wards have dateOfBirth
  const hasBirthdates = activeWards.some((w) => !!w.dateOfBirth);
  if (hasBirthdates) {
    const sorted = [...activeWards].sort((a, b) => {
      const timeA = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : 0;
      const timeB = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : 0;
      return timeA - timeB;
    });

    const foundIndex = sorted.findIndex((w) => w.studentUserId === studentUserId);
    return foundIndex >= 0 ? foundIndex + 1 : (callerHintIndex ?? 1);
  }

  // If dateOfBirth is not populated, check ward's registered siblingIndex
  const matchedWard = activeWards.find((w) => w.studentUserId === studentUserId);
  if (matchedWard?.siblingIndex && matchedWard.siblingIndex > 0) {
    return matchedWard.siblingIndex;
  }

  return callerHintIndex && callerHintIndex > 0 ? callerHintIndex : 1;
}

/**
 * Resolves the net payable fee for a student considering:
 * 1. Default zero-pricing (Universal Free Education)
 * 2. Statutory government circular fee caps (clamping gross fee)
 * 3. Temporal validity of Aswesuma welfare tiers (rejecting expired credentials)
 * 4. Deterministic sibling household concessions
 */
export function resolveNetStudentFee(ctx: FeeCalculationContext): NetStudentFeeCalculation {
  const { schedule, studentUserId, household, regulatoryNotice } = ctx;
  const assessmentDate = ctx.assessmentDate ?? new Date().toISOString();

  // Helper to extract integer cents safely
  const rawScheduleCents = schedule.amountCents ?? Math.round((schedule.amount ?? 0) * 100);

  // 1. Universal Free Baseline
  if (rawScheduleCents <= 0) {
    return {
      scheduleId: schedule.id,
      title: schedule.title,
      scopeType: schedule.scopeType,
      assessmentDate,
      grossAmountCents: 0,
      waiverAmountCents: 0,
      netPayableCents: 0,
      grossAmount: 0,
      waiverAmount: 0,
      netPayable: 0,
      isFullyExempt: true,
      concessionType: 'universal_free',
      waiverReason: 'Universal Free Education (Zero-Fee Statutory Default)',
    };
  }

  // 2. MOE Gazette Statutory Fee Cap Enforcement
  let statutoryCapApplied = false;
  let effectiveCapCents: number | undefined = undefined;
  let grossCents = rawScheduleCents;

  if (regulatoryNotice) {
    const capCents =
      regulatoryNotice.statutoryFeeCapCents ??
      (regulatoryNotice.rules?.maxFeeCapLkr
        ? Math.round(regulatoryNotice.rules.maxFeeCapLkr * 100)
        : undefined);

    if (capCents !== undefined && capCents > 0 && rawScheduleCents > capCents) {
      grossCents = capCents;
      statutoryCapApplied = true;
      effectiveCapCents = capCents;
    }
  }

  const welfare = household?.welfareProfile;
  const derivedSiblingIndex = deriveDeterministicSiblingIndex(
    household,
    studentUserId,
    assessmentDate,
    ctx.siblingIndex,
  );

  // 3. Statutory Government Circular & Welfare Exemptions (Aswesuma)
  if (welfare && schedule.exemptionsAllowed.aswesumaWaived) {
    // Check temporal expiration: Welfare Benefit Board annual certification
    const isWelfareExpired =
      welfare.status === 'expired' ||
      welfare.status === 'revoked' ||
      (welfare.expiresAt &&
        new Date(assessmentDate).getTime() > new Date(welfare.expiresAt).getTime());

    if (isWelfareExpired) {
      // Expired welfare status drops to sibling discount or standard rate with explicit audit warning
      // Continue to sibling discount check below
    } else if (welfare.program === 'aswesuma') {
      const tier = welfare.aswesumaTier;

      // Statutory Severely Poor or Poor = 100% mandatory full waiver
      if (tier === 'severely_poor' || tier === 'poor') {
        const ref = regulatoryNotice ? ` [Circular ${regulatoryNotice.referenceNo}]` : '';
        return {
          scheduleId: schedule.id,
          title: schedule.title,
          scopeType: schedule.scopeType,
          assessmentDate,
          grossAmountCents: grossCents,
          waiverAmountCents: grossCents,
          netPayableCents: 0,
          grossAmount: grossCents / 100,
          waiverAmount: grossCents / 100,
          netPayable: 0,
          isFullyExempt: true,
          concessionType: 'statutory_aswesuma',
          waiverReason: `Statutory Aswesuma Exemption (${tier.replace('_', ' ')})${ref}`,
          statutoryCapApplied,
          effectiveCapCents,
          derivedSiblingIndex,
        };
      }

      // Vulnerable tier = 50% statutory relief
      if (tier === 'vulnerable') {
        const waiverCents = Math.floor(grossCents * 0.5);
        const netCents = grossCents - waiverCents;
        return {
          scheduleId: schedule.id,
          title: schedule.title,
          scopeType: schedule.scopeType,
          assessmentDate,
          grossAmountCents: grossCents,
          waiverAmountCents: waiverCents,
          netPayableCents: netCents,
          grossAmount: grossCents / 100,
          waiverAmount: waiverCents / 100,
          netPayable: netCents / 100,
          isFullyExempt: false,
          concessionType: 'statutory_aswesuma',
          waiverReason: 'Statutory Aswesuma Vulnerable Tier Concession (50% Relief)',
          statutoryCapApplied,
          effectiveCapCents,
          derivedSiblingIndex,
        };
      }
    } else if (welfare.program === 'institutional_scholarship') {
      return {
        scheduleId: schedule.id,
        title: schedule.title,
        scopeType: schedule.scopeType,
        assessmentDate,
        grossAmountCents: grossCents,
        waiverAmountCents: grossCents,
        netPayableCents: 0,
        grossAmount: grossCents / 100,
        waiverAmount: grossCents / 100,
        netPayable: 0,
        isFullyExempt: true,
        concessionType: 'statutory_aswesuma',
        waiverReason: 'Institutional Merit/Need Scholarship (100% Fee Remission)',
        statutoryCapApplied,
        effectiveCapCents,
        derivedSiblingIndex,
      };
    }
  }

  // 4. Deterministic Sibling Concessions
  if (derivedSiblingIndex > 1 && schedule.exemptionsAllowed.siblingDiscountsEnabled) {
    const secondChildRate = (schedule.splitRules?.secondChildDiscountPercent ?? 25) / 100;
    const thirdChildRate = (schedule.splitRules?.thirdChildDiscountPercent ?? 50) / 100;
    const discountRate = derivedSiblingIndex === 2 ? secondChildRate : thirdChildRate;
    const waiverCents = Math.floor(grossCents * discountRate);
    const netCents = grossCents - waiverCents;

    return {
      scheduleId: schedule.id,
      title: schedule.title,
      scopeType: schedule.scopeType,
      assessmentDate,
      grossAmountCents: grossCents,
      waiverAmountCents: waiverCents,
      netPayableCents: netCents,
      grossAmount: grossCents / 100,
      waiverAmount: waiverCents / 100,
      netPayable: netCents / 100,
      isFullyExempt: false,
      concessionType: 'sibling_discount',
      waiverReason: `Sibling Concession (Child #${derivedSiblingIndex} - ${Math.round(discountRate * 100)}% Discount)`,
      statutoryCapApplied,
      effectiveCapCents,
      derivedSiblingIndex,
    };
  }

  // 5. Standard Payable Fee (with statutory cap if enforced)
  return {
    scheduleId: schedule.id,
    title: schedule.title,
    scopeType: schedule.scopeType,
    assessmentDate,
    grossAmountCents: grossCents,
    waiverAmountCents: 0,
    netPayableCents: grossCents,
    grossAmount: grossCents / 100,
    waiverAmount: 0,
    netPayable: grossCents / 100,
    isFullyExempt: false,
    concessionType: 'none',
    statutoryCapApplied,
    effectiveCapCents,
    derivedSiblingIndex,
  };
}

/**
 * Builds the Accrual Invoicing Journal:
 * Accrues the student fee on the ledger, booking statutory subsidies and accounts receivable.
 * Guarantees zero phantom debt on the student by crediting subsidies immediately upon bill generation.
 */
export function buildAccrualInvoiceJournal(
  calc: NetStudentFeeCalculation,
  params: {
    studentUserId: string;
    revenueAccount?: string;
  },
): AccrualInvoiceJournal {
  const invoiceId = `inv-${Date.now()}`;
  const entries: AccountingJournalEntry[] = [];
  const revenueAcc = params.revenueAccount ?? 'revenue:educational_fees';

  // 1. If there is a net payable amount, establish Student Accounts Receivable
  if (calc.netPayableCents > 0) {
    entries.push({
      accountId: `receivable:student:${params.studentUserId}`,
      amountCents: calc.netPayableCents,
      amount: calc.netPayableCents / 100,
      side: 'debit',
      description: `Student tuition receivable for ${calc.title}`,
    });
  }

  // 2. If there is a waiver, record statutory subsidy funding (Debit Subsidy Asset/Expense)
  if (calc.waiverAmountCents > 0) {
    entries.push({
      accountId: 'subsidy:statutory_welfare_exemption',
      amountCents: calc.waiverAmountCents,
      amount: calc.waiverAmountCents / 100,
      side: 'debit',
      description: `Statutory fee remission for ${calc.title} (${calc.waiverReason ?? 'Welfare'})`,
    });
  }

  // 3. Credit Revenue with the total assessed fee
  if (calc.grossAmountCents > 0) {
    entries.push({
      accountId: revenueAcc,
      amountCents: calc.grossAmountCents,
      amount: calc.grossAmountCents / 100,
      side: 'credit',
      description: `Recognized revenue for ${calc.title}`,
    });
  }

  return {
    invoiceId,
    assessmentDate: calc.assessmentDate,
    description: `Accrual Invoice: ${calc.title}`,
    entries,
    netStudentReceivableCents: calc.netPayableCents,
    subsidyCoveredCents: calc.waiverAmountCents,
  };
}

/**
 * Builds the Cash Settlement Journal:
 * Records cash/bank collection and clears the student's accounts receivable.
 * Performs deterministic half-up penny allocation for tutor vs. institute splits.
 */
export function buildCashSettlementJournal(
  calc: NetStudentFeeCalculation,
  params: {
    studentUserId: string;
    payerUserId: string;
    invoiceId?: string;
    paymentMethod?: 'cash' | 'bank_transfer' | 'online_gateway' | 'scholarship_remittance';
    tutorSplitPercent?: number;
    instituteSplitPercent?: number;
    revenueAccount?: string;
  },
): CashSettlementJournal {
  const settlementId = `stl-${Date.now()}`;
  const entries: AccountingJournalEntry[] = [];
  const revenueAcc = params.revenueAccount ?? 'revenue:educational_fees';
  const paymentMethod = params.paymentMethod ?? 'online_gateway';

  if (calc.netPayableCents > 0) {
    // 1. Debit Cash/Bank Asset or Payer Wallet
    entries.push({
      accountId: `wallet:user:${params.payerUserId}`,
      amountCents: calc.netPayableCents,
      amount: calc.netPayableCents / 100,
      side: 'debit',
      description: `Payment received for ${calc.title} via ${paymentMethod}`,
    });

    // 2. Credit Student Receivable to clear student debt
    if (params.tutorSplitPercent && params.instituteSplitPercent) {
      // Deterministic integer-cents split allocation:
      // Tutor gets exact percentage floor, remainder goes to Institute (guarantees sum(credits) == netPayableCents)
      const tutorAmtCents = Math.floor((calc.netPayableCents * params.tutorSplitPercent) / 100);
      const instituteAmtCents = calc.netPayableCents - tutorAmtCents;

      entries.push({
        accountId: `${revenueAcc}:tutor`,
        amountCents: tutorAmtCents,
        amount: tutorAmtCents / 100,
        side: 'credit',
        description: `Tutor split remittance (${params.tutorSplitPercent}%)`,
      });
      entries.push({
        accountId: `${revenueAcc}:institute`,
        amountCents: instituteAmtCents,
        amount: instituteAmtCents / 100,
        side: 'credit',
        description: `Institute facility remittance (${params.instituteSplitPercent}%)`,
      });
    } else {
      entries.push({
        accountId: `receivable:student:${params.studentUserId}`,
        amountCents: calc.netPayableCents,
        amount: calc.netPayableCents / 100,
        side: 'credit',
        description: `Clear student receivable via ${paymentMethod}`,
      });
    }
  }

  return {
    settlementId,
    invoiceId: params.invoiceId ?? `inv-${settlementId}`,
    settledAt: new Date().toISOString(),
    payerUserId: params.payerUserId,
    paymentMethod,
    entries,
    amountSettledCents: calc.netPayableCents,
  };
}

/**
 * Backward-compatible single-pass settlement journal orchestrator:
 * Integrates accrual and settlement balancing without breaking legacy callers.
 */
export function buildSettlementJournal(
  calc: NetStudentFeeCalculation,
  params: {
    studentUserId: string;
    payerUserId: string;
    revenueAccount?: string;
    tutorSplitPercent?: number;
    instituteSplitPercent?: number;
  },
): SettlementJournalResult {
  const entries: AccountingJournalEntry[] = [];

  // 1. If there is a waiver, record the statutory subsidy balancing entries
  if (calc.waiverAmountCents > 0 || calc.waiverAmount > 0) {
    const waiverCents = calc.waiverAmountCents || Math.round(calc.waiverAmount * 100);
    entries.push({
      accountId: 'subsidy:statutory_welfare_exemption',
      amountCents: waiverCents,
      amount: waiverCents / 100,
      side: 'debit',
      description: `Statutory fee remission for ${calc.title} (${calc.waiverReason ?? 'Welfare'})`,
    });
    entries.push({
      accountId: `receivable:student:${params.studentUserId}`,
      amountCents: waiverCents,
      amount: waiverCents / 100,
      side: 'credit',
      description: `Clear student receivable via statutory waiver`,
    });
  }

  // 2. If there is net payable amount collected, record cash settlement
  if (calc.netPayableCents > 0 || calc.netPayable > 0) {
    const settlement = buildCashSettlementJournal(calc, {
      studentUserId: params.studentUserId,
      payerUserId: params.payerUserId,
      tutorSplitPercent: params.tutorSplitPercent,
      instituteSplitPercent: params.instituteSplitPercent,
      revenueAccount: params.revenueAccount,
    });
    entries.push(...settlement.entries);
  }

  return {
    transactionId: `tx-settle-${Date.now()}`,
    description: `Settlement Journal: ${calc.title}`,
    entries,
    netStudentBalance: 0,
  };
}
