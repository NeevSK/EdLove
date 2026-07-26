export interface GrowthBookFeatureRecord {
  key: string;
  archived: boolean;
}

export function validateEndpoint(value: string): URL;
export function validateTimeout(value: number): number;
export function extractFeatureKeys(
  payload: unknown,
  prefix?: string,
): GrowthBookFeatureRecord[];
