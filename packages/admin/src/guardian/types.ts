export type RelationshipType = 'parent' | 'guardian' | 'caregiver';
export type GuardianPermission =
  | 'attendance'
  | 'grades'
  | 'reports'
  | 'communication'
  | 'payments'
  | 'medical';
export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';
export type CustodyLevel = 'full' | 'partial' | 'visitation';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface GuardianIdentity {
  id: string;
  userId: string;
  relationshipType: RelationshipType;
  contactInfo: ContactInfo;
  verificationStatus: VerificationStatus;
  custodyInfo?: CustodyInfo;
  emergencyContact?: EmergencyContact;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
  tenantId: string;
}

export interface ContactInfo {
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  address: Address;
  preferredCommunication: 'sms' | 'email' | 'whatsapp';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustodyInfo {
  custodyLevel: CustodyLevel;
  legalDocuments: string[];
  restrictions?: CustodyRestriction[];
  effectiveDate: string;
  terminationDate?: string;
}

export interface CustodyRestriction {
  type: 'pickup' | 'communication' | 'medical' | 'educational';
  description: string;
  isActive: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface StudentGuardianRelationship {
  id: string;
  studentId: string;
  guardianId: string;
  relationshipType: RelationshipType;
  permissions: GuardianPermission[];
  custodyLevel: CustodyLevel;
  effectiveDate: string;
  terminationDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface GuardianPermissionConfig {
  category: GuardianPermission;
  level: PermissionLevel;
  scope: 'all_students' | 'assigned_students' | 'specific_students';
  restrictions?: PermissionRestrictions[];
}

export interface PermissionRestrictions {
  timeRestrictions?: TimeRestrictions;
  contentFilters?: ContentFilter[];
  approvalRequired?: boolean;
}

export interface TimeRestrictions {
  allowedDays: number[]; // 0-6 (Sunday-Saturday)
  allowedHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  timezone: string;
}

export interface ContentFilter {
  field: string;
  operator: 'includes' | 'excludes' | 'equals';
  value: string;
}

export interface VerificationDocument {
  id: string;
  guardianId: string;
  documentType: 'id_proof' | 'address_proof' | 'custody_papers' | 'emergency_contact';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface GuardianDashboardData {
  guardianId: string;
  students: StudentOverview[];
  notifications: GuardianNotification[];
  upcomingEvents: SchoolEvent[];
  recentActivity: ActivityItem[];
}

export interface StudentOverview {
  studentId: string;
  name: string;
  grade: string;
  classroom: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  };
  grades: {
    latest: GradeInfo[];
    average: number;
  };
  upcomingAssignments: Assignment[];
  recentAnnouncements: Announcement[];
}

export interface GradeInfo {
  subject: string;
  grade: string;
  percentage?: number;
  date: string;
  type: 'assignment' | 'exam' | 'project' | 'participation';
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  author: string;
}

export interface GuardianNotification {
  id: string;
  type: 'attendance' | 'grade' | 'payment' | 'communication' | 'emergency';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'academic' | 'sports' | 'cultural' | 'meeting' | 'holiday';
  requiresRsvp: boolean;
  rsvpStatus?: 'attending' | 'not_attending' | 'maybe';
}

export interface ActivityItem {
  id: string;
  type: 'grade_posted' | 'attendance_marked' | 'payment_received' | 'announcement_read';
  description: string;
  timestamp: string;
  studentId: string;
}

// Mobile-first responsive breakpoints for Guardian Portal
export interface GuardianLayoutBreakpoints {
  mobile: {
    maxWidth: 768;
    cardPadding: 16;
    fontSize: {
      small: 12;
      medium: 14;
      large: 16;
      xlarge: 18;
    };
  };
  tablet: {
    minWidth: 769;
    maxWidth: 1024;
    cardPadding: 20;
    fontSize: {
      small: 13;
      medium: 15;
      large: 17;
      xlarge: 19;
    };
  };
  desktop: {
    minWidth: 1025;
    cardPadding: 24;
    fontSize: {
      small: 14;
      medium: 16;
      large: 18;
      xlarge: 20;
    };
  };
}

// Web standalone features for Guardian Portal
export interface GuardianWebFeatures {
  realTimeNotifications: boolean;
  multiStudentDashboard: boolean;
  advancedFilters: boolean;
  exportCapabilities: ('pdf' | 'csv' | 'print')[];
  languageSupport: string[];
  accessibilityFeatures: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    keyboardNavigation: boolean;
  };
}
