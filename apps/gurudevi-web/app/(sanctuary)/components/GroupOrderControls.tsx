'use client';

import { moveWorkspaceGroup } from '@repo/core/logic/workspace/canvas';

export function GroupOrderControls<TGroupId extends string>({
  groupId,
  groupLabel,
  groupOrder,
  onChange,
}: Readonly<{
  groupId: TGroupId;
  groupLabel: string;
  groupOrder: readonly TGroupId[];
  onChange: (next: TGroupId[]) => void;
}>) {
  const index = groupOrder.indexOf(groupId);
  return (
    <span
      aria-label={`${groupLabel} order`}
      style={{ display: 'inline-flex', gap: '0.25rem', marginLeft: '0.5rem' }}
    >
      <button
        aria-label={`Move ${groupLabel} earlier`}
        disabled={index <= 0}
        onClick={() => onChange(moveWorkspaceGroup(groupOrder, groupId, 'up'))}
        type="button"
        style={orderButtonStyle}
      >
        ↑
      </button>
      <button
        aria-label={`Move ${groupLabel} later`}
        disabled={index < 0 || index >= groupOrder.length - 1}
        onClick={() => onChange(moveWorkspaceGroup(groupOrder, groupId, 'down'))}
        type="button"
        style={orderButtonStyle}
      >
        ↓
      </button>
    </span>
  );
}

const orderButtonStyle = {
  width: '2rem',
  height: '2rem',
  border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
  borderRadius: '999px',
  background: 'transparent',
  cursor: 'pointer',
} as const;
