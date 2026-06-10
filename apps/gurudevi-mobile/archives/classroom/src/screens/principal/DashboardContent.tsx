import type { DashboardContentProps } from '@repo/admin';
import {
  DashboardContent as AdminDashboardContent,
  DashboardEcho,
  InstitutionalCalendarSection,
  LeaveApprovalSection,
  ManagementStation,
  MorningSituationalBrief,
  PrincipalObservationsSection,
  ResourceNeedsDashboard,
  TeacherCarousel,
} from '@repo/admin';
import { TemporalNavigator } from '@repo/ui/components';
import type React from 'react';
import { StudentPulse } from './StudentPulse';

export const DashboardContent: React.FC<DashboardContentProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '64px' }}>
    <TemporalNavigator />
    <AdminDashboardContent
      {...props}
      renderTodayZone={({ schoolId, principalId, studentPulse, atRiskCount, onShowAtRisk }) => (
        <>
          <MorningSituationalBrief schoolId={schoolId} principalId={principalId} viewDate={props.viewDate} />
          <TeacherCarousel schoolId={schoolId} />
          <StudentPulse pulse={studentPulse} atRiskCount={atRiskCount} onShowAtRisk={onShowAtRisk} />
          <LeaveApprovalSection schoolId={schoolId} principalId={principalId} />
          <InstitutionalCalendarSection schoolId={schoolId} principalId={principalId} />
        </>
      )}
      renderInstitutionZone={({ schoolId, principalId }) => (
        <>
          <ManagementStation onAction={props.onNavigate as any} />
          <PrincipalObservationsSection schoolId={schoolId} principalId={principalId} />
        </>
      )}
      renderOutlookZone={({ schoolId }) => (
        <>
          <ResourceNeedsDashboard schoolId={schoolId} />
          <DashboardEcho schoolId={schoolId} />
        </>
      )}
    />
  </div>
);
