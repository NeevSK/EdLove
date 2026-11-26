// Gurudevi decorators only record values; the Gurudevi emitter reads them back.
const put = (ctx, name, target, value) => ctx.program.stateMap(Symbol.for(`gurudevi.${name}`)).set(target, value);
export const $decorators = {
  Gurudevi: {
    query: (ctx, t) => put(ctx, 'kind', t, 'query'),
    command: (ctx, t) => put(ctx, 'kind', t, 'command'),
    requiresBond: (ctx, t, entity, capacities) => put(ctx, 'requiresBond', t, { entity, capacities }),
    delegable: (ctx, t, mode) => put(ctx, 'delegable', t, mode),
    offline: (ctx, t) => put(ctx, 'offline', t, true),
    idempotent: (ctx, t) => put(ctx, 'idempotent', t, true),
    system: (ctx, t) => put(ctx, 'who', t, 'system'),
    ownerOnly: (ctx, t) => put(ctx, 'who', t, 'self'),
  },
};
