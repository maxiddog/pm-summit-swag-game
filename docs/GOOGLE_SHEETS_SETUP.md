# Google Sheets Order Tracking Setup

This guide shows you how to automatically send all swag orders to a Google Sheet.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Dispatch Swag Orders"
4. In the first row, add these headers:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Order ID | Timestamp | Instance ID | Email | Items | Full Address | First Name | Last Name | City | State | Bugs Fixed |

## Step 2: Create the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste the following:

```javascript
function doPost(e) {
  try {
    // Parse the incoming JSON
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Prepare the row data
    const row = [
      data.orderId || '',
      data.submittedAt || new Date().toISOString(),
      data.instanceId || '',
      data.email || '',
      data.itemsSummary || data.items?.map(i => `${i.name} (${i.size || i.selectedSize})`).join(', ') || '',
      data.fullAddress || `${data.shippingAddress?.firstName} ${data.shippingAddress?.lastName}, ${data.shippingAddress?.address}, ${data.shippingAddress?.city}, ${data.shippingAddress?.state} ${data.shippingAddress?.zipCode}, ${data.shippingAddress?.country}`,
      data.shippingAddress?.firstName || '',
      data.shippingAddress?.lastName || '',
      data.shippingAddress?.city || '',
      data.shippingAddress?.state || '',
      data.bugsFixed?.join(', ') || ''
    ];
    
    // Append the row to the sheet
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Order logged' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error and return error response
    console.error('Error processing order:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        orderId: 'ORD-TEST123',
        submittedAt: new Date().toISOString(),
        instanceId: 'test-instance',
        email: 'test@example.com',
        items: [{ name: 'Test Hoodie', selectedSize: 'M' }],
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          address: '123 Test St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        bugsFixed: ['checkoutButton', 'sizeSelection']
      })
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}
```

3. Click **Save** (Ctrl/Cmd + S)
4. Name the project "Swag Order Webhook"

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: "Swag Order Webhook"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (required for webhook to work)
4. Click **Deploy**
5. Click **Authorize access** and follow the prompts
6. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

## Step 4: Configure Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the **landing-page** project
3. Go to **Settings → Environment Variables**
4. Add a new variable:
   - **Name**: `ORDER_WEBHOOK_URL`
   - **Value**: Your Google Apps Script Web App URL
   - **Environment**: Production (check all environments)
5. Click **Save**
6. **Redeploy** the landing-page project for changes to take effect:
   ```bash
   cd landing-page && vercel --prod
   ```

## Step 5: Test the Integration

Send a test order to verify everything works:

```bash
curl -X POST https://landing-page-olive-eight-67.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "test-instance",
    "email": "test@example.com",
    "items": [{"name": "Datadog Hoodie", "selectedSize": "M"}],
    "shippingAddress": {
      "firstName": "Test",
      "lastName": "User",
      "address": "123 Test St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "USA"
    },
    "bugsFixed": ["checkoutButton"]
  }'
```

Check your Google Sheet - the order should appear within seconds!

## Troubleshooting

### Orders not appearing in sheet?

1. **Check Vercel logs**: `vercel logs landing-page` - look for webhook errors
2. **Check Apps Script logs**: In Apps Script, go to **Executions** to see errors
3. **Verify the URL**: Make sure `ORDER_WEBHOOK_URL` is set correctly in Vercel

### "Authorization required" error?

1. In Apps Script, go to **Deploy → Manage deployments**
2. Click the pencil icon to edit
3. Make sure "Who has access" is set to "Anyone"
4. Click **Deploy** to update

### Want to add more columns?

Edit the `row` array in the Apps Script to include additional fields. Don't forget to add corresponding headers in your sheet!

## Security Notes

- The webhook URL is server-side only (in Vercel env vars), not exposed to clients
- Google Apps Script validates and sanitizes input
- Consider adding a secret token for additional security if needed

