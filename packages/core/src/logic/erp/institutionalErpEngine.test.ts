import { describe, expect, it } from 'vitest';
import type {
  FacilityReservation,
  InstitutionalEvent,
  InventoryAssetItem,
} from '../../types/InstitutionalERP';
import {
  allocateEventResources,
  checkTimeRangeOverlap,
  dispatchConsumableStock,
  generateEventSettlement,
  recordBoardOfSurveyAudit,
} from './institutionalErpEngine';

describe('Institutional Educational ERP Engine (G1 Contracts)', () => {
  const nutritionProgramEvent: InstitutionalEvent = {
    id: 'evt-nutrition-2026-10-10',
    scopeType: 'school',
    scopeId: 'school-mahamaya-kandy',
    title: 'Daily Primary Section Midday Nutrition Feeding Program',
    category: 'nutrition',
    cadence: 'daily_recurring',
    startDate: '2026-10-10T07:30:00Z',
    endDate: '2026-10-10T09:00:00Z',
    leadOrganizerUserId: 'usr-teacher-ranasinghe',
    approverUserId: 'usr-principal-wickramasinghe',
    status: 'sanctioned',
    estimatedBudgetCents: 1500000, // Rs. 15,000.00
    fundingSource: 'ministry_grant',
  };

  const pantryRiceStock: InventoryAssetItem = {
    id: 'inv-rice-samba',
    scopeType: 'school',
    scopeId: 'school-mahamaya-kandy',
    name: 'Samba Rice (Grade A)',
    nature: 'consumable_stock',
    category: 'nutrition_pantry',
    totalQuantity: 50, // 50 kg in store
    availableQuantity: 50,
    unitOfMeasure: 'kg',
    condition: 'good',
    custodianUserId: 'usr-pantry-keeper',
    storageLocation: 'Kitchen Dry Ration Store Room',
    reorderThreshold: 20, // Low-stock threshold
    expiryDate: '2027-04-30',
  };

  const paSpeakerDurable: InventoryAssetItem = {
    id: 'inv-pa-speakers-yamaha',
    scopeType: 'school',
    scopeId: 'school-mahamaya-kandy',
    name: 'Yamaha StagePass 400BT Portable PA Speaker System',
    nature: 'durable_equipment',
    category: 'audio_visual',
    totalQuantity: 4,
    availableQuantity: 4,
    condition: 'good',
    custodianUserId: 'usr-av-master',
    storageLocation: 'Main Hall A/V Booth',
    assetTag: 'MMA/AV/2024/009',
  };

  describe('Event Resource Allocation & Bill of Materials (BOM)', () => {
    it('allocates durable equipment and consumes dry rations for an event', () => {
      const result = allocateEventResources({
        event: nutritionProgramEvent,
        durableRequests: [{ item: paSpeakerDurable, quantityRequested: 2 }],
        consumableRequests: [
          { item: pantryRiceStock, quantityDispatched: 15, unitCostCents: 24000 }, // 15kg @ Rs. 240/kg
        ],
      });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Check durable availability reduced from 4 to 2
      expect(result.updatedDurables[0]?.availableQuantity).toBe(2);

      // Check consumable stock reduced from 50kg to 35kg
      expect(result.updatedConsumables[0]?.totalQuantity).toBe(35);

      // Check BOM cost: 15kg * Rs. 240 = Rs. 3,600 (360,000 cents)
      expect(result.bom.totalResourceCostCents).toBe(360000);
      expect(result.stockMovements).toHaveLength(1);
      expect(result.stockMovements[0]?.movementType).toBe('outflow_event_consumption');
      expect(result.stockMovements[0]?.balanceAfter).toBe(35);
    });

    it('rejects allocation when requested durable quantity exceeds available stock', () => {
      const result = allocateEventResources({
        event: nutritionProgramEvent,
        durableRequests: [{ item: paSpeakerDurable, quantityRequested: 10 }], // only 4 exist
        consumableRequests: [],
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Insufficient durable stock');
    });
  });

  describe('Facility Reservation & Timetable Clash Detection', () => {
    const existingAuditoriumReservation: FacilityReservation = {
      id: 'res-morning-assembly',
      facilityId: 'main-auditorium',
      facilityName: 'Main School Auditorium',
      associatedEventId: 'evt-assembly',
      bookedByUserId: 'usr-vp',
      startDateTime: '2026-10-10T08:00:00Z',
      endDateTime: '2026-10-10T09:30:00Z',
      status: 'confirmed',
    };

    it('detects overlapping reservations on the same facility', () => {
      const isClashing = checkTimeRangeOverlap(
        '2026-10-10T08:30:00Z',
        '2026-10-10T10:00:00Z',
        existingAuditoriumReservation.startDateTime,
        existingAuditoriumReservation.endDateTime,
      );
      expect(isClashing).toBe(true);
    });

    it('confirms facility booking when no time conflict exists', () => {
      const isClashing = checkTimeRangeOverlap(
        '2026-10-10T11:00:00Z',
        '2026-10-10T13:00:00Z',
        existingAuditoriumReservation.startDateTime,
        existingAuditoriumReservation.endDateTime,
      );
      expect(isClashing).toBe(false);
    });
  });

  describe('Consumable Stock Dispatch & Low-Stock Alerts', () => {
    it('dispatches stock and flags low-stock alert when balance falls to or below reorder threshold', () => {
      // Current stock: 50kg, threshold: 20kg. Dispatch 35kg -> balance 15kg (below 20kg threshold)
      const dispatch = dispatchConsumableStock(pantryRiceStock, 35, {
        eventId: nutritionProgramEvent.id,
        performedByUserId: 'usr-pantry-keeper',
        unitCostCents: 24000,
        reason: 'Midday meal preparation for 350 students',
      });

      expect(dispatch.updatedItem.totalQuantity).toBe(15);
      expect(dispatch.isLowStock).toBe(true);
      expect(dispatch.movement.balanceAfter).toBe(15);

      // Verify balanced double-entry accounting: 35kg * Rs. 240 = Rs. 8,400 (840000 cents)
      expect(dispatch.journalEntries).toHaveLength(2);
      const debit = dispatch.journalEntries.find((e) => e.side === 'debit');
      const credit = dispatch.journalEntries.find((e) => e.side === 'credit');

      expect(debit?.amountCents).toBe(840000);
      expect(credit?.amountCents).toBe(840000);
      expect(debit?.accountId).toBe('expense:operational:nutrition_pantry');
      expect(credit?.accountId).toBe('inventory:asset:inv-rice-samba');
    });
  });

  describe('Board of Survey (භාණ්ඩ සමීක්ෂණය) Statutory Annual Audit', () => {
    it('records condition update and committee sign-off on audited asset', () => {
      const audit = recordBoardOfSurveyAudit(paSpeakerDurable, {
        surveyYear: 2026,
        schoolId: 'school-mahamaya-kandy',
        committeeMemberUserIds: ['usr-teacher-silva', 'usr-teacher-fernando', 'usr-sds-rep'],
        observedCondition: 'fair',
        surveyStatus: 'verified_serviceable',
        findingsNotes: 'Speaker #2 has minor scratch on grill; acoustic driver functioning 100%.',
      });

      expect(audit.updatedAsset.condition).toBe('fair');
      expect(audit.updatedAsset.lastSurveyStatus).toBe('verified_serviceable');
      expect(audit.record.surveyYear).toBe(2026);
      expect(audit.record.committeeMemberUserIds).toHaveLength(3);
    });
  });

  describe('Event Settlement & Funding Source Journal Reconciliation', () => {
    it('reconciles ministry-funded midday feeding event with balanced supplier payables', () => {
      const settlement = generateEventSettlement(nutritionProgramEvent, 1450000); // Rs. 14,500.00 actual cost

      expect(settlement.totalCostCents).toBe(1450000);
      expect(settlement.varianceCents).toBe(-50000); // 50,000 cents (Rs. 500) under budget!

      // Verify balanced double-entry entries
      const debits = settlement.journalEntries
        .filter((e) => e.side === 'debit')
        .reduce((sum, e) => sum + e.amountCents, 0);
      const credits = settlement.journalEntries
        .filter((e) => e.side === 'credit')
        .reduce((sum, e) => sum + e.amountCents, 0);

      expect(debits).toBe(1450000);
      expect(credits).toBe(1450000);
      expect(settlement.journalEntries[0]?.accountId).toContain('subsidy:ministry_grant');
    });
  });
});
