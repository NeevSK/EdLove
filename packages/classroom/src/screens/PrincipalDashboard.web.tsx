import React from 'react';
import { PrincipalNativeWorkspace as AdminPrincipalDashboardWeb } from '@repo/admin';
import { UniversalPerspective } from '@repo/library';

import { 
  MorningSituationalBrief,
  PulseDashboard,
  TeacherCarousel,
  LeaveApprovalSection,
  InstitutionalCalendarSection,
  PrincipalObservationsSection,
  ResourceNeedsDashboard,
  DashboardEcho
} from '../components/principal';

export default function PrincipalDashboardWeb(props: { schoolId?: string; userId?: string; forceDemo?: boolean; onRefresh?: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. School Health & Pulse - DIRECT ATOMIC */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <PulseDashboard schoolId={props.schoolId || ''} />
      </div>

      <AdminPrincipalDashboardWeb
        schoolId={props.schoolId || ''}
        userId={props.userId || ''}
        // AdminPrincipalDashboardWeb handles navigation via activeView and onActiveViewChange
        renderMain={(ctx: any) => (
          <MorningSituationalBrief 
            stats={{}}
            presence={[]}
            resonanceScore={0}
            schoolId={props.schoolId || ''} 
          />
        )}
        renderAdditionalView={(ctx: any) => {
          if (ctx.activeView === 'hierarchy') {
            return (
              <div style={{ height: '500px' }}>
                <UniversalPerspective 
                  topology={{} as any}
                  onNodePress={() => {}}
                />
              </div>
            );
          }
          return null;
        }}
      />
    </div>
  );
}
