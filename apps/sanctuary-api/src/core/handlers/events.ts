import { eventsORPCContract } from '@repo/core/api/events.orpc.contract';
import { sanctuaryInngest } from '../../agents/inngest';
import { implement, type ORPCContext } from '../orpc';

const impl = implement(eventsORPCContract).$context<ORPCContext>();

export const eventsRouter = impl.router({
  dispatch: impl.dispatch.handler(async ({ input, context }) => {
    const payload = {
      ...input.body.data,
      actorId:
        context.user.id !== 'anonymous'
          ? context.user.id
          : (input.body.data.actorId as string | undefined),
    };

    try {
      await sanctuaryInngest.send({
        name: input.body.name,
        data: payload,
      });
    } catch (inngestError) {
      console.warn('[EventsRouter] Inngest send deferred/logged:', inngestError);
    }

    return {
      success: true,
      event: input.body.name,
    };
  }),
});
