
import { ClassroomSchema } from './packages/core/src/logic/schemas/classroom.schema.js';

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NOW = new Date().toISOString();

const validClassroom = {
  id: UUID,
  name: 'Mathematics 101',
  teacher_id: OTHER_UUID,
  school_id: UUID,
  subject: 'Mathematics',
  grade_id: OTHER_UUID,
  section_id: UUID,
  created_at: NOW,
  updated_at: NOW,
  teacher: {
    full_name: 'John Doe',
  },
};

const result = ClassroomSchema.safeParse(validClassroom);
if (!result.success) {
  console.log(JSON.stringify(result.error.format(), null, 2));
} else {
  console.log('Success!');
}
