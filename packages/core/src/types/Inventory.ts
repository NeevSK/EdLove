export type ClassroomResourceCategory = 'furniture' | 'supplies' | 'equipment';
export type ClassroomResourceCondition = 'good' | 'fair' | 'poor' | 'broken';

export interface ClassroomResourceItem {
    id: string;
    classroom_id: string;
    name: string;
    category: ClassroomResourceCategory;
    quantity: number;
    condition: ClassroomResourceCondition;
    last_checked: string;
    notes?: string;
}

export type InventoryCategory = ClassroomResourceCategory;
export type InventoryCondition = ClassroomResourceCondition;
export type InventoryItem = ClassroomResourceItem;

export interface InventoryRequest {
    id: string;
    school_id?: string;
    classroom_id: string;
    teacher_id: string;
    owner_context?: ResourceOwnerContext;
    item_name: string;
    quantity: string;
    reason?: string;
    status: 'pending' | 'approved' | 'delivered' | 'rejected';
    created_at: string;
}

export interface InstitutionalAsset {
    id: string;
    school_id: string;
    name: string;
    category: string;
    quantity: number;
    condition?: string | null;
    location?: string | null;
    assigned_scope?: 'school' | 'lab' | 'office' | 'shared' | 'classroom_support';
    classroom_id?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ResourceNeedSummary {
    id: string;
    school_id: string;
    resource_type: string;
    description: string;
    requested_by_count: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    icon: string;
}

export type ResourceOwnerContext = 'classroom' | 'institutional';
