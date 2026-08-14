// 1. Read own school info and Staff (including leave submissions) and Calendar events
permit(
  principal,
  action in [Action::"read", Action::"create"],
  resource
) when {
  principal.capacity == "teacher" &&
  (resource is School || resource is Staff || resource is Calendar) &&
  (
    (resource is School && resource.id == principal.school_id) ||
    (resource is Staff && resource.school_id == principal.school_id) ||
    (resource is Calendar && resource.school_id == principal.school_id)
  )
};

// 1b. Read own school DailyContent
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "teacher" &&
  resource is DailyContent &&
  resource.school_id == principal.school_id
};

// 1c. Community permissions: Full CRUD on Group and Post in their school
permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "teacher" &&
  (resource is Group || resource is Post) &&
  resource.school_id == principal.school_id
};

// Sacred Missions: teachers may read their school's manifestos and manage
// only their own endorsement records. The handler separately verifies the
// endorsement's manifesto belongs to the active school.
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "teacher" &&
  resource is Manifesto &&
  resource.school_id == principal.school_id
};

permit(
  principal,
  action in [Action::"read", Action::"create", Action::"delete"],
  resource
) when {
  principal.capacity == "teacher" &&
  resource is ManifestoEndorsement &&
  resource.user_id == principal.id
};

// 2. Full CRUD on Classroom, AttendanceRecord, Assignment, Lesson, Material, InventoryItem — scoped to classrooms they teach
permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "teacher" &&
  (
    resource is Classroom ||
    resource is AttendanceRecord ||
    resource is DailyAttendance ||
    resource is AttendanceSession ||
    resource is Assignment ||
    resource is Lesson ||
    resource is Material ||
    resource is InventoryItem ||
    resource is Grade ||
    resource is GradeMark ||
    resource is ClassroomNote ||
    resource is Library ||
    resource is AssignmentSubmission
  ) &&
  (
    (resource is Classroom && resource has teacher_id && resource.teacher_id == principal.id) ||
    (resource has teacher_id && resource.teacher_id == principal.id) ||
    (resource has classroom_id && principal has classroom_ids && principal.classroom_ids.contains(resource.classroom_id)) ||
    (resource has grade_class_id && principal has classroom_ids && principal.classroom_ids.contains(resource.grade_class_id)) ||
    (resource has grade_class_id && principal has classroom_ids && principal.classroom_ids.contains(resource.grade_class_id)) ||
    (resource is Classroom && principal has classroom_ids && principal.classroom_ids.contains(resource.id)) ||
    (resource is Library) // Library reads/actions are generally permitted
  ) &&
  // Optionally restrict Grade creation to highly trusted devices
  (
    if (action == Action::"create" && (resource is Grade || resource is GradeMark)) then (context has device_trust && context.device_trust == "high") else true
  )
};

// 3. Read own StaffLeave only (GAP: not yet restricted in ZenStack - known leak to fix)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "teacher" &&
  resource is StaffLeave &&
  resource has user_id &&
  resource.user_id == principal.id
};

// 4. Full CRUD on own MoodLog, FireJournal, JoyMoments, GratitudeEntries, EnergyForecasts
permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "teacher" &&
  (
    resource is MoodLog ||
    resource is FireJournal ||
    resource is JoyMoments ||
    resource is GratitudeEntries ||
    resource is EnergyForecasts ||
    resource is Wellbeing
  ) &&
  resource has user_id &&
  resource.user_id == principal.id
};

// 5. Read/Update/Delete own User preferences / personal details (social links deletion etc)
permit(
  principal,
  action in [Action::"read", Action::"update", Action::"delete"],
  resource
) when {
  principal.capacity == "teacher" &&
  resource is User &&
  resource.id == principal.id
};

