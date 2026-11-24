// GENERATED FROM packages/schema/schema.zmodel - DO NOT MODIFY DIRECTLY

class ClassroomStudentModel {
  final String classroom_id;
  final String? student_id;
  final String? full_name;
  final String? invite_code;
  final int? roll_number;
  final DateTime? claimed_at;
  final String? notes;

  const ClassroomStudentModel({
    required this.classroom_id,
    this.student_id,
    this.full_name,
    this.invite_code,
    this.roll_number,
    this.claimed_at,
    this.notes,
  });

  factory ClassroomStudentModel.fromJson(Map<String, dynamic> json) {
    return ClassroomStudentModel(
      classroom_id: json['classroom_id'] as String,
      student_id: json['student_id'] as String?,
      full_name: json['full_name'] as String?,
      invite_code: json['invite_code'] as String?,
      roll_number: json['roll_number'] as int?,
      claimed_at: json['claimed_at'] != null ? DateTime.parse(json['claimed_at'] as String) : null,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'classroom_id': classroom_id,
      'student_id': student_id,
      'full_name': full_name,
      'invite_code': invite_code,
      'roll_number': roll_number,
      'claimed_at': claimed_at?.toIso8601String(),
      'notes': notes,
    };
  }
}
