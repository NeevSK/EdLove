import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'app_database.dart';

AppDatabase createPlatformDatabase() {
  return AppDatabase(
    driftDatabase(
      name: 'gurudevi_powersync_db',
      web: DriftWebOptions(
        sqlite3Wasm: Uri.parse('sqlite3.wasm'),
        driftWorker: Uri.parse('drift_worker.js'),
        onResult: (result) {
          if (result.missingFeatures.isNotEmpty) {
            debugPrint(
              'Drift Web fallback (${result.chosenImplementation}): '
              'missing features ${result.missingFeatures}',
            );
          }
        },
      ),
    ),
  );
}

final databaseProvider = Provider<AppDatabase>((ref) {
  final db = createPlatformDatabase();
  db.seedInitialData();
  return db;
});

final classroomStudentsStreamProvider =
    StreamProvider.family<List<ClassroomStudentEntry>, String>((ref, classroomId) {
  final db = ref.watch(databaseProvider);
  return db.watchClassroomStudents(classroomId);
});
