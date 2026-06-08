// 1. Read Classroom they are enrolled in
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  resource is Classroom &&
  principal has classroom_ids &&
  principal.classroom_ids.contains(resource.id)
};

// 2. Read own Grades and AttendanceRecord (self-scoped only)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  (resource is Grade || resource is AttendanceRecord) &&
  resource has student_id &&
  resource.student_id == principal.id
};

// 3. Read Lessons and Materials for own classroom only (known leak fix)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  (resource is Lesson || resource is Material) &&
  resource has classroom_id &&
  principal has classroom_ids &&
  principal.classroom_ids.contains(resource.classroom_id)
};

// 4. Full CRUD on own MoodLog, FireJournal, JoyMoments, GratitudeEntries, EnergyForecasts
permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "student" &&
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
  principal.capacity == "student" &&
  resource is User &&
  resource.id == principal.id
};

