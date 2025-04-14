#! /bin/bash
source ../.env
echo $FAST_API_PORT
echo 'Starting FastAPI stream'
source venv/bin/activate
uvicorn main:app --port $FAST_API_PORT --reload
