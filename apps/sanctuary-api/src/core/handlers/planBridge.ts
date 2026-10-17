import { ORPCError } from '@orpc/server';
import { planBridgeORPCContract } from '@repo/core/api/planBridge.orpc.contract';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';
import { getPlanBridgeService } from '../planBridge/runtime';
import { type PlanBridgeActor, PlanBridgeError } from '../planBridge/service';

const impl = implement(planBridgeORPCContract).$context<ORPCContext>();

const actorOf = (context: ORPCContext): PlanBridgeActor => ({
  userId: context.user.id,
  schoolId: context.schoolId,
  capacity: context.capacity,
});

async function run<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof PlanBridgeError) {
      throw new ORPCError(error.code, { message: error.message, data: error.data });
    }
    throw error;
  }
}

export const planBridgeRouter = impl.router({
  listMyGradeClasses: impl.listMyGradeClasses
    .use(doubleGateMiddleware)
    .handler(({ context }: any) =>
      run(() => getPlanBridgeService().listMyGradeClasses(actorOf(context))),
    ),
  getSettings: impl.getSettings
    .use(doubleGateMiddleware)
    .handler(({ context }: any) => run(() => getPlanBridgeService().getSettings(actorOf(context)))),
  updateQuietHours: impl.updateQuietHours
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().updateGoodNight(actorOf(context), input.body)),
    ),
  listEvents: impl.listEvents
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().listEvents(actorOf(context), input.query ?? {})),
    ),
  createEvent: impl.createEvent
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().createEvent(actorOf(context), input.body)),
    ),
  previewNotice: impl.previewNotice
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().previewNotice(actorOf(context), input.body)),
    ),
  scheduleNotice: impl.scheduleNotice
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().scheduleNotice(actorOf(context), input.body)),
    ),
  cancelNotice: impl.cancelNotice
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().cancelNotice(actorOf(context), input.body.noticeId)),
    ),
  listNotices: impl.listNotices
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().listNotices(actorOf(context), input.query ?? {})),
    ),
  verifyGuardianLink: impl.verifyGuardianLink
    .use(doubleGateMiddleware)
    .handler(({ input, context }: any) =>
      run(() => getPlanBridgeService().verifyGuardianLink(actorOf(context), input.body)),
    ),
});
