import { UserSchema } from './packages/core/src/logic/schemas/user.schema';

try {
  const updates = {
    onboarding_completed: true,
    onboarding_completed_at: new Date(),
  };
  UserSchema.partial().parse(updates);
  console.log('✅ Parse successful with Date object');
} catch (e) {
  console.log('❌ Parse failed with Date object');
  console.log(e);
}

try {
  const updatesString = {
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
  };
  UserSchema.partial().parse(updatesString);
  console.log('✅ Parse successful with ISO string');
} catch (e) {
  console.log('❌ Parse failed with ISO string');
  console.log(e);
}
