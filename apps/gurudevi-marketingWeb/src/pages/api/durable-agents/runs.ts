import { listRecentDurableAgentRuns } from '../../../lib/durableAgents/durableAgentRuns';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const limitParam = Number(url.searchParams.get('limit') ?? '8');
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 25) : 8;

    const runs = await listRecentDurableAgentRuns(limit);
    return Response.json({ runs });
  } catch {
    return Response.json({ error: 'Failed to fetch durable-agent runs.' }, { status: 500 });
  }
}
