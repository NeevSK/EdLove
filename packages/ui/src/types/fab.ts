import React from 'react';

export type TabType = 'self' | 'classroom' | 'community' | 'library' | 'profile' | 'section' | 'grade' | 'principal' | 'founder';

export interface ActionItem {
    label: string;
    onPress: () => void;
    icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
}
