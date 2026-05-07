import { UserSchema } from "@repo/core/src/logic/index.js";

const validUser = {
	id: "550e8400-e29b-41d4-a716-446655440000",
	full_name: "Sleekness Auditor",
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	roles: ["auditor"],
};

try {
	UserSchema.parse(validUser);
	console.log(
		"✅ Sleekness Confirmed: UserSchema imported and parsed without native leakage.",
	);
} catch (e) {
	console.error("❌ Validation failed (but import worked):", e);
}
