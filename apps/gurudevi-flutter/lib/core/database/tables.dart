import 'package:drift/drift.dart';

@DataClassName('UserEntry')
class Users extends Table {
  TextColumn get id => text()();
  TextColumn get fullName => text()();
  TextColumn get displayName => text().nullable()();
  TextColumn get email => text().nullable()();
  TextColumn get capacity => text().nullable()();
  BoolColumn get onboardingCompleted => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('BondEntry')
class Bonds extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get entityId => text()();
  TextColumn get entityType => text()(); // 'SCHOOL' | 'PLATFORM'
  TextColumn get capacity => text()(); // 'Teacher' | 'Principal' | 'Student' | 'Guardian'
  TextColumn get status => text().withDefault(const Constant('active'))();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('SchoolEntry')
class Schools extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get identifier => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('ClassroomEntry')
class Classrooms extends Table {
  TextColumn get id => text()();
  TextColumn get schoolId => text().nullable()();
  TextColumn get teacherId => text().nullable()();
  TextColumn get name => text()();
  TextColumn get subject => text().nullable()();
  TextColumn get academicYear => text().withDefault(const Constant('2026'))();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('ClassroomStudentEntry')
class ClassroomStudents extends Table {
  TextColumn get id => text()();
  TextColumn get classroomId => text()();
  TextColumn get studentId => text().nullable()();
  TextColumn get fullName => text()();
  IntColumn get rollNumber => integer().nullable()();
  TextColumn get status => text().withDefault(const Constant('present'))(); // 'present', 'absent', 'late'

  @override
  Set<Column> get primaryKey => {id};
}
