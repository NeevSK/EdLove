import 'package:flutter_test/flutter_test.dart';
import 'package:drift/native.dart';
import 'package:gurudevi_flutter/core/database/app_database.dart';

void main() {
  group('Drift Reactive Database & Stream Queries', () {
    late AppDatabase db;

    setUp(() {
      db = AppDatabase(NativeDatabase.memory());
    });

    tearDown(() async {
      await db.close();
    });

    test('seedInitialData creates classroom and student records', () async {
      await db.seedInitialData();

      final classrooms = await db.select(db.classrooms).get();
      expect(classrooms.length, 1);
      expect(classrooms.first.name, 'Grade 10-A (Science & Math)');

      final students = await db.select(db.classroomStudents).get();
      expect(students.length, 4);
      expect(students.any((s) => s.fullName == 'Kavindu Perera'), isTrue);
    });

    test('watchClassroomStudents stream emits updates when attendance is toggled', () async {
      await db.seedInitialData();

      final stream = db.watchClassroomStudents('cls-10a');

      // Check initial state
      final initialStudents = await stream.first;
      final student1 = initialStudents.firstWhere((s) => s.id == 'stu-01');
      expect(student1.status, 'present');

      // Toggle attendance to 'absent'
      await db.toggleAttendance('stu-01', 'absent');

      // Stream should reactively emit updated status
      final updatedStudents = await stream.first;
      final updatedStudent1 = updatedStudents.firstWhere((s) => s.id == 'stu-01');
      expect(updatedStudent1.status, 'absent');
    });
  });
}
