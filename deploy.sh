#!/usr/bin/env bash
# Redeploy the app through AWS SSM send-command.
#
# Usage:
#   INSTANCE_ID=i-0123456789abcdef0 ./deploy.sh
#   INSTANCE_ID=i-... REFRESH_ENV=1 ./deploy.sh   # also re-read /stock/* into .env
#
# Optional env:
#   AWS_REGION (default eu-west-1)
#   APP_DIR    (default /opt/stock)
#   BRANCH     (default master)
#   HEALTH_URL (e.g. https://stock.example.com/api/health) - checked after deploy
#   TIMEOUT    (seconds, default 1800)
set -euo pipefail

# Common non-Homebrew install location for AWS CLI v2.
if ! command -v aws >/dev/null 2>&1 && [ -x "$HOME/.local/bin/aws" ]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

AWS_REGION="${AWS_REGION:-eu-west-1}"
APP_DIR="${APP_DIR:-/opt/stock}"
BRANCH="${BRANCH:-master}"
TIMEOUT="${TIMEOUT:-1800}"
REFRESH_ENV="${REFRESH_ENV:-0}"

if [ -z "${INSTANCE_ID:-}" ]; then
  echo "INSTANCE_ID is required (e.g. INSTANCE_ID=i-... ./deploy.sh)" >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found. Install AWS CLI v2 first." >&2
  exit 1
fi

remote_cmd="$(cat <<EOF
set -euo pipefail
cd '$APP_DIR'
$([ "$REFRESH_ENV" = "1" ] && echo "./scripts/fetch-env.sh")
git fetch origin
git checkout '$BRANCH'
git pull --ff-only 'origin' '$BRANCH'
docker compose build
docker compose run --rm --build migrate
docker compose up -d --remove-orphans
docker image prune -f >/dev/null
docker compose ps
EOF
)"

# Build the parameters JSON safely (newlines/quotes in the script).
if command -v python3 >/dev/null 2>&1; then
  params="$(printf '%s' "$remote_cmd" | python3 -c 'import json,sys; print(json.dumps({"commands": [sys.stdin.read()]}))')"
else
  params="commands=$remote_cmd"
fi

echo "==> Sending deploy command to $INSTANCE_ID ($AWS_REGION)"
command_id="$(aws ssm send-command \
  --region "$AWS_REGION" \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Deploy stock app $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --timeout-seconds "$TIMEOUT" \
  --parameters "$params" \
  --query 'Command.CommandId' \
  --output text)"

echo "==> Command ID: $command_id"

status="Pending"
deadline=$((SECONDS + TIMEOUT))
while [ "$SECONDS" -lt "$deadline" ]; do
  status="$(aws ssm get-command-invocation \
    --region "$AWS_REGION" \
    --command-id "$command_id" \
    --instance-id "$INSTANCE_ID" \
    --query 'Status' \
    --output text 2>/dev/null || echo Pending)"
  case "$status" in
    Success|Failed|Cancelled|TimedOut) break ;;
  esac
  sleep 5
done

echo "==> Status: $status"
echo "----- stdout -----"
aws ssm get-command-invocation --region "$AWS_REGION" --command-id "$command_id" --instance-id "$INSTANCE_ID" --query 'StandardOutputContent' --output text || true
echo "----- stderr -----"
aws ssm get-command-invocation --region "$AWS_REGION" --command-id "$command_id" --instance-id "$INSTANCE_ID" --query 'StandardErrorContent' --output text || true

if [ "$status" != "Success" ]; then
  echo "Deploy failed." >&2
  exit 1
fi

if [ -n "${HEALTH_URL:-}" ]; then
  echo "==> Health check: $HEALTH_URL"
  curl -fsS --retry 12 --retry-delay 5 --retry-all-errors "$HEALTH_URL" >/dev/null
  echo "OK"
fi

echo "==> Deploy finished"
