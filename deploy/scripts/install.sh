#!/usr/bin/env bash
# install.sh - First-time setup for the Mini Library API on Ubuntu EC2
# Run as root or with sudo
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/library-api}"
APP_USER="library"

echo "=== Mini Library API - Installation Script ==="

# 1. Install Node.js 20.x
if ! command -v node &> /dev/null || [[ "$(node -v)" != v20* ]]; then
  echo "Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "Node.js $(node -v) already installed"
fi

# 2. Create system user
if ! id "$APP_USER" &> /dev/null; then
  echo "Creating system user: $APP_USER"
  useradd --system --shell /usr/sbin/nologin "$APP_USER"
else
  echo "User $APP_USER already exists"
fi

# 3. Create app directory structure
echo "Setting up directories..."
mkdir -p "$APP_DIR"/{data,dist}

# 4. Create .env file from example if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
  echo "Creating .env file..."
  cat > "$APP_DIR/.env" << 'ENVEOF'
NODE_ENV=production
PORT=3000
API_VERSION=1.0.0
DATABASE_URL="file:./data/library.db"
CORS_ORIGINS=https://your-cloudfront-domain.cloudfront.net
DEV_AUTH_ENABLED=false
JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_SECRET
ENVEOF
  echo "IMPORTANT: Edit $APP_DIR/.env with your actual configuration!"
fi

# 5. Set ownership
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# 6. Install systemd service
echo "Installing systemd service..."
cp "$(dirname "$0")/../systemd/library-api.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable library-api

echo ""
echo "=== Installation Complete ==="
echo "Next steps:"
echo "  1. Edit $APP_DIR/.env with your configuration"
echo "  2. Deploy the application using deploy.sh"
echo "  3. Start the service: sudo systemctl start library-api"
echo "  4. Check status: sudo systemctl status library-api"
echo "  5. View logs: sudo journalctl -u library-api -f"
