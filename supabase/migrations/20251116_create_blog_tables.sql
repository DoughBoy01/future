-- Create blog_authors table
CREATE TABLE IF NOT EXISTS blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,

  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create programmatic_pages table for SEO landing pages
CREATE TABLE IF NOT EXISTS programmatic_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL CHECK (page_type IN ('location', 'category', 'age', 'location_category', 'location_age', 'category_age')),
  slug TEXT UNIQUE NOT NULL,

  -- Dynamic parameters
  location TEXT,
  category TEXT,
  age_min INTEGER,
  age_max INTEGER,

  -- SEO content
  title TEXT NOT NULL,
  meta_description TEXT,
  h1_title TEXT,
  intro_content TEXT,

  -- Auto-generated or manual
  auto_generated BOOLEAN DEFAULT TRUE,

  -- Stats (updated periodically)
  camp_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_programmatic_pages_slug ON programmatic_pages(slug);
CREATE INDEX idx_programmatic_pages_type ON programmatic_pages(page_type);

-- Add RLS policies (Row Level Security)
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmatic_pages ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read active categories" ON blog_categories
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Public can read authors" ON blog_authors
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can read tags" ON blog_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can read post tags" ON blog_post_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can read programmatic pages" ON programmatic_pages
  FOR SELECT USING (TRUE);

-- Admin write access (you can customize this based on your RBAC setup)
-- For now, we'll allow authenticated users with admin role
-- You'll need to adjust this based on your existing permissions table

CREATE POLICY "Admins can manage posts" ON blog_posts
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM permissions WHERE role = 'super_admin'
    )
  );

CREATE POLICY "Admins can manage categories" ON blog_categories
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM permissions WHERE role = 'super_admin'
    )
  );

CREATE POLICY "Admins can manage authors" ON blog_authors
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM permissions WHERE role = 'super_admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_blog_authors_updated_at BEFORE UPDATE ON blog_authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default blog author (you can update this later)
INSERT INTO blog_authors (name, bio, email)
VALUES (
  'FutureEdge Team',
  'Helping families discover amazing summer camp experiences since 2024.',
  'hello@futureedge.com'
) ON CONFLICT DO NOTHING;

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, meta_description, display_order) VALUES
  ('Parent Guides', 'parent-guides', 'Helpful guides for parents choosing summer camps', 'Expert guides to help parents choose the perfect summer camp for their children.', 1),
  ('Camp Tips', 'camp-tips', 'Tips for making the most of summer camp', 'Practical tips and advice for preparing your child for summer camp success.', 2),
  ('Activity Ideas', 'activity-ideas', 'Fun summer activities and camp programs', 'Discover exciting summer camp activities and programs for kids of all ages.', 3),
  ('Local Guides', 'local-guides', 'Summer camp guides by location', 'Find the best summer camps in your area with our local guides.', 4),
  ('Camp Safety', 'camp-safety', 'Safety tips and guidelines for camps', 'Everything parents need to know about summer camp safety and security.', 5),
  ('STEM & Education', 'stem-education', 'Educational camps and STEM programs', 'Explore educational summer camps focused on STEM, coding, and learning.', 6)
ON CONFLICT (slug) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE blog_posts IS 'Blog posts for SEO content marketing';
COMMENT ON TABLE programmatic_pages IS 'Auto-generated SEO landing pages for locations, categories, and age groups';
COMMENT ON COLUMN blog_posts.seo_title IS 'Custom SEO title (defaults to post title if empty)';
COMMENT ON COLUMN blog_posts.seo_description IS 'Meta description for search engines';
COMMENT ON COLUMN programmatic_pages.auto_generated IS 'Whether page content was auto-generated or manually edited';
