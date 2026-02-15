export type InventoryCategory = 'furniture' | 'supplies' | 'equipment';
export type InventoryCondition = 'good' | 'fair' | 'poor' | 'broken';

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
    condition: InventoryCondition;
    last_checked: string;
    notes?: string;
}
