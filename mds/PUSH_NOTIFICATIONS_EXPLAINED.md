# Push Notifications - How It Works

## Overview

Push notifications allow your app to send notifications to users even when they're not actively using the app. When an achievement is awarded, users will receive a notification on their device.

## How It Works (Step by Step)

### 1. **User Enables Notifications**
   - User clicks "Enable Push Notifications" button
   - Browser asks for permission: "Allow notifications?"
   - User clicks "Allow"

### 2. **Subscription Created**
   - Browser creates a unique "subscription" object
   - This subscription contains:
     - An endpoint URL (unique to the user's browser)
     - Encryption keys (to secure the notification)
   - Subscription is sent to your server and saved in the database

### 3. **Achievement Awarded**
   - Manager/admin awards an achievement to a user
   - Server automatically sends push notification to that user
   - Uses web-push library to encrypt and send notification

### 4. **User Receives Notification**
   - Even if app is closed, notification appears on device
   - User clicks notification → Opens app to achievements page

## Why Do You Need VAPID Keys?

**VAPID** (Voluntary Application Server Identification) is a security standard for web push notifications.

### What are VAPID keys?
- **Public Key**: Shared with the browser (safe to expose)
- **Private Key**: Kept secret on your server (never expose!)

### Why are they needed?
1. **Security**: Proves your server is authorized to send notifications
2. **Prevents Spam**: Browser vendors require VAPID to prevent abuse
3. **Encryption**: Used to encrypt notifications so only the user can read them

### Why the email (VAPID_SUBJECT)?
- The `mailto:` email is a **contact point** for browser vendors
- If there's an issue with your push notifications, they can contact you
- It's part of the VAPID standard - **required** by browsers
- Format: `mailto:your-email@example.com`

**Example:**
```
VAPID_SUBJECT=mailto:gm@thegaitens.co.uk
```

This tells browsers: "If there's a problem with notifications from this app, contact gm@thegaitens.co.uk"

## Setup Checklist

### ✅ Already Done:
- [x] Database table created (`push_subscriptions`)
- [x] Service worker handles push events
- [x] API endpoints created
- [x] Web-push library integrated
- [x] Achievement award triggers notification

### 🔧 What You Need to Do:

1. **Run Database Migration**
   ```sql
   -- Run scripts/37-create-push-subscriptions-table.sql in Supabase
   ```

2. **Add Environment Variables**
   Add to `.env.local`:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBfqW0O8_K9187Le-485F82GnPncAeQI5JTxvINrZsnTwde7bSTq9aRpw3CaQNMLWy1ZBHMUIySMsc8T7V2vDTc
   VAPID_PRIVATE_KEY=Z9AnpO9ArStuNrsggPJ_MCixekOHIPp0Ga638hb9HYs
   VAPID_SUBJECT=mailto:gm@thegaitens.co.uk
   INTERNAL_API_SECRET=your-secret-key-change-in-production
   ```

3. **Restart Dev Server**
   ```bash
   npm run dev
   ```

4. **Test It!**
   - Open app in browser
   - Click "Enable Push Notifications" button
   - Grant permission
   - Award an achievement to yourself
   - You should receive a notification!

## User Experience

### First Time:
1. User sees "Enable Push Notifications" button
2. Clicks it → Browser permission popup appears
3. User clicks "Allow"
4. Button changes to "Disable Notifications" ✅

### When Achievement Awarded:
1. Manager awards achievement
2. User receives notification (even if app closed!)
3. Notification shows: "Achievement Unlocked! 🎉"
4. User clicks → Opens achievements page

## Browser Support

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)  
- ✅ Safari (iOS 16.4+)
- ⚠️ Safari (Desktop) - Limited support

## Troubleshooting

**"Push notifications are not configured"**
- Check `.env.local` has `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Restart dev server after adding env vars

**"Failed to enable push notifications"**
- Check browser console for errors
- Ensure HTTPS (or localhost)
- Verify service worker is registered

**Notifications not appearing**
- Check browser notification settings
- Verify subscription was saved to database
- Check server logs for web-push errors

## Security Notes

- ✅ Private key is **never** exposed to client
- ✅ Public key is safe to expose (it's public!)
- ✅ Notifications are encrypted end-to-end
- ✅ Each user has unique subscription endpoint
