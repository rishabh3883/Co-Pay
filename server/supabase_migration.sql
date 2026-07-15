-- Co-Pay Database Migration Schema for Supabase
-- Paste this script directly into your Supabase SQL Editor and run it!

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "personalBudget" NUMERIC DEFAULT 0,
  "phone" TEXT DEFAULT '',
  "upiId" TEXT DEFAULT '',
  "personalExpenses" JSONB DEFAULT '[]'::jsonb,
  "streaks" INTEGER DEFAULT 1,
  "badges" TEXT[] DEFAULT ARRAY['Early Payer']::TEXT[],
  "createdAt" TEXT NOT NULL
);

-- 2. Create Homes Table
CREATE TABLE IF NOT EXISTS "homes" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "inviteCode" TEXT UNIQUE NOT NULL,
  "adminId" TEXT NOT NULL,
  "monthlyBudget" NUMERIC DEFAULT 0,
  "members" TEXT[] DEFAULT '{}'::TEXT[],
  "createdAt" TEXT NOT NULL
);

-- 3. Create Expenses Table
CREATE TABLE IF NOT EXISTS "expenses" (
  "id" TEXT PRIMARY KEY,
  "homeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" NUMERIC NOT NULL,
  "paidBy" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "billImage" TEXT DEFAULT '',
  "notes" TEXT DEFAULT '',
  "status" TEXT DEFAULT 'approved',
  "approvals" TEXT[] DEFAULT '{}'::TEXT[]
);

-- 4. Create Reminders Table
CREATE TABLE IF NOT EXISTS "reminders" (
  "id" TEXT PRIMARY KEY,
  "homeId" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "phone" TEXT DEFAULT '',
  "dateTime" TEXT NOT NULL,
  "expenseTitle" TEXT DEFAULT '',
  "amount" NUMERIC DEFAULT 0,
  "deliveryStatus" TEXT DEFAULT 'Sent'
);

-- 5. Create Settlements Table
CREATE TABLE IF NOT EXISTS "settlements" (
  "id" TEXT PRIMARY KEY,
  "homeId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "amount" NUMERIC NOT NULL,
  "date" TEXT NOT NULL,
  "refId" TEXT DEFAULT '',
  "status" TEXT DEFAULT 'Pending'
);

-- Note: Row-Level Security (RLS) is disabled by default for these tables to match MongoDB's behavior.
-- If you want to enable Security policies, you can do so in the Supabase Dashboard.
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "expenses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "reminders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "settlements" DISABLE ROW LEVEL SECURITY;
