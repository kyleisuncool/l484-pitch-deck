#!/usr/bin/env bash
# Labs 484 Pitch Deck — local preview server
PORT=${1:-4002}
URL="http://localhost:$PORT"

echo ""
echo "  Labs 484 — Pitch Deck"
echo "  $URL"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

(sleep 0.4 && open "$URL") &

python3 -m http.server "$PORT" --bind 127.0.0.1 2>/dev/null \
  || python -m SimpleHTTPServer "$PORT"
