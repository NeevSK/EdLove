// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $UsersTable extends Users with TableInfo<$UsersTable, UserEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UsersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _fullNameMeta =
      const VerificationMeta('fullName');
  @override
  late final GeneratedColumn<String> fullName = GeneratedColumn<String>(
      'full_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _displayNameMeta =
      const VerificationMeta('displayName');
  @override
  late final GeneratedColumn<String> displayName = GeneratedColumn<String>(
      'display_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
      'email', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _capacityMeta =
      const VerificationMeta('capacity');
  @override
  late final GeneratedColumn<String> capacity = GeneratedColumn<String>(
      'capacity', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _onboardingCompletedMeta =
      const VerificationMeta('onboardingCompleted');
  @override
  late final GeneratedColumn<bool> onboardingCompleted = GeneratedColumn<bool>(
      'onboarding_completed', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("onboarding_completed" IN (0, 1))'),
      defaultValue: const Constant(false));
  @override
  List<GeneratedColumn> get $columns =>
      [id, fullName, displayName, email, capacity, onboardingCompleted];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'users';
  @override
  VerificationContext validateIntegrity(Insertable<UserEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('full_name')) {
      context.handle(_fullNameMeta,
          fullName.isAcceptableOrUnknown(data['full_name']!, _fullNameMeta));
    } else if (isInserting) {
      context.missing(_fullNameMeta);
    }
    if (data.containsKey('display_name')) {
      context.handle(
          _displayNameMeta,
          displayName.isAcceptableOrUnknown(
              data['display_name']!, _displayNameMeta));
    }
    if (data.containsKey('email')) {
      context.handle(
          _emailMeta, email.isAcceptableOrUnknown(data['email']!, _emailMeta));
    }
    if (data.containsKey('capacity')) {
      context.handle(_capacityMeta,
          capacity.isAcceptableOrUnknown(data['capacity']!, _capacityMeta));
    }
    if (data.containsKey('onboarding_completed')) {
      context.handle(
          _onboardingCompletedMeta,
          onboardingCompleted.isAcceptableOrUnknown(
              data['onboarding_completed']!, _onboardingCompletedMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  UserEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return UserEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      fullName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}full_name'])!,
      displayName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}display_name']),
      email: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}email']),
      capacity: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}capacity']),
      onboardingCompleted: attachedDatabase.typeMapping.read(
          DriftSqlType.bool, data['${effectivePrefix}onboarding_completed'])!,
    );
  }

  @override
  $UsersTable createAlias(String alias) {
    return $UsersTable(attachedDatabase, alias);
  }
}

class UserEntry extends DataClass implements Insertable<UserEntry> {
  final String id;
  final String fullName;
  final String? displayName;
  final String? email;
  final String? capacity;
  final bool onboardingCompleted;
  const UserEntry(
      {required this.id,
      required this.fullName,
      this.displayName,
      this.email,
      this.capacity,
      required this.onboardingCompleted});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['full_name'] = Variable<String>(fullName);
    if (!nullToAbsent || displayName != null) {
      map['display_name'] = Variable<String>(displayName);
    }
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    if (!nullToAbsent || capacity != null) {
      map['capacity'] = Variable<String>(capacity);
    }
    map['onboarding_completed'] = Variable<bool>(onboardingCompleted);
    return map;
  }

  UsersCompanion toCompanion(bool nullToAbsent) {
    return UsersCompanion(
      id: Value(id),
      fullName: Value(fullName),
      displayName: displayName == null && nullToAbsent
          ? const Value.absent()
          : Value(displayName),
      email:
          email == null && nullToAbsent ? const Value.absent() : Value(email),
      capacity: capacity == null && nullToAbsent
          ? const Value.absent()
          : Value(capacity),
      onboardingCompleted: Value(onboardingCompleted),
    );
  }

  factory UserEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return UserEntry(
      id: serializer.fromJson<String>(json['id']),
      fullName: serializer.fromJson<String>(json['fullName']),
      displayName: serializer.fromJson<String?>(json['displayName']),
      email: serializer.fromJson<String?>(json['email']),
      capacity: serializer.fromJson<String?>(json['capacity']),
      onboardingCompleted:
          serializer.fromJson<bool>(json['onboardingCompleted']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'fullName': serializer.toJson<String>(fullName),
      'displayName': serializer.toJson<String?>(displayName),
      'email': serializer.toJson<String?>(email),
      'capacity': serializer.toJson<String?>(capacity),
      'onboardingCompleted': serializer.toJson<bool>(onboardingCompleted),
    };
  }

  UserEntry copyWith(
          {String? id,
          String? fullName,
          Value<String?> displayName = const Value.absent(),
          Value<String?> email = const Value.absent(),
          Value<String?> capacity = const Value.absent(),
          bool? onboardingCompleted}) =>
      UserEntry(
        id: id ?? this.id,
        fullName: fullName ?? this.fullName,
        displayName: displayName.present ? displayName.value : this.displayName,
        email: email.present ? email.value : this.email,
        capacity: capacity.present ? capacity.value : this.capacity,
        onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      );
  UserEntry copyWithCompanion(UsersCompanion data) {
    return UserEntry(
      id: data.id.present ? data.id.value : this.id,
      fullName: data.fullName.present ? data.fullName.value : this.fullName,
      displayName:
          data.displayName.present ? data.displayName.value : this.displayName,
      email: data.email.present ? data.email.value : this.email,
      capacity: data.capacity.present ? data.capacity.value : this.capacity,
      onboardingCompleted: data.onboardingCompleted.present
          ? data.onboardingCompleted.value
          : this.onboardingCompleted,
    );
  }

  @override
  String toString() {
    return (StringBuffer('UserEntry(')
          ..write('id: $id, ')
          ..write('fullName: $fullName, ')
          ..write('displayName: $displayName, ')
          ..write('email: $email, ')
          ..write('capacity: $capacity, ')
          ..write('onboardingCompleted: $onboardingCompleted')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, fullName, displayName, email, capacity, onboardingCompleted);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is UserEntry &&
          other.id == this.id &&
          other.fullName == this.fullName &&
          other.displayName == this.displayName &&
          other.email == this.email &&
          other.capacity == this.capacity &&
          other.onboardingCompleted == this.onboardingCompleted);
}

class UsersCompanion extends UpdateCompanion<UserEntry> {
  final Value<String> id;
  final Value<String> fullName;
  final Value<String?> displayName;
  final Value<String?> email;
  final Value<String?> capacity;
  final Value<bool> onboardingCompleted;
  final Value<int> rowid;
  const UsersCompanion({
    this.id = const Value.absent(),
    this.fullName = const Value.absent(),
    this.displayName = const Value.absent(),
    this.email = const Value.absent(),
    this.capacity = const Value.absent(),
    this.onboardingCompleted = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  UsersCompanion.insert({
    required String id,
    required String fullName,
    this.displayName = const Value.absent(),
    this.email = const Value.absent(),
    this.capacity = const Value.absent(),
    this.onboardingCompleted = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        fullName = Value(fullName);
  static Insertable<UserEntry> custom({
    Expression<String>? id,
    Expression<String>? fullName,
    Expression<String>? displayName,
    Expression<String>? email,
    Expression<String>? capacity,
    Expression<bool>? onboardingCompleted,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (fullName != null) 'full_name': fullName,
      if (displayName != null) 'display_name': displayName,
      if (email != null) 'email': email,
      if (capacity != null) 'capacity': capacity,
      if (onboardingCompleted != null)
        'onboarding_completed': onboardingCompleted,
      if (rowid != null) 'rowid': rowid,
    });
  }

  UsersCompanion copyWith(
      {Value<String>? id,
      Value<String>? fullName,
      Value<String?>? displayName,
      Value<String?>? email,
      Value<String?>? capacity,
      Value<bool>? onboardingCompleted,
      Value<int>? rowid}) {
    return UsersCompanion(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      displayName: displayName ?? this.displayName,
      email: email ?? this.email,
      capacity: capacity ?? this.capacity,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (fullName.present) {
      map['full_name'] = Variable<String>(fullName.value);
    }
    if (displayName.present) {
      map['display_name'] = Variable<String>(displayName.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (capacity.present) {
      map['capacity'] = Variable<String>(capacity.value);
    }
    if (onboardingCompleted.present) {
      map['onboarding_completed'] = Variable<bool>(onboardingCompleted.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UsersCompanion(')
          ..write('id: $id, ')
          ..write('fullName: $fullName, ')
          ..write('displayName: $displayName, ')
          ..write('email: $email, ')
          ..write('capacity: $capacity, ')
          ..write('onboardingCompleted: $onboardingCompleted, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $BondsTable extends Bonds with TableInfo<$BondsTable, BondEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BondsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<String> userId = GeneratedColumn<String>(
      'user_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _entityIdMeta =
      const VerificationMeta('entityId');
  @override
  late final GeneratedColumn<String> entityId = GeneratedColumn<String>(
      'entity_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _entityTypeMeta =
      const VerificationMeta('entityType');
  @override
  late final GeneratedColumn<String> entityType = GeneratedColumn<String>(
      'entity_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _capacityMeta =
      const VerificationMeta('capacity');
  @override
  late final GeneratedColumn<String> capacity = GeneratedColumn<String>(
      'capacity', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('active'));
  @override
  List<GeneratedColumn> get $columns =>
      [id, userId, entityId, entityType, capacity, status];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'bonds';
  @override
  VerificationContext validateIntegrity(Insertable<BondEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('user_id')) {
      context.handle(_userIdMeta,
          userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta));
    } else if (isInserting) {
      context.missing(_userIdMeta);
    }
    if (data.containsKey('entity_id')) {
      context.handle(_entityIdMeta,
          entityId.isAcceptableOrUnknown(data['entity_id']!, _entityIdMeta));
    } else if (isInserting) {
      context.missing(_entityIdMeta);
    }
    if (data.containsKey('entity_type')) {
      context.handle(
          _entityTypeMeta,
          entityType.isAcceptableOrUnknown(
              data['entity_type']!, _entityTypeMeta));
    } else if (isInserting) {
      context.missing(_entityTypeMeta);
    }
    if (data.containsKey('capacity')) {
      context.handle(_capacityMeta,
          capacity.isAcceptableOrUnknown(data['capacity']!, _capacityMeta));
    } else if (isInserting) {
      context.missing(_capacityMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BondEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BondEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      userId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}user_id'])!,
      entityId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}entity_id'])!,
      entityType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}entity_type'])!,
      capacity: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}capacity'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
    );
  }

  @override
  $BondsTable createAlias(String alias) {
    return $BondsTable(attachedDatabase, alias);
  }
}

class BondEntry extends DataClass implements Insertable<BondEntry> {
  final String id;
  final String userId;
  final String entityId;
  final String entityType;
  final String capacity;
  final String status;
  const BondEntry(
      {required this.id,
      required this.userId,
      required this.entityId,
      required this.entityType,
      required this.capacity,
      required this.status});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['user_id'] = Variable<String>(userId);
    map['entity_id'] = Variable<String>(entityId);
    map['entity_type'] = Variable<String>(entityType);
    map['capacity'] = Variable<String>(capacity);
    map['status'] = Variable<String>(status);
    return map;
  }

  BondsCompanion toCompanion(bool nullToAbsent) {
    return BondsCompanion(
      id: Value(id),
      userId: Value(userId),
      entityId: Value(entityId),
      entityType: Value(entityType),
      capacity: Value(capacity),
      status: Value(status),
    );
  }

  factory BondEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BondEntry(
      id: serializer.fromJson<String>(json['id']),
      userId: serializer.fromJson<String>(json['userId']),
      entityId: serializer.fromJson<String>(json['entityId']),
      entityType: serializer.fromJson<String>(json['entityType']),
      capacity: serializer.fromJson<String>(json['capacity']),
      status: serializer.fromJson<String>(json['status']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'userId': serializer.toJson<String>(userId),
      'entityId': serializer.toJson<String>(entityId),
      'entityType': serializer.toJson<String>(entityType),
      'capacity': serializer.toJson<String>(capacity),
      'status': serializer.toJson<String>(status),
    };
  }

  BondEntry copyWith(
          {String? id,
          String? userId,
          String? entityId,
          String? entityType,
          String? capacity,
          String? status}) =>
      BondEntry(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        entityId: entityId ?? this.entityId,
        entityType: entityType ?? this.entityType,
        capacity: capacity ?? this.capacity,
        status: status ?? this.status,
      );
  BondEntry copyWithCompanion(BondsCompanion data) {
    return BondEntry(
      id: data.id.present ? data.id.value : this.id,
      userId: data.userId.present ? data.userId.value : this.userId,
      entityId: data.entityId.present ? data.entityId.value : this.entityId,
      entityType:
          data.entityType.present ? data.entityType.value : this.entityType,
      capacity: data.capacity.present ? data.capacity.value : this.capacity,
      status: data.status.present ? data.status.value : this.status,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BondEntry(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('entityId: $entityId, ')
          ..write('entityType: $entityType, ')
          ..write('capacity: $capacity, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, userId, entityId, entityType, capacity, status);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BondEntry &&
          other.id == this.id &&
          other.userId == this.userId &&
          other.entityId == this.entityId &&
          other.entityType == this.entityType &&
          other.capacity == this.capacity &&
          other.status == this.status);
}

class BondsCompanion extends UpdateCompanion<BondEntry> {
  final Value<String> id;
  final Value<String> userId;
  final Value<String> entityId;
  final Value<String> entityType;
  final Value<String> capacity;
  final Value<String> status;
  final Value<int> rowid;
  const BondsCompanion({
    this.id = const Value.absent(),
    this.userId = const Value.absent(),
    this.entityId = const Value.absent(),
    this.entityType = const Value.absent(),
    this.capacity = const Value.absent(),
    this.status = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  BondsCompanion.insert({
    required String id,
    required String userId,
    required String entityId,
    required String entityType,
    required String capacity,
    this.status = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        userId = Value(userId),
        entityId = Value(entityId),
        entityType = Value(entityType),
        capacity = Value(capacity);
  static Insertable<BondEntry> custom({
    Expression<String>? id,
    Expression<String>? userId,
    Expression<String>? entityId,
    Expression<String>? entityType,
    Expression<String>? capacity,
    Expression<String>? status,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (userId != null) 'user_id': userId,
      if (entityId != null) 'entity_id': entityId,
      if (entityType != null) 'entity_type': entityType,
      if (capacity != null) 'capacity': capacity,
      if (status != null) 'status': status,
      if (rowid != null) 'rowid': rowid,
    });
  }

  BondsCompanion copyWith(
      {Value<String>? id,
      Value<String>? userId,
      Value<String>? entityId,
      Value<String>? entityType,
      Value<String>? capacity,
      Value<String>? status,
      Value<int>? rowid}) {
    return BondsCompanion(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      entityId: entityId ?? this.entityId,
      entityType: entityType ?? this.entityType,
      capacity: capacity ?? this.capacity,
      status: status ?? this.status,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (userId.present) {
      map['user_id'] = Variable<String>(userId.value);
    }
    if (entityId.present) {
      map['entity_id'] = Variable<String>(entityId.value);
    }
    if (entityType.present) {
      map['entity_type'] = Variable<String>(entityType.value);
    }
    if (capacity.present) {
      map['capacity'] = Variable<String>(capacity.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BondsCompanion(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('entityId: $entityId, ')
          ..write('entityType: $entityType, ')
          ..write('capacity: $capacity, ')
          ..write('status: $status, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SchoolsTable extends Schools with TableInfo<$SchoolsTable, SchoolEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SchoolsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _identifierMeta =
      const VerificationMeta('identifier');
  @override
  late final GeneratedColumn<String> identifier = GeneratedColumn<String>(
      'identifier', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [id, name, identifier];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'schools';
  @override
  VerificationContext validateIntegrity(Insertable<SchoolEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('identifier')) {
      context.handle(
          _identifierMeta,
          identifier.isAcceptableOrUnknown(
              data['identifier']!, _identifierMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SchoolEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SchoolEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      identifier: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}identifier']),
    );
  }

  @override
  $SchoolsTable createAlias(String alias) {
    return $SchoolsTable(attachedDatabase, alias);
  }
}

class SchoolEntry extends DataClass implements Insertable<SchoolEntry> {
  final String id;
  final String name;
  final String? identifier;
  const SchoolEntry({required this.id, required this.name, this.identifier});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || identifier != null) {
      map['identifier'] = Variable<String>(identifier);
    }
    return map;
  }

  SchoolsCompanion toCompanion(bool nullToAbsent) {
    return SchoolsCompanion(
      id: Value(id),
      name: Value(name),
      identifier: identifier == null && nullToAbsent
          ? const Value.absent()
          : Value(identifier),
    );
  }

  factory SchoolEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SchoolEntry(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      identifier: serializer.fromJson<String?>(json['identifier']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'identifier': serializer.toJson<String?>(identifier),
    };
  }

  SchoolEntry copyWith(
          {String? id,
          String? name,
          Value<String?> identifier = const Value.absent()}) =>
      SchoolEntry(
        id: id ?? this.id,
        name: name ?? this.name,
        identifier: identifier.present ? identifier.value : this.identifier,
      );
  SchoolEntry copyWithCompanion(SchoolsCompanion data) {
    return SchoolEntry(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      identifier:
          data.identifier.present ? data.identifier.value : this.identifier,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SchoolEntry(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('identifier: $identifier')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, identifier);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SchoolEntry &&
          other.id == this.id &&
          other.name == this.name &&
          other.identifier == this.identifier);
}

class SchoolsCompanion extends UpdateCompanion<SchoolEntry> {
  final Value<String> id;
  final Value<String> name;
  final Value<String?> identifier;
  final Value<int> rowid;
  const SchoolsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.identifier = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SchoolsCompanion.insert({
    required String id,
    required String name,
    this.identifier = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name);
  static Insertable<SchoolEntry> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? identifier,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (identifier != null) 'identifier': identifier,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SchoolsCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String?>? identifier,
      Value<int>? rowid}) {
    return SchoolsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      identifier: identifier ?? this.identifier,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (identifier.present) {
      map['identifier'] = Variable<String>(identifier.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SchoolsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('identifier: $identifier, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ClassroomsTable extends Classrooms
    with TableInfo<$ClassroomsTable, ClassroomEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ClassroomsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _schoolIdMeta =
      const VerificationMeta('schoolId');
  @override
  late final GeneratedColumn<String> schoolId = GeneratedColumn<String>(
      'school_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _teacherIdMeta =
      const VerificationMeta('teacherId');
  @override
  late final GeneratedColumn<String> teacherId = GeneratedColumn<String>(
      'teacher_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _subjectMeta =
      const VerificationMeta('subject');
  @override
  late final GeneratedColumn<String> subject = GeneratedColumn<String>(
      'subject', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _academicYearMeta =
      const VerificationMeta('academicYear');
  @override
  late final GeneratedColumn<String> academicYear = GeneratedColumn<String>(
      'academic_year', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('2026'));
  @override
  List<GeneratedColumn> get $columns =>
      [id, schoolId, teacherId, name, subject, academicYear];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'classrooms';
  @override
  VerificationContext validateIntegrity(Insertable<ClassroomEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('school_id')) {
      context.handle(_schoolIdMeta,
          schoolId.isAcceptableOrUnknown(data['school_id']!, _schoolIdMeta));
    }
    if (data.containsKey('teacher_id')) {
      context.handle(_teacherIdMeta,
          teacherId.isAcceptableOrUnknown(data['teacher_id']!, _teacherIdMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('subject')) {
      context.handle(_subjectMeta,
          subject.isAcceptableOrUnknown(data['subject']!, _subjectMeta));
    }
    if (data.containsKey('academic_year')) {
      context.handle(
          _academicYearMeta,
          academicYear.isAcceptableOrUnknown(
              data['academic_year']!, _academicYearMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ClassroomEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ClassroomEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      schoolId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}school_id']),
      teacherId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}teacher_id']),
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      subject: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}subject']),
      academicYear: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}academic_year'])!,
    );
  }

  @override
  $ClassroomsTable createAlias(String alias) {
    return $ClassroomsTable(attachedDatabase, alias);
  }
}

class ClassroomEntry extends DataClass implements Insertable<ClassroomEntry> {
  final String id;
  final String? schoolId;
  final String? teacherId;
  final String name;
  final String? subject;
  final String academicYear;
  const ClassroomEntry(
      {required this.id,
      this.schoolId,
      this.teacherId,
      required this.name,
      this.subject,
      required this.academicYear});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || schoolId != null) {
      map['school_id'] = Variable<String>(schoolId);
    }
    if (!nullToAbsent || teacherId != null) {
      map['teacher_id'] = Variable<String>(teacherId);
    }
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || subject != null) {
      map['subject'] = Variable<String>(subject);
    }
    map['academic_year'] = Variable<String>(academicYear);
    return map;
  }

  ClassroomsCompanion toCompanion(bool nullToAbsent) {
    return ClassroomsCompanion(
      id: Value(id),
      schoolId: schoolId == null && nullToAbsent
          ? const Value.absent()
          : Value(schoolId),
      teacherId: teacherId == null && nullToAbsent
          ? const Value.absent()
          : Value(teacherId),
      name: Value(name),
      subject: subject == null && nullToAbsent
          ? const Value.absent()
          : Value(subject),
      academicYear: Value(academicYear),
    );
  }

  factory ClassroomEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ClassroomEntry(
      id: serializer.fromJson<String>(json['id']),
      schoolId: serializer.fromJson<String?>(json['schoolId']),
      teacherId: serializer.fromJson<String?>(json['teacherId']),
      name: serializer.fromJson<String>(json['name']),
      subject: serializer.fromJson<String?>(json['subject']),
      academicYear: serializer.fromJson<String>(json['academicYear']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'schoolId': serializer.toJson<String?>(schoolId),
      'teacherId': serializer.toJson<String?>(teacherId),
      'name': serializer.toJson<String>(name),
      'subject': serializer.toJson<String?>(subject),
      'academicYear': serializer.toJson<String>(academicYear),
    };
  }

  ClassroomEntry copyWith(
          {String? id,
          Value<String?> schoolId = const Value.absent(),
          Value<String?> teacherId = const Value.absent(),
          String? name,
          Value<String?> subject = const Value.absent(),
          String? academicYear}) =>
      ClassroomEntry(
        id: id ?? this.id,
        schoolId: schoolId.present ? schoolId.value : this.schoolId,
        teacherId: teacherId.present ? teacherId.value : this.teacherId,
        name: name ?? this.name,
        subject: subject.present ? subject.value : this.subject,
        academicYear: academicYear ?? this.academicYear,
      );
  ClassroomEntry copyWithCompanion(ClassroomsCompanion data) {
    return ClassroomEntry(
      id: data.id.present ? data.id.value : this.id,
      schoolId: data.schoolId.present ? data.schoolId.value : this.schoolId,
      teacherId: data.teacherId.present ? data.teacherId.value : this.teacherId,
      name: data.name.present ? data.name.value : this.name,
      subject: data.subject.present ? data.subject.value : this.subject,
      academicYear: data.academicYear.present
          ? data.academicYear.value
          : this.academicYear,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ClassroomEntry(')
          ..write('id: $id, ')
          ..write('schoolId: $schoolId, ')
          ..write('teacherId: $teacherId, ')
          ..write('name: $name, ')
          ..write('subject: $subject, ')
          ..write('academicYear: $academicYear')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, schoolId, teacherId, name, subject, academicYear);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ClassroomEntry &&
          other.id == this.id &&
          other.schoolId == this.schoolId &&
          other.teacherId == this.teacherId &&
          other.name == this.name &&
          other.subject == this.subject &&
          other.academicYear == this.academicYear);
}

class ClassroomsCompanion extends UpdateCompanion<ClassroomEntry> {
  final Value<String> id;
  final Value<String?> schoolId;
  final Value<String?> teacherId;
  final Value<String> name;
  final Value<String?> subject;
  final Value<String> academicYear;
  final Value<int> rowid;
  const ClassroomsCompanion({
    this.id = const Value.absent(),
    this.schoolId = const Value.absent(),
    this.teacherId = const Value.absent(),
    this.name = const Value.absent(),
    this.subject = const Value.absent(),
    this.academicYear = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ClassroomsCompanion.insert({
    required String id,
    this.schoolId = const Value.absent(),
    this.teacherId = const Value.absent(),
    required String name,
    this.subject = const Value.absent(),
    this.academicYear = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name);
  static Insertable<ClassroomEntry> custom({
    Expression<String>? id,
    Expression<String>? schoolId,
    Expression<String>? teacherId,
    Expression<String>? name,
    Expression<String>? subject,
    Expression<String>? academicYear,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (schoolId != null) 'school_id': schoolId,
      if (teacherId != null) 'teacher_id': teacherId,
      if (name != null) 'name': name,
      if (subject != null) 'subject': subject,
      if (academicYear != null) 'academic_year': academicYear,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ClassroomsCompanion copyWith(
      {Value<String>? id,
      Value<String?>? schoolId,
      Value<String?>? teacherId,
      Value<String>? name,
      Value<String?>? subject,
      Value<String>? academicYear,
      Value<int>? rowid}) {
    return ClassroomsCompanion(
      id: id ?? this.id,
      schoolId: schoolId ?? this.schoolId,
      teacherId: teacherId ?? this.teacherId,
      name: name ?? this.name,
      subject: subject ?? this.subject,
      academicYear: academicYear ?? this.academicYear,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (schoolId.present) {
      map['school_id'] = Variable<String>(schoolId.value);
    }
    if (teacherId.present) {
      map['teacher_id'] = Variable<String>(teacherId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (subject.present) {
      map['subject'] = Variable<String>(subject.value);
    }
    if (academicYear.present) {
      map['academic_year'] = Variable<String>(academicYear.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ClassroomsCompanion(')
          ..write('id: $id, ')
          ..write('schoolId: $schoolId, ')
          ..write('teacherId: $teacherId, ')
          ..write('name: $name, ')
          ..write('subject: $subject, ')
          ..write('academicYear: $academicYear, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ClassroomStudentsTable extends ClassroomStudents
    with TableInfo<$ClassroomStudentsTable, ClassroomStudentEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ClassroomStudentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _classroomIdMeta =
      const VerificationMeta('classroomId');
  @override
  late final GeneratedColumn<String> classroomId = GeneratedColumn<String>(
      'classroom_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _studentIdMeta =
      const VerificationMeta('studentId');
  @override
  late final GeneratedColumn<String> studentId = GeneratedColumn<String>(
      'student_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _fullNameMeta =
      const VerificationMeta('fullName');
  @override
  late final GeneratedColumn<String> fullName = GeneratedColumn<String>(
      'full_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _rollNumberMeta =
      const VerificationMeta('rollNumber');
  @override
  late final GeneratedColumn<int> rollNumber = GeneratedColumn<int>(
      'roll_number', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('present'));
  @override
  List<GeneratedColumn> get $columns =>
      [id, classroomId, studentId, fullName, rollNumber, status];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'classroom_students';
  @override
  VerificationContext validateIntegrity(
      Insertable<ClassroomStudentEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('classroom_id')) {
      context.handle(
          _classroomIdMeta,
          classroomId.isAcceptableOrUnknown(
              data['classroom_id']!, _classroomIdMeta));
    } else if (isInserting) {
      context.missing(_classroomIdMeta);
    }
    if (data.containsKey('student_id')) {
      context.handle(_studentIdMeta,
          studentId.isAcceptableOrUnknown(data['student_id']!, _studentIdMeta));
    }
    if (data.containsKey('full_name')) {
      context.handle(_fullNameMeta,
          fullName.isAcceptableOrUnknown(data['full_name']!, _fullNameMeta));
    } else if (isInserting) {
      context.missing(_fullNameMeta);
    }
    if (data.containsKey('roll_number')) {
      context.handle(
          _rollNumberMeta,
          rollNumber.isAcceptableOrUnknown(
              data['roll_number']!, _rollNumberMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ClassroomStudentEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ClassroomStudentEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      classroomId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}classroom_id'])!,
      studentId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}student_id']),
      fullName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}full_name'])!,
      rollNumber: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}roll_number']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
    );
  }

  @override
  $ClassroomStudentsTable createAlias(String alias) {
    return $ClassroomStudentsTable(attachedDatabase, alias);
  }
}

class ClassroomStudentEntry extends DataClass
    implements Insertable<ClassroomStudentEntry> {
  final String id;
  final String classroomId;
  final String? studentId;
  final String fullName;
  final int? rollNumber;
  final String status;
  const ClassroomStudentEntry(
      {required this.id,
      required this.classroomId,
      this.studentId,
      required this.fullName,
      this.rollNumber,
      required this.status});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['classroom_id'] = Variable<String>(classroomId);
    if (!nullToAbsent || studentId != null) {
      map['student_id'] = Variable<String>(studentId);
    }
    map['full_name'] = Variable<String>(fullName);
    if (!nullToAbsent || rollNumber != null) {
      map['roll_number'] = Variable<int>(rollNumber);
    }
    map['status'] = Variable<String>(status);
    return map;
  }

  ClassroomStudentsCompanion toCompanion(bool nullToAbsent) {
    return ClassroomStudentsCompanion(
      id: Value(id),
      classroomId: Value(classroomId),
      studentId: studentId == null && nullToAbsent
          ? const Value.absent()
          : Value(studentId),
      fullName: Value(fullName),
      rollNumber: rollNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(rollNumber),
      status: Value(status),
    );
  }

  factory ClassroomStudentEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ClassroomStudentEntry(
      id: serializer.fromJson<String>(json['id']),
      classroomId: serializer.fromJson<String>(json['classroomId']),
      studentId: serializer.fromJson<String?>(json['studentId']),
      fullName: serializer.fromJson<String>(json['fullName']),
      rollNumber: serializer.fromJson<int?>(json['rollNumber']),
      status: serializer.fromJson<String>(json['status']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'classroomId': serializer.toJson<String>(classroomId),
      'studentId': serializer.toJson<String?>(studentId),
      'fullName': serializer.toJson<String>(fullName),
      'rollNumber': serializer.toJson<int?>(rollNumber),
      'status': serializer.toJson<String>(status),
    };
  }

  ClassroomStudentEntry copyWith(
          {String? id,
          String? classroomId,
          Value<String?> studentId = const Value.absent(),
          String? fullName,
          Value<int?> rollNumber = const Value.absent(),
          String? status}) =>
      ClassroomStudentEntry(
        id: id ?? this.id,
        classroomId: classroomId ?? this.classroomId,
        studentId: studentId.present ? studentId.value : this.studentId,
        fullName: fullName ?? this.fullName,
        rollNumber: rollNumber.present ? rollNumber.value : this.rollNumber,
        status: status ?? this.status,
      );
  ClassroomStudentEntry copyWithCompanion(ClassroomStudentsCompanion data) {
    return ClassroomStudentEntry(
      id: data.id.present ? data.id.value : this.id,
      classroomId:
          data.classroomId.present ? data.classroomId.value : this.classroomId,
      studentId: data.studentId.present ? data.studentId.value : this.studentId,
      fullName: data.fullName.present ? data.fullName.value : this.fullName,
      rollNumber:
          data.rollNumber.present ? data.rollNumber.value : this.rollNumber,
      status: data.status.present ? data.status.value : this.status,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ClassroomStudentEntry(')
          ..write('id: $id, ')
          ..write('classroomId: $classroomId, ')
          ..write('studentId: $studentId, ')
          ..write('fullName: $fullName, ')
          ..write('rollNumber: $rollNumber, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, classroomId, studentId, fullName, rollNumber, status);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ClassroomStudentEntry &&
          other.id == this.id &&
          other.classroomId == this.classroomId &&
          other.studentId == this.studentId &&
          other.fullName == this.fullName &&
          other.rollNumber == this.rollNumber &&
          other.status == this.status);
}

class ClassroomStudentsCompanion
    extends UpdateCompanion<ClassroomStudentEntry> {
  final Value<String> id;
  final Value<String> classroomId;
  final Value<String?> studentId;
  final Value<String> fullName;
  final Value<int?> rollNumber;
  final Value<String> status;
  final Value<int> rowid;
  const ClassroomStudentsCompanion({
    this.id = const Value.absent(),
    this.classroomId = const Value.absent(),
    this.studentId = const Value.absent(),
    this.fullName = const Value.absent(),
    this.rollNumber = const Value.absent(),
    this.status = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ClassroomStudentsCompanion.insert({
    required String id,
    required String classroomId,
    this.studentId = const Value.absent(),
    required String fullName,
    this.rollNumber = const Value.absent(),
    this.status = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        classroomId = Value(classroomId),
        fullName = Value(fullName);
  static Insertable<ClassroomStudentEntry> custom({
    Expression<String>? id,
    Expression<String>? classroomId,
    Expression<String>? studentId,
    Expression<String>? fullName,
    Expression<int>? rollNumber,
    Expression<String>? status,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (classroomId != null) 'classroom_id': classroomId,
      if (studentId != null) 'student_id': studentId,
      if (fullName != null) 'full_name': fullName,
      if (rollNumber != null) 'roll_number': rollNumber,
      if (status != null) 'status': status,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ClassroomStudentsCompanion copyWith(
      {Value<String>? id,
      Value<String>? classroomId,
      Value<String?>? studentId,
      Value<String>? fullName,
      Value<int?>? rollNumber,
      Value<String>? status,
      Value<int>? rowid}) {
    return ClassroomStudentsCompanion(
      id: id ?? this.id,
      classroomId: classroomId ?? this.classroomId,
      studentId: studentId ?? this.studentId,
      fullName: fullName ?? this.fullName,
      rollNumber: rollNumber ?? this.rollNumber,
      status: status ?? this.status,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (classroomId.present) {
      map['classroom_id'] = Variable<String>(classroomId.value);
    }
    if (studentId.present) {
      map['student_id'] = Variable<String>(studentId.value);
    }
    if (fullName.present) {
      map['full_name'] = Variable<String>(fullName.value);
    }
    if (rollNumber.present) {
      map['roll_number'] = Variable<int>(rollNumber.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ClassroomStudentsCompanion(')
          ..write('id: $id, ')
          ..write('classroomId: $classroomId, ')
          ..write('studentId: $studentId, ')
          ..write('fullName: $fullName, ')
          ..write('rollNumber: $rollNumber, ')
          ..write('status: $status, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $UsersTable users = $UsersTable(this);
  late final $BondsTable bonds = $BondsTable(this);
  late final $SchoolsTable schools = $SchoolsTable(this);
  late final $ClassroomsTable classrooms = $ClassroomsTable(this);
  late final $ClassroomStudentsTable classroomStudents =
      $ClassroomStudentsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities =>
      [users, bonds, schools, classrooms, classroomStudents];
}

typedef $$UsersTableCreateCompanionBuilder = UsersCompanion Function({
  required String id,
  required String fullName,
  Value<String?> displayName,
  Value<String?> email,
  Value<String?> capacity,
  Value<bool> onboardingCompleted,
  Value<int> rowid,
});
typedef $$UsersTableUpdateCompanionBuilder = UsersCompanion Function({
  Value<String> id,
  Value<String> fullName,
  Value<String?> displayName,
  Value<String?> email,
  Value<String?> capacity,
  Value<bool> onboardingCompleted,
  Value<int> rowid,
});

class $$UsersTableFilterComposer extends Composer<_$AppDatabase, $UsersTable> {
  $$UsersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get displayName => $composableBuilder(
      column: $table.displayName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get capacity => $composableBuilder(
      column: $table.capacity, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get onboardingCompleted => $composableBuilder(
      column: $table.onboardingCompleted,
      builder: (column) => ColumnFilters(column));
}

class $$UsersTableOrderingComposer
    extends Composer<_$AppDatabase, $UsersTable> {
  $$UsersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get displayName => $composableBuilder(
      column: $table.displayName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get capacity => $composableBuilder(
      column: $table.capacity, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get onboardingCompleted => $composableBuilder(
      column: $table.onboardingCompleted,
      builder: (column) => ColumnOrderings(column));
}

class $$UsersTableAnnotationComposer
    extends Composer<_$AppDatabase, $UsersTable> {
  $$UsersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get fullName =>
      $composableBuilder(column: $table.fullName, builder: (column) => column);

  GeneratedColumn<String> get displayName => $composableBuilder(
      column: $table.displayName, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get capacity =>
      $composableBuilder(column: $table.capacity, builder: (column) => column);

  GeneratedColumn<bool> get onboardingCompleted => $composableBuilder(
      column: $table.onboardingCompleted, builder: (column) => column);
}

class $$UsersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $UsersTable,
    UserEntry,
    $$UsersTableFilterComposer,
    $$UsersTableOrderingComposer,
    $$UsersTableAnnotationComposer,
    $$UsersTableCreateCompanionBuilder,
    $$UsersTableUpdateCompanionBuilder,
    (UserEntry, BaseReferences<_$AppDatabase, $UsersTable, UserEntry>),
    UserEntry,
    PrefetchHooks Function()> {
  $$UsersTableTableManager(_$AppDatabase db, $UsersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$UsersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$UsersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$UsersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> fullName = const Value.absent(),
            Value<String?> displayName = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<String?> capacity = const Value.absent(),
            Value<bool> onboardingCompleted = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UsersCompanion(
            id: id,
            fullName: fullName,
            displayName: displayName,
            email: email,
            capacity: capacity,
            onboardingCompleted: onboardingCompleted,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String fullName,
            Value<String?> displayName = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<String?> capacity = const Value.absent(),
            Value<bool> onboardingCompleted = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UsersCompanion.insert(
            id: id,
            fullName: fullName,
            displayName: displayName,
            email: email,
            capacity: capacity,
            onboardingCompleted: onboardingCompleted,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$UsersTable, UserEntry>(table),
                    BaseReferences<_$AppDatabase, $UsersTable, UserEntry>(
                        db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$UsersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $UsersTable,
    UserEntry,
    $$UsersTableFilterComposer,
    $$UsersTableOrderingComposer,
    $$UsersTableAnnotationComposer,
    $$UsersTableCreateCompanionBuilder,
    $$UsersTableUpdateCompanionBuilder,
    (UserEntry, BaseReferences<_$AppDatabase, $UsersTable, UserEntry>),
    UserEntry,
    PrefetchHooks Function()>;
typedef $$BondsTableCreateCompanionBuilder = BondsCompanion Function({
  required String id,
  required String userId,
  required String entityId,
  required String entityType,
  required String capacity,
  Value<String> status,
  Value<int> rowid,
});
typedef $$BondsTableUpdateCompanionBuilder = BondsCompanion Function({
  Value<String> id,
  Value<String> userId,
  Value<String> entityId,
  Value<String> entityType,
  Value<String> capacity,
  Value<String> status,
  Value<int> rowid,
});

class $$BondsTableFilterComposer extends Composer<_$AppDatabase, $BondsTable> {
  $$BondsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get userId => $composableBuilder(
      column: $table.userId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get entityId => $composableBuilder(
      column: $table.entityId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get entityType => $composableBuilder(
      column: $table.entityType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get capacity => $composableBuilder(
      column: $table.capacity, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));
}

class $$BondsTableOrderingComposer
    extends Composer<_$AppDatabase, $BondsTable> {
  $$BondsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get userId => $composableBuilder(
      column: $table.userId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get entityId => $composableBuilder(
      column: $table.entityId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get entityType => $composableBuilder(
      column: $table.entityType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get capacity => $composableBuilder(
      column: $table.capacity, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));
}

class $$BondsTableAnnotationComposer
    extends Composer<_$AppDatabase, $BondsTable> {
  $$BondsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get userId =>
      $composableBuilder(column: $table.userId, builder: (column) => column);

  GeneratedColumn<String> get entityId =>
      $composableBuilder(column: $table.entityId, builder: (column) => column);

  GeneratedColumn<String> get entityType => $composableBuilder(
      column: $table.entityType, builder: (column) => column);

  GeneratedColumn<String> get capacity =>
      $composableBuilder(column: $table.capacity, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);
}

class $$BondsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $BondsTable,
    BondEntry,
    $$BondsTableFilterComposer,
    $$BondsTableOrderingComposer,
    $$BondsTableAnnotationComposer,
    $$BondsTableCreateCompanionBuilder,
    $$BondsTableUpdateCompanionBuilder,
    (BondEntry, BaseReferences<_$AppDatabase, $BondsTable, BondEntry>),
    BondEntry,
    PrefetchHooks Function()> {
  $$BondsTableTableManager(_$AppDatabase db, $BondsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BondsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BondsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BondsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> userId = const Value.absent(),
            Value<String> entityId = const Value.absent(),
            Value<String> entityType = const Value.absent(),
            Value<String> capacity = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              BondsCompanion(
            id: id,
            userId: userId,
            entityId: entityId,
            entityType: entityType,
            capacity: capacity,
            status: status,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String userId,
            required String entityId,
            required String entityType,
            required String capacity,
            Value<String> status = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              BondsCompanion.insert(
            id: id,
            userId: userId,
            entityId: entityId,
            entityType: entityType,
            capacity: capacity,
            status: status,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$BondsTable, BondEntry>(table),
                    BaseReferences<_$AppDatabase, $BondsTable, BondEntry>(
                        db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$BondsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $BondsTable,
    BondEntry,
    $$BondsTableFilterComposer,
    $$BondsTableOrderingComposer,
    $$BondsTableAnnotationComposer,
    $$BondsTableCreateCompanionBuilder,
    $$BondsTableUpdateCompanionBuilder,
    (BondEntry, BaseReferences<_$AppDatabase, $BondsTable, BondEntry>),
    BondEntry,
    PrefetchHooks Function()>;
typedef $$SchoolsTableCreateCompanionBuilder = SchoolsCompanion Function({
  required String id,
  required String name,
  Value<String?> identifier,
  Value<int> rowid,
});
typedef $$SchoolsTableUpdateCompanionBuilder = SchoolsCompanion Function({
  Value<String> id,
  Value<String> name,
  Value<String?> identifier,
  Value<int> rowid,
});

class $$SchoolsTableFilterComposer
    extends Composer<_$AppDatabase, $SchoolsTable> {
  $$SchoolsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get identifier => $composableBuilder(
      column: $table.identifier, builder: (column) => ColumnFilters(column));
}

class $$SchoolsTableOrderingComposer
    extends Composer<_$AppDatabase, $SchoolsTable> {
  $$SchoolsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get identifier => $composableBuilder(
      column: $table.identifier, builder: (column) => ColumnOrderings(column));
}

class $$SchoolsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SchoolsTable> {
  $$SchoolsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get identifier => $composableBuilder(
      column: $table.identifier, builder: (column) => column);
}

class $$SchoolsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SchoolsTable,
    SchoolEntry,
    $$SchoolsTableFilterComposer,
    $$SchoolsTableOrderingComposer,
    $$SchoolsTableAnnotationComposer,
    $$SchoolsTableCreateCompanionBuilder,
    $$SchoolsTableUpdateCompanionBuilder,
    (SchoolEntry, BaseReferences<_$AppDatabase, $SchoolsTable, SchoolEntry>),
    SchoolEntry,
    PrefetchHooks Function()> {
  $$SchoolsTableTableManager(_$AppDatabase db, $SchoolsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SchoolsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SchoolsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SchoolsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String?> identifier = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SchoolsCompanion(
            id: id,
            name: name,
            identifier: identifier,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String name,
            Value<String?> identifier = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SchoolsCompanion.insert(
            id: id,
            name: name,
            identifier: identifier,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$SchoolsTable, SchoolEntry>(table),
                    BaseReferences<_$AppDatabase, $SchoolsTable, SchoolEntry>(
                        db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SchoolsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SchoolsTable,
    SchoolEntry,
    $$SchoolsTableFilterComposer,
    $$SchoolsTableOrderingComposer,
    $$SchoolsTableAnnotationComposer,
    $$SchoolsTableCreateCompanionBuilder,
    $$SchoolsTableUpdateCompanionBuilder,
    (SchoolEntry, BaseReferences<_$AppDatabase, $SchoolsTable, SchoolEntry>),
    SchoolEntry,
    PrefetchHooks Function()>;
typedef $$ClassroomsTableCreateCompanionBuilder = ClassroomsCompanion Function({
  required String id,
  Value<String?> schoolId,
  Value<String?> teacherId,
  required String name,
  Value<String?> subject,
  Value<String> academicYear,
  Value<int> rowid,
});
typedef $$ClassroomsTableUpdateCompanionBuilder = ClassroomsCompanion Function({
  Value<String> id,
  Value<String?> schoolId,
  Value<String?> teacherId,
  Value<String> name,
  Value<String?> subject,
  Value<String> academicYear,
  Value<int> rowid,
});

class $$ClassroomsTableFilterComposer
    extends Composer<_$AppDatabase, $ClassroomsTable> {
  $$ClassroomsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get schoolId => $composableBuilder(
      column: $table.schoolId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get teacherId => $composableBuilder(
      column: $table.teacherId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get subject => $composableBuilder(
      column: $table.subject, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get academicYear => $composableBuilder(
      column: $table.academicYear, builder: (column) => ColumnFilters(column));
}

class $$ClassroomsTableOrderingComposer
    extends Composer<_$AppDatabase, $ClassroomsTable> {
  $$ClassroomsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get schoolId => $composableBuilder(
      column: $table.schoolId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get teacherId => $composableBuilder(
      column: $table.teacherId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get subject => $composableBuilder(
      column: $table.subject, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get academicYear => $composableBuilder(
      column: $table.academicYear,
      builder: (column) => ColumnOrderings(column));
}

class $$ClassroomsTableAnnotationComposer
    extends Composer<_$AppDatabase, $ClassroomsTable> {
  $$ClassroomsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get schoolId =>
      $composableBuilder(column: $table.schoolId, builder: (column) => column);

  GeneratedColumn<String> get teacherId =>
      $composableBuilder(column: $table.teacherId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get subject =>
      $composableBuilder(column: $table.subject, builder: (column) => column);

  GeneratedColumn<String> get academicYear => $composableBuilder(
      column: $table.academicYear, builder: (column) => column);
}

class $$ClassroomsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ClassroomsTable,
    ClassroomEntry,
    $$ClassroomsTableFilterComposer,
    $$ClassroomsTableOrderingComposer,
    $$ClassroomsTableAnnotationComposer,
    $$ClassroomsTableCreateCompanionBuilder,
    $$ClassroomsTableUpdateCompanionBuilder,
    (
      ClassroomEntry,
      BaseReferences<_$AppDatabase, $ClassroomsTable, ClassroomEntry>
    ),
    ClassroomEntry,
    PrefetchHooks Function()> {
  $$ClassroomsTableTableManager(_$AppDatabase db, $ClassroomsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ClassroomsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ClassroomsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ClassroomsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String?> schoolId = const Value.absent(),
            Value<String?> teacherId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String?> subject = const Value.absent(),
            Value<String> academicYear = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ClassroomsCompanion(
            id: id,
            schoolId: schoolId,
            teacherId: teacherId,
            name: name,
            subject: subject,
            academicYear: academicYear,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            Value<String?> schoolId = const Value.absent(),
            Value<String?> teacherId = const Value.absent(),
            required String name,
            Value<String?> subject = const Value.absent(),
            Value<String> academicYear = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ClassroomsCompanion.insert(
            id: id,
            schoolId: schoolId,
            teacherId: teacherId,
            name: name,
            subject: subject,
            academicYear: academicYear,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$ClassroomsTable, ClassroomEntry>(table),
                    BaseReferences<_$AppDatabase, $ClassroomsTable,
                        ClassroomEntry>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ClassroomsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ClassroomsTable,
    ClassroomEntry,
    $$ClassroomsTableFilterComposer,
    $$ClassroomsTableOrderingComposer,
    $$ClassroomsTableAnnotationComposer,
    $$ClassroomsTableCreateCompanionBuilder,
    $$ClassroomsTableUpdateCompanionBuilder,
    (
      ClassroomEntry,
      BaseReferences<_$AppDatabase, $ClassroomsTable, ClassroomEntry>
    ),
    ClassroomEntry,
    PrefetchHooks Function()>;
typedef $$ClassroomStudentsTableCreateCompanionBuilder
    = ClassroomStudentsCompanion Function({
  required String id,
  required String classroomId,
  Value<String?> studentId,
  required String fullName,
  Value<int?> rollNumber,
  Value<String> status,
  Value<int> rowid,
});
typedef $$ClassroomStudentsTableUpdateCompanionBuilder
    = ClassroomStudentsCompanion Function({
  Value<String> id,
  Value<String> classroomId,
  Value<String?> studentId,
  Value<String> fullName,
  Value<int?> rollNumber,
  Value<String> status,
  Value<int> rowid,
});

class $$ClassroomStudentsTableFilterComposer
    extends Composer<_$AppDatabase, $ClassroomStudentsTable> {
  $$ClassroomStudentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get classroomId => $composableBuilder(
      column: $table.classroomId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get studentId => $composableBuilder(
      column: $table.studentId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get rollNumber => $composableBuilder(
      column: $table.rollNumber, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));
}

class $$ClassroomStudentsTableOrderingComposer
    extends Composer<_$AppDatabase, $ClassroomStudentsTable> {
  $$ClassroomStudentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get classroomId => $composableBuilder(
      column: $table.classroomId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get studentId => $composableBuilder(
      column: $table.studentId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get rollNumber => $composableBuilder(
      column: $table.rollNumber, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));
}

class $$ClassroomStudentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $ClassroomStudentsTable> {
  $$ClassroomStudentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get classroomId => $composableBuilder(
      column: $table.classroomId, builder: (column) => column);

  GeneratedColumn<String> get studentId =>
      $composableBuilder(column: $table.studentId, builder: (column) => column);

  GeneratedColumn<String> get fullName =>
      $composableBuilder(column: $table.fullName, builder: (column) => column);

  GeneratedColumn<int> get rollNumber => $composableBuilder(
      column: $table.rollNumber, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);
}

class $$ClassroomStudentsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ClassroomStudentsTable,
    ClassroomStudentEntry,
    $$ClassroomStudentsTableFilterComposer,
    $$ClassroomStudentsTableOrderingComposer,
    $$ClassroomStudentsTableAnnotationComposer,
    $$ClassroomStudentsTableCreateCompanionBuilder,
    $$ClassroomStudentsTableUpdateCompanionBuilder,
    (
      ClassroomStudentEntry,
      BaseReferences<_$AppDatabase, $ClassroomStudentsTable,
          ClassroomStudentEntry>
    ),
    ClassroomStudentEntry,
    PrefetchHooks Function()> {
  $$ClassroomStudentsTableTableManager(
      _$AppDatabase db, $ClassroomStudentsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ClassroomStudentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ClassroomStudentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ClassroomStudentsTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> classroomId = const Value.absent(),
            Value<String?> studentId = const Value.absent(),
            Value<String> fullName = const Value.absent(),
            Value<int?> rollNumber = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ClassroomStudentsCompanion(
            id: id,
            classroomId: classroomId,
            studentId: studentId,
            fullName: fullName,
            rollNumber: rollNumber,
            status: status,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String classroomId,
            Value<String?> studentId = const Value.absent(),
            required String fullName,
            Value<int?> rollNumber = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ClassroomStudentsCompanion.insert(
            id: id,
            classroomId: classroomId,
            studentId: studentId,
            fullName: fullName,
            rollNumber: rollNumber,
            status: status,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$ClassroomStudentsTable, ClassroomStudentEntry>(
                        table),
                    BaseReferences<_$AppDatabase, $ClassroomStudentsTable,
                        ClassroomStudentEntry>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ClassroomStudentsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ClassroomStudentsTable,
    ClassroomStudentEntry,
    $$ClassroomStudentsTableFilterComposer,
    $$ClassroomStudentsTableOrderingComposer,
    $$ClassroomStudentsTableAnnotationComposer,
    $$ClassroomStudentsTableCreateCompanionBuilder,
    $$ClassroomStudentsTableUpdateCompanionBuilder,
    (
      ClassroomStudentEntry,
      BaseReferences<_$AppDatabase, $ClassroomStudentsTable,
          ClassroomStudentEntry>
    ),
    ClassroomStudentEntry,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$UsersTableTableManager get users =>
      $$UsersTableTableManager(_db, _db.users);
  $$BondsTableTableManager get bonds =>
      $$BondsTableTableManager(_db, _db.bonds);
  $$SchoolsTableTableManager get schools =>
      $$SchoolsTableTableManager(_db, _db.schools);
  $$ClassroomsTableTableManager get classrooms =>
      $$ClassroomsTableTableManager(_db, _db.classrooms);
  $$ClassroomStudentsTableTableManager get classroomStudents =>
      $$ClassroomStudentsTableTableManager(_db, _db.classroomStudents);
}
