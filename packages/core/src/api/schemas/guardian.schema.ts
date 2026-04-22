import { z } from 'zod';

export const GuardianIdentitySchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  relationshipType: z.enum(['parent', 'guardian', 'caregiver']),
  contactInfo: z.any(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']),
  custodyInfo: z.any().optional(),
  emergencyContact: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  schoolId: z.string(),
  tenantId: z.string(),
});

export const GuardianContactInfoSchema = z.object({
  primaryPhone: z.string(),
  secondaryPhone: z.string().optional(),
  email: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  preferredCommunication: z.enum(['sms', 'email', 'whatsapp']),
});

export const GuardianCustodyInfoSchema = z.object({
  custodyLevel: z.enum(['full', 'partial', 'visitation']),
  legalDocuments: z.array(z.string()),
  restrictions: z
    .array(
      z.object({
        type: z.enum(['pickup', 'communication', 'medical', 'educational']),
        description: z.string(),
        isActive: z.boolean(),
      }),
    )
    .optional(),
  effectiveDate: z.string(),
  terminationDate: z.string().optional(),
});

export const GuardianEmergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  isPrimary: z.boolean(),
});

export const GuardianProfileCreateSchema = z.object({
  userId: z.string().optional(),
  relationshipType: z.enum(['parent', 'guardian', 'caregiver']),
  contactInfo: GuardianContactInfoSchema,
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  custodyInfo: GuardianCustodyInfoSchema.optional(),
  emergencyContact: GuardianEmergencyContactSchema.optional(),
  schoolId: z.string(),
  tenantId: z.string(),
});

export const GuardianVerificationDocumentSchema = z.object({
  id: z.string().optional(),
  documentType: z.enum(['id_proof', 'address_proof', 'custody_papers', 'emergency_contact']),
  fileName: z.string(),
  fileUrl: z.string(),
  uploadedAt: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const GuardianPermissionConfigSchema = z.object({
  category: z.enum(['attendance', 'grades', 'reports', 'communication', 'payments', 'medical']),
  level: z.enum(['none', 'read', 'write', 'admin']),
  scope: z.enum(['all_students', 'assigned_students', 'specific_students']),
  restrictions: z
    .array(
      z.object({
        timeRestrictions: z
          .object({
            allowedDays: z.array(z.number()),
            allowedHours: z.object({
              start: z.string(),
              end: z.string(),
            }),
            timezone: z.string(),
          })
          .optional(),
        contentFilters: z
          .array(
            z.object({
              field: z.string(),
              operator: z.enum(['includes', 'excludes', 'equals']),
              value: z.string(),
            }),
          )
          .optional(),
        approvalRequired: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const GuardianNotificationSettingsSchema = z.record(z.string(), z.any());

export const StudentGuardianRelationshipSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  guardianId: z.string(),
  relationshipType: z.enum(['parent', 'guardian', 'caregiver']),
  permissions: z.array(GuardianPermissionConfigSchema),
  custodyLevel: z.enum(['full', 'partial', 'visitation']),
  effectiveDate: z.string(),
  terminationDate: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  schoolId: z.string(),
});

export const GuardianGradeInfoSchema = z.object({
  subject: z.string(),
  grade: z.string(),
  percentage: z.number().optional(),
  date: z.string(),
  type: z.enum(['assignment', 'exam', 'project', 'participation']),
});

export const GuardianAssignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  dueDate: z.string(),
  status: z.enum(['pending', 'submitted', 'graded', 'overdue']),
  grade: z.string().optional(),
});

export const GuardianAnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  createdAt: z.string(),
  author: z.string(),
});

export const GuardianDataWindowSchema = z.object({
  kind: z.enum(['rolling_window', 'latest_snapshot', 'upcoming_projection']),
  label: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  asOf: z.string(),
});

export const GuardianTimelinePolicySchema = z.object({
  visibility: z.literal('official_records_only'),
  includes: z.array(z.enum(['attendance', 'grades'])),
  excludes: z.array(z.enum(['teacher_private_notes', 'draft_grades', 'admin_internal_records'])),
});

export const GuardianSummaryWindowsSchema = z.object({
  attendance: GuardianDataWindowSchema,
  grades: GuardianDataWindowSchema,
  assignments: GuardianDataWindowSchema,
});

export const GuardianSectionVisibilitySchema = z.object({
  attendance: z.boolean(),
  grades: z.boolean(),
  reports: z.boolean(),
  assignments: z.boolean(),
});

export const GuardianStudentOverviewSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  grade: z.string(),
  classroom: z.string(),
  attendance: z.object({
    present: z.number(),
    absent: z.number(),
    late: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
  grades: z.object({
    latest: z.array(GuardianGradeInfoSchema),
    average: z.number(),
  }),
  upcomingAssignments: z.array(GuardianAssignmentSchema),
  recentAnnouncements: z.array(GuardianAnnouncementSchema),
  summaryWindows: GuardianSummaryWindowsSchema.optional(),
  timelinePolicy: GuardianTimelinePolicySchema.optional(),
  sectionVisibility: GuardianSectionVisibilitySchema.optional(),
});

export const GuardianNotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['attendance', 'grade', 'payment', 'communication', 'emergency']),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
  actionUrl: z.string().optional(),
});

export const GuardianSchoolEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  type: z.enum(['academic', 'sports', 'cultural', 'meeting', 'holiday']),
  requiresRsvp: z.boolean(),
  rsvpStatus: z.enum(['attending', 'not_attending', 'maybe']).optional(),
});

export const GuardianActivityItemSchema = z.object({
  id: z.string(),
  type: z.enum(['grade_posted', 'attendance_marked', 'payment_received', 'announcement_read']),
  description: z.string(),
  timestamp: z.string(),
  studentId: z.string(),
});

export const GuardianDashboardPolicySchema = z.object({
  asOf: z.string(),
  timelineVisibility: z.literal('official_records_only'),
  summaryMode: z.literal('bounded_windows'),
  officialRecordTypes: z.array(z.enum(['attendance', 'grades'])),
  projectionTypes: z.array(z.enum(['assignments', 'notifications', 'events'])),
  excludedData: z.array(
    z.enum(['teacher_private_notes', 'draft_grades', 'admin_internal_records']),
  ),
});

export const GuardianDashboardSchema = z.object({
  guardianId: z.string(),
  students: z.array(GuardianStudentOverviewSchema),
  notifications: z.array(GuardianNotificationSchema),
  upcomingEvents: z.array(GuardianSchoolEventSchema),
  recentActivity: z.array(GuardianActivityItemSchema),
  policy: GuardianDashboardPolicySchema.optional(),
});

export type GuardianIdentity = z.infer<typeof GuardianIdentitySchema>;
export type GuardianStudentOverview = z.infer<typeof GuardianStudentOverviewSchema>;
export type GuardianDashboard = z.infer<typeof GuardianDashboardSchema>;
export type GuardianProfileCreate = z.infer<typeof GuardianProfileCreateSchema>;
export type GuardianVerificationDocument = z.infer<typeof GuardianVerificationDocumentSchema>;
export type GuardianPermissionConfig = z.infer<typeof GuardianPermissionConfigSchema>;
export type GuardianNotificationSettings = z.infer<typeof GuardianNotificationSettingsSchema>;
export type StudentGuardianRelationship = z.infer<typeof StudentGuardianRelationshipSchema>;
