#! /bin/bash
source ../.env
echo $FAST_API_PORT
echo 'Starting FastAPI stream'
source venv/bin/activate
uvicorn main:app --port $FAST_API_PORT --reload
# Optional param --host 0.0.0.0 listen on all network interfaces