import http.server, pathlib, urllib.request, re, os, sys

HERE = pathlib.Path(__file__).parent
PORT = int(os.environ.get('PORT', '8788'))
VIEWER = HERE / '.viewer.html'
SHELL_URL = os.environ.get('FOGLAMP_SHELL_URL', 'https://www.foglamp.dev/scan/sample-codebase-wgwf6i')
ORIGIN = re.match(r'^(https?://[^/]+)', SHELL_URL).group(1)

if not VIEWER.exists():
    sys.exit('Run: python foglamp-local.py build scan.json  first')

PAGE = VIEWER.read_bytes()

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/scan/sample-codebase-wgwf6i':
            self.send_response(200)
            self.send_header('content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(PAGE)
        elif self.path == '/':
            self.send_response(302)
            self.send_header('location', '/scan/sample-codebase-wgwf6i')
            self.end_headers()
        elif self.path.startswith('/_next/') or self.path == '/favicon.ico':
            try:
                r = urllib.request.urlopen(urllib.request.Request(ORIGIN + self.path, headers={'User-Agent': 'Mozilla/5.0'}), timeout=25)
                self.send_response(r.status)
                self.send_header('content-type', r.headers.get('content-type', ''))
                self.end_headers()
                self.wfile.write(r.read())
            except Exception:
                self.send_response(502)
                self.end_headers()
        else:
            self.send_response(204)
            self.end_headers()
    def log_message(self, *a): pass

print('Open: http://localhost:' + str(PORT) + '/')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
