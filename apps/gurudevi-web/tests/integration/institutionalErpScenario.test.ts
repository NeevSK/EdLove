import { describe, expect, it } from 'vitest';
import { erpHexagonalService } from '@/lib/domain/adapters/erp/erpHexagonalService';

describe('Institutional ERP Hexagonal Integration Scenario (G2 jsdom contract)', () => {
  it('retrieves canonical institutional events and inventory items', async () => {
    const events = await erpHexagonalService.getInstitutionalEvents('school-ananda-colombo');
    const inventory = await erpHexagonalService.getInventoryItems('school-ananda-colombo');

    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(inventory.length).toBeGreaterThanOrEqual(4);

    const nutritionEvent = events.find((e) => e.category === 'nutrition');
    expect(nutritionEvent).toBeDefined();
    expect(nutritionEvent?.fundingSource).toBe('ministry_grant');

    const riceItem = inventory.find((i) => i.id === 'inv-pantry-samba-rice');
    expect(riceItem).toBeDefined();
    expect(riceItem?.nature).toBe('consumable_stock');
  });

  it('allocates durable PA speakers and dispatches daily nutrition rations without errors', async () => {
    const events = await erpHexagonalService.getInstitutionalEvents('school-ananda-colombo');
    const inventory = await erpHexagonalService.getInventoryItems('school-ananda-colombo');

    const event = events[0]!;
    const paSpeaker = inventory.find((i) => i.nature === 'durable_equipment')!;
    const rice = inventory.find((i) => i.id === 'inv-pantry-samba-rice')!;

    // Allocate resources for the event
    const allocation = await erpHexagonalService.allocateResources({
      event,
      durableRequests: [{ item: paSpeaker, quantityRequested: 1 }],
      consumableRequests: [{ item: rice, quantityDispatched: 20, unitCostCents: 24000 }],
    });

    expect(allocation.success).toBe(true);
    expect(allocation.bom.totalResourceCostCents).toBe(480000); // 20kg * 240.00 = Rs. 4,800.00

    // Dispatch stock directly
    const dispatch = await erpHexagonalService.dispatchStock(rice, 10, {
      eventId: event.id,
      performedByUserId: 'usr-pantry-matron',
      unitCostCents: 24000,
      reason: 'Fresh morning porridge for primary classes',
    });

    expect(dispatch.movement.quantity).toBe(10);
    expect(dispatch.journalEntries.length).toBe(2);
    expect(dispatch.journalEntries[0]?.side).toBe('debit');
    expect(dispatch.journalEntries[1]?.side).toBe('credit');
  });
});
