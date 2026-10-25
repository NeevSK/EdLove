import { Hono } from 'hono';

export interface WebSocketDoorOptions {
  enabled?: boolean;
}

/**
 * Modular, optional WebSocket ingress door.
 * 
 * Kept strictly decoupled from the core stateless HTTP/oRPC engine so that
 * horizontal autoscaling on Render/Serverless is not compromised by long-lived state.
 */
export function createWebSocketDoor(options?: WebSocketDoorOptions) {
  const door = new Hono();
  const isEnabled = options?.enabled ?? (process.env.ENABLE_WEBSOCKETS === 'true');

  door.get('/', (c) => {
    if (!isEnabled) {
      return c.json(
        {
          error: 'WebSocketsDisabled',
          message:
            'WebSockets are optional and disabled by default. Use stateless oRPC v2 procedures or set ENABLE_WEBSOCKETS=true to enable.',
          status: 501,
        },
        501,
      );
    }

    // In Bun runtime, WebSocket upgrades are handled via Bun.serve websocket handlers.
    // If running under Bun, check for upgrade headers:
    const upgradeHeader = c.req.header('Upgrade');
    if (upgradeHeader?.toLowerCase() === 'websocket') {
      return new Response(null, { status: 101 });
    }

    return c.json({
      status: 'ready',
      protocol: 'websocket',
      hint: 'Send WebSocket Upgrade request to connect.',
    });
  });

  return door;
}
