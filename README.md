# 🐛 Datadog MCP Swag Store - Debugging Game

An interactive debugging game that teaches users how to use the Datadog MCP (Model Context Protocol) server by fixing intentional bugs in a swag store e-commerce application.

## 🎯 Project Overview

Users receive their own isolated instance of a buggy swag store. Using AI assistants (Cursor or Claude Code) connected to Datadog via MCP, they debug and fix 3-5 intentional bugs to unlock the checkout process and claim free Datadog swag.

### Key Features

- **🔐 Per-User Isolated Instances:** Each user gets their own subdomain and deployment
- **🐞 Intentional Bugs:** Carefully crafted bugs that teach real debugging patterns
- **🤖 MCP Integration:** Hands-on experience with Datadog's MCP server
- **📚 Interactive Tutorial:** Step-by-step guidance through each debugging challenge
- **🎁 Real Rewards:** Users earn actual Datadog swag upon completion

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Landing Page (Authentication)              │
│              www.datadog-PM.swag                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│            Instance Creation API                         │
│  - Validates email                                       │
│  - Provisions isolated instance                          │
│  - Generates MCP credentials                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│         Per-User Swag Store Instance                     │
│         id-{xyz}.datadog-PM.swag                        │
│  - Full e-commerce functionality                         │
│  - 3-5 intentional bugs                                  │
│  - Datadog RUM integration                               │
│  - Interactive tutorial                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Order Collection Endpoint                   │
│  - Receives completed orders                             │
│  - Non-manipulatable, admin-controlled                   │
│  - Stores in Google Sheets/Database                      │
└─────────────────────────────────────────────────────────┘
```

## 🐛 The Bugs

Each instance includes these intentional bugs:

### Bug #1: Checkout Button (Critical Path)
- **Issue:** Button onClick handler is commented out
- **Location:** `src/components/Cart.jsx`
- **Difficulty:** Easy
- **Learning:** Event handler debugging, DOM inspection

### Bug #2: Size Selection Exception
- **Issue:** Selecting size "S" throws uncaught exception
- **Location:** `src/App.jsx` addToCart function
- **Difficulty:** Easy
- **Learning:** Exception handling, error logs

### Bug #3: Email Validation
- **Issue:** Regex pattern is broken (missing @ symbol)
- **Location:** `src/components/CheckoutForm.jsx`
- **Difficulty:** Easy/Medium
- **Learning:** Form validation, regex debugging

### Optional Bugs (can be added):
- Database connection error
- API endpoint misconfiguration
- CSS rendering issues

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Vercel CLI or Docker
- Datadog account (for MCP keys)

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd datadog-swag-game

# Install dependencies
npm install

# Start landing page
cd landing-page
npm run dev

# Start API server
cd ../deployment
npm install
node server.js

# Start swag store (for testing)
cd ../swag-store
npm install
npm run dev
```

### Deploy to Production

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

Quick deploy:

```bash
# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Deploy landing page
cd landing-page
vercel --prod

# Deploy API server
cd ../deployment
vercel --prod

# Make deployment script executable
chmod +x deploy-instance.sh
```

## 📚 Project Structure

```
datadog-swag-game/
├── docs/
│   ├── ARCHITECTURE.md          # Technical architecture
│   └── DEPLOYMENT_GUIDE.md      # Step-by-step deployment
├── landing-page/
│   ├── index.html               # Main landing page
│   ├── instance.html            # Credentials display page
│   └── package.json
├── swag-store/
│   ├── src/
│   │   ├── App.jsx              # Main application (Bug #2)
│   │   ├── components/
│   │   │   ├── Cart.jsx         # Cart view (Bug #1)
│   │   │   ├── CheckoutForm.jsx # Checkout (Bug #3)
│   │   │   ├── ProductCard.jsx  # Product display
│   │   │   └── TutorialOverlay.jsx # Tutorial system
│   │   └── App.css
│   └── package.json
├── deployment/
│   ├── server.js                # API server
│   ├── deploy-instance.sh       # Instance deployment script
│   └── package.json
└── README.md                    # This file
```

## 🎮 User Journey

1. **Landing:** User visits `www.datadog-PM.swag`
2. **Authentication:** User enters email address
3. **Provisioning:** System creates isolated instance (~30-60s)
4. **Setup:** User receives:
   - Unique subdomain URL
   - MCP configuration (JSON)
   - Tutorial instructions
5. **Debugging:** User:
   - Opens Cursor or Claude Code
   - Adds MCP server configuration
   - Visits their instance
   - Follows tutorial to debug bugs
   - Uses AI + MCP to query Datadog logs
   - Fixes code and redeploys
6. **Checkout:** Once all bugs fixed, user completes order
7. **Fulfillment:** Order sent to admin for swag shipment

## 🔧 Configuration

### Environment Variables

**API Server (.env):**
```env
PORT=3001
ADMIN_TOKEN=your-secure-random-token
GOOGLE_SHEETS_WEBHOOK=https://hooks.zapier.com/your-webhook
NODE_ENV=production
```

**Swag Store (.env):**
```env
VITE_INSTANCE_ID=auto-generated
VITE_USER_EMAIL=auto-generated
VITE_DD_APP_ID=swag-store-game
VITE_DD_CLIENT_TOKEN=auto-generated
VITE_ADMIN_TOKEN=matches-api-server-token
```

### MCP Configuration

Users receive this configuration to add to their AI assistant:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["-y", "@datadog/datadog-mcp-server"],
      "env": {
        "DD_API_KEY": "user-specific-key",
        "DD_APP_KEY": "user-specific-key",
        "DD_SITE": "datadoghq.com"
      }
    }
  }
}
```

## 📊 Monitoring

### Health Check

```bash
curl https://api.datadog-swag.com/health
```

### Admin Endpoints

View all instances:
```bash
curl -H "x-admin-token: YOUR_TOKEN" \
  https://api.datadog-swag.com/api/admin/instances
```

View all orders:
```bash
curl -H "x-admin-token: YOUR_TOKEN" \
  https://api.datadog-swag.com/api/admin/orders
```

### Datadog Dashboard

Track these metrics:
- Active instances
- Bug fix completion rate
- Average time to complete
- Order submission success rate
- User journey funnel

## 🔒 Security

- **API Keys:** Read-only Datadog keys with minimal scope
- **Instance Isolation:** Complete separation between users
- **Rate Limiting:** Prevent abuse of instance creation
- **Admin Authentication:** Secure token for order endpoint
- **Input Validation:** All user inputs sanitized

## 💰 Cost Estimation (200 users)

- **Vercel Pro:** $20/month (unlimited deployments)
- **Datadog:** $0 (using trial accounts or shared key)
- **Domain + SSL:** $10-20/year
- **Google Sheets:** Free
- **Total:** ~$20-25/month

## 🐛 Troubleshooting

### Instance Creation Fails
- Check Vercel deployment quota
- Verify API credentials
- Review server logs

### MCP Not Connecting
- Verify Datadog API keys
- Check MCP server installation
- Ensure correct configuration format

### Orders Not Appearing
- Check webhook URL
- Verify admin token
- Test endpoint manually

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for more troubleshooting.

## 🤝 Contributing

This is an internal Datadog project for the MCP swag campaign. For improvements:

1. Test changes locally
2. Document any new bugs or features
3. Update tutorial if gameplay changes
4. Maintain bug difficulty balance

## 📝 License

Proprietary - Datadog Internal Use

## 🎉 Credits

Built for Datadog's MCP launch campaign to teach developers how to use the Datadog MCP server in a fun, interactive way.

## 📞 Support

- **Technical Issues:** Check docs/DEPLOYMENT_GUIDE.md
- **MCP Questions:** Refer to Datadog MCP documentation
- **Bug Reports:** Document and create internal ticket

---

**Ready to deploy?** See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions.

**Need to modify bugs?** Edit the files marked with `BUG #` comments in the swag-store/src directory.

**Questions?** Check the comprehensive architecture documentation in docs/ARCHITECTURE.md.
