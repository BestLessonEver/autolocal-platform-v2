-- AutoLocal.ai — Required Supabase Tables
-- Run this in Supabase Dashboard → SQL Editor

-- Audit requests (from website form)
CREATE TABLE IF NOT EXISTS audit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  website text,
  city text NOT NULL,
  state text NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Completed audits
CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  city text,
  state text,
  category text,
  website_url text,
  google_place_id text,
  overall_score integer,
  data jsonb,
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  report_viewed boolean DEFAULT false,
  report_viewed_at timestamptz,
  converted boolean DEFAULT false,
  package_purchased text,
  created_at timestamptz DEFAULT now()
);

-- Outbound emails tracking
CREATE TABLE IF NOT EXISTS outbound_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES audits(id),
  to_email text NOT NULL,
  from_email text DEFAULT 'brian@autolocal.ai',
  subject text NOT NULL,
  template_used text,
  approach text,
  resend_id text,
  status text DEFAULT 'sent',
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  follow_up_number integer DEFAULT 0,
  next_follow_up_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Client onboarding data
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  owner_name text,
  email text,
  phone text,
  website text,
  city text,
  state text,
  package text,
  social_accounts jsonb,
  brand_preferences jsonb,
  status text DEFAULT 'onboarding',
  audit_id uuid REFERENCES audits(id),
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS but allow service role full access
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Service role policies (our backend)
CREATE POLICY "Service role full access" ON audit_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON audits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON outbound_emails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON clients FOR ALL USING (true) WITH CHECK (true);
