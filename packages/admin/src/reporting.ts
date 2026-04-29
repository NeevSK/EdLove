import type { AttendanceReport, TenantKind } from '@repo/core';
import { attendanceAPI } from '@repo/core/api';
import { supabase } from '@repo/core/native';

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  category: 'attendance' | 'operations' | 'inventory';
}

export interface DocumentTemplateDefinition {
  id: string;
  title: string;
  category: 'report' | 'letter' | 'certificate';
  audience: 'principal' | 'staff' | 'guardian';
}

export interface OperationalSnapshot {
  totalStaff: number;
  totalStudents: number;
  totalClassrooms: number;
  pendingLeaves: number;
  pendingInventoryRequests: number;
}

export interface ReportingTenantFilter {
  tenantKinds?: TenantKind[];
}

const CUSTOMER_REPORTING_TENANT_KINDS: TenantKind[] = ['customer'];

const REPORT_CATALOG: ReportDefinition[] = [
  {
    id: 'attendance_overview',
    title: 'Attendance Overview',
    description: 'Cross-school attendance trend and absence summary.',
    category: 'attendance',
  },
  {
    id: 'operations_snapshot',
    title: 'Operations Snapshot',
    description: 'Pending approvals, inventory requests, and institutional load.',
    category: 'operations',
  },
  {
    id: 'resource_needs',
    title: 'Resource Needs',
    description: 'Aggregated classroom requests and urgent institutional needs.',
    category: 'inventory',
  },
];

const DOCUMENT_TEMPLATES: DocumentTemplateDefinition[] = [
  { id: 'attendance_letter', title: 'Attendance Letter', category: 'letter', audience: 'guardian' },
  {
    id: 'school_summary',
    title: 'School Summary Report',
    category: 'report',
    audience: 'principal',
  },
  {
    id: 'character_certificate',
    title: 'Character Certificate',
    category: 'certificate',
    audience: 'staff',
  },
];

export const reportingAPI = {
  async listReports(): Promise<ReportDefinition[]> {
    return REPORT_CATALOG;
  },

  async getAttendanceReport(
    schoolId: string,
    startDate: string,
    endDate: string,
    classroomId?: string,
  ): Promise<AttendanceReport> {
    const report = await attendanceAPI.getAttendanceReport(
      schoolId,
      startDate,
      endDate,
      classroomId,
    );
    return {
      ...report,
      trend: (report.trend || []).map((p) => ({
        ...p,
        date: p.date || new Date().toISOString().split('T')[0],
      })),
    } as AttendanceReport;
  },

  async getOperationalSnapshot(
    schoolId: string,
    filter?: ReportingTenantFilter,
  ): Promise<OperationalSnapshot> {
    const staffUsersQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .neq('role', 'student');
    const studentUsersQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('role', 'student');

    const filteredStaffUsersQuery = filter?.tenantKinds?.length
      ? staffUsersQuery.in('tenant_kind', filter.tenantKinds)
      : staffUsersQuery;
    const filteredStudentUsersQuery = filter?.tenantKinds?.length
      ? studentUsersQuery.in('tenant_kind', filter.tenantKinds)
      : studentUsersQuery;

    const [staff, students, classrooms, pendingLeaves, pendingInventoryRequests] =
      await Promise.all([
        filteredStaffUsersQuery,
        filteredStudentUsersQuery,
        supabase
          .from('classrooms')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId),
        supabase
          .from('staff_leaves')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('status', 'pending'),
        supabase
          .from('inventory_requests')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('status', 'pending'),
      ]);

    return {
      totalStaff: staff.count ?? 0,
      totalStudents: students.count ?? 0,
      totalClassrooms: classrooms.count ?? 0,
      pendingLeaves: pendingLeaves.count ?? 0,
      pendingInventoryRequests: pendingInventoryRequests.count ?? 0,
    };
  },

  async getOperationalSnapshotSegmented(
    schoolId: string,
    filter: ReportingTenantFilter,
  ): Promise<OperationalSnapshot> {
    return this.getOperationalSnapshot(schoolId, filter);
  },

  getCustomerReportingFilter(): ReportingTenantFilter {
    return {
      tenantKinds: CUSTOMER_REPORTING_TENANT_KINDS,
    };
  },

  async getCustomerOperationalSnapshot(schoolId: string): Promise<OperationalSnapshot> {
    return this.getOperationalSnapshot(schoolId, this.getCustomerReportingFilter());
  },
};

export const documentsAPI = {
  async listTemplates(): Promise<DocumentTemplateDefinition[]> {
    return DOCUMENT_TEMPLATES;
  },
};
