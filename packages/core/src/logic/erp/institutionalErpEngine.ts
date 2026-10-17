/**
 * Institutional Educational ERP Business Engine
 *
 * Implements core operational logic for schools and educational institutes:
 * - Event Resource Allocations & Bill of Materials (BOM)
 * - Consumable Stock Dispatch with Low-Stock Reorder Triggers
 * - Timetable & Facility Reservation Clash-Detection
 * - Statutory Board of Survey (භාණ්ඩ සමීක්ෂණය) Audit Processing
 * - Double-Entry Inventory & Subsidy Ledger Emission
 */

import type { AccountingJournalEntry } from '../../types/EducationalEconomics';
import type {
  AssetCondition,
  BoardOfSurveyRecord,
  BoardOfSurveyStatus,
  EventResourceBOM,
  FacilityReservation,
  InstitutionalEvent,
  InventoryAssetItem,
  InventoryStockMovement,
} from '../../types/InstitutionalERP';

export interface AllocationRequest {
  event: InstitutionalEvent;
  durableRequests: Array<{ item: InventoryAssetItem; quantityRequested: number }>;
  consumableRequests: Array<{
    item: InventoryAssetItem;
    quantityDispatched: number;
    unitCostCents?: number;
  }>;
  facilityRequest?: {
    facilityId: string;
    facilityName: string;
    existingReservations: FacilityReservation[];
  };
}

export interface AllocationResult {
  bom: EventResourceBOM;
  success: boolean;
  errors: string[];
  hasFacilityClash: boolean;
  updatedDurables: InventoryAssetItem[];
  updatedConsumables: InventoryAssetItem[];
  stockMovements: InventoryStockMovement[];
}

export interface StockDispatchResult {
  updatedItem: InventoryAssetItem;
  movement: InventoryStockMovement;
  isLowStock: boolean;
  journalEntries: AccountingJournalEntry[];
}

export interface EventSettlementResult {
  eventId: string;
  title: string;
  fundingSource: string;
  totalCostCents: number;
  varianceCents: number; // Actual vs Estimated budget
  journalEntries: AccountingJournalEntry[];
}

/**
 * Checks if two date ranges overlap for spatial facility clash-detection.
 */
export function checkTimeRangeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const timeStartA = new Date(startA).getTime();
  const timeEndA = new Date(endA).getTime();
  const timeStartB = new Date(startB).getTime();
  const timeEndB = new Date(endB).getTime();

  return Math.max(timeStartA, timeStartB) < Math.min(timeEndA, timeEndB);
}

/**
 * Allocates durable equipment, consumable materials, and facility bookings for an event:
 * Verifies stock availability, checks timetable clashes, and computes total resource cost.
 */
export function allocateEventResources(request: AllocationRequest): AllocationResult {
  const { event, durableRequests, consumableRequests, facilityRequest } = request;
  const errors: string[] = [];
  const updatedDurables: InventoryAssetItem[] = [];
  const updatedConsumables: InventoryAssetItem[] = [];
  const stockMovements: InventoryStockMovement[] = [];

  const reservedDurables: EventResourceBOM['reservedDurables'] = [];
  const consumedStock: EventResourceBOM['consumedStock'] = [];
  let totalResourceCostCents = 0;

  // 1. Process Durable Asset Allocations (Equipment check-out)
  for (const { item, quantityRequested } of durableRequests) {
    if (quantityRequested > item.availableQuantity) {
      errors.push(
        `Insufficient durable stock for ${item.name}: Requested ${quantityRequested}, but only ${item.availableQuantity} available.`,
      );
    } else {
      const newAvailable = item.availableQuantity - quantityRequested;
      updatedDurables.push({
        ...item,
        availableQuantity: newAvailable,
      });

      reservedDurables.push({
        inventoryItemId: item.id,
        itemName: item.name,
        quantityRequested,
        checkedOutAt: event.startDate,
      });
    }
  }

  // 2. Process Consumable Material Allocations (Stock deduction)
  for (const { item, quantityDispatched, unitCostCents } of consumableRequests) {
    if (quantityDispatched > item.totalQuantity) {
      errors.push(
        `Insufficient consumable stock for ${item.name}: Requested ${quantityDispatched}, but only ${item.totalQuantity} in pantry/stores.`,
      );
    } else {
      const costPerUnit = unitCostCents ?? 0;
      const lineCostCents = quantityDispatched * costPerUnit;
      totalResourceCostCents += lineCostCents;

      const newTotal = item.totalQuantity - quantityDispatched;
      updatedConsumables.push({
        ...item,
        totalQuantity: newTotal,
        availableQuantity: Math.max(0, item.availableQuantity - quantityDispatched),
      });

      const movement: InventoryStockMovement = {
        id: `mov-${Date.now()}-${item.id}`,
        inventoryItemId: item.id,
        movementType: 'outflow_event_consumption',
        quantity: quantityDispatched,
        balanceAfter: newTotal,
        associatedEventId: event.id,
        performedByUserId: event.leadOrganizerUserId,
        recordedAt: new Date().toISOString(),
        unitCostCents: costPerUnit,
        totalCostCents: lineCostCents,
        notes: `Dispatched to event: ${event.title}`,
      };

      stockMovements.push(movement);

      consumedStock.push({
        inventoryItemId: item.id,
        itemName: item.name,
        quantityDispatched,
        unitOfMeasure: item.unitOfMeasure ?? 'units',
        costCents: lineCostCents,
      });
    }
  }

  // 3. Process Facility Reservation & Clash Detection
  const reservedFacilities: FacilityReservation[] = [];
  let hasFacilityClash = false;

  if (facilityRequest && event.endDate) {
    const clash = facilityRequest.existingReservations.find(
      (res) =>
        res.facilityId === facilityRequest.facilityId &&
        res.status === 'confirmed' &&
        checkTimeRangeOverlap(event.startDate, event.endDate!, res.startDateTime, res.endDateTime),
    );

    if (clash) {
      hasFacilityClash = true;
      errors.push(
        `Facility clash detected on ${facilityRequest.facilityName}: Already reserved for another booking from ${clash.startDateTime} to ${clash.endDateTime}.`,
      );
    }

    reservedFacilities.push({
      id: `res-${Date.now()}-${facilityRequest.facilityId}`,
      facilityId: facilityRequest.facilityId,
      facilityName: facilityRequest.facilityName,
      associatedEventId: event.id,
      bookedByUserId: event.leadOrganizerUserId,
      startDateTime: event.startDate,
      endDateTime: event.endDate,
      hasClash: !!clash,
      clashNotes: clash ? `Clashes with reservation ${clash.id}` : undefined,
      status: clash ? 'tentative' : 'confirmed',
    });
  }

  const bom: EventResourceBOM = {
    eventId: event.id,
    reservedDurables,
    consumedStock,
    reservedFacilities,
    totalResourceCostCents,
  };

  return {
    bom,
    success: errors.length === 0,
    errors,
    hasFacilityClash,
    updatedDurables,
    updatedConsumables,
    stockMovements,
  };
}

/**
 * Dispatches consumable stock (e.g. daily rice for the midday meal) and emits double-entry ledger entries.
 */
export function dispatchConsumableStock(
  item: InventoryAssetItem,
  quantity: number,
  params: {
    eventId?: string;
    performedByUserId: string;
    unitCostCents?: number;
    reason?: string;
  },
): StockDispatchResult {
  if (quantity <= 0) {
    throw new Error('Dispatch quantity must be greater than zero.');
  }

  if (quantity > item.totalQuantity) {
    throw new Error(
      `Cannot dispatch ${quantity} of ${item.name}; current stock is only ${item.totalQuantity}.`,
    );
  }

  const newBalance = item.totalQuantity - quantity;
  const unitCost = params.unitCostCents ?? 0;
  const totalCostCents = quantity * unitCost;
  const isLowStock = newBalance <= (item.reorderThreshold ?? 0);

  const updatedItem: InventoryAssetItem = {
    ...item,
    totalQuantity: newBalance,
    availableQuantity: Math.max(0, item.availableQuantity - quantity),
  };

  const movement: InventoryStockMovement = {
    id: `mov-${Date.now()}-${item.id}`,
    inventoryItemId: item.id,
    movementType: 'outflow_event_consumption',
    quantity,
    balanceAfter: newBalance,
    associatedEventId: params.eventId,
    performedByUserId: params.performedByUserId,
    recordedAt: new Date().toISOString(),
    unitCostCents: unitCost,
    totalCostCents,
    notes: params.reason ?? 'Consumable stock dispatch',
  };

  // Double-entry accounting for inventory consumption:
  // Debit Event/Operational Expense, Credit Inventory Asset
  const journalEntries: AccountingJournalEntry[] = [];
  if (totalCostCents > 0) {
    journalEntries.push({
      accountId: `expense:operational:${item.category}`,
      amountCents: totalCostCents,
      amount: totalCostCents / 100,
      side: 'debit',
      description: `Consumed ${quantity} ${item.unitOfMeasure ?? 'units'} of ${item.name}`,
    });
    journalEntries.push({
      accountId: `inventory:asset:${item.id}`,
      amountCents: totalCostCents,
      amount: totalCostCents / 100,
      side: 'credit',
      description: `Depleted inventory balance for ${item.name}`,
    });
  }

  return {
    updatedItem,
    movement,
    isLowStock,
    journalEntries,
  };
}

/**
 * Records an official Board of Survey (භාණ්ඩ සමීක්ෂණය) statutory annual audit for a school asset.
 */
export function recordBoardOfSurveyAudit(
  asset: InventoryAssetItem,
  audit: {
    surveyYear: number;
    schoolId: string;
    committeeMemberUserIds: string[];
    observedCondition: AssetCondition;
    surveyStatus: BoardOfSurveyStatus;
    findingsNotes: string;
  },
): { updatedAsset: InventoryAssetItem; record: BoardOfSurveyRecord } {
  const record: BoardOfSurveyRecord = {
    id: `bos-${audit.surveyYear}-${asset.id}`,
    schoolId: audit.schoolId,
    surveyYear: audit.surveyYear,
    assetId: asset.id,
    assetName: asset.name,
    recordedCondition: audit.observedCondition,
    surveyStatus: audit.surveyStatus,
    committeeMemberUserIds: audit.committeeMemberUserIds,
    findingsNotes: audit.findingsNotes,
    signedOffAt: new Date().toISOString(),
  };

  const updatedAsset: InventoryAssetItem = {
    ...asset,
    condition: audit.observedCondition,
    lastSurveyDate: record.signedOffAt,
    lastSurveyStatus: audit.surveyStatus,
    lastSurveyNotes: audit.findingsNotes,
  };

  return { updatedAsset, record };
}

/**
 * Generates financial settlement entries for an event/program (Ministry Grant vs. SDS Reserve vs. Tickets).
 */
export function generateEventSettlement(
  event: InstitutionalEvent,
  actualCostCents: number,
): EventSettlementResult {
  const varianceCents = actualCostCents - event.estimatedBudgetCents;
  const journalEntries: AccountingJournalEntry[] = [];

  if (event.fundingSource === 'ministry_grant') {
    // Government grant: Debit Subsidy Grant Receivable / Expense, Credit Payables/Cash
    journalEntries.push({
      accountId: `subsidy:ministry_grant:${event.category}`,
      amountCents: actualCostCents,
      amount: actualCostCents / 100,
      side: 'debit',
      description: `Ministry grant settlement for ${event.title}`,
    });
    journalEntries.push({
      accountId: 'payable:event_suppliers',
      amountCents: actualCostCents,
      amount: actualCostCents / 100,
      side: 'credit',
      description: `Vendor obligations for ${event.title}`,
    });
  } else if (event.fundingSource === 'sds_reserve') {
    // School Development Society Reserve: Debit SDS Reserve Fund, Credit Cash
    journalEntries.push({
      accountId: 'equity:sds_general_reserve',
      amountCents: actualCostCents,
      amount: actualCostCents / 100,
      side: 'debit',
      description: `SDS reserve expenditure for ${event.title}`,
    });
    journalEntries.push({
      accountId: 'payable:event_suppliers',
      amountCents: actualCostCents,
      amount: actualCostCents / 100,
      side: 'credit',
      description: `Vendor disbursements for ${event.title}`,
    });
  }

  return {
    eventId: event.id,
    title: event.title,
    fundingSource: event.fundingSource,
    totalCostCents: actualCostCents,
    varianceCents,
    journalEntries,
  };
}
