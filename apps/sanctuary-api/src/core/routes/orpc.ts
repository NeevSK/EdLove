import { buildORPCContextFromHono } from '../router';

type RouteRegistrar = {
  all: (path: string, handler: (context: any) => Promise<Response>) => unknown;
};

type RPCHandler = {
  handle: (...args: any[]) => Promise<{ matched: boolean; response?: Response }>;
};

const nativeORPCPaths = [
  '/api/self/*',
  '/api/profile/*',
  '/api/identity/*',
  '/api/onboarding/*',
  '/api/community/*',
  '/api/messaging/*',
  '/api/social/*',
  '/api/announcements/*',
  '/api/principalNotes/*',
  '/api/admin/*',
  '/api/sync/*',
  '/api/dailyContent/*',
  '/api/decisionJournal/*',
  '/api/journalEntries/*',
  '/api/sacredMissions/*',
  '/api/library/*',
  '/api/authorization/*',
  '/api/educational/*',
  '/api/grading/*',
  '/api/attendance/*',
  '/api/guardianAssessment/*',
  '/api/agent/*',
  '/api/thuthimal/*',
  '/api/erp/*',
  '/api/mapping/*',
  '/api/inventory/*',
  '/api/history/*',
  '/api/longitudinal/*',
  '/api/school-forest/*',
  // RPCLink uses the router's camel-case namespace; keep this explicit
  // compatibility mount alongside the kebab-case contract path.
  '/api/schoolForest/*',
  '/api/privacy/*',
  '/api/echoes/*',
  '/api/studentPotential/*',
  '/api/forms/*',
  '/api/tracking/*',
  '/api/warmMirror/*',
  '/api/presence/*',
] as const;

async function handleNativeORPC(c: any, rpcHandler: RPCHandler) {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    context,
    prefix: '/api',
  });
  return matched && response ? response : c.text('Not Found', 404);
}

export function registerNativeORPCRoutes(app: RouteRegistrar, rpcHandler: RPCHandler) {
  for (const path of nativeORPCPaths) {
    app.all(path, (context) => handleNativeORPC(context, rpcHandler));
  }
}

export { nativeORPCPaths };
