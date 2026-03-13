# Database Setup Instructions

## Required SQL Scripts

Run these scripts in order in your Supabase SQL Editor:

1. **`scripts/01-create-tables.sql`** - Creates all base tables
2. **`scripts/02-create-manager-account.sql`** - Creates initial manager account (optional)
3. **`scripts/03-fix-rls-policies.sql`** - Sets up RLS policies
4. **`scripts/06-create-notice-reads-table.sql`** - Creates notice reads table (if using read/unread feature)
5. **`scripts/07-create-holiday-calendar-table.sql`** - ⚠️ **REQUIRED FOR HOLIDAY CALENDAR** - Creates calendar availability table
6. **`scripts/08-create-notices-storage.sql`** - Sets up storage bucket for notice images

## Quick Fix for Calendar Errors

If you're seeing errors about `holiday_calendar_availability` table not existing:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `scripts/07-create-holiday-calendar-table.sql`
3. Click "Run" to execute the script
4. Refresh your application

## Storage Setup for Image Uploads

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `notices`
3. Set it to **Public**
4. Run `scripts/08-create-notices-storage.sql` in SQL Editor to set up policies
