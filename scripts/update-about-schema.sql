-- Create about_content table for storing About Us page content
CREATE TABLE IF NOT EXISTS about_content (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  social_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content for Project section
INSERT INTO about_content (id, section, title, content, social_links) VALUES 
('project', 'project', 'Project', 
'The Global Inflation Calculator is a comprehensive financial tool designed to help individuals, researchers, and financial professionals understand the impact of inflation on purchasing power over time. Our mission is to provide accurate, accessible, and easy-to-use inflation calculations across major world currencies.

We believe that understanding inflation is crucial for making informed financial decisions, whether you''re planning for retirement, analyzing historical investments, or conducting academic research. Our calculator uses official government data sources to ensure accuracy and reliability.

Our goal is to democratize access to financial data and help people better understand how economic forces affect their money over time. We are committed to providing this service free of charge while maintaining the highest standards of data accuracy and user experience.',
'[{"platform": "twitter", "url": "https://twitter.com/globalinflation", "icon": "twitter"}]'::jsonb),

('admin', 'admin', 'Admin', 
'I am a financial data analyst and software developer with over 10 years of experience in economic research and web development. I created this calculator to bridge the gap between complex economic data and practical financial understanding.

My background includes work with government statistical agencies, financial institutions, and academic research organizations. I hold degrees in Economics and Computer Science, and I am passionate about making financial data accessible to everyone.

When I''m not working on this project, I enjoy analyzing market trends, contributing to open-source projects, and sharing insights about personal finance and economic trends through various platforms.',
'[{"platform": "twitter", "url": "https://twitter.com/yourusername", "icon": "twitter"}, {"platform": "linkedin", "url": "https://linkedin.com/in/yourprofile", "icon": "linkedin"}, {"platform": "github", "url": "https://github.com/yourusername", "icon": "github"}]'::jsonb);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_about_content_section ON about_content(section);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_about_content_updated_at 
    BEFORE UPDATE ON about_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
