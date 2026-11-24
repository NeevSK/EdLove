import 'package:dzod/dzod.dart';

/// Zod-compatible validation schemas matching @repo/schema rules
class GurudeviValidators {
  static final userProfileSchema = z.object({
    'displayName': z.string().min(2),
    'email': z.string().email(),
    'capacity': z.enum_([
      'Teacher',
      'Principal',
      'Student',
      'Guardian',
    ]),
  });

  static final attendanceRecordSchema = z.object({
    'studentId': z.string().min(1),
    'classroomId': z.string().min(1),
    'status': z.enum_(['present', 'absent', 'late', 'excused']),
  });

  static final classroomNoteSchema = z.object({
    'content': z.string().min(3).max(500),
    'studentId': z.string().optional(),
  });
}
