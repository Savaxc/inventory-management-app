# Deploying Stock.app on AWS

Single EC2 instance running `app + postgres + caddy` with Docker Compose.
Caddy terminates TLS and obtains the certificate automatically once a domain
points at the Elastic IP.

```
Internet :80/:443
        │
      Caddy
        │
   Next.js app :3000
        │
   Postgres :5432 (private Docker network)
```

## What is in the repo

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage Node 22 build; Next.js `standalone` runner; separate `prisma-base` stage for migrations |
| `docker-compose.yml` | `app`, `db` (postgres:16 + volume), `caddy:2`, one-off `migrate` service |
| `Caddyfile` | Reverse proxy; HTTP on the raw IP, automatic HTTPS for a domain |
| `scripts/fetch-env.sh` | Reads `/stock/*` from SSM and writes `.env` on the instance |
| `scripts/bootstrap-ec2.sh` | Docker, 2 GB swap, clone, first build, migrations |
| `deploy.sh` | Redeploy through `aws ssm send-command` |
| `infra/provision.sh` | IAM, SSM parameters, security group, EC2, Elastic IP, first deploy |

## Local check

```bash
cd inventory-management-app
docker compose up -d --build
docker compose run --rm migrate
curl http://localhost/api/health   # {"status":"ok"}
open http://localhost
```

The local `.env` is used for Clerk/Resend/model keys. Compose builds
`DATABASE_URL` for the `db` container, so local `DATABASE_URL` pointing at
`localhost` is fine. Production gets the SSM value instead.

Stop with `docker compose down` (add `-v` to delete the local database).

## Prerequisites for AWS

1. AWS CLI v2 configured with credentials for account `820381490815`
   (`aws sts get-caller-identity` must work).
2. A **default VPC** with a public subnet, or export `VPC_ID` and `SUBNET_ID`.
3. The app code pushed to `origin/master` — the instance clones
   `https://github.com/Savaxc/inventory-management-app.git`.
4. The secrets in `inventory-management-app/.env` (or exported in the shell):
   `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `RESEND_API_KEY`,
   `OPENAI_API_KEY`.

## Provision everything

```bash
cd inventory-management-app
./infra/provision.sh
```

It creates/reuses:

- IAM role `stock-ec2-role` + instance profile, with
  `AmazonSSMManagedInstanceCore` and read access to
  `arn:aws:ssm:eu-west-1:820381490815:parameter/stock/*`
- SSM parameters under `/stock/` (SecureString for secrets)
- Security group `stock-app-sg`: inbound **80 and 443 only** (no 22)
- `t3.small` Amazon Linux 2023, 20 GB gp3, IMDSv2 required
- Elastic IP, associated with the instance
- Docker + 2 GB swap, repo clone, `.env` from SSM, `docker compose up -d --build`,
  `prisma migrate deploy`

At the end it prints the instance ID, Elastic IP and URL.

### SSM parameters written

| Name | Type |
| --- | --- |
| `/stock/DATABASE_URL` | SecureString |
| `/stock/POSTGRES_PASSWORD` | SecureString |
| `/stock/POSTGRES_USER` | String |
| `/stock/POSTGRES_DB` | String |
| `/stock/CLERK_SECRET_KEY` | SecureString |
| `/stock/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | SecureString |
| `/stock/RESEND_API_KEY` | SecureString |
| `/stock/RESEND_FROM_EMAIL` | String (optional) |
| `/stock/OPENAI_API_KEY` | SecureString |
| `/stock/OPENAI_BASE_URL` | String |
| `/stock/ASSISTANT_MODEL` | String |
| `/stock/APP_DOMAIN` | String (optional) |

`fetch-env.sh` also copies `DATABASE_URL` to `APP_DATABASE_URL`, which is what
Compose reads. That keeps the door open for RDS without changing the app.

## Redeploy

Every later deploy is one command:

```bash
cd inventory-management-app
INSTANCE_ID=i-0123456789abcdef0 ./deploy.sh
```

It runs over SSM (no SSH): `git pull`, `docker compose build`,
`prisma migrate deploy`, `docker compose up -d`.

Useful options:

```bash
REFRESH_ENV=1 INSTANCE_ID=i-... ./deploy.sh   # re-read SSM parameters into .env
HEALTH_URL=http://<elastic-ip>/api/health INSTANCE_ID=i-... ./deploy.sh
```

## GitHub Actions deploy

`.github/workflows/deploy-aws.yml` deploys on every push to `master` and can
also be started manually from the Actions tab. It uses GitHub OIDC, so no
long-lived AWS access keys are stored in GitHub.

The `deploy` job targets the GitHub environment `production`, which has
`Savaxc` as a required reviewer. A push or manual run pauses at **Waiting for
approval**; approve it in **Actions → Review deployments**. The IAM role trusts
only `repo:Savaxc/inventory-management-app:environment:production`, so an
unapproved job cannot assume the AWS role. Self-review is currently allowed;
enable **Prevent self-review** in the environment settings if a second
maintainer is added.

One-time setup (the AWS SSO session must be active):

```bash
aws sso login --profile stock
AWS_PROFILE=stock ./infra/github-actions-oidc.sh
```

The script creates/reuses:

- the GitHub OIDC provider in IAM
- IAM role `stock-github-actions-deploy`, trusted only for
  `repo:Savaxc/inventory-management-app:environment:production`
- an inline policy that allows `ssm:SendCommand` on the app instance and
  `ssm:GetCommandInvocation` for reading the deploy result
- the `AWS_ROLE_ARN` repository secret, when `gh` is authenticated locally

Repository settings used by the workflow:

| Name | Type | Default |
| --- | --- | --- |
| `AWS_ROLE_ARN` | Secret (required) | set by the setup script |
| `AWS_REGION` | Variable (optional) | `eu-west-1` |
| `INSTANCE_ID` | Variable (optional) | `i-062afca8fa2a194bd` |
| `HEALTH_URL` | Variable (optional) | `http://52.211.55.184/api/health` |

Use **Run workflow** with `refresh_env` enabled when SSM parameters have
changed. If `AWS_ROLE_ARN` is not configured, the workflow logs a warning and
skips the deploy instead of failing.

## Rotating secrets and adding Resend

Never paste a secret into chat, a GitHub issue, or a commit. Use the hidden-input
helper; it writes the value to SSM as `SecureString`, updates the local `.env`
with mode `600`, and never prints the value:

```bash
./scripts/set-secret.sh OPENAI_API_KEY
./scripts/set-secret.sh RESEND_API_KEY --deploy
```

`--deploy` starts the GitHub Actions workflow with `refresh_env=true`; approve
the production deployment in GitHub.

### OpenAI / DeepSeek key rotation

1. Open <https://platform.deepseek.com/api_keys>.
2. Create a new key, then revoke the old one.
3. Run `./scripts/set-secret.sh OPENAI_API_KEY --deploy`.

### Resend

1. Open <https://resend.com/api-keys>.
2. Create a **Sending access** key and copy it once.
3. Run `./scripts/set-secret.sh RESEND_API_KEY --deploy`.

Without a verified domain, Resend's `onboarding@resend.dev` sender can only
deliver to the email address registered on the Resend account. To send to other
users, verify a domain in Resend, then set the sender and redeploy:

```bash
aws ssm put-parameter --region eu-west-1 --name /stock/RESEND_FROM_EMAIL \
  --type String --value 'StockApp <alerts@your-domain.com>' --overwrite
```

## Domain and HTTPS

Until a domain exists the app is served over plain HTTP on the Elastic IP.

When you get the subdomain:

1. Point a DNS `A` record at the Elastic IP.
2. Set `APP_DOMAIN` in SSM:
   ```bash
   aws ssm put-parameter --region eu-west-1 --name /stock/APP_DOMAIN \
     --value stock.example.com --type String --overwrite
   ```
3. Refresh the env and restart Caddy:
   ```bash
   REFRESH_ENV=1 INSTANCE_ID=i-... ./deploy.sh
   ```
   Caddy sees the new site address, requests a Let's Encrypt certificate on
   port 80/443 and starts redirecting HTTP to HTTPS. The certificate lives in
   the `caddy_data` volume, so it survives container restarts.

Then switch Clerk to a production instance with the new domain and update the
two Clerk parameters in SSM (`REFRESH_ENV=1` redeploy).

## RDS instead of the Postgres container

Set `DATABASE_URL` in SSM to the RDS connection string (host must be reachable
from the instance) and run `REFRESH_ENV=1 INSTANCE_ID=i-... ./deploy.sh`.
`fetch-env.sh` copies it to `APP_DATABASE_URL`, so both the app and the
migration service use RDS. You can then remove the `db` service and its volume.

## Notes

- The EC2 instance has **no SSH port open**. Use:
  `aws ssm start-session --target <instance-id> --region eu-west-1`
- Clerk development keys are fine for the demo. Production Clerk needs the
  domain, as above.
- Resend without a verified domain only delivers to your own address, which is
  enough for testing.
- The app container is not published to the host; only Caddy exposes 80/443.
- `.env` is never baked into the image (`.dockerignore` excludes it). The image
  build uses placeholders only to satisfy SDK constructors during `next build`.
