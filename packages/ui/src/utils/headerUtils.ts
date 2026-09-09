import { Crown, GraduationCap, School } from '@repo/ui/icons';
import type { TFunction } from 'i18next';
import type React from 'react';

export interface HeaderRoleContext {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  emoji: string;
  label: string;
}

export interface HeaderGreetingDetails {
  text: string;
  emoji: string;
}

export function getHeaderRoleContext(
  can: (action: any, subject: any) => boolean,
  t: TFunction,
): HeaderRoleContext {
  if (can('manage', 'AdminDashboard')) {
    return { icon: Crown, emoji: '⚡', label: t('roles.admin', 'Admin') };
  }
  if (can('manage', 'PrincipalDashboard')) {
    return { icon: Crown, emoji: '🏛️', label: t('roles.principal', 'Principal') };
  }
  if (can('manage', 'SectionHeadDashboard')) {
    return { icon: GraduationCap, emoji: '🏔️', label: t('roles.sectionHead', 'Section Head') };
  }
  if (can('manage', 'GradeHeadDashboard')) {
    return { icon: GraduationCap, emoji: '🌲', label: t('roles.gradeHead', 'Grade Head') };
  }
  if (can('manage', 'TeacherDashboard')) {
    return { icon: GraduationCap, emoji: '🌱', label: t('roles.teacher', 'Teacher') };
  }
  if (can('manage', 'StudentDashboard')) {
    return { icon: School, emoji: '📚', label: t('roles.student', 'Student') };
  }
  return { icon: School, emoji: '🌿', label: t('roles.member', 'Member') };
}

export function getHeaderGreeting(t: TFunction): HeaderGreetingDetails {
  const hour = new Date().getHours();
  if (hour < 12) return { text: t('goodMorning', 'Good morning'), emoji: '🌅' };
  if (hour < 18) return { text: t('goodAfternoon', 'Good afternoon'), emoji: '☀️' };
  return { text: t('goodEvening', 'Good evening'), emoji: '🏮' };
}
