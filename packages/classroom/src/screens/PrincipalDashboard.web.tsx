import React from 'react';
import { PrincipalDashboardWeb, DashboardContent } from '@repo/admin';
import type { ComponentType } from 'react';
import CreateSchoolModal from '../components/CreateSchoolModal';

type Props = {
  PrincipalOnboardingViewComponent: ComponentType<any>;
  CreateClassroomModalComponent: ComponentType<any>;
};

export default function PrincipalDashboardWebSurface({
  PrincipalOnboardingViewComponent,
  CreateClassroomModalComponent,
}: Props) {
  return (
    <PrincipalDashboardWeb
      DashboardContentComponent={DashboardContent}
      PrincipalOnboardingViewComponent={PrincipalOnboardingViewComponent}
      CreateSchoolModalComponent={CreateSchoolModal as any}
      CreateClassroomModalComponent={CreateClassroomModalComponent}
    />
  );
}
