// Backend API Server for Datadog MCP Swag Store
// Handles instance creation and order collection

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('landing-page'));

// In-memory store (replace with database in production)
const instances = new Map();
const orders = [];

// Generate unique instance ID
function generateInstanceId() {
  return `id-${crypto.randomBytes(8).toString('hex')}`;
}

// Generate API keys (in production, create actual Datadog API keys)
function generateApiKeys() {
  return {
    apiKey: `dd_api_${crypto.randomBytes(16).toString('hex')}`,
    appKey: `dd_app_${crypto.randomBytes(16).toString('hex')}`
  };
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Create instance endpoint
app.post('/api/create-instance', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if email already has an active instance
    const existingInstance = Array.from(instances.values()).find(
      inst => inst.email === email && inst.status === 'active'
    );

    if (existingInstance) {
      return res.json({
        instanceId: existingInstance.id,
        token: existingInstance.token,
        existing: true
      });
    }

    // Generate instance details
    const instanceId = generateInstanceId();
    const { apiKey, appKey } = generateApiKeys();
    const token = crypto.randomBytes(32).toString('hex');

    const instance = {
      id: instanceId,
      email,
      token,
      apiKey,
      appKey,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'provisioning'
    };

    instances.set(instanceId, instance);

    // Deploy instance asynchronously
    deployInstance(instanceId, email, apiKey, appKey).then(() => {
      instance.status = 'active';
      console.log(`✅ Instance ${instanceId} deployed for ${email}`);
    }).catch(error => {
      console.error(`❌ Failed to deploy instance ${instanceId}:`, error);
      instance.status = 'failed';
    });

    res.json({
      instanceId,
      token,
      existing: false
    });

  } catch (error) {
    console.error('Error creating instance:', error);
    res.status(500).json({ error: 'Failed to create instance' });
  }
});

// Get instance details
app.get('/api/instance/:id', (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');

  const instance = instances.get(id);

  if (!instance) {
    return res.status(404).json({ error: 'Instance not found' });
  }

  if (instance.token !== token) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    instanceId: instance.id,
    email: instance.email,
    status: instance.status,
    createdAt: instance.createdAt,
    expiresAt: instance.expiresAt,
    mcpConfig: {
      mcpServers: {
        datadog: {
          command: "npx",
          args: ["-y", "@datadog/datadog-mcp-server"],
          env: {
            DD_API_KEY: instance.apiKey,
            DD_APP_KEY: instance.appKey,
            DD_SITE: "datadoghq.com"
          }
        }
      }
    }
  });
});

// Submit order endpoint (hardcoded, non-manipulatable)
app.post('/api/orders', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    
    // Validate admin token (in production, use proper authentication)
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const order = {
      ...req.body,
      submittedAt: new Date().toISOString(),
      orderId: crypto.randomBytes(8).toString('hex')
    };

    orders.push(order);

    // Write to file for backup
    const ordersFile = path.join(__dirname, 'orders.json');
    await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2));

    // Optional: Send to Google Sheets, Airtable, etc.
    await sendToGoogleSheets(order);

    console.log(`📦 Order received: ${order.orderId} from ${order.email}`);

    res.json({
      success: true,
      orderId: order.orderId
    });

  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).json({ error: 'Failed to submit order' });
  }
});

// Admin endpoint to view all orders
app.get('/api/admin/orders', (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    total: orders.length,
    orders: orders.sort((a, b) => 
      new Date(b.submittedAt) - new Date(a.submittedAt)
    )
  });
});

// Admin endpoint to view all instances
app.get('/api/admin/instances', (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    total: instances.size,
    instances: Array.from(instances.values())
  });
});

// Deploy instance (calls the deployment script)
async function deployInstance(instanceId, email, apiKey, appKey) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../deployment/deploy-instance.sh');
    const command = `bash ${scriptPath} ${instanceId} ${email} ${apiKey} ${appKey}`;

    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Deployment error for ${instanceId}:`, stderr);
        reject(error);
      } else {
        console.log(`Deployment output for ${instanceId}:`, stdout);
        resolve(stdout);
      }
    });
  });
}

// Send order to Google Sheets (optional)
async function sendToGoogleSheets(order) {
  // Implementation depends on your Google Sheets setup
  // Use googleapis package or webhook to Zapier/Make
  
  // Example with webhook:
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      console.error('Failed to send to Google Sheets:', await response.text());
    }
  } catch (error) {
    console.error('Error sending to Google Sheets:', error);
  }
}

// Cleanup expired instances (run periodically)
function cleanupExpiredInstances() {
  const now = new Date();
  
  for (const [id, instance] of instances.entries()) {
    if (new Date(instance.expiresAt) < now) {
      console.log(`🗑️  Cleaning up expired instance: ${id}`);
      instances.delete(id);
      // Also cleanup deployment (e.g., delete Vercel deployment)
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredInstances, 60 * 60 * 1000);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    instances: instances.size,
    orders: orders.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Datadog MCP Swag Store API running on port ${PORT}`);
  console.log(`📊 Admin token: ${process.env.ADMIN_TOKEN || 'NOT SET'}`);
});
