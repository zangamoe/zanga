-- Add custom slugs for SEO-friendly URLs
ALTER TABLE series ADD COLUMN IF NOT EXISTS custom_slug TEXT UNIQUE;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS custom_slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_series_custom_slug ON series(custom_slug);
CREATE INDEX IF NOT EXISTS idx_authors_custom_slug ON authors(custom_slug);

-- Page builder for custom pages
CREATE TABLE IF NOT EXISTS page_builder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_blocks JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for page_builder
ALTER TABLE page_builder ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages viewable by everyone" ON page_builder 
FOR SELECT 
USING (published = true);

CREATE POLICY "Admins can manage pages" ON page_builder 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Homepage sections for dynamic content organization
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  section_type TEXT NOT NULL,
  filter_criteria JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for homepage_sections
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections viewable by everyone" ON homepage_sections 
FOR SELECT 
USING (enabled = true);

CREATE POLICY "Admins can manage sections" ON homepage_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add site metadata settings if not exists
INSERT INTO site_settings (key, value, type) VALUES
  ('site_title', '"zanga"', 'text'),
  ('site_description', '"Discover professionally localized manga from aspiring Japanese authors"', 'text'),
  ('site_favicon_url', '""', 'image'),
  ('site_og_image_url', '""', 'image')
ON CONFLICT (key) DO NOTHING;