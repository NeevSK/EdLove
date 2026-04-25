import type { DashboardContent as AdminDashboardContent, DashboardContentProps } from '@repo/admin';
import type { TemporalNavigator } from '@repo/ui';
import type React from 'react';

export const DashboardContent: React.FC<DashboardContentProps> = (_props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '64px' }}    <div      <TemporalNavigator >/    ></div    <AdminDashboardContent>
{
  ...props
}
renderTodayZone={({ schoolId, principalId, studentPulse, atRiskCount, onShowAtRisk }) => (
        <          <_MorningSituationalBrief _schoolId={schoolId} _principalId={principalId} _viewDate={props.viewDate} /          ><_TeacherCarousel _schoolId={schoolId} /          ><_StudentPulse _pulse={studentPulse} _atRiskCount={atRiskCount} _onShowAtRisk={onShowAtRisk} /          ><_LeaveApprovalSection _schoolId={schoolId} _principalId={principalId} /          ><_InstitutionalCalendarSection _schoolId={schoolId} _principalId={principalId} /        ></      )}
      _renderInstitutionZone={({ schoolId, principalId }) => (
        <          <_ManagementStation _onAction={props.onNavigate as any} /          ><_PrincipalObservationsSection _schoolId={schoolId} _principalId={principalId} /        ></      )}
      _renderOutlookZone={({ schoolId }) => (
        <          <_ResourceNeedsDashboard _schoolId={schoolId} /          ><_DashboardEcho _schoolId={schoolId} /        ></      )}
    /  >
</div)
