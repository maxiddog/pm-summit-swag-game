# Datadog MCP Swag Store - Deployment Guide

## Quick Start

This guide will help you deploy the Datadog MCP Swag Store for ~200 users.

## Prerequisites

- Node.js 18+ and npm
- Vercel CLI (recommended) or Docker
- Datadog account (for production MCP keys)
- Domain with wildcard SSL capability (optional but recommended)

## Architecture Overview

```
Landing Page (www.datadog-PM.swag)
    ↓ User enters email
Instance Creation API
    ↓ Creates isolated deployment
Per-User Instance (id-{xyz}.datadog-PM.swag)
    ↓ User debugs with MCP
Order Submission
    ↓ Hardcoded endpoint
Order Collection (Google Sheets/Database)
```

## Setup Steps

### 1. Install Dependencies

```bash
# Install global tools
npm install -g vercel

# Install landing page dependencies
cd landing-page
npm install

# Install swag store dependencies
cd ../swag-store
npm install

# Install API server dependencies
cd ../deployment
npm install
```

### 2. Configure Environment Variables

Create `.env` files in each directory:

**deployment/.env:**
```bash
PORT=3001
ADMIN_TOKEN=your-secure-random-token-here
GOOGLE_SHEETS_WEBHOOK=https://hooks.zapier.com/your-webhook
NODE_ENV=production
```

**swag-store/.env.example:**
```bash
VITE_INSTANCE_ID=placeholder
VITE_USER_EMAIL=placeholder
VITE_DD_APP_ID=swag-store-game
VITE_DD_CLIENT_TOKEN=placeholder
VITE_ADMIN_TOKEN=your-admin-token
```

### 3. Set Up Order Collection

#### Option A: Google Sheets (Recommended for 200 users)

1. Create a new Google Sheet with columns:
   - Order ID
   - Instance ID
   - Email
   - Timestamp
   - Items (JSON)
   - Shipping Address (JSON)
   - Bugs Fixed (JSON)

2. Set up a webhook using Google Apps Script or Zapier:
   - Zapier: Create a "Webhooks by Zapier" trigger
   - Connect it to "Google Sheets" action
   - Copy webhook URL to `GOOGLE_SHEETS_WEBHOOK` in .env

3. **Google Apps Script Alternative:**

```javascript
// In Google Sheets: Extensions → Apps Script
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.orderId,
    data.instanceId,
    data.email,
    data.timestamp,
    JSON.stringify(data.items),
    JSON.stringify(data.shippingAddress),
    JSON.stringify(data.bugsFixed)
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy as web app and use the URL as your webhook.

#### Option B: Airtable

1. Create an Airtable base with Orders table
2. Get API key from Airtable
3. Update `sendToGoogleSheets` function in server.js to use Airtable API

#### Option C: Database

Update the server.js to use PostgreSQL, MySQL, or MongoDB instead of in-memory storage.

### 4. Deploy Landing Page

```bash
cd landing-page

# Deploy to Vercel
vercel --prod

# Or deploy to your own server
npm run build
# Upload dist/ folder to your hosting
```

Configure your domain:
- Point `www.datadog-PM.swag` to landing page
- Set up wildcard DNS: `*.datadog-PM.swag` → instance deployment server

### 5. Deploy API Server

```bash
cd deployment

# Option A: Deploy to Vercel as serverless function
vercel --prod

# Option B: Deploy to traditional server
node server.js

# Option C: Use PM2 for process management
pm2 start server.js --name swag-api
pm2 save
```

### 6. Set Up Instance Deployment

Make the deployment script executable:

```bash
chmod +x deployment/deploy-instance.sh
```

Test deployment:

```bash
./deployment/deploy-instance.sh test-id test@example.com test-api-key test-app-key
```

### 7. Configure Datadog MCP Keys

For production, you need real Datadog API keys:

1. Go to Datadog → Organization Settings → API Keys
2. Create a new API key with read-only access
3. Create Application Keys for each instance (or use a shared read-only key)
4. Update the `generateApiKeys()` function in server.js

**Important:** For security, create separate read-only keys per instance or use Datadog's RBAC to scope access.

### 8. Test End-to-End

1. Visit landing page: `https://www.datadog-PM.swag`
2. Enter test email
3. Wait for instance creation (~30-60s)
4. Verify MCP credentials work
5. Test swag store with bugs
6. Complete an order
7. Check Google Sheets/database for order

## Scaling Considerations

### For 200 Users

**Recommended Setup:**
- Vercel for all deployments (landing page, instances, API)
- Google Sheets for order collection
- Shared Datadog read-only API key
- Automatic instance cleanup after 7 days

**Cost Estimate:**
- Vercel Pro: $20/month
- Domain + SSL: $10-20/year
- Datadog: Free trial or existing account
- **Total: ~$20-25/month**

### Instance Management

Monitor and manage instances:

```bash
# View all active instances
curl -H "x-admin-token: YOUR_TOKEN" \
  https://api.datadog-swag.com/api/admin/instances

# View all orders
curl -H "x-admin-token: YOUR_TOKEN" \
  https://api.datadog-swag.com/api/admin/orders
```

### Automatic Cleanup

The server automatically cleans up expired instances (7 days old). You can also manually cleanup:

```bash
# List expired instances
curl -H "x-admin-token: YOUR_TOKEN" \
  https://api.datadog-swag.com/api/admin/instances | \
  jq '.instances[] | select(.expiresAt < now)'

# Delete Vercel deployments
vercel rm swag-store-INSTANCE_ID --yes
```

## Monitoring

### Health Checks

```bash
curl https://api.datadog-swag.com/health
```

### Key Metrics to Track

- Instance creation success rate
- Deployment time
- Bug fix completion rate
- Order submission success rate
- Average time to complete challenge

### Datadog Dashboard

Create a Datadog dashboard to monitor:
- Number of active instances
- Bug fix patterns
- User journey completion
- Error rates

## Security Considerations

1. **API Keys:** Use read-only Datadog keys with minimal scope
2. **Admin Token:** Use a strong random token (32+ characters)
3. **Rate Limiting:** Add rate limiting to instance creation endpoint
4. **Email Validation:** Implement proper email validation and verification
5. **Instance Isolation:** Ensure instances can't interfere with each other
6. **Order Endpoint:** Validate admin token on all order submissions

## Troubleshooting

### Instance Creation Fails

Check logs:
```bash
pm2 logs swag-api
# or
vercel logs
```

Common issues:
- Vercel deployment quota exceeded
- Invalid Datadog API keys
- Network connectivity issues

### Orders Not Appearing

1. Check webhook URL is correct
2. Verify admin token in requests
3. Check server logs for errors
4. Test webhook manually with curl

### MCP Connection Issues

1. Verify API keys are correct
2. Check Datadog account permissions
3. Ensure MCP server package is installed: `npx @datadog/datadog-mcp-server`
4. Check network connectivity from user's machine

## Production Checklist

- [ ] Environment variables configured
- [ ] Domain and DNS configured
- [ ] SSL certificates installed
- [ ] Order collection endpoint tested
- [ ] Instance deployment script tested
- [ ] Rate limiting implemented
- [ ] Monitoring and alerts set up
- [ ] Admin dashboard accessible
- [ ] Documentation updated
- [ ] Backup strategy in place

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review logs in deployment/logs/
3. Test with a fresh instance
4. Contact Datadog support for MCP-specific issues

## Maintenance

### Weekly Tasks
- Check instance cleanup is working
- Review order submissions
- Monitor error rates
- Clean up expired Vercel deployments

### Monthly Tasks
- Review and optimize costs
- Update dependencies
- Backup order data
- Analyze completion rates and user feedback

## Advanced: Custom Deployment Platforms

### Docker + Kubernetes

See `deployment/k8s/` for Kubernetes manifests (to be created if needed).

### Railway

```bash
railway login
railway init
railway up
```

### Render

```bash
# Create render.yaml configuration
# Deploy via Render dashboard
```

## Next Steps

1. Deploy and test with internal team
2. Soft launch with 10-20 external users
3. Monitor and fix any issues
4. Full launch to all 200 users
5. Collect feedback and iterate

Good luck with your Datadog MCP Swag Challenge! 🎉
