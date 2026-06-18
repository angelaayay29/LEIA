#!/bin/bash
cd "$(dirname "$0")"

PORT=8888
while lsof -i :$PORT >/dev/null 2>&1; do
  if [ "$PORT" -eq 8888 ]; then
    echo "Port 8888 is in use — trying next port..."
  fi
  PORT=$((PORT + 1))
  if [ "$PORT" -gt 8898 ]; then
    echo "Could not find an open port between 8888–8898."
    exit 1
  fi
done

echo ""
echo "  LEIA — starting local server..."
echo "  Open: http://localhost:$PORT"
echo "  Press Ctrl+C to stop"
echo ""
/usr/bin/python3 -m http.server "$PORT"
