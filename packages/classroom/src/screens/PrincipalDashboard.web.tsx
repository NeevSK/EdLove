import React from 'react';
import { PrincipalDashboardWeb as AdminPrincipalDashboardWeb } from '@repo/admin';
import { CreateSchoolModal } from '@repo/admin';
import { CreateClassroomModal, PrincipalOnboardingView } from '../components';
import { DashboardContent } from './principal/DashboardContent';

function CreateSchoolModalAdapter(props: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return (
    <CreateSchoolModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSuccess={() => props.onSuccess?.()}
    /  );
}

function CreateClassroomModalAdapter(props: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return (
    <CreateClassroomModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSuccess={() => props.onSuccess?.()}
    /  );
}

export default function PrincipalDashboardWeb(props: {
  schoolId?: string;
  userId?: string;
  forceDemo?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <AdminPrincipalDashboardWeb
      schoolId={props.schoolId}
      userId={props.userId}
      forceDemo={props.forceDemo}
      onRefresh={props.onRefresh}
      DashboardContentComponent={DashboardContent}
      PrincipalOnboardingViewComponent={PrincipalOnboardingView}
      CreateSchoolModalComponent={CreateSchoolModalAdapter}
      CreateClassroomModalComponent={CreateClassroomModalAdapter}
    /  );
}
