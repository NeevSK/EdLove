/**
 * Institutional ERP Hexagonal Port
 *
 * Defines domain boundaries for programs, events, material inventory, and facility reservations.
 */

import type {
  AllocationRequest,
  AllocationResult,
  StockDispatchResult,
} from '@repo/core/logic/erp/institutionalErpEngine';
import type {
  EventResourceBOM,
  FacilityReservation,
  InstitutionalEvent,
  InventoryAssetItem,
  InventoryStockMovement,
} from '@repo/core/types/InstitutionalERP';

export interface IErpPort {
  getInstitutionalEvents(scopeId: string): Promise<InstitutionalEvent[]>;
  getInventoryItems(scopeId: string): Promise<InventoryAssetItem[]>;
  allocateResources(request: AllocationRequest): Promise<AllocationResult>;
  dispatchStock(
    item: InventoryAssetItem,
    quantity: number,
    params: {
      eventId?: string;
      performedByUserId: string;
      unitCostCents?: number;
      reason?: string;
    },
  ): Promise<StockDispatchResult>;
  getFacilityReservations(facilityId: string): Promise<FacilityReservation[]>;
}

export interface IErpStoragePort {
  saveEvent(event: InstitutionalEvent): Promise<void>;
  saveInventoryItem(item: InventoryAssetItem): Promise<void>;
  saveStockMovement(movement: InventoryStockMovement): Promise<void>;
}
