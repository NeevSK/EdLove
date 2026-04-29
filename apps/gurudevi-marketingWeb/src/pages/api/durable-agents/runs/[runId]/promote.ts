import { promoteDurableAgentRunToTeacherNote } from '../../../../../lib/durableAgents/durableAgentRuns';

export const prerender = false;

export async function POST({ params, request }: { params: { runId: string }; request: Request }) {
  let actorId: string | null = null;

  try {
    const body = (await request.json()) as { actorId?: unknown };
    actorId = typeof body.actorId === 'string' ? body.actorId : null;
  } catch {
    actorId = null;
  }

  try {
    const result = await promoteDurableAgentRunToTeacherNote(params.runId, actorId);

    return Response.json({
      runId: params.runId,
      teacherNoteId: result.teacherNoteId,
      alreadyPromoted: result.alreadyPromoted,
      promotionMode: result.promotionMode,
      status: 'promoted',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to promote durable-agent run.';

    return Response.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
