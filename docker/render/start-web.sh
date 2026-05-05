#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-10000}"
export INTERNAL_GATEWAY_URL="${INTERNAL_GATEWAY_URL:-http://127.0.0.1:3000}"
export GATEWAY_BASE_URL="${GATEWAY_BASE_URL:-/api}"
export AUTH_BASE_URL="${AUTH_BASE_URL:-/auth}"
export USERS_SERVICE_URL="${USERS_SERVICE_URL:-http://127.0.0.1:3001}"
export ASSETS_SERVICE_URL="${ASSETS_SERVICE_URL:-http://127.0.0.1:3002}"
export TICKETS_SERVICE_URL="${TICKETS_SERVICE_URL:-http://127.0.0.1:3003}"
export DISABLE_RABBITMQ="${DISABLE_RABBITMQ:-true}"

cleanup() {
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "${pid}" >/dev/null 2>&1; then
      kill "${pid}" >/dev/null 2>&1 || true
    fi
  done
}

start_service() {
  local name="$1"
  shift
  echo "Iniciando ${name}..."
  "$@" &
  PIDS+=($!)
}

declare -a PIDS=()
trap cleanup EXIT INT TERM

start_service "users-service" env \
  PORT=3001 \
  DB_HOST="${DB_HOST}" \
  DB_PORT="${DB_PORT}" \
  DB_USER="${DB_USER}" \
  DB_PASSWORD="${DB_PASSWORD}" \
  DB_NAME="${DB_NAME}" \
  DISABLE_RABBITMQ="${DISABLE_RABBITMQ}" \
  node /workspace/users-service/dist/server.js

start_service "assets-service" env \
  PORT=3002 \
  DB_HOST="${DB_HOST}" \
  DB_PORT="${DB_PORT}" \
  DB_USER="${DB_USER}" \
  DB_PASSWORD="${DB_PASSWORD}" \
  DB_NAME="${DB_NAME}" \
  DISABLE_RABBITMQ="${DISABLE_RABBITMQ}" \
  node /workspace/assets-service/dist/server.js

start_service "tickets-service" env \
  PORT=3003 \
  DB_HOST="${DB_HOST}" \
  DB_PORT="${DB_PORT}" \
  DB_USER="${DB_USER}" \
  DB_PASSWORD="${DB_PASSWORD}" \
  DB_NAME="${DB_NAME}" \
  DISABLE_RABBITMQ="${DISABLE_RABBITMQ}" \
  node /workspace/tickets-service/dist/server.js

start_service "gateway-service" env \
  PORT=3000 \
  JWT_SECRET="${JWT_SECRET}" \
  USERS_SERVICE_URL="${USERS_SERVICE_URL}" \
  ASSETS_SERVICE_URL="${ASSETS_SERVICE_URL}" \
  TICKETS_SERVICE_URL="${TICKETS_SERVICE_URL}" \
  node /workspace/gateway-service/dist/server.js

start_service "frontend-service" env \
  PORT="${PORT}" \
  INTERNAL_GATEWAY_URL="${INTERNAL_GATEWAY_URL}" \
  GATEWAY_BASE_URL="${GATEWAY_BASE_URL}" \
  AUTH_BASE_URL="${AUTH_BASE_URL}" \
  node /workspace/frontend-service/dist/server.js

wait -n
