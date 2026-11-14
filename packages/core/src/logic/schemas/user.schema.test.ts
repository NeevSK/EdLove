import { describe, expect, it } from 'vitest';
import { UserSchema, UserContextSchema } from './user.schema';

describe('user schema', () => {
  it('validates a correct user object', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      display_name: 'John Doe',
      full_name: 'John Doe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(UserSchema.parse(validUser)).toMatchObject(validUser);
  });

  it('fails on invalid uuid', () => {
    const invalidUser = {
      id: 'not-a-uuid',
      display_name: 'John Doe',
      full_name: 'John Doe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });

  it('defaults authenticated context citizenship to SECOND_CLASS and normalizes WANDERER', () => {
    expect(UserContextSchema.parse({}).citizenship).toBe('SECOND_CLASS');
    expect(UserContextSchema.parse({ citizenship: 'WANDERER' }).citizenship).toBe('THIRD_CLASS');
  });
});
