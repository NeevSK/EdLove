// GENERATED FROM packages/schema/schema.zmodel - DO NOT MODIFY DIRECTLY

class BondModel {
  final String user_id;
  final String entity_id;
  final String entity_type;
  final String capacity;
  final DateTime? valid_until;
  final Map<String, dynamic>? metadata;
  final DateTime updated_at;

  const BondModel({
    required this.user_id,
    required this.entity_id,
    required this.entity_type,
    required this.capacity,
    this.valid_until,
    this.metadata,
    required this.updated_at,
  });

  factory BondModel.fromJson(Map<String, dynamic> json) {
    return BondModel(
      user_id: json['user_id'] as String,
      entity_id: json['entity_id'] as String,
      entity_type: json['entity_type'] as String,
      capacity: json['capacity'] as String,
      valid_until: json['valid_until'] != null ? DateTime.parse(json['valid_until'] as String) : null,
      metadata: json['metadata'] as Map<String, dynamic>?,
      updated_at: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': user_id,
      'entity_id': entity_id,
      'entity_type': entity_type,
      'capacity': capacity,
      'valid_until': valid_until?.toIso8601String(),
      'metadata': metadata,
      'updated_at': updated_at.toIso8601String(),
    };
  }
}
