-- Create the database tables for the inflation calculator

-- Table to store FAQ entries
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store SEO content
CREATE TABLE IF NOT EXISTS seo_content (
    id SERIAL PRIMARY KEY,
    page_slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200),
    description TEXT,
    keywords TEXT,
    og_title VARCHAR(200),
    og_description TEXT,
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store site settings
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store usage statistics
CREATE TABLE IF NOT EXISTS usage_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_calculations INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    popular_currency VARCHAR(10),
    average_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- Table to store about page content
CREATE TABLE IF NOT EXISTS about_content (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200),
    content TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default FAQ entries
INSERT INTO faqs (question, answer, category, display_order) VALUES
('What is inflation?', 'Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power over time.', 'general', 1),
('How is inflation calculated?', 'Inflation is typically measured using price indices like the Consumer Price Index (CPI), which tracks the cost of a basket of goods and services over time.', 'general', 2),
('Why does inflation matter?', 'Inflation affects your purchasing power - as prices rise, each unit of currency buys fewer goods and services than it did before.', 'general', 3),
('How accurate are these calculations?', 'Our calculations use official government inflation data and are updated regularly. However, individual experiences may vary based on spending patterns.', 'calculator', 4),
('What currencies are supported?', 'We currently support USD, EUR, GBP, CAD, AUD, CHF, JPY, and NZD with historical inflation data.', 'calculator', 5);

-- Insert default SEO content
INSERT INTO seo_content (page_slug, title, description, keywords) VALUES
('home', 'Global Inflation Calculator - Calculate Historical Purchasing Power', 'Calculate how inflation affects your money over time. Compare purchasing power across different currencies and years with our free inflation calculator.', 'inflation calculator, purchasing power, historical inflation, currency inflation'),
('about', 'About Our Inflation Calculator - Methodology and Data Sources', 'Learn about our inflation calculation methodology, data sources, and how we ensure accuracy in our historical inflation analysis.', 'inflation methodology, CPI data, inflation sources, about inflation calculator');

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Global Inflation Calculator', 'text', 'The name of the website'),
('contact_email', 'contact@inflationcalculator.com', 'email', 'Contact email address'),
('analytics_id', '', 'text', 'Google Analytics tracking ID'),
('maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode');

-- Insert default about content
INSERT INTO about_content (section_key, title, content, display_order) VALUES
('introduction', 'About Our Inflation Calculator', 'Our inflation calculator helps you understand how the purchasing power of money changes over time due to inflation. Using official government data, we provide accurate calculations for multiple currencies.', 1),
('methodology', 'Methodology & Data Sources', 'We use Consumer Price Index (CPI) data from official government sources including the U.S. Bureau of Labor Statistics, Statistics Canada, the Office for National Statistics (UK), and other national statistical agencies.', 2),
('accuracy', 'Data Accuracy', 'Our data is updated regularly and sourced from official government statistics. We strive to provide the most accurate inflation calculations possible.', 3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(date);
CREATE INDEX IF NOT EXISTS idx_about_content_active ON about_content(is_active);
