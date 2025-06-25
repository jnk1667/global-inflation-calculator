-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table  
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (id, title, description, keywords, contact_email)
VALUES (
  'main',
  'Global Inflation Calculator',
  'Free inflation calculator for comparing currency values',
  'inflation calculator, currency, historical prices',
  'admin@example.com'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (optional)
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since this is admin-only)
CREATE POLICY "Allow all operations on faqs" ON faqs FOR ALL USING (true);
CREATE POLICY "Allow all operations on site_settings" ON site_settings FOR ALL USING (true);
