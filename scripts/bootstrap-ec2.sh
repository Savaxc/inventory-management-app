#!/usr/bin/env bash
# First-time setup on an Amazon Linux 2023 EC2 instance.
# Run as root (e.g. through SSM Session Manager): sudo bash scripts/bootstrap-ec2.sh
set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-west-1}"
SSM_PATH="${SSM_PATH:-/stock/}"
APP_DIR="${APP_DIR:-/opt/stock}"
REPO_URL="${REPO_URL:-https://github.com/Savaxc/inventory-management-app.git}"
BRANCH="${BRANCH:-master}"
SWAP_SIZE="${SWAP_SIZE:-2G}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root (sudo)." >&2
  exit 1
fi

echo "==> Installing packages"
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user 2>/dev/null || true

# AWS CLI v2 (usually preinstalled on AL2023, but do not rely on it).
if ! command -v aws >/dev/null 2>&1; then
  dnf install -y awscli-2 || dnf install -y awscli || {
    dnf install -y unzip curl
    curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
    unzip -q -o /tmp/awscliv2.zip -d /tmp
    /tmp/aws/install --update
  }
fi

# Docker Compose v2 plugin (not always bundled with the AL2023 docker package).
if ! docker compose version >/dev/null 2>&1; then
  dnf install -y docker-compose-plugin >/dev/null 2>&1 || true
fi
if ! docker compose version >/dev/null 2>&1; then
  dnf install -y curl
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
docker compose version

echo "==> Adding ${SWAP_SIZE} swap (next build is memory hungry)"
if [ ! -f /swapfile ]; then
  fallocate -l "$SWAP_SIZE" /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  chmod 600 /swapfile
  mkswap /swapfile
fi
swapon /swapfile 2>/dev/null || true
grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab

echo "==> Fetching repository"
mkdir -p "$(dirname "$APP_DIR")"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only "origin" "$BRANCH"

echo "==> Writing .env from SSM ($SSM_PATH)"
AWS_REGION="$AWS_REGION" SSM_PATH="$SSM_PATH" ./scripts/fetch-env.sh

echo "==> Building images"
docker compose build

echo "==> Running database migrations"
docker compose run --rm migrate

echo "==> Starting containers"
docker compose up -d --remove-orphans

echo "==> Done"
docker compose ps
