#!/usr/bin/env bash
# deploy.sh - Deploy or update the Mini Library API
# Run as root or with sudo
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/library-api}"
APP_USER="library"
ARTIFACT="${1:-/tmp/library-api.tar.gz}"

echo "=== Mini Library API - Deploy Script ==="

if [ ! -f "$ARTIFACT" ]; then
  echo "Error: Artifact not found: $ARTIFACT"
  echo "Usage: $0 [path-to-artifact.tar.gz]"
  exit 1
fi

# 1. Stop service (if running)
echo "Stopping library-api service..."
systemctl stop library-api || true

# 2. Extract artifact
echo "Extracting artifact to $APP_DIR..."
tar -xzf "$ARTIFACT" -C "$APP_DIR" --strip-components=0

# 3. Install production dependencies
echo "Installing production dependencies..."
cd "$APP_DIR"
npm ci --omit=dev

# 4. Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 5. Set ownership
echo "Setting file ownership..."
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# 6. Start service
echo "Starting library-api service..."
systemctl start library-api

# 7. Wait and verify
echo "Waiting for application to start..."
sleep 3
if curl -sf http://localhost:3000/api/v1/health > /dev/null; then
  echo "Health check PASSED"
else
  echo "WARNING: Health check failed. Check logs: journalctl -u library-api -f"
fi

echo ""
echo "=== Deployment Complete ==="
echo "Status: $(systemctl is-active library-api)"
