enum PerspectiveKind {
  personal,
  institutional,
}

class SanctuaryPerspective {
  final String id;
  final PerspectiveKind kind;
  final String? schoolId;
  final String? schoolName;
  final String? capacity; // 'teacher' | 'principal' | 'student' | 'guardian' etc.
  final String label;

  const SanctuaryPerspective({
    required this.id,
    required this.kind,
    this.schoolId,
    this.schoolName,
    this.capacity,
    required this.label,
  });

  static const personal = SanctuaryPerspective(
    id: 'personal',
    kind: PerspectiveKind.personal,
    label: 'Personal Sanctuary',
  );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SanctuaryPerspective &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class Bond {
  final String id;
  final String entityType; // 'SCHOOL'
  final String entityId;
  final String capacity; // 'teacher' | 'principal' | 'student' | 'guardian'
  final String? entityName;
  final Map<String, dynamic>? metadata;

  const Bond({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.capacity,
    this.entityName,
    this.metadata,
  });

  SanctuaryPerspective toPerspective() {
    return SanctuaryPerspective(
      id: id,
      kind: PerspectiveKind.institutional,
      schoolId: entityId,
      schoolName: entityName,
      capacity: capacity,
      label: '${entityName ?? entityId} ($capacity)',
    );
  }
}
