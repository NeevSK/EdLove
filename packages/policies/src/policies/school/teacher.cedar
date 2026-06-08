// 1. Read own school info
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "teacher" &&
  resource is School &&
  resource.id == principal.school_id
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
    resource is Assignment ||
    resource is Lesson ||
    resource is Material ||
    resource is InventoryItem ||
    resource is Grade
  ) &&
  (
    (resource is Classroom && resource has teacher_id && resource.teacher_id == principal.id) ||
    (resource has teacher_id && resource.teacher_id == principal.id) ||
    (resource has classroom_id && principal has classroom_ids && principal.classroom_ids.contains(resource.classroom_id)) ||
    (resource is Classroom && principal has classroom_ids && principal.classroom_ids.contains(resource.id))
  ) &&
  // Optionally restrict Grade creation to highly trusted devices
  (
    if (action == Action::"create" && resource is Grade) then (context has device_trust && context.device_trust == "high") else true
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
    resource is EnergyForecasts
  ) &&
  resource has user_id &&
  resource.user_id == principal.id
};

// 5. Read/Update own User preferences / personal details
permit(
  principal,
  action in [Action::"read", Action::"update"],
  resource
) when {
  principal.capacity == "teacher" &&
  resource is User &&
  resource.id == principal.id
};

