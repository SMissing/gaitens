# Push Notifications Setup

This app supports push notifications for achievement awards. When a user is awarded an achievement, they'll receive a push notification even if they're not actively using the app.

## Current Implementation

The app currently uses:
- **Browser Notification API** for in-app notifications (works immediately)
- **Web Push API** foundation for background notifications (requires setup)

## Setup Instructions

### 1. Database Setup

Run the migration script to create the push subscriptions table:

```sql
-- Run scripts/37-create-push-subscriptions-table.sql
```

### 2. Enable Push Notifications (Production)

For production, you'll need to set up Web Push with VAPID keys:

#### Install web-push library:
```bash
npm install web-push
```

#### Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

This will output:
- Public Key (starts with `B...`)
- Private Key (starts with `...`)

#### Add to `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBfqW0O8_K9187Le-485F82GnPncAeQI5JTxvINrZsnTwde7bSTq9aRpw3CaQNMLWy1ZBHMUIySMsc8T7V2vDTc
VAPID_PRIVATE_KEY=Z9AnpO9ArStuNrsggPJ_MCixekOHIPp0Ga638hb9HYs
VAPID_SUBJECT=mailto:gm@thegaitens.co.uk
INTERNAL_API_SECRET=your-secret-key-change-in-production
```

**Important:** Replace `mailto:your-email@example.com` with your actual email address (e.g., `mailto:admin@gaitens.com`).

#### Web-push Integration:

✅ **Already implemented!** The `app/api/push/send/route.ts` file has been updated to use web-push. Just make sure:
1. `web-push` is installed (already in package.json)
2. VAPID keys are set in `.env.local` (see above)
3. Restart your dev server after adding environment variables

### 3. How It Works

1. **User opens app** → `PushNotificationManager` component requests notification permission
2. **User grants permission** → Subscription is created and saved to database
3. **Achievement awarded** → `sendPushNotification` is called automatically
4. **Notification sent** → User receives push notification (even if app is closed)

### 4. Testing

1. Open the app in a browser
2. Grant notification permissions when prompted
3. Award an achievement to yourself (as admin/manager)
4. You should receive a push notification

### 5. Browser Support

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (iOS 16.4+)
- ⚠️ Safari (Desktop) - Limited support

### 6. Notification Behavior

- **App open**: Notification appears as a browser notification
- **App closed**: Push notification appears on device (requires web-push setup)
- **Clicking notification**: Opens the achievements page

### 7. Troubleshooting

**Notifications not working?**
- Check browser console for errors
- Verify notification permissions are granted
- Check that service worker is registered
- Ensure HTTPS is enabled (required for push notifications)

**VAPID keys not working?**
- Verify keys are correctly set in `.env.local`
- Ensure public key matches the one used for subscription
- Check that VAPID_SUBJECT is a valid mailto: URL

**Service worker errors?**
- Clear browser cache
- Unregister old service worker
- Reload page

## Current Status

✅ Database table created
✅ Service worker handles push events
✅ Subscription registration API
✅ Notification permission request
✅ Achievement award triggers notification
✅ Web-push library integrated
✅ VAPID keys configured

**Ready to use!** Just add the VAPID keys to your `.env.local` file and restart your dev server. Push notifications will work for both in-app and background notifications!
