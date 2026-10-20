#!/usr/bin/env bash
# Pull every parameter under /stock/ from SSM Parameter Store and write .env.
# Runs on the EC2 instance (the instance role has read access to the path).
set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-west-1}"
SSM_PATH="${SSM_PATH:-/stock/}"
ENV_FILE="${ENV_FILE:-.env}"

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found" >&2
  exit 1
fi

umask 077
tmp="$(mktemp "${ENV_FILE}.XXXXXX")"
trap 'rm -f "$tmp"' EXIT

aws ssm get-parameters-by-path \
  --path "$SSM_PATH" \
  --recursive \
  --with-decryption \
  --region "$AWS_REGION" \
  --query 'Parameters[].[Name,Value]' \
  --output text \
  | awk -F '\t' -v prefix="${SSM_PATH%/}/" '
      index($1, prefix) == 1 { print substr($1, length(prefix) + 1) "=" $2 }
    ' > "$tmp"

if [ ! -s "$tmp" ]; then
  echo "No parameters found under $SSM_PATH" >&2
  exit 1
fi

# docker-compose reads APP_DATABASE_URL. Keep the SSM value (which may point at
# RDS) while local runs can still fall back to the bundled db container.
if grep -q '^DATABASE_URL=' "$tmp" && ! grep -q '^APP_DATABASE_URL=' "$tmp"; then
  db_url="$(sed -n 's/^DATABASE_URL=//p' "$tmp" | head -n 1)"
  printf 'APP_DATABASE_URL=%s\n' "$db_url" >> "$tmp"
fi

mv "$tmp" "$ENV_FILE"
chmod 600 "$ENV_FILE"
trap - EXIT

# Fail early with a useful message instead of a confusing compose error.
missing=0
for key in DATABASE_URL POSTGRES_PASSWORD NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY RESEND_API_KEY OPENAI_API_KEY; do
  if ! grep -q "^${key}=" "$ENV_FILE"; then
    echo "Missing parameter: ${SSM_PATH%/}/${key}" >&2
    missing=1
  fi
done

if [ "$missing" -ne 0 ]; then
  exit 1
fi

echo "Wrote $ENV_FILE from $SSM_PATH"
