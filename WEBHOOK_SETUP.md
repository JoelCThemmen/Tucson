# Clerk Webhook Setup Guide

This guide will walk you through setting up a webhook in Clerk to automatically sync users to your PostgreSQL database.

## Prerequisites
- Your backend server must be running and accessible from the internet
- You need access to the Clerk Dashboard
- For local development, you'll need a tool like ngrok to expose your local server

## Step 1: Prepare Your Backend

Your backend already has the webhook endpoint ready at:
```
POST /api/v1/auth/webhook
```

This endpoint is located in: `/backend/src/routes/auth.routes.ts`

## Step 2: Make Your Local Server Accessible (Development Only)

Since webhooks need to be accessible from the internet, you'll need to expose your local server.

### Option A: Using ngrok (Recommended for testing)

1. Install ngrok:
```bash
# On macOS
brew install ngrok

# On Linux
snap install ngrok

# Or download from https://ngrok.com/download
```

2. Start your backend server (if not already running):
```bash
cd /home/joel/source/repos/Tucson/backend
npm run dev
```

3. In a new terminal, expose your backend:
```bash
ngrok http 5000
```

4. You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

5. Your webhook URL will be:
```
https://abc123.ngrok.io/api/v1/auth/webhook
```

### Option B: Deploy to a staging server
If you have a deployed version, use that URL instead.

## Step 3: Configure Webhook in Clerk Dashboard

1. **Sign in to Clerk Dashboard**
   - Go to: https://dashboard.clerk.com/
   - Sign in with your account

2. **Navigate to Webhooks**
   - In the left sidebar, click on "Webhooks"
   - Or go directly to: https://dashboard.clerk.com/apps/[YOUR_APP_ID]/webhooks

3. **Create a New Webhook**
   - Click the "Add Endpoint" button
   - Fill in the following:
     - **Endpoint URL**: Your webhook URL from Step 2
       - For ngrok: `https://abc123.ngrok.io/api/v1/auth/webhook`
       - For production: `https://yourdomain.com/api/v1/auth/webhook`
     - **Description**: "Sync users to PostgreSQL database"

4. **Select Events to Listen To**
   Check the following events:
   - ✅ `user.created` - When a new user signs up
   - ✅ `user.updated` - When user profile is updated
   - ✅ `user.deleted` - When a user is deleted
   
   These are the critical events. Optionally, you can also add:
   - `email.created` - When user adds a new email
   - `session.created` - For audit logging

5. **Create the Webhook**
   - Click "Create" button
   - Clerk will generate a Signing Secret

## Step 4: Copy the Webhook Signing Secret

1. After creating the webhook, you'll see a "Signing Secret"
2. It will look something like: `whsec_abc123def456...`
3. Click the copy button to copy this secret

## Step 5: Add the Signing Secret to Your Backend

1. Open your backend `.env` file:
```bash
cd /home/joel/source/repos/Tucson/backend
nano .env
```

2. Update the `CLERK_WEBHOOK_SECRET` line:
```env
CLERK_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
```

3. Save the file

4. Restart your backend server:
```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

## Step 6: Test the Webhook

### Method 1: Test from Clerk Dashboard

1. In the Clerk Dashboard webhook page
2. Click on your webhook endpoint
3. Click "Testing" tab
4. Select an event type (e.g., `user.created`)
5. Click "Send test"
6. Check your backend logs for success

### Method 2: Create a Test User

1. Go to your application
2. Sign up with a new test account
3. Check your database to see if the user was created:

```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d tucson -c "SELECT * FROM \"User\";"
```

## Step 7: Monitor Webhook Activity

### In Clerk Dashboard:
1. Go to the webhook endpoint page
2. Click on "Logs" tab
3. You'll see all webhook attempts with:
   - Status (success/failure)
   - Response time
   - Response code
   - Request/Response bodies

### In Your Backend:
Check the logs:
```bash
# Your backend console will show:
# Webhook received: user.created
# User created/updated in database: user_xxxxx
```

Check the database audit log:
```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d tucson -c "SELECT * FROM \"AuditLog\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - The signing secret is incorrect
   - Check that CLERK_WEBHOOK_SECRET in .env matches the one from Clerk Dashboard

2. **404 Not Found**
   - The webhook URL is incorrect
   - Ensure it ends with `/api/v1/auth/webhook`

3. **Connection Timeout**
   - Your local server is not accessible
   - Check ngrok is running and the URL is correct

4. **500 Internal Server Error**
   - Check backend logs for specific errors
   - Ensure database is running and accessible

### Debug Tips:

1. **Enable verbose logging** in your webhook handler:
```typescript
// In auth.routes.ts
console.log('Headers:', req.headers);
console.log('Body:', req.body);
```

2. **Test with curl** to ensure endpoint is accessible:
```bash
curl -X POST https://your-webhook-url/api/v1/auth/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

3. **Check Clerk webhook logs** for the exact payload being sent

## Production Deployment

For production:

1. **Use environment variables** for all sensitive data
2. **Ensure HTTPS** is enabled (required by Clerk)
3. **Set up monitoring** for webhook failures
4. **Implement retry logic** for database operations
5. **Add rate limiting** to prevent abuse

## Security Best Practices

1. **Always verify the webhook signature** (already implemented in your code)
2. **Use HTTPS only** in production
3. **Implement idempotency** - handle duplicate webhook deliveries
4. **Log all webhook events** for audit trail
5. **Set up alerts** for webhook failures

## Webhook Event Payloads

### user.created
```json
{
  "type": "user.created",
  "data": {
    "id": "user_xxx",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
}
```

### user.updated
```json
{
  "type": "user.updated",
  "data": {
    "id": "user_xxx",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Smith",  // Changed
    ...
  }
}
```

## Need Help?

- Clerk Documentation: https://clerk.com/docs/integrations/webhooks
- Clerk Support: https://clerk.com/support
- Your webhook endpoint code: `/backend/src/routes/auth.routes.ts`