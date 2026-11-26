// GENERATED FROM packages/schema/schema.zmodel - DO NOT MODIFY DIRECTLY

class ClassroomModel {
  final String? school_id;
  final String? grade_id;
  final String? teacher_id;
  final String? section_id;
  final String name;
  final String? handle;
  final String? subject;
  final String? description;
  final String? color_theme;
  final String academic_year;
  final DateTime updated_at;
  final String? created_by;
  final DateTime? deleted_at;
  final String? deleted_by;
  final String? deletion_reason;
  final String? kind;

  const ClassroomModel({
    this.school_id,
    this.grade_id,
    this.teacher_id,
    this.section_id,
    required this.name,
    this.handle,
    this.subject,
    this.description,
    this.color_theme,
    required this.academic_year,
    required this.updated_at,
    this.created_by,
    this.deleted_at,
    this.deleted_by,
    this.deletion_reason,
    this.kind,
  });

  factory ClassroomModel.fromJson(Map<String, dynamic> json) {
    return ClassroomModel(
      school_id: json['school_id'] as String?,
      grade_id: json['grade_id'] as String?,
      teacher_id: json['teacher_id'] as String?,
      section_id: json['section_id'] as String?,
      name: json['name'] as String,
      handle: json['handle'] as String?,
      subject: json['subject'] as String?,
      description: json['description'] as String?,
      color_theme: json['color_theme'] as String?,
      academic_year: json['academic_year'] as String,
      updated_at: DateTime.parse(json['updated_at'] as String),
      created_by: json['created_by'] as String?,
      deleted_at: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
      deleted_by: json['deleted_by'] as String?,
      deletion_reason: json['deletion_reason'] as String?,
      kind: json['kind'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'school_id': school_id,
      'grade_id': grade_id,
      'teacher_id': teacher_id,
      'section_id': section_id,
      'name': name,
      'handle': handle,
      'subject': subject,
      'description': description,
      'color_theme': color_theme,
      'academic_year': academic_year,
      'updated_at': updated_at.toIso8601String(),
      'created_by': created_by,
      'deleted_at': deleted_at?.toIso8601String(),
      'deleted_by': deleted_by,
      'deletion_reason': deletion_reason,
      'kind': kind,
    };
  }
}
