export type InventoryCategory = 'furniture' | 'supplies' | 'equipment';
export type InventoryCondition = 'good' | 'fair' | 'poor' | 'broken';

export interface InventoryItem {
    id: string;
    classroom_id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
    condition: InventoryCondition;
    last_checked: string;
    notes?: string;
}

export interface InventoryRequest {
    id: string;
    classroom_id: string;
    teacher_id: string;
    item_name: string;
    quantity: string;
    reason?: string;
    status: 'pending' | 'approved' | 'delivered' | 'rejected';
    created_at: string;
}
