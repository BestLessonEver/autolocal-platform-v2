-- AutoLocal.ai Website Previews
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS website_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  business_name text NOT NULL,
  tagline text,
  description text,
  category text NOT NULL DEFAULT 'general'
    CHECK (category IN ('salon','dental','fitness','restaurant','contractor','general')),

  -- Brand colors
  brand_color_primary text DEFAULT '#2563EB',
  brand_color_secondary text DEFAULT '#1E40AF',
  brand_color_accent text DEFAULT '#F59E0B',

  -- Media
  logo_url text,
  hero_image_url text,
  gallery_images jsonb DEFAULT '[]'::jsonb,

  -- Business data
  services jsonb DEFAULT '[]'::jsonb,
  hours jsonb DEFAULT '{}'::jsonb,
  address text,
  city text,
  state text,
  phone text,
  email text,
  website_current text,

  -- Reviews
  reviews jsonb DEFAULT '[]'::jsonb,
  google_rating numeric(2,1),
  google_review_count integer DEFAULT 0,

  -- CTA
  cta_text text DEFAULT 'Contact Us',
  cta_url text,

  -- Template & linking
  template text DEFAULT 'modern-clean',
  audit_id uuid REFERENCES audits(id) ON DELETE SET NULL,

  -- Status & tracking
  status text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  view_count integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_previews_slug ON website_previews(slug);
CREATE INDEX idx_previews_status ON website_previews(status);
CREATE INDEX idx_previews_audit ON website_previews(audit_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_preview_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER previews_updated_at
  BEFORE UPDATE ON website_previews
  FOR EACH ROW EXECUTE FUNCTION update_preview_timestamp();

-- RPC for atomic view count increment
CREATE OR REPLACE FUNCTION increment_preview_views(preview_slug text)
RETURNS void AS $$
BEGIN
  UPDATE website_previews SET view_count = view_count + 1 WHERE slug = preview_slug;
END;
$$ LANGUAGE plpgsql;
