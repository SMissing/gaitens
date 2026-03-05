# Gaitens Leisure Group - Staff Portal

Internal staff portal web application for Gaitens Leisure Group.

## 🚀 Deployment

**Note:** This is a Next.js application with server-side features. GitHub Pages will only show the README file. 

**Recommended:** Deploy to [Vercel](https://vercel.com) for the best Next.js experience:
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically on every push

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Database & Authentication)
- **Zod** (Validation)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase credentials:
- `https://ycfemtinonheyjtndyrm.supabase.co`
- `https://ycfemtinonheyjtndyrm.supabase.co

3. Set up Supabase database:

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "staffCode" TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('staff', 'manager', 'admin')),
  site TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Holiday requests table
CREATE TABLE holiday_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id),
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holiday calendar events table
CREATE TABLE holiday_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holiday', 'approved_request')),
  title TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training courses table
CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "videoUrl" TEXT,
  content TEXT,
  "quizQuestions" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training completions table
CREATE TABLE training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id),
  "courseId" UUID NOT NULL REFERENCES training_courses(id),
  "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  score INTEGER
);

-- Notices table
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[],
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  pinned BOOLEAN DEFAULT FALSE,
  "createdBy" UUID NOT NULL REFERENCES users(id)
);

-- Grievances table
CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'resolved')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'implemented', 'rejected')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee votes table
CREATE TABLE employee_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "voterId" UUID NOT NULL REFERENCES users(id),
  "nomineeId" UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  month TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("voterId", month)
);

-- Employee winners table
CREATE TABLE employee_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id),
  month TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdBy" UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees UUID[] NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_staff_code ON users("staffCode");
CREATE INDEX idx_holiday_requests_user ON holiday_requests("userId");
CREATE INDEX idx_training_completions_user ON training_completions("userId");
CREATE INDEX idx_notices_expires ON notices("expiresAt");
CREATE INDEX idx_employee_votes_month ON employee_votes(month);
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /login          - Login page
  /dashboard      - Main dashboard
  /handbook       - Staff handbook
  /holidays       - Holiday management
  /training       - Training system
  /notices        - Notice board
  /ideas          - Ideas submission
  /employee-of-the-month - Voting system
  /grievance      - Grievance form
  /businesses     - Business information
  /social         - Social feed
  /manager        - Manager tools
  /staff          - Staff management
  /meetings       - Meeting management
/components
  /forms          - Form components
  /layout         - Layout components
  /ui             - UI components
/lib
  auth.ts         - Authentication logic
  db.ts           - Database client
  validation.ts   - Zod schemas
/types
  database.ts     - TypeScript types
```

## Authentication

Users log in using a **4-digit numeric code**. The system includes:
- Lock after 5 failed attempts for 5 minutes
- Name confirmation before login
- 8-hour session duration

## Features

- ✅ Staff login with 4-digit code
- ✅ Dashboard with overview
- 🚧 Manager staff creation
- 🚧 Handbook viewing
- 🚧 Holiday requests
- 🚧 Training system
- 🚧 Notice board
- 🚧 Grievance form
- 🚧 Ideas submission
- 🚧 Employee of the month
- 🚧 Social feed
- 🚧 Business information
- 🚧 Manager meeting tool

## Development

This project uses:
- React Server Components where appropriate
- TypeScript for type safety
- TailwindCSS for styling
- Zod for validation
- Supabase for backend services

Keep code simple, modular, and beginner-friendly.
