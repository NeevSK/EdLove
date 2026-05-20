// GAP: Read Grades for own child only (currently missing in ZenStack)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "parent" &&
  resource is Grade &&
  resource has student_id &&
  principal has child_student_ids &&
  principal.child_student_ids.contains(resource.student_id)
};

// GAP: Read Attendance for own child only (currently missing in ZenStack)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "parent" &&
  resource is AttendanceRecord &&
  resource has student_id &&
  principal has child_student_ids &&
  principal.child_student_ids.contains(resource.student_id)
};
