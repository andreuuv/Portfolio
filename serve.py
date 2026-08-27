#!/usr/bin/env python3
"""Local dev server for this project — same as `python3 -m http.server`,
with two fixes over the plain version:

1. Cache-Control: no-store on every response, so the browser never serves
   a stale copy of an HTML/CSS/JS/JSON file while it's being edited.
   Plain http.server doesn't send any cache headers at all, which leaves
   browsers free to use aggressive heuristic caching — that's been the
   cause of most "I don't see the change" reports this whole project.

2. ThreadingHTTPServer instead of plain HTTPServer. Plain HTTPServer
   handles ONE request at a time — with several autoplaying preview
   videos on a page (e.g. the Film list), the first one's still-open
   streaming connection blocked the server from even starting the next
   one, so every video after the first just sat at readyState 0
   indefinitely ("los videos no cargan"). Threading lets multiple
   requests — including several concurrent video streams — get served
   at once, like any real web server would.

Usage: python3 serve.py [port]  (default port 8811)
"""
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8811
    ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
