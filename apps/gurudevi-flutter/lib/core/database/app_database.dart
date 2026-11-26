import 'package:drift/drift.dart';
import 'tables.dart';

part 'app_database.g.dart';

@DriftDatabase(tables: [Users, Bonds, Schools, Classrooms, ClassroomStudents])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.e);

  @override
  int get schemaVersion => 1;

  // Reactive Watchers
  Stream<List<ClassroomStudentEntry>> watchClassroomStudents(String classroomId) {
    return (select(classroomStudents)..where((tbl) => tbl.classroomId.equals(classroomId))).watch();
  }

  Stream<List<ClassroomEntry>> watchClassrooms() {
    return select(classrooms).watch();
  }

  Future<void> toggleAttendance(String studentId, String newStatus) {
    return (update(classroomStudents)..where((tbl) => tbl.id.equals(studentId)))
        .write(ClassroomStudentsCompanion(status: Value(newStatus)));
  }

  Future<void> seedInitialData() async {
    final count = await select(classrooms).get();
    if (count.isEmpty) {
      await into(classrooms).insert(
        ClassroomsCompanion.insert(
          id: 'cls-10a',
          name: 'Grade 10-A (Science & Math)',
          subject: const Value('Physics'),
        ),
      );

      final sampleStudents = [
        ClassroomStudentsCompanion.insert(
          id: 'stu-01',
          classroomId: 'cls-10a',
          fullName: 'Kavindu Perera',
          rollNumber: const Value(1),
          status: const Value('present'),
        ),
        ClassroomStudentsCompanion.insert(
          id: 'stu-02',
          classroomId: 'cls-10a',
          fullName: 'Nethmi Jayawardena',
          rollNumber: const Value(2),
          status: const Value('present'),
        ),
        ClassroomStudentsCompanion.insert(
          id: 'stu-03',
          classroomId: 'cls-10a',
          fullName: 'Sahan Wickramasinghe',
          rollNumber: const Value(3),
          status: const Value('absent'),
        ),
        ClassroomStudentsCompanion.insert(
          id: 'stu-04',
          classroomId: 'cls-10a',
          fullName: 'Dinithi Silva',
          rollNumber: const Value(4),
          status: const Value('present'),
        ),
      ];

      for (final s in sampleStudents) {
        await into(classroomStudents).insert(s);
      }
    }
  }
}
