import { createClient } from "@supabase/supabase-js";

function requireEnvValue(
	value: string | undefined,
	envNames: string[],
): string {
	if (typeof value === "string" && value.trim().length > 0) {
		return value;
	}

	throw new Error(
		`Missing required Supabase environment variable. Expected one of: ${envNames.join(", ")}.`,
	);
}

const supabaseUrl = requireEnvValue(
	import.meta.env["PUBLIC_SUPABASE_URL"] || import.meta.env["SUPABASE_URL"],
	[
	"PUBLIC_SUPABASE_URL",
	"SUPABASE_URL",
	],
);
const supabasePublishableKey = requireEnvValue(
	import.meta.env["PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ||
		import.meta.env["SUPABASE_PUBLISHABLE_KEY"],
	["PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY"],
);
const supabaseServiceRoleKey = requireEnvValue(
	import.meta.env["SUPABASE_SECRET_KEY"] ||
		import.meta.env["SUPABASE_SERVICE_ROLE_KEY"],
	["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
);

/**
 * Standard Supabase client (respects RLS).
 * Use this for client-side operations or non-privileged background tasks.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

/**
 * 'God Mode' Supabase client (bypasses RLS).
 * ONLY for use in protected Inngest handlers / server-side orchestration.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});
