// Vercel Serverless Function: Create Per-User Instance
// This creates a new Vercel deployment for each user

const crypto = require('crypto');

// In-memory store (for demo - in production use a database like Vercel KV)
// Note: This will reset on cold starts, so for production use Vercel KV or similar
const instances = new Map();

function generateInstanceId(email) {
  // Create a short hash from email for the instance ID
  const hash = crypto.createHash('sha256').update(email + Date.now()).digest('hex');
  return hash.substring(0, 12);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Generate instance ID
    const instanceId = generateInstanceId(email);
    const token = crypto.randomBytes(32).toString('hex');

    // For the MVP, we'll use a pre-deployed "template" store
    // In production, this would trigger a Vercel deployment via API
    
    // The swag store template should already be deployed
    // Each "instance" will be simulated by passing the instanceId in the URL
    // This is simpler than creating actual separate deployments for 200 users
    
    const instance = {
      id: instanceId,
      email,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      // In production, you'd create actual Datadog read-only API keys here
      // For the demo, we provide placeholder keys that work with the demo environment
      ddApiKey: process.env.DD_API_KEY || 'demo-api-key',
      ddAppKey: process.env.DD_APP_KEY || 'demo-app-key'
    };

    instances.set(instanceId, instance);

    console.log(`📦 Created instance ${instanceId} for ${email}`);

    return res.status(200).json({
      instanceId,
      token,
      // URL to the swag store instance
      // For the MVP, all users share the same deployment but with different instance IDs
      storeUrl: `https://mcp-swag-store-dispatch-agents.vercel.app/?instance=${instanceId}`,
      mcpConfig: {
        mcpServers: {
          datadog: {
            command: "npx",
            args: ["-y", "@datadog/datadog-mcp-server"],
            env: {
              DD_API_KEY: instance.ddApiKey,
              DD_APP_KEY: instance.ddAppKey,
              DD_SITE: "datadoghq.com"
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Error creating instance:', error);
    return res.status(500).json({ error: 'Failed to create instance' });
  }
};

