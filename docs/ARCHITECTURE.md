# Datadog MCP Swag Store - Architecture Documentation

## Overview

An interactive debugging game that teaches users how to use the Datadog MCP server by fixing intentional bugs in a swag store to complete their order.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Master Landing Page                      │
│                  www.datadog-PM.swag                        │
│              (Email Authentication Portal)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ User enters email
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              Instance Creation Service                       │
│    - Validates email                                        │
│    - Creates unique subdomain                               │
│    - Deploys isolated instance                              │
│    - Generates MCP credentials                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
        ┌───────────────┴───────────────┬──────────────────┐
        ↓                               ↓                  ↓
┌──────────────┐            ┌──────────────┐    ┌──────────────┐
│  Instance 1  │            │  Instance 2  │    │  Instance N  │
│  id-1.swag   │            │  id-2.swag   │    │  id-N.swag   │
└──────┬───────┘            └──────┬───────┘    └──────┬───────┘
       │                           │                    │
       │ User debugs with MCP      │                    │
       ↓                           ↓                    ↓
┌──────────────────────────────────────────────────────────────┐
│            Datadog MCP Server (User's Local)                 │
│  - Monitors logs                                             │
│  - Surfaces exceptions                                       │
│  - Provides debugging context                                │
└──────────────────────────────────────────────────────────────┘
                        │
                        │ Bugs fixed, order placed
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              Order Aggregation Endpoint                      │
│         (Hardcoded, non-manipulatable)                      │
│    - Google Sheets / Airtable / Database                    │
│    - Receives all order submissions                          │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Master Landing Page
- **URL**: `www.datadog-PM.swag`
- **Purpose**: Email authentication and instance provisioning
- **Features**:
  - Email input form
  - Email validation
  - Instance creation trigger
  - Credential display
  - Tutorial introduction

### 2. Per-User Instance
- **URL Pattern**: `{user-id}.datadog-PM.swag/id-{N}`
- **Technology Stack**: 
  - Frontend: React + Vite
  - Backend: Node.js/Express (lightweight)
  - Database: SQLite (per-instance)
  - Deployment: Docker containers or Vercel serverless
- **Features**:
  - Full e-commerce functionality
  - Intentional bugs (configurable)
  - MCP access credentials
  - Datadog logging integration
  - Redeploy capability

### 3. Bug System
Each instance includes 3-5 intentional bugs:

#### Bug Type 1: Checkout Button (Critical Path)
- **Issue**: Button onClick handler missing/broken
- **Location**: `src/components/Cart.jsx`
- **Datadog Signal**: `checkout_button_clicked` event missing in logs
- **Fix Difficulty**: Easy

#### Bug Type 2: Size Selection Exception (Frontend Error)
- **Issue**: Uncaught exception when selecting "Small"
- **Location**: `src/components/ProductSize.jsx`
- **Datadog Signal**: JavaScript error in browser console, exception in logs
- **Fix Difficulty**: Easy

#### Bug Type 3: Database Connection (Backend Error)
- **Issue**: Misspelled table name in inventory query
- **Location**: `server/routes/inventory.js`
- **Datadog Signal**: SQL error logs, empty inventory response
- **Fix Difficulty**: Medium

#### Bug Type 4: Form Validation (Logic Error)
- **Issue**: Email validation regex broken
- **Location**: `src/utils/validation.js`
- **Datadog Signal**: Form submission failures in logs
- **Fix Difficulty**: Easy

### 4. Datadog Integration

Each instance is instrumented with:
```javascript
// Datadog RUM (Real User Monitoring)
datadogRum.init({
  applicationId: process.env.DD_APP_ID,
  clientToken: process.env.DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: `swag-store-${instanceId}`,
  env: 'game',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});

// Backend logging
const tracer = require('dd-trace').init({
  service: `swag-store-${instanceId}`,
  env: 'game'
});
```

### 5. MCP Server Configuration

Users receive these credentials:
```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["-y", "@datadog/datadog-mcp-server"],
      "env": {
        "DD_API_KEY": "<user-specific-key>",
        "DD_APP_KEY": "<user-specific-key>",
        "DD_SITE": "datadoghq.com"
      }
    }
  }
}
```

### 6. Order Collection System

**Endpoint**: `https://api.datadog-swag.com/orders` (admin-controlled)

**Method**: POST

**Payload**:
```json
{
  "instanceId": "id-123",
  "email": "user@example.com",
  "timestamp": "2025-12-15T15:30:00Z",
  "items": [
    {
      "productId": "hoodie-001",
      "name": "Datadog Hoodie",
      "size": "M",
      "quantity": 1,
      "price": 0
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "country": "USA"
  },
  "debugSteps": [
    "fixed_checkout_button",
    "fixed_size_selection",
    "fixed_database_connection"
  ]
}
```

**Storage Options**:
1. **Google Sheets** (Recommended for 200 users)
   - Easy setup with Google Apps Script
   - No database management
   - Built-in spreadsheet interface
   
2. **Airtable**
   - Better UX
   - API-friendly
   - Requires account

3. **Simple Database**
   - PostgreSQL/MySQL
   - More control
   - Requires hosting

## Deployment Strategy

### Option A: Vercel (Recommended for 200 users)

**Pros**:
- Serverless, scales automatically
- Easy subdomain routing
- Built-in environment variables per deployment
- Git integration

**Cons**:
- Limited execution time
- Cold starts

**Implementation**:
```bash
# Each instance is a separate Vercel deployment
vercel deploy --name=swag-store-${instanceId} \
  --env DD_API_KEY=$userApiKey \
  --env DD_APP_KEY=$userAppKey \
  --env INSTANCE_ID=$instanceId
```

### Option B: Docker + Kubernetes

**Pros**:
- Full control
- Persistent state
- No cold starts

**Cons**:
- More complex
- Infrastructure management
- Higher cost

### Option C: Railway/Render

**Pros**:
- Middle ground
- Easy deployment
- Reasonable pricing

**Cons**:
- Less mature than Vercel

## User Flow

1. **Landing** → User visits main site, sees tutorial intro
2. **Authentication** → Enters email, validates
3. **Provisioning** → System creates instance (30-60 seconds)
4. **Credentials** → User receives:
   - Subdomain URL
   - MCP server config (JSON to copy)
   - Tutorial steps
5. **Debugging** → User:
   - Opens Cursor/Claude Code
   - Pastes MCP config
   - Connects to Datadog
   - Follows tutorial prompts
   - Runs diagnostic queries via MCP
   - Fixes bugs
   - Redeploys
6. **Verification** → Tests fixes in browser
7. **Checkout** → Completes order
8. **Submission** → Order sent to admin endpoint

## Security Considerations

1. **Email Validation**: Prevent abuse with rate limiting
2. **Instance Isolation**: No cross-contamination between users
3. **API Keys**: Limited scope, read-only Datadog access where possible
4. **Order Endpoint**: Authentication token, validate instance ID
5. **Resource Limits**: Max CPU/memory per instance
6. **Cleanup**: Auto-delete instances after 7 days

## Tutorial Design

### Phase 1: Introduction (On Landing Page)
```
Welcome to the Datadog MCP Debugging Challenge! 🐛

Your mission: Fix bugs in our swag store using the Datadog MCP server.
As you debug, you'll learn how to use MCP to surface logs, traces, and 
exceptions in real-time.

Ready to earn some swag? Let's go!
```

### Phase 2: Setup (After Instance Creation)
```
Your personal instance: https://id-123.datadog-PM.swag

Step 1: Copy this MCP configuration
[Copy Button] → config.json

Step 2: Add to Cursor/Claude Code
- Open settings
- Find "MCP Servers"
- Paste configuration
- Restart editor

Step 3: Start debugging!
```

### Phase 3: Debugging Tutorial (On Swag Store Instance)
```
🔍 Bug #1: The Checkout Button Mystery

Try clicking "Checkout" → Nothing happens!

Use Claude/Cursor with MCP to investigate:

1. Ask: "Use Datadog MCP to check recent browser events for 
   checkout button clicks"

2. Ask: "Show me any JavaScript errors in the last 5 minutes"

3. Once you find the issue, ask: "Fix the checkout button bug"

4. Redeploy and test!

[Next Bug →]
```

## Monitoring & Analytics

Track:
- Instance creation count
- Bug fix completion rate
- Time to complete each bug
- Order submission success rate
- MCP query patterns

## Cost Estimation (200 users)

**Vercel**:
- Free tier: 100 deployments/day
- Pro: $20/month (unlimited)
- Total: ~$20-40/month

**Datadog**:
- Trial accounts (free)
- Or shared account with per-user service names
- Total: $0-50/month

**Domain**:
- Wildcard SSL: $10-50/year

**Total**: ~$30-90/month for 200 users

## Implementation Timeline

- **Week 1**: Landing page + instance provisioning
- **Week 2**: Swag store with bugs + Datadog integration
- **Week 3**: MCP setup + tutorial system
- **Week 4**: Testing + refinement
- **Week 5**: Deployment + user testing

## Next Steps

1. Choose deployment platform (Vercel recommended)
2. Set up Datadog organization/accounts
3. Build landing page
4. Build swag store with bugs
5. Create deployment automation
6. Design tutorial flow
7. Set up order collection
8. Test end-to-end
9. Launch!
