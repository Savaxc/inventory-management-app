#!/usr/bin/env bash
# Update one app secret without ever echoing it.
#
# Usage:
#   ./scripts/set-secret.sh OPENAI_API_KEY
#   ./scripts/set-secret.sh RESEND_API_KEY --deploy
#   ./scripts/set-secret.sh CLERK_SECRET_KEY --deploy
#
# The value is read hidden from the terminal, written to SSM as SecureString
# under /stock/, and written to the local .env with mode 600.
#
# Optional env:
#   AWS_PROFILE (default stock)
#   AWS_REGION  (default eu-west-1)
#   SSM_PREFIX  (default /stock)
#   ENV_FILE    (default .env)
#   REPO        (default Savaxc/inventory-management-app)
#   BRANCH      (default master)
#
# --deploy starts the GitHub Actions workflow with refresh_env=true. The
# production environment still requires approval in GitHub.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

AWS_PROFILE="${AWS_PROFILE:-stock}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
SSM_PREFIX="${SSM_PREFIX:-/stock}"
SSM_PREFIX="${SSM_PREFIX%/}"
ENV_FILE="${ENV_FILE:-.env}"
REPO="${REPO:-Savaxc/inventory-management-app}"
BRANCH="${BRANCH:-master}"

die() { echo "ERROR: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage: ./scripts/set-secret.sh NAME [--deploy]

Examples:
  ./scripts/set-secret.sh OPENAI_API_KEY
  ./scripts/set-secret.sh RESEND_API_KEY --deploy

The value is read hidden. It is never printed or passed on the command line.
EOF
}

DEPLOY=0
NAME=""
for arg in "$@"; do
  case "$arg" in
    --deploy) DEPLOY=1 ;;
    -h|--help) usage; exit 0 ;;
    --*) die "Unknown option: $arg" ;;
    *)
      [ -z "$NAME" ] || die "Only one parameter name is accepted."
      NAME="$arg"
      ;;
  esac
done

[ -n "$NAME" ] || { usage; exit 1; }
NAME="${NAME#/stock/}"
[[ "$NAME" =~ ^[A-Z][A-Z0-9_]*$ ]] || die "Invalid parameter name: $NAME"

if ! command -v aws >/dev/null 2>&1 && [ -x "$HOME/.local/bin/aws" ]; then
  export PATH="$HOME/.local/bin:$PATH"
fi
command -v aws >/dev/null 2>&1 || die "AWS CLI not found."
command -v python3 >/dev/null 2>&1 || die "python3 not found."

export AWS_PROFILE
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  die "AWS session is not active. Run: aws sso login --profile $AWS_PROFILE"
fi

if [ -f "$ENV_FILE" ] && command -v git >/dev/null 2>&1; then
  git check-ignore -q "$ENV_FILE" || die "$ENV_FILE is not gitignored. Refusing to write a secret."
fi

printf 'New value for %s (input hidden): ' "$SSM_PREFIX/$NAME"
IFS= read -rs SECRET
printf '\n'
[ -n "$SECRET" ] || die "Empty value; nothing changed."

case "$SECRET" in
  *[[:space:]]*) die "The value contains whitespace; nothing changed." ;;
esac

case "$NAME" in
  OPENAI_API_KEY)
    case "$SECRET" in
      sk-*) [ "${#SECRET}" -ge 20 ] || die "OpenAI key is too short." ;;
      *) die "OpenAI key should start with sk-." ;;
    esac
    ;;
  RESEND_API_KEY)
    case "$SECRET" in
      re_*) [ "${#SECRET}" -ge 20 ] || die "Resend key is too short." ;;
      *) die "Resend key should start with re_." ;;
    esac
    ;;
  CLERK_SECRET_KEY)
    case "$SECRET" in
      sk_test_*|sk_live_*) ;;
      *) die "Clerk secret key should start with sk_test_ or sk_live_." ;;
    esac
    ;;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
    case "$SECRET" in
      pk_test_*|pk_live_*) ;;
      *) die "Clerk publishable key should start with pk_test_ or pk_live_." ;;
    esac
    ;;
  *)
    [ "${#SECRET}" -ge 8 ] || die "Value is too short."
    ;;
esac

umask 077
SECRET_FILE="$(mktemp "${TMPDIR:-/tmp}/stock-secret.XXXXXX")"
JSON_FILE="$(mktemp "${TMPDIR:-/tmp}/stock-secret-json.XXXXXX")"
cleanup() { rm -f "$SECRET_FILE" "$JSON_FILE"; }
trap cleanup EXIT

printf '%s' "$SECRET" >"$SECRET_FILE"
unset SECRET

python3 - "$SECRET_FILE" "$SSM_PREFIX/$NAME" >"$JSON_FILE" <<'PY'
import json
import sys

value_path, parameter_name = sys.argv[1:3]
with open(value_path, "r", encoding="utf-8") as fh:
    value = fh.read()
print(json.dumps({
    "Name": parameter_name,
    "Value": value,
    "Type": "SecureString",
    "Overwrite": True,
}))
PY

VERSION="$(aws ssm put-parameter \
  --region "$AWS_REGION" \
  --cli-input-json "file://$JSON_FILE" \
  --query 'Version' \
  --output text)"

python3 - "$ENV_FILE" "$SECRET_FILE" "$NAME" <<'PY'
import os
import sys
import tempfile

env_path, value_path, name = sys.argv[1:4]
with open(value_path, "r", encoding="utf-8") as fh:
    value = fh.read()

lines = []
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as fh:
        lines = fh.readlines()

prefixes = (name + "=", "export " + name + "=")
found = False
result = []
for line in lines:
    if line.startswith(prefixes):
        result.append(f"{name}={value}\n")
        found = True
    else:
        result.append(line)

if not found:
    if result and not result[-1].endswith("\n"):
        result[-1] += "\n"
    result.append(f"{name}={value}\n")

directory = os.path.dirname(os.path.abspath(env_path))
fd, temp_path = tempfile.mkstemp(prefix=".env.", dir=directory)
try:
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        fh.writelines(result)
    os.chmod(temp_path, 0o600)
    os.replace(temp_path, env_path)
finally:
    if os.path.exists(temp_path):
        os.unlink(temp_path)
PY

chmod 600 "$ENV_FILE"

echo "SSM parameter $SSM_PREFIX/$NAME updated (version $VERSION)."
echo "Local $ENV_FILE updated with mode 600."

if [ "$DEPLOY" -eq 1 ]; then
  command -v gh >/dev/null 2>&1 || die "gh CLI not found; deploy manually."
  gh workflow run deploy-aws.yml --repo "$REPO" --ref "$BRANCH" -f refresh_env=true
  echo "Deploy workflow started. Approve the production deployment in GitHub Actions."
else
  echo "Next: run the deploy workflow with refresh_env=true, or add --deploy next time."
fi
