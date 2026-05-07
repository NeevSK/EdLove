import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const correlationId = url.searchParams.get("correlationId");

	if (!correlationId) {
		return new Response(
			JSON.stringify({
				error: "Missing required correlationId query parameter.",
			}),
			{
				status: 400,
				headers: { "content-type": "application/json" },
			},
		);
	}

	const { data, error } = await supabaseAdmin
		.from("audit_logs")
		.select(
			"id, action, entity_id, entity_type, school_id, metadata, idempotency_key, created_at",
		)
		.eq("metadata->>correlationId", correlationId)
		.order("created_at", { ascending: true })
		.limit(200);

	if (error) {
		return new Response(
			JSON.stringify({
				error: "Failed to load workflow trace.",
				details: error.message,
			}),
			{
				status: 500,
				headers: { "content-type": "application/json" },
			},
		);
	}

	return new Response(
		JSON.stringify({
			correlationId,
			count: data?.length ?? 0,
			entries: data ?? [],
		}),
		{
			status: 200,
			headers: { "content-type": "application/json" },
		},
	);
};
