import 'package:flutter_test/flutter_test.dart';
import 'package:gurudevi_flutter/core/validation/user_validator.dart';

void main() {
  group('Dzod Zod-Compatible Runtime Validation', () {
    test('Valid teacher user profile succeeds validation', () {
      final input = {
        'displayName': 'Sunil Jayawardena',
        'email': 'sunil@school.lk',
        'capacity': 'Teacher',
      };

      final result = GurudeviValidators.userProfileSchema.safeParse(input);
      expect(result, isNotNull);
    });

    test('Short display name fails validation', () {
      final input = {
        'displayName': 'S', // Less than 2 chars
        'email': 'sunil@school.lk',
        'capacity': 'Teacher',
      };

      final result = GurudeviValidators.userProfileSchema.safeParse(input);
      expect(result, isNull);
    });

    test('Invalid email address fails validation', () {
      final input = {
        'displayName': 'Sunil Jayawardena',
        'email': 'not-an-email',
        'capacity': 'Teacher',
      };

      final result = GurudeviValidators.userProfileSchema.safeParse(input);
      expect(result, isNull);
    });

    test('Attendance record schema validates present/absent statuses', () {
      final validAttendance = {
        'studentId': 'stu-01',
        'classroomId': 'cls-10a',
        'status': 'present',
      };

      final result = GurudeviValidators.attendanceRecordSchema.safeParse(validAttendance);
      expect(result, isNotNull);

      final invalidAttendance = {
        'studentId': 'stu-01',
        'classroomId': 'cls-10a',
        'status': 'unknown_status',
      };
      expect(GurudeviValidators.attendanceRecordSchema.safeParse(invalidAttendance), isNull);
    });
  });
}
