import '../../../core/database/app_database.dart';
import '../../../core/models/perspective.dart';

/// Dart 3 Sealed Class hierarchy for exhaustive pattern matching
sealed class WorkspaceUiState {
  const WorkspaceUiState();
}

class WorkspaceLoading extends WorkspaceUiState {
  const WorkspaceLoading();
}

class WorkspaceReady extends WorkspaceUiState {
  final List<ClassroomStudentEntry> students;
  final SanctuaryPerspective perspective;
  final int presentCount;
  final int totalCount;
  final bool isGuest;

  const WorkspaceReady({
    required this.students,
    required this.perspective,
    required this.presentCount,
    required this.totalCount,
    required this.isGuest,
  });

  int get presentPercentage =>
      totalCount == 0 ? 0 : ((presentCount / totalCount) * 100).round();
}

class WorkspaceError extends WorkspaceUiState {
  final String message;
  const WorkspaceError(this.message);
}
