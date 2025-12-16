# 🎓 Datadog MCP Debugging Tutorial

## Welcome to the Challenge!

This tutorial will guide you through debugging the Datadog Swag Store using the Datadog MCP server. By the end, you'll have hands-on experience with MCP and earn free Datadog swag!

## What You'll Learn

- How to connect AI assistants to Datadog via MCP
- Real-world debugging techniques using observability data
- How to query logs, traces, and metrics through MCP
- Debugging patterns for frontend and backend issues

## Prerequisites

Before starting, make sure you have:
- ✅ Your personal instance URL (from the credentials page)
- ✅ MCP configuration JSON (copied to clipboard)
- ✅ Cursor or Claude Code installed
- ✅ 30-60 minutes to complete the challenge

## Step 1: Set Up Your Environment

### 1.1 Install an AI Code Editor

Choose one:

**Option A: Cursor**
1. Download from [cursor.sh](https://cursor.sh)
2. Install and open
3. Sign in or create account

**Option B: Claude Code**
1. Download from [anthropic.com/code](https://anthropic.com/code)
2. Install and open
3. Sign in with Anthropic account

### 1.2 Add MCP Server Configuration

1. Open your editor settings:
   - **Cursor:** Settings → Features → MCP Servers
   - **Claude Code:** Settings → Extensions → MCP

2. Paste the MCP configuration JSON you received

3. Save and restart your editor

4. Verify connection:
   ```
   Ask your AI: "Can you access Datadog via MCP?"
   ```

## Step 2: Explore Your Instance

### 2.1 Visit Your Swag Store

Open your unique instance URL in a browser:
```
https://id-{your-id}.datadog-PM.swag
```

### 2.2 Browse Products

- Look at available swag items
- Notice they're all FREE! 🎁
- Try adding items to your cart

### 2.3 Encounter Bug #1

Try to proceed to checkout... nothing happens! 🐛

This is your first debugging challenge.

## Step 3: Debug Bug #1 - Checkout Button

### 3.1 Investigate with MCP

Open your AI code editor and try these prompts:

**Prompt 1: Check User Interactions**
```
Use Datadog MCP to show me recent user interactions on my swag store instance.
Specifically look for button clicks in the cart view.
```

**Prompt 2: Look for JavaScript Errors**
```
Check Datadog for any JavaScript errors or console logs related to the checkout button.
```

**Prompt 3: Find Missing Handlers**
```
Look for any UI elements with missing event handlers in the Datadog RUM data.
```

### 3.2 Identify the Issue

You should discover:
- The checkout button exists in the DOM
- No click event is being fired when clicked
- The onClick handler is missing or commented out

### 3.3 Fix the Bug

**Prompt to AI:**
```
The checkout button in Cart.jsx has a commented-out onClick handler.
Please uncomment the line that says: // onClick={onCheckout}
And show me the fixed code.
```

### 3.4 Apply the Fix

1. Open `src/components/Cart.jsx` in your local clone
2. Find the checkout button (around line 45)
3. Uncomment the onClick handler:
   ```jsx
   <button 
     className="btn-primary" 
     onClick={onCheckout}  // <-- Uncomment this line!
   >
     Proceed to Checkout →
   </button>
   ```
4. Save the file

### 3.5 Redeploy

```bash
# If using Vercel
npm run build
vercel --prod

# Or just refresh if running locally
npm run dev
```

### 3.6 Test

1. Refresh your swag store
2. Add items to cart
3. Click "Proceed to Checkout"
4. ✅ It should work now!

## Step 4: Debug Bug #2 - Size Selection Crash

### 4.1 Encounter the Bug

1. Go back to products
2. Try selecting size "S" (Small)
3. Click "Add to Cart"
4. 💥 Error! The page crashes

### 4.2 Investigate with MCP

**Prompt 1: Check for Exceptions**
```
Use Datadog MCP to show me recent JavaScript exceptions in my instance.
Look specifically for errors that happened when I tried to add a product to cart.
```

**Prompt 2: Analyze Stack Trace**
```
Can you show me the full stack trace of the most recent exception?
What function is throwing the error?
```

### 4.3 Identify the Issue

You should find:
- Error: "Cannot read property 'property' of undefined"
- Location: `App.jsx` in the `addToCart` function
- Triggered only when size "S" is selected

### 4.4 Fix the Bug

**Prompt to AI:**
```
In App.jsx, the addToCart function has a bug that crashes when size "S" is selected.
It's trying to access a property on an undefined variable.
Please show me the buggy code and the fix.
```

The issue is:
```jsx
if (size === 'S') {
  const undefinedVar = undefined;
  console.log(undefinedVar.property); // This crashes!
}
```

Fix by removing or commenting out these lines.

### 4.5 Redeploy and Test

1. Apply the fix
2. Redeploy your instance
3. Try adding size "S" items
4. ✅ Should work now!

## Step 5: Debug Bug #3 - Email Validation

### 5.1 Encounter the Bug

1. Add items to cart
2. Proceed to checkout (now works!)
3. Fill out the form with a valid email
4. Try to submit...
5. ❌ "Please enter a valid email address"

Even though your email IS valid! 🐛

### 5.2 Investigate with MCP

**Prompt 1: Check Form Submissions**
```
Use Datadog MCP to show me failed form submissions in my instance.
What validation errors are being logged?
```

**Prompt 2: Review Validation Logic**
```
Can you look at the validation logic in the checkout form?
Show me how email validation is implemented.
```

### 5.3 Identify the Issue

You should discover:
- Email validation uses a regex pattern
- The regex is missing the @ symbol!
- Pattern: `/^[^\s]+[^\s.]+\.[^\s@]+$/` (BROKEN)
- Should be: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### 5.4 Fix the Bug

**Prompt to AI:**
```
In CheckoutForm.jsx, the validateEmail function has a broken regex.
It's missing the @ symbol in the pattern.
Please show me the correct regex for email validation.
```

Fix the regex:
```javascript
const validateEmail = (email) => {
  // FIXED: Added @ symbol back into the regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

### 5.5 Redeploy and Test

1. Apply the fix
2. Redeploy
3. Try submitting the form with a valid email
4. ✅ Should work now!

## Step 6: Complete Your Order

### 6.1 Fill Out Shipping Information

Now that all bugs are fixed:
1. Add swag items to cart
2. Proceed to checkout
3. Fill out your shipping information
4. Double-check your address

### 6.2 Submit Order

Click "Complete Order" and wait for confirmation.

### 6.3 Success! 🎉

You should see:
- ✅ Order Submitted confirmation
- List of bugs you fixed
- Your swag will ship soon!

## Debugging Tips You Learned

### 1. Use Logs to Track User Actions
- RUM (Real User Monitoring) shows actual user interactions
- Click events, page views, navigation paths
- Helps identify where users get stuck

### 2. Exception Tracking is Crucial
- Stack traces point directly to problem code
- Timestamps help correlate errors with user actions
- Frequency data shows severity

### 3. Validation Bugs are Subtle
- Always test edge cases
- Log validation failures
- Regex patterns need careful review

### 4. Iterative Debugging Works
- Fix one bug at a time
- Test after each fix
- Use observability to verify fixes

## MCP Commands You Used

Here are the key MCP queries you learned:

```
1. "Show recent user interactions"
2. "Check for JavaScript errors"
3. "Display exception stack traces"
4. "Query form validation failures"
5. "Show RUM session replays"
```

## What's Next?

Now that you've mastered MCP debugging:

1. **Explore More:** Try the Datadog MCP server on your own projects
2. **Learn Advanced Features:** Check out distributed tracing, custom metrics
3. **Share Your Experience:** Tell your team about MCP!

## Troubleshooting

### MCP Not Connecting
- Restart your code editor
- Check API keys in configuration
- Verify Datadog account access

### Can't Find Bugs in Code
- Use the tutorial hints
- Search for "BUG #" comments in the code
- Check the relevant files mentioned

### Deployment Issues
- Check console for build errors
- Verify environment variables
- Try deploying to localhost first

### Order Not Submitting
- Ensure all bugs are fixed
- Check network tab for failed requests
- Verify admin endpoint is reachable

## Need Help?

If you're stuck:
1. Re-read the tutorial section
2. Check the hints in the app itself
3. Use MCP to query more Datadog data
4. Look at the debug hints in the UI

## Feedback

We'd love to hear about your experience!
- What was most helpful?
- What was confusing?
- How long did it take?
- Would you recommend this to others?

---

**Congratulations on completing the Datadog MCP Debugging Challenge!** 

You've learned valuable debugging skills and earned some awesome swag. Now go forth and monitor all the things! 📊🐕

## Quick Reference

### File Locations
- Bug #1: `src/components/Cart.jsx` (line ~45)
- Bug #2: `src/App.jsx` (addToCart function)
- Bug #3: `src/components/CheckoutForm.jsx` (validateEmail function)

### Useful MCP Queries
```
"Show me recent errors"
"Check user interactions"
"Display exception traces"
"Query RUM data"
"Show session replays"
```

### Redeploy Commands
```bash
# Vercel
npm run build && vercel --prod

# Local
npm run dev
```

Happy debugging! 🐛✨
