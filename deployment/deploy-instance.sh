#!/bin/bash

# Datadog MCP Swag Store - Instance Deployment Script
# This script automates the creation of per-user isolated instances

set -e

INSTANCE_ID=$1
USER_EMAIL=$2
DD_API_KEY=$3
DD_APP_KEY=$4

if [ -z "$INSTANCE_ID" ] || [ -z "$USER_EMAIL" ]; then
    echo "Usage: ./deploy-instance.sh <instance-id> <user-email> [dd-api-key] [dd-app-key]"
    exit 1
fi

echo "🚀 Deploying instance: $INSTANCE_ID for $USER_EMAIL"

# Create instance directory
INSTANCE_DIR="/tmp/swag-store-$INSTANCE_ID"
mkdir -p "$INSTANCE_DIR"

# Copy application files
echo "📦 Copying application files..."
cp -r ./swag-store/* "$INSTANCE_DIR/"

# Generate .env file with instance-specific config
cat > "$INSTANCE_DIR/.env" << EOF
VITE_INSTANCE_ID=$INSTANCE_ID
VITE_USER_EMAIL=$USER_EMAIL
VITE_DD_APP_ID=swag-store-game
VITE_DD_CLIENT_TOKEN=demo-token-$INSTANCE_ID
VITE_ADMIN_TOKEN=$ADMIN_TOKEN
DD_API_KEY=${DD_API_KEY:-demo-api-key}
DD_APP_KEY=${DD_APP_KEY:-demo-app-key}
EOF

# Deploy to Vercel (or your chosen platform)
echo "🌐 Deploying to Vercel..."
cd "$INSTANCE_DIR"

# Option 1: Vercel deployment
if command -v vercel &> /dev/null; then
    vercel deploy \
        --name="swag-store-$INSTANCE_ID" \
        --env VITE_INSTANCE_ID="$INSTANCE_ID" \
        --env VITE_USER_EMAIL="$USER_EMAIL" \
        --env VITE_DD_APP_ID="swag-store-game" \
        --env VITE_DD_CLIENT_TOKEN="demo-token-$INSTANCE_ID" \
        --env VITE_ADMIN_TOKEN="$ADMIN_TOKEN" \
        --prod \
        --yes
    
    DEPLOYMENT_URL=$(vercel ls swag-store-$INSTANCE_ID --json | jq -r '.[0].url')
    echo "✅ Deployed to: https://$DEPLOYMENT_URL"
else
    echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Option 2: Docker deployment (alternative)
# docker build -t swag-store-$INSTANCE_ID .
# docker run -d \
#     --name swag-store-$INSTANCE_ID \
#     -p 0:3000 \
#     -e INSTANCE_ID=$INSTANCE_ID \
#     -e USER_EMAIL=$USER_EMAIL \
#     swag-store-$INSTANCE_ID

# Store instance metadata
echo "💾 Storing instance metadata..."
cat > "./instances/$INSTANCE_ID.json" << EOF
{
  "instanceId": "$INSTANCE_ID",
  "email": "$USER_EMAIL",
  "deploymentUrl": "$DEPLOYMENT_URL",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "expiresAt": "$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%SZ")",
  "ddApiKey": "${DD_API_KEY:-demo-api-key}",
  "ddAppKey": "${DD_APP_KEY:-demo-app-key}",
  "status": "active"
}
EOF

echo ""
echo "✅ Instance deployed successfully!"
echo "📍 Instance ID: $INSTANCE_ID"
echo "🌐 URL: https://$DEPLOYMENT_URL"
echo "📧 Email: $USER_EMAIL"
echo ""
echo "🔑 MCP Configuration:"
echo "Copy this to Cursor/Claude Code settings:"
echo ""
cat << EOF
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["-y", "@datadog/datadog-mcp-server"],
      "env": {
        "DD_API_KEY": "${DD_API_KEY:-demo-api-key}",
        "DD_APP_KEY": "${DD_APP_KEY:-demo-app-key}",
        "DD_SITE": "datadoghq.com"
      }
    }
  }
}
EOF
echo ""

# Cleanup temporary directory
rm -rf "$INSTANCE_DIR"

echo "🎉 Done! User can now access their instance at: https://$DEPLOYMENT_URL"
