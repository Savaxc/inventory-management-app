#!/usr/bin/env bash
# Create or update the GitHub Actions OIDC role used by
# .github/workflows/deploy-aws.yml.
#
# Usage:
#   AWS_PROFILE=stock ./infra/github-actions-oidc.sh
#
# Optional env:
#   AWS_REGION    (default eu-west-1)
#   GITHUB_REPO        (default Savaxc/inventory-management-app)
#   GITHUB_ENVIRONMENT (default production)
#   ROLE_NAME          (default stock-github-actions-deploy)
#   INSTANCE_ID        (default i-062afca8fa2a194bd)
#   SET_GH_SECRET      (default 1; set to 0 to skip `gh secret set`)
set -euo pipefail

if ! command -v aws >/dev/null 2>&1 && [ -x "$HOME/.local/bin/aws" ]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found. Install AWS CLI v2 first." >&2
  exit 1
fi

AWS_REGION="${AWS_REGION:-eu-west-1}"
GITHUB_REPO="${GITHUB_REPO:-Savaxc/inventory-management-app}"
GITHUB_ENVIRONMENT="${GITHUB_ENVIRONMENT:-production}"
ROLE_NAME="${ROLE_NAME:-stock-github-actions-deploy}"
INSTANCE_ID="${INSTANCE_ID:-i-062afca8fa2a194bd}"
SET_GH_SECRET="${SET_GH_SECRET:-1}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
OIDC_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

echo "==> AWS account: $ACCOUNT_ID"
echo "==> Region: $AWS_REGION"
echo "==> GitHub repo: $GITHUB_REPO"
echo "==> GitHub environment: $GITHUB_ENVIRONMENT"
echo "==> EC2 instance: $INSTANCE_ID"

echo "==> Ensuring GitHub OIDC provider exists"
if aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn "$OIDC_ARN" >/dev/null 2>&1; then
  echo "OIDC provider already exists."
else
  aws iam create-open-id-connect-provider \
    --url "https://token.actions.githubusercontent.com" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" >/dev/null
  echo "OIDC provider created."
fi

python3 - "$ACCOUNT_ID" "$GITHUB_REPO" "$GITHUB_ENVIRONMENT" > "$tmpdir/trust.json" <<'PY'
import json
import sys

account_id, github_repo, github_environment = sys.argv[1], sys.argv[2], sys.argv[3]
print(json.dumps({
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {
            "Federated": f"arn:aws:iam::{account_id}:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            "StringEquals": {
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                "token.actions.githubusercontent.com:sub": f"repo:{github_repo}:environment:{github_environment}"
            }
        }
    }]
}, indent=2))
PY

python3 - "$ACCOUNT_ID" "$AWS_REGION" "$INSTANCE_ID" > "$tmpdir/policy.json" <<'PY'
import json
import sys

account_id, region, instance_id = sys.argv[1], sys.argv[2], sys.argv[3]
print(json.dumps({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "SendDeployCommand",
            "Effect": "Allow",
            "Action": "ssm:SendCommand",
            "Resource": [
                f"arn:aws:ec2:{region}:{account_id}:instance/{instance_id}",
                f"arn:aws:ssm:{region}::document/AWS-RunShellScript"
            ]
        },
        {
            "Sid": "ReadDeployCommandStatus",
            "Effect": "Allow",
            "Action": "ssm:GetCommandInvocation",
            "Resource": "*"
        }
    ]
}, indent=2))
PY

echo "==> Ensuring IAM role $ROLE_NAME exists"
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam update-assume-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-document "file://$tmpdir/trust.json"
  echo "Trust policy updated."
else
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --description "GitHub Actions deploy role for Stock.app" \
    --assume-role-policy-document "file://$tmpdir/trust.json" >/dev/null
  echo "Role created."
fi

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$ROLE_NAME" \
  --policy-document "file://$tmpdir/policy.json"
echo "Deploy policy applied."

if [ "$SET_GH_SECRET" = "1" ] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "==> Setting GitHub secret AWS_ROLE_ARN"
  if gh secret set AWS_ROLE_ARN --body "$ROLE_ARN" --repo "$GITHUB_REPO"; then
    echo "Secret updated."
  else
    echo "Could not set the secret automatically." >&2
    echo "Run: gh secret set AWS_ROLE_ARN --body '$ROLE_ARN' --repo '$GITHUB_REPO'" >&2
  fi
else
  echo "Set the GitHub secret manually:"
  echo "  gh secret set AWS_ROLE_ARN --body '$ROLE_ARN' --repo '$GITHUB_REPO'"
fi

echo
echo "Role ARN: $ROLE_ARN"
echo "Next push to master (or a manual workflow run) will deploy through SSM."
