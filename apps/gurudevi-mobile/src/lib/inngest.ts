/**
 * Gurudevi Inngest Client (Mobile Shell)
 *
 * 📱 IMPERATIVE SHELL:
 * This is the emitter client for the mobile application.
 * Mobile apps primarily emit events; they rarely serve as background workers.
 */
let inngestPromise: Promise<import('@repo/core/logic/ports/eventBus.port').IEventBusPort> | undefined;

export function getInngest() {
  inngestPromise ??= import('@repo/core/adapters/events/inngest.adapter')
    .then(({ createInngestEventBusAdapter }) => import('inngest').then(({ Inngest }) => {
      const client = new Inngest({
        id: 'gurudevi-mobile-app',
        eventKey: process.env.EXPO_PUBLIC_INNGEST_EVENT_KEY,
      });
      return createInngestEventBusAdapter(client as any);
    }));

  return inngestPromise;
}
