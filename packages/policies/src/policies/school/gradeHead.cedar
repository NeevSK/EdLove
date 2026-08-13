// Ghost Role GAP: Read all Classrooms within own grade
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "gradeHead" &&
  resource is Classroom &&
  resource has grade_id &&
  principal has grade_id &&
  resource.grade_id == principal.grade_id
};

// Ghost Role GAP: Read Attendance for own grade
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "gradeHead" &&
  (resource is AttendanceRecord || resource is DailyAttendance || resource is AttendanceSession) &&
  resource has grade_id &&
  principal has grade_id &&
  resource.grade_id == principal.grade_id
};
