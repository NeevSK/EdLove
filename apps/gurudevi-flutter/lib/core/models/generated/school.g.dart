// GENERATED FROM packages/schema/schema.zmodel - DO NOT MODIFY DIRECTLY

class SchoolModel {
  final String name;
  final String? handle;
  final String? created_by;
  final String? type;
  final String? census_id;
  final Map<String, dynamic>? custom_branding;
  final DateTime? last_census_sync;
  final String? avatar_url;
  final DateTime? deleted_at;
  final String? deleted_by;
  final String? deletion_reason;

  const SchoolModel({
    required this.name,
    this.handle,
    this.created_by,
    this.type,
    this.census_id,
    this.custom_branding,
    this.last_census_sync,
    this.avatar_url,
    this.deleted_at,
    this.deleted_by,
    this.deletion_reason,
  });

  factory SchoolModel.fromJson(Map<String, dynamic> json) {
    return SchoolModel(
      name: json['name'] as String,
      handle: json['handle'] as String?,
      created_by: json['created_by'] as String?,
      type: json['type'] as String?,
      census_id: json['census_id'] as String?,
      custom_branding: json['custom_branding'] as Map<String, dynamic>?,
      last_census_sync: json['last_census_sync'] != null ? DateTime.parse(json['last_census_sync'] as String) : null,
      avatar_url: json['avatar_url'] as String?,
      deleted_at: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
      deleted_by: json['deleted_by'] as String?,
      deletion_reason: json['deletion_reason'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'handle': handle,
      'created_by': created_by,
      'type': type,
      'census_id': census_id,
      'custom_branding': custom_branding,
      'last_census_sync': last_census_sync?.toIso8601String(),
      'avatar_url': avatar_url,
      'deleted_at': deleted_at?.toIso8601String(),
      'deleted_by': deleted_by,
      'deletion_reason': deletion_reason,
    };
  }
}
