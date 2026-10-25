import {
  claimPendingExternalEffects,
  markExternalEffectDispatched,
  rescheduleExternalEffect,
} from '../core/externalEffectOutbox';
import { sanctuaryInngest } from './inngest';

/**
 * Delivers only durable, server-authored effect intents. A successful result
 * means Inngest accepted the handoff—not that an eventual provider completed
 * delivery, which remains owned by the receiving workflow.
 */
export const externalEffectDispatch = sanctuaryInngest.createFunction(
  { id: 'sanctuary-external-effect-dispatch', retries: 2, triggers: [{ cron: '* * * * *' }] } as any,
  async ({ step }: any) =>
    step.run('dispatch-persisted-effects', async () => {
      const intents = await claimPendingExternalEffects();
      let dispatched = 0;
      let deferred = 0;
      for (const intent of intents) {
        try {
          await sanctuaryInngest.send({
            id: intent.id,
            name: intent.effectName,
            data: intent.payload,
          });
          await markExternalEffectDispatched(intent);
          dispatched += 1;
        } catch (error) {
          await rescheduleExternalEffect(intent, error);
          deferred += 1;
        }
      }
      return { claimed: intents.length, dispatched, deferred };
    }),
) as any;

export const externalEffectFunctions = [externalEffectDispatch];
