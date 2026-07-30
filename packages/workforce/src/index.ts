export type WorkforceJobFamily =
  | 'academic'
  | 'operations'
  | 'finance'
  | 'wellbeing'
  | 'facilities'
  | 'transport'
  | 'food_service'
  | 'external_service';

export interface WorkforcePosition {
  id: string;
  schoolId: string;
  title: string;
  family: WorkforceJobFamily;
  reportsToUserId?: string | null;
  active: boolean;
}

export interface WorkforceAssignment {
  id: string;
  userId: string;
  schoolId: string;
  positionId: string;
  startDate?: string | null;
  endDate?: string | null;
  status: 'active' | 'inactive' | 'planned';
}

export * from '@repo/workforce/constants/workforceRegistry';
export { default as WorkforceShell } from '@repo/workforce/WorkforceShell';
