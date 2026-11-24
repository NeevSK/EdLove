// GENERATED FROM packages/schema/schema.zmodel - DO NOT MODIFY DIRECTLY

class UserModel {
  final String? email;
  final String full_name;
  final String? display_name;
  final String? first_name;
  final String? last_name;
  final String? identity_state;
  final String? username;
  final String? avatar_url;
  final String? bio;
  final String? phone;
  final String? index_number;
  final String? nic_number;
  final String? capacity;
  final String? thuthimal_gifter;
  final DateTime? thuthimal_gifted_at;
  final int? experience_years;
  final List<String> subjects_taught;
  final List<String> qualifications;
  final String? tenant_kind;
  final DateTime? onboarding_completed_at;
  final String? school_id;
  final Map<String, dynamic>? metadata;
  final DateTime updated_at;
  final DateTime? last_seen_at;
  final String? escrowed_recovery_key;
  final DateTime? deleted_at;
  final String? deleted_by;
  final String? deletion_reason;
  final List<String> social_links;
  final List<String> reactions;
  final List<String> messages;
  final List<String> ai_messages;
  final List<String> mood_logs;
  final List<String> journal_entries;
  final List<String> thought_records;
  final List<String> learning_reflections;
  final List<String> joy_moments;
  final List<String> gratitude_glimmers;
  final List<String> sleep_logs;
  final List<String> timetable_periods;
  final List<String> daily_prep_items;
  final List<String> personal_reminders;
  final List<String> todo_lists;
  final List<String> todos;
  final List<String> notifications;
  final List<String> push_tokens;
  final List<String> whispered_moments;
  final List<String> growth_events;
  final String? growth_state;
  final List<String> manifesto_endorsements;
  final List<String> staff_leaves;
  final List<String> invoices;
  final List<String> bonds;
  final List<String> entitlement_grants;
  final String? energy_balance;
  final List<String> ad_reward_transactions;

  const UserModel({
    this.email,
    required this.full_name,
    this.display_name,
    this.first_name,
    this.last_name,
    this.identity_state,
    this.username,
    this.avatar_url,
    this.bio,
    this.phone,
    this.index_number,
    this.nic_number,
    this.capacity,
    this.thuthimal_gifter,
    this.thuthimal_gifted_at,
    this.experience_years,
    required this.subjects_taught,
    required this.qualifications,
    this.tenant_kind,
    this.onboarding_completed_at,
    this.school_id,
    this.metadata,
    required this.updated_at,
    this.last_seen_at,
    this.escrowed_recovery_key,
    this.deleted_at,
    this.deleted_by,
    this.deletion_reason,
    required this.social_links,
    required this.reactions,
    required this.messages,
    required this.ai_messages,
    required this.mood_logs,
    required this.journal_entries,
    required this.thought_records,
    required this.learning_reflections,
    required this.joy_moments,
    required this.gratitude_glimmers,
    required this.sleep_logs,
    required this.timetable_periods,
    required this.daily_prep_items,
    required this.personal_reminders,
    required this.todo_lists,
    required this.todos,
    required this.notifications,
    required this.push_tokens,
    required this.whispered_moments,
    required this.growth_events,
    this.growth_state,
    required this.manifesto_endorsements,
    required this.staff_leaves,
    required this.invoices,
    required this.bonds,
    required this.entitlement_grants,
    this.energy_balance,
    required this.ad_reward_transactions,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      email: json['email'] as String?,
      full_name: json['full_name'] as String,
      display_name: json['display_name'] as String?,
      first_name: json['first_name'] as String?,
      last_name: json['last_name'] as String?,
      identity_state: json['identity_state'] as String?,
      username: json['username'] as String?,
      avatar_url: json['avatar_url'] as String?,
      bio: json['bio'] as String?,
      phone: json['phone'] as String?,
      index_number: json['index_number'] as String?,
      nic_number: json['nic_number'] as String?,
      capacity: json['capacity'] as String?,
      thuthimal_gifter: json['thuthimal_gifter'] as String?,
      thuthimal_gifted_at: json['thuthimal_gifted_at'] != null ? DateTime.parse(json['thuthimal_gifted_at'] as String) : null,
      experience_years: json['experience_years'] as int?,
      subjects_taught: json['subjects_taught'] as List<String>,
      qualifications: json['qualifications'] as List<String>,
      tenant_kind: json['tenant_kind'] as String?,
      onboarding_completed_at: json['onboarding_completed_at'] != null ? DateTime.parse(json['onboarding_completed_at'] as String) : null,
      school_id: json['school_id'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      updated_at: DateTime.parse(json['updated_at'] as String),
      last_seen_at: json['last_seen_at'] != null ? DateTime.parse(json['last_seen_at'] as String) : null,
      escrowed_recovery_key: json['escrowed_recovery_key'] as String?,
      deleted_at: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
      deleted_by: json['deleted_by'] as String?,
      deletion_reason: json['deletion_reason'] as String?,
      social_links: json['social_links'] as List<String>,
      reactions: json['reactions'] as List<String>,
      messages: json['messages'] as List<String>,
      ai_messages: json['ai_messages'] as List<String>,
      mood_logs: json['mood_logs'] as List<String>,
      journal_entries: json['journal_entries'] as List<String>,
      thought_records: json['thought_records'] as List<String>,
      learning_reflections: json['learning_reflections'] as List<String>,
      joy_moments: json['joy_moments'] as List<String>,
      gratitude_glimmers: json['gratitude_glimmers'] as List<String>,
      sleep_logs: json['sleep_logs'] as List<String>,
      timetable_periods: json['timetable_periods'] as List<String>,
      daily_prep_items: json['daily_prep_items'] as List<String>,
      personal_reminders: json['personal_reminders'] as List<String>,
      todo_lists: json['todo_lists'] as List<String>,
      todos: json['todos'] as List<String>,
      notifications: json['notifications'] as List<String>,
      push_tokens: json['push_tokens'] as List<String>,
      whispered_moments: json['whispered_moments'] as List<String>,
      growth_events: json['growth_events'] as List<String>,
      growth_state: json['growth_state'] as String?,
      manifesto_endorsements: json['manifesto_endorsements'] as List<String>,
      staff_leaves: json['staff_leaves'] as List<String>,
      invoices: json['invoices'] as List<String>,
      bonds: json['bonds'] as List<String>,
      entitlement_grants: json['entitlement_grants'] as List<String>,
      energy_balance: json['energy_balance'] as String?,
      ad_reward_transactions: json['ad_reward_transactions'] as List<String>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'full_name': full_name,
      'display_name': display_name,
      'first_name': first_name,
      'last_name': last_name,
      'identity_state': identity_state,
      'username': username,
      'avatar_url': avatar_url,
      'bio': bio,
      'phone': phone,
      'index_number': index_number,
      'nic_number': nic_number,
      'capacity': capacity,
      'thuthimal_gifter': thuthimal_gifter,
      'thuthimal_gifted_at': thuthimal_gifted_at?.toIso8601String(),
      'experience_years': experience_years,
      'subjects_taught': subjects_taught,
      'qualifications': qualifications,
      'tenant_kind': tenant_kind,
      'onboarding_completed_at': onboarding_completed_at?.toIso8601String(),
      'school_id': school_id,
      'metadata': metadata,
      'updated_at': updated_at.toIso8601String(),
      'last_seen_at': last_seen_at?.toIso8601String(),
      'escrowed_recovery_key': escrowed_recovery_key,
      'deleted_at': deleted_at?.toIso8601String(),
      'deleted_by': deleted_by,
      'deletion_reason': deletion_reason,
      'social_links': social_links,
      'reactions': reactions,
      'messages': messages,
      'ai_messages': ai_messages,
      'mood_logs': mood_logs,
      'journal_entries': journal_entries,
      'thought_records': thought_records,
      'learning_reflections': learning_reflections,
      'joy_moments': joy_moments,
      'gratitude_glimmers': gratitude_glimmers,
      'sleep_logs': sleep_logs,
      'timetable_periods': timetable_periods,
      'daily_prep_items': daily_prep_items,
      'personal_reminders': personal_reminders,
      'todo_lists': todo_lists,
      'todos': todos,
      'notifications': notifications,
      'push_tokens': push_tokens,
      'whispered_moments': whispered_moments,
      'growth_events': growth_events,
      'growth_state': growth_state,
      'manifesto_endorsements': manifesto_endorsements,
      'staff_leaves': staff_leaves,
      'invoices': invoices,
      'bonds': bonds,
      'entitlement_grants': entitlement_grants,
      'energy_balance': energy_balance,
      'ad_reward_transactions': ad_reward_transactions,
    };
  }
}
