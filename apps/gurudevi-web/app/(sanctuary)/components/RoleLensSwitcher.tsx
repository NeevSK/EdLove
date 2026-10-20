'use client';

import React from 'react';
import styles from './role-lens-switcher.module.css';

export type WorkspaceRoleFilter =
  | 'all'
  | 'common'
  | 'teacher'
  | 'student'
  | 'principal'
  | 'guardian';

export interface RoleDescriptor {
  id: WorkspaceRoleFilter;
  label: string;
  emoji: string;
  description: string;
}

export const ROLE_DESCRIPTORS: readonly RoleDescriptor[] = [
  { id: 'all', label: 'All', emoji: '✦', description: 'Show all tools and practices' },
  { id: 'common', label: 'Common', emoji: '🌿', description: 'Universal baseline shared by all' },
  { id: 'teacher', label: 'Teacher', emoji: '👨‍🏫', description: 'Educator & classroom guidance' },
  { id: 'student', label: 'Student', emoji: '🎓', description: 'Learner presence, schedule & studies' },
  { id: 'principal', label: 'Principal', emoji: '🏛️', description: 'Campus leadership, kiosk & badges' },
  { id: 'guardian', label: 'Guardian', emoji: '👨‍👩‍👧', description: 'Family circle & ward attendance' },
] as const;

export interface RoleLensSwitcherProps {
  activeRole: WorkspaceRoleFilter;
  onRoleChange: (role: WorkspaceRoleFilter) => void;
  availableRoles?: readonly WorkspaceRoleFilter[];
  className?: string;
  presentation?: 'pills' | 'menu';
}

export function RoleLensSwitcher({
  activeRole,
  onRoleChange,
  availableRoles = ['all', 'common', 'teacher', 'student', 'principal', 'guardian'],
  className = '',
  presentation = 'pills',
}: Readonly<RoleLensSwitcherProps>) {
  const rolesToRender = ROLE_DESCRIPTORS.filter((r) => availableRoles.includes(r.id));

  if (presentation === 'menu') {
    return (
      <label className={`${styles.roleMenu} ${className}`}>
        <select
          aria-label="Workspace role"
          onChange={(event) => onRoleChange(event.target.value as WorkspaceRoleFilter)}
          value={activeRole}
        >
          {rolesToRender.map((role) => (
            <option key={role.id} value={role.id}>
              {role.emoji} {role.label}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className={styles.roleMenuChevron}>
          ⌄
        </span>
      </label>
    );
  }

  return (
    <div
      className={`${styles.roleLensContainer} ${className}`}
      role="toolbar"
      aria-label="Role perspective lens"
    >
      <span className={styles.roleLensLabel}>
        <span aria-hidden="true">🏷️</span> Lens
      </span>
      <div className={styles.rolePills} role="radiogroup" aria-label="Select role perspective">
        {rolesToRender.map((role) => {
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              className={styles.rolePill}
              data-active={isActive ? 'true' : 'false'}
              role="radio"
              aria-checked={isActive}
              title={role.description}
              onClick={() => onRoleChange(role.id)}
            >
              <span className={styles.roleEmoji} aria-hidden="true">
                {role.emoji}
              </span>
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
