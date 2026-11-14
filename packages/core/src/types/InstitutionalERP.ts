/**
 * Canonical Institutional Educational ERP Domain Types
 *
 * Models the operational reality of educational institutions:
 * - Multi-Scope Programs & Events (Daily nutritional feeding, sports meets, excursions, seminars)
 * - Material & Asset Lifecycle (Durable equipment vs Consumable operational stock)
 * - Facility & Space Reservations with timetable clash-detection
 * - Board of Survey (භාණ්ඩ සමීක්ෂණය) statutory audit tracking
 * - Event Resource Allocations & Bill of Materials (BOM)
 */

import type { AccountingJournalEntry } from './EducationalEconomics';
import type { TemporalBounds } from './Temporal';

export type EventCadence = 'one_time' | 'daily_recurring' | 'weekly_recurring' | 'term_recurring';

export type EventCategory =
  | 'nutrition' // Free midday meal, morning porridge, welfare feeding
  | 'excursion' // Annual school trip, field study
  | 'sports' // Sports meet, inter-house matches, cricket practice
  | 'academic_seminar' // O/L / A/L revision seminars, mock exams
  | 'cultural' // Pirith ceremony, prize giving, drama festival
  | 'maintenance' // Shramadana cleaning, classroom renovation
  | 'commercial_class'; // Weekend tuition masterclass

export type EventApprovalStatus =
  | 'draft'
  | 'pending_approval'
  | 'sanctioned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type FundingSource =
  | 'ministry_grant' // Government midday meal subsidy, free textbook/uniform grant
  | 'sds_reserve' // School Development Society reserve funds
  | 'student_contributions' // Paid tickets/fees (subject to Aswesuma exemptions)
  | 'donation' // Alumni association, philanthropic sponsor
  | 'free_public'; // Zero-budget event

export type InventoryNature = 'durable_equipment' | 'consumable_stock';

export type InventoryCategory =
  | 'sports' // Balls, bats, nets, javelins
  | 'lab' // Microscopes, test tubes, chemicals, specimens
  | 'nutrition_pantry' // Rice, dhal, eggs, milk powder, vegetables
  | 'stationery' // Paper reams, chalk, registers, printing ink
  | 'furniture' // Desks, chairs, podiums, whiteboards
  | 'audio_visual' // Microphones, P.A. amplifiers, projectors
  | 'first_aid'; // Antiseptic, bandages, medicine

export type AssetCondition = 'good' | 'fair' | 'poor' | 'damaged' | 'condemned_for_disposal';

export type StockMovementType =
  | 'inflow_procurement'
  | 'inflow_donation'
  | 'outflow_event_consumption'
  | 'outflow_transfer'
  | 'spoilage_write_off';

export type BoardOfSurveyStatus = 'verified_serviceable' | 'missing' | 'damaged' | 'condemned';

/** Institutional Program or Event (The Operational Work Order) */
export interface InstitutionalEvent extends Partial<TemporalBounds> {
  id: string;
  scopeType: 'school' | 'section' | 'grade' | 'classroom' | 'institute';
  scopeId: string; // ID of the school, section, grade, classroom, or institute
  title: string; // e.g. "Grade 10 Educational Excursion", "National Midday Nutrition Program"
  description?: string;
  category: EventCategory;
  cadence: EventCadence;
  startDate: string; // ISO 8601 Date/Time
  endDate?: string;
  recurrenceRule?: string; // e.g. "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR"
  leadOrganizerUserId: string; // Teacher-in-Charge or Lead Organizer
  approverUserId?: string; // Principal, Section Head, or Zonal Director
  status: EventApprovalStatus;

  // Budget & Financial Linkage
  estimatedBudgetCents: number;
  actualExpenditureCents?: number;
  fundingSource: FundingSource;
  chargeableScheduleId?: string; // Links to EducationalEconomics if students contribute

  // Compliance
  regulatoryNoticeId?: string; // e.g. MOE Excursion Safety Circular
  parentalConsentRequired?: boolean; // Requires guardianBond confirmation
}

/** Physical Asset or Inventory Item */
export interface InventoryAssetItem extends Partial<TemporalBounds> {
  id: string;
  scopeType: 'school' | 'section' | 'grade' | 'classroom' | 'institute';
  scopeId: string;
  name: string;
  nature: InventoryNature;
  category: InventoryCategory;

  // Durable Asset Fields
  totalQuantity: number;
  availableQuantity: number;
  condition: AssetCondition;
  custodianUserId: string; // Staff member holding keys & accountability
  storageLocation: string; // e.g. "Sports Store Room 2", "Pantry Cabinet A"
  assetTag?: string; // e.g. "ANANDA/PHY/2026/042"

  // Consumable Stock Fields
  unitOfMeasure?: 'kg' | 'liters' | 'units' | 'reams' | 'packets';
  reorderThreshold?: number; // Generates low-stock alert when stock drops below this
  batchLotNo?: string;
  expiryDate?: string; // Critical for nutritional pantry rations

  // Board of Survey (භාණ්ඩ සමීක්ෂණය) Audit State
  lastSurveyDate?: string;
  lastSurveyStatus?: BoardOfSurveyStatus;
  lastSurveyNotes?: string;
}

/** Consumable Stock Movement Ledger Entry */
export interface InventoryStockMovement {
  id: string;
  inventoryItemId: string;
  movementType: StockMovementType;
  quantity: number;
  balanceAfter: number;
  associatedEventId?: string; // Dispatched to specific event/program
  performedByUserId: string;
  recordedAt: string;
  notes?: string;
  unitCostCents?: number;
  totalCostCents?: number;
}

/** Spatial / Facility Booking */
export interface FacilityReservation extends Partial<TemporalBounds> {
  id: string;
  facilityId: string; // e.g. "main-auditorium", "chemistry-lab-2", "cricket-ground"
  facilityName: string;
  associatedEventId: string;
  bookedByUserId: string;
  startDateTime: string;
  endDateTime: string;
  hasClash?: boolean;
  clashNotes?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

/** Bill of Materials & Resource Allocation for an Event */
export interface EventResourceBOM {
  eventId: string;
  reservedDurables: Array<{
    inventoryItemId: string;
    itemName: string;
    quantityRequested: number;
    checkedOutAt?: string;
    returnedAt?: string;
    conditionOnReturn?: AssetCondition;
  }>;
  consumedStock: Array<{
    inventoryItemId: string;
    itemName: string;
    quantityDispatched: number;
    unitOfMeasure: string;
    costCents: number;
  }>;
  reservedFacilities: FacilityReservation[];
  totalResourceCostCents: number;
}

/** Statutory Board of Survey Audit Record */
export interface BoardOfSurveyRecord {
  id: string;
  schoolId: string;
  surveyYear: number;
  assetId: string;
  assetName: string;
  recordedCondition: AssetCondition;
  surveyStatus: BoardOfSurveyStatus;
  committeeMemberUserIds: string[];
  findingsNotes: string;
  signedOffAt: string;
}
