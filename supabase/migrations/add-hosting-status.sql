-- Add hosting_status to website_previews
-- 'preview' = free preview (server-rendered only, not deployed)
-- 'active' = hosting paid, site is deployed
-- 'expired' = subscription cancelled, site should be taken down
ALTER TABLE website_previews
  ADD COLUMN IF NOT EXISTS hosting_status TEXT DEFAULT 'preview'
    CHECK (hosting_status IN ('preview', 'active', 'expired'));

-- Add stripe_customer_id for linking to Stripe
ALTER TABLE website_previews
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Update any existing 'paid' records to 'active' (grandfather them in)
UPDATE website_previews SET hosting_status = 'active' WHERE status = 'paid';
