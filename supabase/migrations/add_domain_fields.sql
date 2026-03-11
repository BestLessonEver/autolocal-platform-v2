-- Domain management fields for website_previews
ALTER TABLE website_previews ADD COLUMN IF NOT EXISTS domain_status text DEFAULT NULL;
-- Values: 'searching', 'registering', 'configuring_dns', 'active', 'failed'

ALTER TABLE website_previews ADD COLUMN IF NOT EXISTS domain_provider text DEFAULT NULL;
-- Values: 'namecheap', 'external' (user brought their own)

ALTER TABLE website_previews ADD COLUMN IF NOT EXISTS domain_registrar_id text DEFAULT NULL;
-- Namecheap domain ID for management

ALTER TABLE website_previews ADD COLUMN IF NOT EXISTS domain_auto_renew boolean DEFAULT true;

ALTER TABLE website_previews ADD COLUMN IF NOT EXISTS domain_expires_at timestamptz DEFAULT NULL;
