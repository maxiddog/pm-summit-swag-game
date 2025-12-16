// Admin endpoint to view all orders (PRIVATE - requires token)
// Access: /api/admin/orders?token=YOUR_ADMIN_TOKEN

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin token - REQUIRED
  const adminToken = req.query.token || req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_TOKEN;

  // If no token configured in environment
  if (!expectedToken) {
    return res.status(403).json({ 
      error: 'Access denied',
      setup: 'ADMIN_TOKEN environment variable not configured'
    });
  }

  // Validate token - must match exactly
  if (!adminToken || adminToken !== expectedToken) {
    return res.status(403).json({ 
      error: 'Unauthorized - Invalid or missing token'
    });
  }

  // Token valid - return all orders
  const orders = global.orders || [];
  
  return res.status(200).json({
    success: true,
    total_orders: orders.length,
    orders: orders.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  });
};
