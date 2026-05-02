import { fetchDurableAgentRun } from "../../../../lib/durableAgents/durableAgentRuns";

export const prerender = false;

export async function GET({ params }: { params: { runId: string } }) {
	const runId = params.runId;

	try {
		const run = await fetchDurableAgentRun(runId);
		if (!run) {
			return Response.json({ error: "Run not found." }, { status: 404 });
		}

		return Response.json(run);
	} catch {
		return Response.json(
			{ error: "Failed to fetch durable-agent run." },
			{ status: 500 },
		);
	}
}
