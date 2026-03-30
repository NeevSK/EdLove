/**
 * SanctuaryTabBar.tsx  (web-only)
 *
 * Generic pill-style horizontal tab bar used across SelfView panels
 * (PrincipalSelfView, FounderSelfView) and any future panel-based screen.
 *
 * Replaces the copy-pasted `TABS.map(tab => <button …>)` block that appeared
 * identically in PrincipalSelfView.web.tsx and FounderSelfView.web.tsx.
 */
import React from 'react';

export interface SanctuaryTab<T extends string = string> {
    id: T;
    /** Any Lucide icon component (or any React component accepting `size` prop). */
    icon: React.ComponentType<{ size?: number; color?: string }>;
    label: string;
    /**
     * Active background colour.  Defaults to 'var(--moss)'.
     * Set to a specific CSS colour for role-branded tabs (e.g. Founder uses saffron).
     */
    activeColor?: string;
    /**
     * Text colour when the tab is active.
     * Defaults to 'white'.  Override to maintain WCAG AA contrast on light accents.
     */
    activeTextColor?: string;
}

interface SanctuaryTabBarProps<T extends string> {
    tabs: SanctuaryTab<T>[];
    activeId: T;
    onSelect: (id: T) => void;
    /** Extra wrapper style (e.g. marginBottom). */
    style?: React.CSSProperties;
}

export function SanctuaryTabBar<T extends string>({
    tabs,
    activeId,
    onSelect,
    style,
}: SanctuaryTabBarProps<T>) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '32px',
                ...style,
            }}
        >
            {tabs.map(tab => {
                const isActive = tab.id === activeId;
                const activeBg = tab.activeColor ?? 'var(--moss)';
                const activeText = tab.activeTextColor ?? 'white';
                return (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '13px',
                            fontFamily: 'var(--font-body)',
                            transition: 'all 0.2s',
                            background: isActive ? activeBg : 'var(--background-alt)',
                            color: isActive ? activeText : 'var(--ink)',
                        }}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
