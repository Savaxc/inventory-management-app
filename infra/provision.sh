#!/usr/bin/env bash
# Provision the AWS side of the stock app:
#   IAM role + instance profile (SSM + read /stock/* parameters)
#   SSM parameters under /stock/
#   Security group (80/443 only)
#   t3.small Amazon Linux 2023 instance, 20 GB gp3, Elastic IP
#   Docker + 2 GB swap + first deploy via SSM
#
# Prereqs: AWS CLI v2 configured with credentials for the target account.
# Secrets are read from the app's .env (or the environment) and written to SSM.
#
# Usage:
#   ./infra/provision.sh
#
# Optional env:
#   AWS_REGION (eu-west-1), STACK_NAME (stock), INSTANCE_TYPE (t3.small),
#   VOLUME_SIZE (20), BRANCH (master), SSM_PREFIX (/stock),
#   VPC_ID, SUBNET_ID, APP_DOMAIN, ACME_EMAIL, SKIP_BOOTSTRAP=1
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Common non-Homebrew install location for AWS CLI v2.
if ! command -v aws >/dev/null 2>&1 && [ -x "$HOME/.local/bin/aws" ]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

# Load local secrets if present. Values already exported win.
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT_DIR/.env"
  set +a
fi

AWS_REGION="${AWS_REGION:-eu-west-1}"
STACK_NAME="${STACK_NAME:-stock}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t3.small}"
VOLUME_SIZE="${VOLUME_SIZE:-20}"
BRANCH="${BRANCH:-master}"
SSM_PREFIX="${SSM_PREFIX:-/stock}"
SSM_PREFIX="${SSM_PREFIX%/}"
REPO_URL="${REPO_URL:-https://github.com/Savaxc/inventory-management-app.git}"
APP_DIR="${APP_DIR:-/opt/stock}"
ROLE_NAME="${STACK_NAME}-ec2-role"
PROFILE_NAME="${STACK_NAME}-ec2-profile"
SG_NAME="${STACK_NAME}-app-sg"
POSTGRES_USER="${POSTGRES_USER:-stock}"
POSTGRES_DB="${POSTGRES_DB:-stock}"
OPENAI_BASE_URL="${OPENAI_BASE_URL:-https://api.deepseek.com/v1}"
ASSISTANT_MODEL="${ASSISTANT_MODEL:-deepseek-v4-flash}"
APP_DOMAIN="${APP_DOMAIN:-}"
ACME_EMAIL="${ACME_EMAIL:-}"
SKIP_BOOTSTRAP="${SKIP_BOOTSTRAP:-0}"

die() { echo "ERROR: $*" >&2; exit 1; }
info() { echo "==> $*"; }

command -v aws >/dev/null 2>&1 || die "aws CLI not found. Install AWS CLI v2 first."
command -v git >/dev/null 2>&1 || die "git not found."

for var in CLERK_SECRET_KEY NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY RESEND_API_KEY OPENAI_API_KEY; do
  [ -n "${!var:-}" ] || die "$var is not set (put it in .env or export it)"
done

info "Checking AWS identity"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
CALLER_ARN="$(aws sts get-caller-identity --query Arn --output text)"
echo "    account: $ACCOUNT_ID"
echo "    caller:  $CALLER_ARN"

# Reuse an existing DB password so re-running the script does not break the volume.
if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  POSTGRES_PASSWORD="$(aws ssm get-parameter \
    --region "$AWS_REGION" \
    --name "${SSM_PREFIX}/POSTGRES_PASSWORD" \
    --with-decryption \
    --query Parameter.Value \
    --output text 2>/dev/null || true)"
fi
if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  POSTGRES_PASSWORD="$(openssl rand -hex 24)"
  info "Generated a new Postgres password"
fi

# URL-encode the password for DATABASE_URL.
if command -v python3 >/dev/null 2>&1; then
  PG_PASS_ENC="$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$POSTGRES_PASSWORD")"
else
  PG_PASS_ENC="$POSTGRES_PASSWORD"
fi
DATABASE_URL="postgresql://${POSTGRES_USER}:${PG_PASS_ENC}@db:5432/${POSTGRES_DB}?schema=public"

# ---------- IAM ----------
info "IAM role $ROLE_NAME"
TRUST_DOC='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$TRUST_DOC" >/dev/null
  sleep 5
fi

aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore" >/dev/null

SSM_POLICY="$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter${SSM_PREFIX}",
        "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter${SSM_PREFIX}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "kms:Decrypt",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "ssm.${AWS_REGION}.amazonaws.com"
        }
      }
    }
  ]
}
EOF
)"
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "${STACK_NAME}-ssm-params" \
  --policy-document "$SSM_POLICY" >/dev/null

if ! aws iam get-instance-profile --instance-profile-name "$PROFILE_NAME" >/dev/null 2>&1; then
  aws iam create-instance-profile --instance-profile-name "$PROFILE_NAME" >/dev/null
  aws iam add-role-to-instance-profile \
    --instance-profile-name "$PROFILE_NAME" \
    --role-name "$ROLE_NAME" >/dev/null
  sleep 10
fi

# ---------- SSM parameters ----------
info "Writing SSM parameters to $SSM_PREFIX"

put_param() {
  local name="$1" value="$2" type="${3:-SecureString}"
  aws ssm put-parameter \
    --region "$AWS_REGION" \
    --name "${SSM_PREFIX}/${name}" \
    --value "$value" \
    --type "$type" \
    --overwrite >/dev/null
  echo "    ${name}"
}

put_param DATABASE_URL "$DATABASE_URL" SecureString
put_param POSTGRES_PASSWORD "$POSTGRES_PASSWORD" SecureString
put_param POSTGRES_USER "$POSTGRES_USER" String
put_param POSTGRES_DB "$POSTGRES_DB" String
put_param CLERK_SECRET_KEY "$CLERK_SECRET_KEY" SecureString
put_param NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" SecureString
put_param RESEND_API_KEY "$RESEND_API_KEY" SecureString
put_param OPENAI_API_KEY "$OPENAI_API_KEY" SecureString
put_param OPENAI_BASE_URL "$OPENAI_BASE_URL" String
put_param ASSISTANT_MODEL "$ASSISTANT_MODEL" String
[ -n "$APP_DOMAIN" ] && put_param APP_DOMAIN "$APP_DOMAIN" String
[ -n "$ACME_EMAIL" ] && put_param ACME_EMAIL "$ACME_EMAIL" String

# ---------- Network ----------
info "Resolving VPC and subnet"
VPC_ID="${VPC_ID:-$(aws ec2 describe-vpcs \
  --region "$AWS_REGION" \
  --filters Name=is-default,Values=true \
  --query 'Vpcs[0].VpcId' \
  --output text)}"
if [ -z "$VPC_ID" ] || [ "$VPC_ID" = "None" ]; then
  die "No default VPC found. Set VPC_ID and SUBNET_ID explicitly."
fi

if [ -z "${SUBNET_ID:-}" ]; then
  SUBNET_ID="$(aws ec2 describe-subnets \
    --region "$AWS_REGION" \
    --filters "Name=vpc-id,Values=$VPC_ID" Name=default-for-az,Values=true \
    --query 'Subnets[0].SubnetId' \
    --output text)"
fi
if [ -z "$SUBNET_ID" ] || [ "$SUBNET_ID" = "None" ]; then
  SUBNET_ID="$(aws ec2 describe-subnets \
    --region "$AWS_REGION" \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[0].SubnetId' \
    --output text)"
fi
[ -n "$SUBNET_ID" ] && [ "$SUBNET_ID" != "None" ] || die "No subnet found in $VPC_ID"

SG_ID="$(aws ec2 describe-security-groups \
  --region "$AWS_REGION" \
  --filters "Name=group-name,Values=$SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text 2>/dev/null || true)"
if [ -z "$SG_ID" ] || [ "$SG_ID" = "None" ]; then
  info "Creating security group $SG_NAME (80/443 only)"
  SG_ID="$(aws ec2 create-security-group \
    --region "$AWS_REGION" \
    --group-name "$SG_NAME" \
    --description "Stock app - public 80/443 only, no SSH" \
    --vpc-id "$VPC_ID" \
    --query GroupId \
    --output text)"
else
  echo "    reusing security group $SG_ID"
fi

# Idempotent: duplicate rules are ignored, missing rules are restored.
aws ec2 authorize-security-group-ingress --region "$AWS_REGION" --group-id "$SG_ID" \
  --protocol tcp --port 80 --cidr 0.0.0.0/0 >/dev/null 2>&1 || true
aws ec2 authorize-security-group-ingress --region "$AWS_REGION" --group-id "$SG_ID" \
  --protocol tcp --port 443 --cidr 0.0.0.0/0 >/dev/null 2>&1 || true

# ---------- EC2 ----------
AMI_ID="$(aws ssm get-parameter \
  --region "$AWS_REGION" \
  --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query Parameter.Value \
  --output text)"
[ -n "$AMI_ID" ] && [ "$AMI_ID" != "None" ] || die "Could not resolve AL2023 AMI"

INSTANCE_ID="$(aws ec2 describe-instances \
  --region "$AWS_REGION" \
  --filters "Name=tag:Name,Values=${STACK_NAME}-app" \
    "Name=instance-state-name,Values=pending,running,stopping,stopped" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text 2>/dev/null || true)"

USER_DATA="$(cat <<'EOF'
#!/bin/bash
set -euxo pipefail
dnf install -y docker git
systemctl enable --now docker
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
fi
swapon /swapfile || true
grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
EOF
)"
USER_DATA_FILE="$(mktemp)"
printf '%s\n' "$USER_DATA" > "$USER_DATA_FILE"
trap 'rm -f "$USER_DATA_FILE"' EXIT

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  info "Launching $INSTANCE_TYPE ($AMI_ID)"
  INSTANCE_ID="$(aws ec2 run-instances \
    --region "$AWS_REGION" \
    --image-id "$AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --iam-instance-profile "Name=$PROFILE_NAME" \
    --security-group-ids "$SG_ID" \
    --subnet-id "$SUBNET_ID" \
    --block-device-mappings "[{\"DeviceName\":\"/dev/xvda\",\"Ebs\":{\"VolumeSize\":${VOLUME_SIZE},\"VolumeType\":\"gp3\",\"DeleteOnTermination\":true}}]" \
    --metadata-options "HttpTokens=required,HttpEndpoint=enabled" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${STACK_NAME}-app},{Key=Stack,Value=${STACK_NAME}}]" \
    --user-data "file://${USER_DATA_FILE}" \
    --query 'Instances[0].InstanceId' \
    --output text)"
  aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"
else
  echo "    reusing instance $INSTANCE_ID"
fi

# ---------- Elastic IP ----------
info "Elastic IP"
ALLOC_ID="$(aws ec2 describe-addresses \
  --region "$AWS_REGION" \
  --filters "Name=tag:Stack,Values=${STACK_NAME}" \
  --query 'Addresses[0].AllocationId' \
  --output text 2>/dev/null || true)"
if [ -z "$ALLOC_ID" ] || [ "$ALLOC_ID" = "None" ]; then
  ALLOC_ID="$(aws ec2 allocate-address \
    --region "$AWS_REGION" \
    --domain vpc \
    --query AllocationId \
    --output text)"
  aws ec2 create-tags --region "$AWS_REGION" --resources "$ALLOC_ID" \
    --tags "Key=Name,Value=${STACK_NAME}-eip" "Key=Stack,Value=${STACK_NAME}" >/dev/null
fi

aws ec2 associate-address \
  --region "$AWS_REGION" \
  --instance-id "$INSTANCE_ID" \
  --allocation-id "$ALLOC_ID" \
  --allow-reassociation >/dev/null

EIP="$(aws ec2 describe-addresses \
  --region "$AWS_REGION" \
  --allocation-ids "$ALLOC_ID" \
  --query 'Addresses[0].PublicIp' \
  --output text)"

# ---------- First deploy via SSM ----------
if [ "$SKIP_BOOTSTRAP" != "1" ]; then
  info "Waiting for the SSM agent (this can take a minute)"
  SSM_ONLINE=0
  for _ in $(seq 1 60); do
    PING="$(aws ssm describe-instance-information \
      --region "$AWS_REGION" \
      --filters "Key=InstanceIds,Values=$INSTANCE_ID" \
      --query 'InstanceInformationList[0].PingStatus' \
      --output text 2>/dev/null || true)"
    if [ "$PING" = "Online" ]; then
      SSM_ONLINE=1
      break
    fi
    sleep 5
  done
  [ "$SSM_ONLINE" = "1" ] || die "Instance did not register with SSM. Check the IAM instance profile and outbound network."

  info "Running first deploy via SSM (build can take 10-20 minutes)"
  REMOTE="$(cat <<EOF
set -euo pipefail
if command -v cloud-init >/dev/null 2>&1; then
  cloud-init status --wait || true
fi
if ! command -v git >/dev/null 2>&1; then
  dnf install -y git
fi
export AWS_REGION='$AWS_REGION'
export SSM_PATH='${SSM_PREFIX}/'
export APP_DIR='$APP_DIR'
export REPO_URL='$REPO_URL'
export BRANCH='$BRANCH'
mkdir -p "\$(dirname "\$APP_DIR")"
if [ ! -d "\$APP_DIR/.git" ]; then
  git clone --branch "\$BRANCH" "\$REPO_URL" "\$APP_DIR"
fi
cd "\$APP_DIR"
git fetch origin
git reset --hard "origin/\$BRANCH"
bash scripts/bootstrap-ec2.sh
EOF
)"
  if command -v python3 >/dev/null 2>&1; then
    PARAMS="$(printf '%s' "$REMOTE" | python3 -c 'import json,sys; print(json.dumps({"commands": [sys.stdin.read()]}))')"
  else
    PARAMS="commands=$REMOTE"
  fi

  COMMAND_ID="$(aws ssm send-command \
    --region "$AWS_REGION" \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --comment "Initial stock app deploy" \
    --timeout-seconds 3600 \
    --parameters "$PARAMS" \
    --query 'Command.CommandId' \
    --output text)"
  echo "    command id: $COMMAND_ID"

  STATUS="Pending"
  DEADLINE=$((SECONDS + 3600))
  while [ "$SECONDS" -lt "$DEADLINE" ]; do
    STATUS="$(aws ssm get-command-invocation \
      --region "$AWS_REGION" \
      --command-id "$COMMAND_ID" \
      --instance-id "$INSTANCE_ID" \
      --query Status \
      --output text 2>/dev/null || echo Pending)"
    case "$STATUS" in
      Success|Failed|Cancelled|TimedOut) break ;;
    esac
    sleep 10
  done
  echo "    status: $STATUS"
  echo "----- stdout -----"
  aws ssm get-command-invocation --region "$AWS_REGION" --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
  echo "----- stderr -----"
  aws ssm get-command-invocation --region "$AWS_REGION" --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text || true
  [ "$STATUS" = "Success" ] || die "First deploy failed. Inspect the output above."
fi

cat <<EOF

============================================================
Instance:    $INSTANCE_ID
Elastic IP:  $EIP
URL:         http://$EIP
Redeploy:    INSTANCE_ID=$INSTANCE_ID ./deploy.sh
SSM session: aws ssm start-session --target $INSTANCE_ID --region $AWS_REGION
============================================================
EOF
