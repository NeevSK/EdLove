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
  (resource is Grade || resource is GradeMark || resource is AttendanceRecord || resource is DailyAttendance || resource is AttendanceSession) &&
  resource has student_id &&
  resource.student_id == principal.id
};

// 3. Read Lessons, Materials, ClassroomNotes, and Assignments for own classroom only (known leak fix)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  (resource is Lesson || resource is Material || resource is ClassroomNote || resource is Assignment) &&
  resource has classroom_id &&
  principal has classroom_ids &&
  principal.classroom_ids.contains(resource.classroom_id)
};

// 3b. Read Library resources generally permitted
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  resource is Library
};

// 3c. Read DailyContent generally permitted
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  resource is DailyContent
};

// Sacred Missions: students may read school manifestos and manage their own
// endorsement records; school membership is enforced by the API handler.
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  resource is Manifesto &&
  resource.school_id == principal.school_id
};

permit(
  principal,
  action in [Action::"read", Action::"create", Action::"delete"],
  resource
) when {
  principal.capacity == "student" &&
  resource is ManifestoEndorsement &&
  resource.user_id == principal.id
};

// 3e. Read Assignment generally permitted for own school
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "student" &&
  resource is Assignment &&
  resource.school_id == principal.school_id
};

// 3d. Community permissions: Full CRUD on Group and Post in their school
permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "student" &&
  (resource is Group || resource is Post) &&
  resource.school_id == principal.school_id
};

// 4. Full CRUD on own MoodLog, FireJournal, JoyMoments, GratitudeEntries, EnergyForecasts
permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "student" &&
  (
    (
      resource is MoodLog ||
      resource is FireJournal ||
      resource is JoyMoments ||
      resource is GratitudeEntries ||
      resource is EnergyForecasts ||
      resource is Wellbeing ||
      resource is UserRewards ||
      resource is WhisperedMoment
    ) &&
    resource has user_id &&
    resource.user_id == principal.id
  ) ||
  (
    resource is AssignmentSubmission &&
    resource has student_id &&
    resource.student_id == principal.id
  )
};

// 5. Read/Update/Delete own User preferences / personal details (social links deletion etc)
permit(
  principal,
  action in [Action::"read", Action::"update", Action::"delete"],
  resource
) when {
  principal.capacity == "student" &&
  resource is User &&
  resource.id == principal.id
};

