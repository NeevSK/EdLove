import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import React from 'react';

export interface MobileFeatureItem {
  id: string;
  title: string;
  description: string;
  route: string;
  params?: Record<string, string>;
  iconName?: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  requiredCapacity?: Capacity[];
  badge?: string;
  category?: string;
  defaultSubTab?: boolean;
}

export interface MobileDomainRegistry {
  domain: 'workspace' | 'self' | 'library' | 'community' | 'profile';
  title: string;
  subtitle: string;
  roleBadge?: string;
  items: MobileFeatureItem[];
}
