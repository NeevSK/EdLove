import { z } from 'zod';

/**
 * How the H5P player page talks to its host. On mobile the page runs in a WebView and posts
 * strings through `ReactNativeWebView.postMessage`; on the web it runs in a sandboxed iframe
 * and posts objects to its parent. Both carry the same envelope, checked here before the host
 * acts on anything: the page runs third-party library code, so its messages are untrusted.
 */

export const BRIDGE_CHANNEL = 'gurudevi.h5p';
export const BRIDGE_VERSION = 1;

/** Upper bound on a message before it is parsed. A saved state is the largest message. */
export const MAX_MESSAGE_CHARS = 1_048_576;

const envelope = {
  channel: z.literal(BRIDGE_CHANNEL),
  v: z.literal(BRIDGE_VERSION),
  playerId: z.string().min(1).max(128),
};

export const BridgeMessage = z.discriminatedUnion('type', [
  z.strictObject({ ...envelope, type: z.literal('ready') }),
  z.strictObject({ ...envelope, type: z.literal('xapi'), statement: z.unknown() }),
  z.strictObject({
    ...envelope,
    type: z.literal('state'),
    state: z.string().max(MAX_MESSAGE_CHARS),
  }),
  z.strictObject({
    ...envelope,
    type: z.literal('resize'),
    height: z.number().int().min(0).max(100_000),
  }),
  z.strictObject({ ...envelope, type: z.literal('error'), message: z.string().max(2000) }),
]);
export type BridgeMessage = z.infer<typeof BridgeMessage>;

export type ParseMessageResult =
  | { readonly ok: true; readonly message: BridgeMessage }
  | {
      readonly ok: false;
      readonly reason: 'too_large' | 'not_json' | 'not_a_bridge_message' | 'other_player';
    };

/** Reads what the page posted. Anything not addressed to `playerId` is refused. */
export function parseBridgeMessage(data: unknown, playerId: string): ParseMessageResult {
  let value = data;
  if (typeof data === 'string') {
    if (data.length > MAX_MESSAGE_CHARS + 4096) return { ok: false, reason: 'too_large' };
    try {
      value = JSON.parse(data);
    } catch {
      return { ok: false, reason: 'not_json' };
    }
  }
  const parsed = BridgeMessage.safeParse(value);
  if (!parsed.success) return { ok: false, reason: 'not_a_bridge_message' };
  if (parsed.data.playerId !== playerId) return { ok: false, reason: 'other_player' };
  return { ok: true, message: parsed.data };
}

export interface PlayerAssets {
  /** `h5p-standalone`'s `dist/main.bundle.js`, served from the same origin as the package. */
  readonly mainJs: string;
  readonly frameJs: string;
  readonly frameCss: string;
}

export interface PlayerDocumentOptions {
  readonly playerId: string;
  /** The extracted package folder, ending in `/`. */
  readonly packageUrl: string;
  /** Where shared libraries live, when the device keeps them outside the package. */
  readonly librariesUrl?: string;
  readonly assets: PlayerAssets;
  /** The only origin the page may load from or post to: `file://` on mobile, the app origin on the web. */
  readonly origin: string;
  /** The parent's origin on the web. Unused in a WebView. */
  readonly parentOrigin?: string;
  /** The state the learner left the content in, as H5P saved it. */
  readonly previousState?: string;
  readonly saveEverySeconds?: number;
  readonly language?: string;
}

const scriptJson = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const attr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The page that hosts one player. It loads only from `origin`, never from the network, and
 * reports through the bridge. H5P libraries need inline scripts and styles, so the policy
 * allows those, but no other origin.
 */
export function buildPlayerDocument(options: PlayerDocumentOptions): string {
  const self = options.origin;
  const csp = [
    "default-src 'none'",
    `script-src ${self} 'unsafe-inline'`,
    `style-src ${self} 'unsafe-inline'`,
    `img-src ${self} data: blob:`,
    `media-src ${self} blob:`,
    `font-src ${self} data:`,
    `connect-src ${self}`,
    `frame-src ${self} about:`,
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  const config = {
    channel: BRIDGE_CHANNEL,
    v: BRIDGE_VERSION,
    playerId: options.playerId,
    parentOrigin: options.parentOrigin ?? null,
    saveEverySeconds: options.saveEverySeconds ?? 10,
    h5p: {
      id: options.playerId,
      h5pJsonPath: options.packageUrl,
      ...(options.librariesUrl !== undefined ? { librariesPath: options.librariesUrl } : {}),
      frameJs: options.assets.frameJs,
      frameCss: options.assets.frameCss,
      frame: false,
      copyright: false,
      export: false,
      embed: false,
      icon: false,
      fullScreen: false,
      ...(options.previousState !== undefined
        ? {
            contentUserData: [
              { dataType: 'state', previousState: options.previousState, subContentId: '*' },
            ],
          }
        : {}),
    },
  };

  return `<!doctype html>
<html lang="${attr(options.language ?? 'en')}">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${attr(csp)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<style>html,body{margin:0;padding:0;background:transparent}</style>
</head>
<body>
<div id="h5p"></div>
<script src="${attr(options.assets.mainJs)}" charset="utf-8"></script>
<script>
(function () {
  var c = ${scriptJson(config)};
  function post(type, extra) {
    var m = Object.assign({ channel: c.channel, v: c.v, playerId: c.playerId, type: type }, extra || {});
    if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
    else if (c.parentOrigin) { window.parent.postMessage(m, c.parentOrigin); }
  }
  window.addEventListener('error', function (e) { post('error', { message: String(e.message || 'error').slice(0, 2000) }); });
  var lastState = null;
  function saveState() {
    try {
      var entry = window.H5PIntegration && window.H5PIntegration.contents && window.H5PIntegration.contents['cid-' + c.playerId];
      var data = entry && entry.contentUserData && entry.contentUserData[0] && entry.contentUserData[0].state;
      if (typeof data === 'string' && data !== lastState) { lastState = data; post('state', { state: data }); }
    } catch (err) { post('error', { message: 'state: ' + String(err).slice(0, 1990) }); }
  }
  var el = document.getElementById('h5p');
  new H5PStandalone.H5P(el, c.h5p).then(function () {
    H5P.externalDispatcher.on('xAPI', function (event) {
      post('xapi', { statement: event.data.statement });
      saveState();
    });
    setInterval(saveState, c.saveEverySeconds * 1000);
    if (window.ResizeObserver) {
      new ResizeObserver(function () { post('resize', { height: Math.ceil(document.documentElement.scrollHeight) }); }).observe(document.body);
    }
    post('ready');
  }, function (err) { post('error', { message: 'load: ' + String(err).slice(0, 1990) }); });
})();
</script>
</body>
</html>`;
}
