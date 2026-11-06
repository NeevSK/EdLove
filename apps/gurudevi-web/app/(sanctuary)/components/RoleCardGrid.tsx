'use client';

import React from 'react';
import { CANONICAL_CIVIC_ROLES, type CivicRoleOption } from '@repo/core/types';
import styles from './role-card-grid.module.css';

export interface RoleOption<T extends string = string> {
  readonly id: T;
  readonly label: string;
  readonly emoji: string;
  readonly verb: string;
}

export const CANONICAL_ROLE_OPTIONS: readonly RoleOption[] = CANONICAL_CIVIC_ROLES as unknown as readonly RoleOption[];

export interface RoleCardGridProps<T extends string = string> {
  readonly roles?: readonly RoleOption<T>[];
  readonly selectedRoleId: T;
  readonly onSelectRole: (roleId: T) => void;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly name?: string;
}

export function RoleCardGrid<T extends string = string>({
  roles = CANONICAL_ROLE_OPTIONS as unknown as readonly RoleOption<T>[],
  selectedRoleId,
  onSelectRole,
  ariaLabel = 'Choose your role',
  className = '',
  name = 'role_selection',
}: Readonly<RoleCardGridProps<T>>) {
  return (
    <div
      className={`${styles.roleChoiceGrid} ${className}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {roles.map((role) => {
        const isSelected = selectedRoleId === role.id;
        return (
          <label
            key={role.id}
            className={`${styles.roleChoiceBtn} ${isSelected ? styles.roleChoiceBtnActive : ''}`}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <input
              type="radio"
              name={name}
              value={role.id}
              checked={isSelected}
              onChange={() => onSelectRole(role.id)}
              aria-label={`${role.label} — ${role.verb}`}
              style={{
                position: 'absolute',
                opacity: 0,
                width: 0,
                height: 0,
                pointerEvents: 'none',
              }}
            />
            <span className={styles.roleChoiceIcon} aria-hidden="true">
              {role.emoji}
            </span>
            <div className={styles.roleChoiceInfo}>
              <span className={styles.roleChoiceLabel}>{role.label}</span>
              <span className={styles.roleChoiceVerb}>{role.verb}</span>
            </div>
            {isSelected ? (
              <span className={styles.roleChoiceCheck} aria-hidden="true">
                ✓
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
