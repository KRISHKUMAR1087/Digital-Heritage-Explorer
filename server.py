# Multi-threaded HTTP Web Server for Digital Heritage Explorer
import http.server
import socketserver
import sys

PORT = 8000

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    handler = http.server.SimpleHTTPRequestHandler
    try:
        with ThreadedHTTPServer(("", PORT), handler) as httpd:
            print(f"Serving Digital Heritage Explorer on http://localhost:{PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        sys.exit(0)
