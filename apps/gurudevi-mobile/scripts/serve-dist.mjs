import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../dist', import.meta.url));
const root = resolve(process.env.EXPO_WEB_DIST ?? defaultRoot);
const port = Number(process.env.PORT ?? 4173);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
};

function safePath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  const candidate = resolve(root, `.${normalize(pathname)}`);
  return candidate.startsWith(root) ? candidate : null;
}

const server = createServer((request, response) => {
  const requested = safePath(request.url ?? '/');
  const file =
    requested && existsSync(requested) && statSync(requested).isFile()
      ? requested
      : join(root, 'index.html');

  if (!existsSync(file)) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Web export is missing. Run the Expo web export first.');
    return;
  }

  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': contentTypes[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
