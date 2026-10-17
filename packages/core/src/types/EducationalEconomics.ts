/**
 * Foundational Educational Economics & Regulatory Schema Contracts
 *
 * Grounded in Sri Lankan educational reality & 13-year longitudinal governance:
 * - 4-Tier Pricing Scopes: school, grade, classroom, activity
 * - Bitemporal Household Welfare Profiles (Aswesuma 4 statutory tiers with annual expiration)
 * - Ministry of Education (MOE) Gazette Circulars and enforced statutory fee caps
 * - Deterministic verified sibling derivations across a child's 13-year school lifecycle
 * - Integer-cent precision (eliminates floating-point rounding errors in ledger balancing)
 */

import type { TemporalBounds } from './Temporal';

export type PricingScopeType = 'school' | 'grade' | 'classroom' | 'activity';

export type BillingFrequency = 'none' | 'one_off' | 'monthly' | 'term' | 'annual';

export type AswesumaTier = 'severely_poor' | 'poor' | 'vulnerable' | 'transitional';

export type WelfareProgram = 'aswesuma' | 'samurdhi' | 'none' | 'institutional_scholarship';

export type WelfareVerificationStatus =
  | 'unverified'
  | 'self_declared'
  | 'school_verified'
  | 'official_wbb_verified';

export type HouseholdWelfareStatus = 'active' | 'under_review' | 'expired' | 'revoked';

/** Official Government Gazette or Ministry Circular with Temporal Bounds */
export interface RegulatoryNotice extends Partial<TemporalBounds> {
  id: string;
  referenceNo: string; // e.g. "ED/01/2026/36", "Gazette 2345/12"
  authority:
    | 'ministry_of_education'
    | 'provincial_department'
    | 'department_of_examinations'
    | 'school_board';
  category: 'fee_cap' | 'academic_calendar' | 'exam_dates' | 'emergency_directive';
  title: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  documentUrl?: string;
  statutoryFeeCapCents?: number; // Integer cents ceiling (e.g. 250000 = Rs. 2,500.00)
  rules: {
    maxFeeCapLkr?: number; // legacy float support
    mandatoryExemptionPrograms?: WelfareProgram[];
    mandatoryExemptionTiers?: AswesumaTier[];
    allowSiblingDiscounts?: boolean;
    mandatesFreeEducation?: boolean;
  };
}

/** Household Unit: Family Anchor for Wards and Welfare Entitlements */
export interface Household extends Partial<TemporalBounds> {
  id: string;
  name: string; // e.g. "Perera Household - Nugegoda"
  headUserId: string; // Guardian / Parent User ID
  headNic?: string; // National Identity Card of Household Head
  createdAt: string;
  welfareProfile?: HouseholdWelfareProfile;
  wards: HouseholdWard[];
}

/** Household Ward with Birthdate and School Enrollment for Deterministic Sibling Indexing */
export interface HouseholdWard {
  studentUserId: string;
  studentName: string;
  dateOfBirth: string; // ISO 8601 (e.g. "2015-04-12") - Authoritative for sibling chronological ranking
  isActiveSchoolStudent: boolean; // Only active school students count in sibling concession order
  siblingIndex?: number; // Computed dynamically or cached (1 = first child, 2 = second child)
  schoolId?: string;
  gradeLevel?: string;
  enrolledSince?: string;
}

/** Bitemporal Household Welfare Profile with Statutory Expiration Tracking */
export interface HouseholdWelfareProfile extends Partial<TemporalBounds> {
  householdId: string;
  program: WelfareProgram;
  aswesumaTier?: AswesumaTier;
  aswesumaRefNo?: string;
  incomeBracket?: '<50k' | '50k-100k' | '100k-250k' | '>250k';
  status: HouseholdWelfareStatus;
  verificationStatus: WelfareVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  expiresAt: string; // Statutory annual recertification deadline
  effectiveFrom: string;
  effectiveTo?: string | null;
  documentProofUrl?: string;
  digitalCertificateHash?: string; // Verifiable cryptographic signature from WBB
}

/** Chargeable Schedule: Unified Polymorphic Pricing Contract */
export interface ChargeableSchedule extends Partial<TemporalBounds> {
  id: string;
  title: string; // e.g. "SDS Annual Fund", "Grade 11 Term Test Papers", "Saturday Maths Masterclass"
  scopeType: PricingScopeType;
  scopeId: string; // School.id, Grade.id, Classroom.id, or Activity.id
  amountCents: number; // Integer cents (0 = Universal Free Default, 250000 = Rs. 2,500.00)
  amount: number; // Backward-compatible decimal rupees
  currency: string; // DEFAULT: "LKR"
  frequency: BillingFrequency; // DEFAULT: "none"
  isMandatory: boolean;
  regulatoryNoticeId?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  exemptionsAllowed: {
    aswesumaWaived: boolean;
    clergyWaived: boolean;
    scholarshipWaived: boolean;
    siblingDiscountsEnabled: boolean;
  };
  splitRules?: {
    tutorPercent?: number;
    institutePercent?: number;
    sdsReservePercent?: number;
    secondChildDiscountPercent?: number; // e.g. 25
    thirdChildDiscountPercent?: number; // e.g. 50
  };
}

/** Calculated Net Fee Result for a Student */
export interface NetStudentFeeCalculation {
  scheduleId: string;
  title: string;
  scopeType: PricingScopeType;
  assessmentDate: string; // Point-in-time calculation reference date
  grossAmountCents: number;
  waiverAmountCents: number;
  netPayableCents: number;
  // Decimal helpers for UI displays
  grossAmount: number;
  waiverAmount: number;
  netPayable: number;
  isFullyExempt: boolean;
  waiverReason?: string;
  concessionType?: 'statutory_aswesuma' | 'sibling_discount' | 'universal_free' | 'none';
  statutoryCapApplied?: boolean;
  effectiveCapCents?: number;
  derivedSiblingIndex?: number;
}

/** Double-Entry Accounting Journal Entry */
export interface AccountingJournalEntry {
  accountId: string;
  amountCents: number;
  amount: number; // decimal rupees
  side: 'debit' | 'credit';
  description: string;
}

/** Accrual Invoice Journal: Establishes Accounts Receivable & Statutory Subsidies without Phantom Debt */
export interface AccrualInvoiceJournal {
  invoiceId: string;
  assessmentDate: string;
  description: string;
  entries: AccountingJournalEntry[];
  netStudentReceivableCents: number;
  subsidyCoveredCents: number;
}

/** Cash Settlement Journal: Records Payment Collection & Exact Split Remittances */
export interface CashSettlementJournal {
  settlementId: string;
  invoiceId: string;
  settledAt: string;
  payerUserId: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'online_gateway' | 'scholarship_remittance';
  entries: AccountingJournalEntry[];
  amountSettledCents: number;
}
