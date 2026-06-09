#!/bin/sh
set -e

cd /app/backend
uvicorn main:app --host 127.0.0.1 --port 8000 &
backend_pid=$!

cd /app/frontend
node server.js &
frontend_pid=$!

trap 'kill "$backend_pid" "$frontend_pid" 2>/dev/null; wait' TERM INT

wait -n
exit $?
