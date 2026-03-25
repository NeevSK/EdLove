import { registerRoleCapabilities } from '@repo/core';

/**
 * Classroom Domain Capabilities
 * 
 * Registers what various roles can do within the classroom and school context.
 * This lives here, decoupled from the core authority logic.
 */
export function registerClassroomCapabilities() {
  registerRoleCapabilities({
    school: {
      principal: [
        'school.read',
        'school.manage',
        'school.people.read',
        'school.people.manage',
        'school.calendar.read',
        'school.calendar.manage',
        'school.reporting.read',
        'school.reporting.export',
        'school.inventory.read',
        'school.inventory.manage',
        'classroom.read.school',
        'attendance.student.read',
        'attendance.staff.read',
        'attendance.staff.manage',
        'leave.review.school',
        'student.record.read.school',
      ],
      vice_principal: [
        'school.read',
        'school.people.read',
        'school.people.manage',
        'school.calendar.read',
        'school.calendar.manage',
        'school.reporting.read',
        'school.inventory.read',
        'attendance.student.read',
        'attendance.staff.read',
        'leave.review.school',
        'student.record.read.school',
      ],
      teacher: [
        'school.read',
        'school.calendar.read',
        'classroom.read.assigned',
        'classroom.create',
        'classroom.manage.own',
        'classroom.resources.manage',
        'attendance.student.read',
        'attendance.student.take',
        'assignment.create',
        'leave.request.self',
      ],
      student: [
        'school.read', 
        'classroom.read.assigned', 
        'assignment.submit', 
        'student.record.read.self'
      ],
      section_head: [
        'school.read',
        'school.people.read',
        'school.calendar.read',
        'classroom.read.school',
        'attendance.student.read',
        'student.record.read.school',
      ],
      grade_head: [
        'school.read',
        'school.people.read',
        'school.calendar.read',
        'classroom.read.school',
        'attendance.student.read',
        'student.record.read.school',
      ],
      office_head: [
        'school.read',
        'school.people.read',
        'school.calendar.read',
        'school.reporting.read',
        'school.inventory.read',
        'attendance.staff.read',
      ],
    },
    work: {
      teacher: ['classroom.resources.manage', 'assignment.create'],
      finance_officer: ['school.reporting.read'],
      office_staff: ['school.people.read', 'school.calendar.read'],
      librarian: ['school.inventory.read'],
      lab_assistant: ['school.inventory.read', 'school.inventory.manage'],
    }
  });
}
