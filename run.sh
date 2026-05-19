#!/usr/bin/env bash
set -e

echo "==> Training models..."
python -m models.train_all

echo ""
echo "==> Starting FastAPI backend on http://localhost:8000"
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo ""
echo "==> Installing frontend dependencies..."
cd frontend && npm install

echo ""
echo "==> Starting React frontend on http://localhost:3000"
npm start

# Kill backend when frontend exits
kill $BACKEND_PID 2>/dev/null
