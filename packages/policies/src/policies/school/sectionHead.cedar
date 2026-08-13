// Ghost Role GAP: Read all Classrooms within own section
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "sectionHead" &&
  resource is Classroom &&
  resource has section_id &&
  principal has section_id &&
  resource.section_id == principal.section_id
};

// Ghost Role GAP: Read Attendance for own section
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "sectionHead" &&
  (resource is AttendanceRecord || resource is DailyAttendance || resource is AttendanceSession) &&
  resource has section_id &&
  principal has section_id &&
  resource.section_id == principal.section_id
};
