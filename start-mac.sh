#!/bin/bash
cd "$(dirname "$0")"

PORT=8765
URL="http://127.0.0.1:$PORT"

# Try Node.js first
if command -v node &> /dev/null; then
    echo "Starting server with Node.js..."
    node offline-package/runtime/server.cjs &
    SERVER_PID=$!
else
    # Fallback to Python
    if command -v python3 &> /dev/null; then
        echo "Starting server with Python..."
        cd offline-package/dist && python3 -m http.server $PORT &
        SERVER_PID=$!
    elif command -v python &> /dev/null; then
        echo "Starting server with Python..."
        cd offline-package/dist && python -m SimpleHTTPServer $PORT &
        SERVER_PID=$!
    else
        echo "Error: Node.js or Python is required to run the server."
        exit 1
    fi
fi

sleep 2

# Open browser
if command -v open &> /dev/null; then
    open "$URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$URL"
fi

echo "=================================="
echo "Server running at $URL"
echo "Press Ctrl+C to stop"
echo "=================================="

wait $SERVER_PID
