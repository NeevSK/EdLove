/**
 * Institutional ERP Hexagonal Service Adapter
 *
 * Implements IErpPort & IErpStoragePort.
 * Provides offline-first local persistence and bridges @repo/core/logic/erp/institutionalErpEngine.
 */

import { storage } from '@repo/core/lib/storage';
import {
  type AllocationRequest,
  type AllocationResult,
  allocateEventResources,
  dispatchConsumableStock,
  type StockDispatchResult,
} from '@repo/core/logic/erp/institutionalErpEngine';
import type {
  FacilityReservation,
  InstitutionalEvent,
  InventoryAssetItem,
  InventoryStockMovement,
} from '@repo/core/types/InstitutionalERP';
import type { IErpPort, IErpStoragePort } from '../../ports/erp.port';

const EVENTS_CACHE_KEY = 'gurudevi:domain:erp:events';
const INVENTORY_CACHE_KEY = 'gurudevi:domain:erp:inventory';
const MOVEMENTS_CACHE_KEY = 'gurudevi:domain:erp:movements';

export const DEFAULT_CANONICAL_EVENTS: InstitutionalEvent[] = [
  {
    id: 'evt-midday-meal-daily',
    scopeType: 'school',
    scopeId: 'school-ananda-colombo',
    title: 'National Midday Nutritional Feeding Program',
    description:
      'Daily fresh hot lunch for primary students funded by the Ministry of Education grant.',
    category: 'nutrition',
    cadence: 'daily_recurring',
    startDate: '2026-10-10T07:30:00Z',
    endDate: '2026-10-10T09:00:00Z',
    recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
    leadOrganizerUserId: 'usr-teacher-karunaratne',
    approverUserId: 'usr-principal-colombo',
    status: 'in_progress',
    estimatedBudgetCents: 1800000, // Rs. 18,000.00
    fundingSource: 'ministry_grant',
    regulatoryNoticeId: 'circ-moe-nutrition-2024',
  },
  {
    id: 'evt-sigiriya-excursion-grade10',
    scopeType: 'grade',
    scopeId: 'grade-10',
    title: 'Grade 10 Annual History & Archaeological Field Excursion to Sigiriya',
    description: '3-day field study covering Sigiriya fortress and Dambulla cave temples.',
    category: 'excursion',
    cadence: 'one_time',
    startDate: '2026-11-15T05:00:00Z',
    endDate: '2026-11-17T20:00:00Z',
    leadOrganizerUserId: 'usr-history-head',
    approverUserId: 'usr-principal-colombo',
    status: 'sanctioned',
    estimatedBudgetCents: 65000000, // Rs. 650,000.00
    fundingSource: 'student_contributions',
    regulatoryNoticeId: 'circ-moe-excursion-safety-2022',
    parentalConsentRequired: true,
  },
  {
    id: 'evt-annual-sports-meet-2026',
    scopeType: 'school',
    scopeId: 'school-ananda-colombo',
    title: 'Inter-House Annual Athletic Sports Festival',
    description:
      'Annual track & field sports festival between Parakrama, Vijaya, Gemunu, and Tissa houses.',
    category: 'sports',
    cadence: 'one_time',
    startDate: '2026-12-05T08:00:00Z',
    endDate: '2026-12-05T18:00:00Z',
    leadOrganizerUserId: 'usr-sports-director',
    approverUserId: 'usr-principal-colombo',
    status: 'sanctioned',
    estimatedBudgetCents: 45000000, // Rs. 450,000.00
    fundingSource: 'sds_reserve',
  },
];

export const DEFAULT_CANONICAL_INVENTORY: InventoryAssetItem[] = [
  {
    id: 'inv-pantry-samba-rice',
    scopeType: 'school',
    scopeId: 'school-ananda-colombo',
    name: 'Samba Rice (Grade A Cleaned)',
    nature: 'consumable_stock',
    category: 'nutrition_pantry',
    totalQuantity: 120, // 120 kg
    availableQuantity: 120,
    unitOfMeasure: 'kg',
    condition: 'good',
    custodianUserId: 'usr-pantry-matron',
    storageLocation: 'Kitchen Main Ration Store',
    reorderThreshold: 30,
    expiryDate: '2027-03-31',
  },
  {
    id: 'inv-pantry-farm-eggs',
    scopeType: 'school',
    scopeId: 'school-ananda-colombo',
    name: 'Fresh Farm Brown Eggs',
    nature: 'consumable_stock',
    category: 'nutrition_pantry',
    totalQuantity: 450, // 450 eggs
    availableQuantity: 450,
    unitOfMeasure: 'units',
    condition: 'good',
    custodianUserId: 'usr-pantry-matron',
    storageLocation: 'Kitchen Cold Storage',
    reorderThreshold: 100,
    expiryDate: '2026-10-25',
  },
  {
    id: 'inv-sports-cricket-kit',
    scopeType: 'school',
    scopeId: 'school-ananda-colombo',
    name: 'Kookaburra Senior Cricket Bats & Gear Set',
    nature: 'durable_equipment',
    category: 'sports',
    totalQuantity: 8,
    availableQuantity: 8,
    condition: 'good',
    custodianUserId: 'usr-sports-director',
    storageLocation: 'Pavilion Sports Storage Room',
    assetTag: 'AC/SPT/CRK/2025/012',
    lastSurveyDate: '2026-01-15',
    lastSurveyStatus: 'verified_serviceable',
  },
  {
    id: 'inv-pa-amplifier-stage',
    scopeType: 'school',
    scopeId: 'school-ananda-colombo',
    name: 'Fender Passport Conference Portable PA Audio Rig',
    nature: 'durable_equipment',
    category: 'audio_visual',
    totalQuantity: 3,
    availableQuantity: 3,
    condition: 'good',
    custodianUserId: 'usr-av-master',
    storageLocation: 'Auditorium Control Booth',
    assetTag: 'AC/AV/PA/2024/003',
    lastSurveyDate: '2026-01-15',
    lastSurveyStatus: 'verified_serviceable',
  },
];

export class ErpHexagonalService implements IErpPort, IErpStoragePort {
  async getInstitutionalEvents(scopeId: string): Promise<InstitutionalEvent[]> {
    const raw = storage.getString(EVENTS_CACHE_KEY);
    if (!raw) {
      storage.set(EVENTS_CACHE_KEY, JSON.stringify(DEFAULT_CANONICAL_EVENTS));
      return DEFAULT_CANONICAL_EVENTS;
    }
    try {
      return JSON.parse(raw) as InstitutionalEvent[];
    } catch {
      return DEFAULT_CANONICAL_EVENTS;
    }
  }

  async getInventoryItems(scopeId: string): Promise<InventoryAssetItem[]> {
    const raw = storage.getString(INVENTORY_CACHE_KEY);
    if (!raw) {
      storage.set(INVENTORY_CACHE_KEY, JSON.stringify(DEFAULT_CANONICAL_INVENTORY));
      return DEFAULT_CANONICAL_INVENTORY;
    }
    try {
      return JSON.parse(raw) as InventoryAssetItem[];
    } catch {
      return DEFAULT_CANONICAL_INVENTORY;
    }
  }

  async allocateResources(request: AllocationRequest): Promise<AllocationResult> {
    const result = allocateEventResources(request);
    if (result.success) {
      const items = await this.getInventoryItems(request.event.scopeId);
      const updatedMap = new Map<string, InventoryAssetItem>();
      for (const item of items) updatedMap.set(item.id, item);
      for (const dur of result.updatedDurables) updatedMap.set(dur.id, dur);
      for (const con of result.updatedConsumables) updatedMap.set(con.id, con);

      storage.set(INVENTORY_CACHE_KEY, JSON.stringify(Array.from(updatedMap.values())));
    }
    return result;
  }

  async dispatchStock(
    item: InventoryAssetItem,
    quantity: number,
    params: {
      eventId?: string;
      performedByUserId: string;
      unitCostCents?: number;
      reason?: string;
    },
  ): Promise<StockDispatchResult> {
    const result = dispatchConsumableStock(item, quantity, params);
    await this.saveInventoryItem(result.updatedItem);
    await this.saveStockMovement(result.movement);
    return result;
  }

  async getFacilityReservations(facilityId: string): Promise<FacilityReservation[]> {
    return [
      {
        id: `res-sample-${facilityId}`,
        facilityId,
        facilityName: 'Main School Auditorium',
        associatedEventId: 'evt-annual-sports-meet-2026',
        bookedByUserId: 'usr-sports-director',
        startDateTime: '2026-12-05T08:00:00Z',
        endDateTime: '2026-12-05T18:00:00Z',
        status: 'confirmed',
      },
    ];
  }

  async saveEvent(event: InstitutionalEvent): Promise<void> {
    const events = await this.getInstitutionalEvents(event.scopeId);
    const index = events.findIndex((e) => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    storage.set(EVENTS_CACHE_KEY, JSON.stringify(events));
  }

  async saveInventoryItem(item: InventoryAssetItem): Promise<void> {
    const items = await this.getInventoryItems(item.scopeId);
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    storage.set(INVENTORY_CACHE_KEY, JSON.stringify(items));
  }

  async saveStockMovement(movement: InventoryStockMovement): Promise<void> {
    const raw = storage.getString(MOVEMENTS_CACHE_KEY);
    const movements: InventoryStockMovement[] = raw ? JSON.parse(raw) : [];
    movements.push(movement);
    storage.set(MOVEMENTS_CACHE_KEY, JSON.stringify(movements));
  }
}

export const erpHexagonalService = new ErpHexagonalService();
