-- Fix FAQ categories in PRODUCTION database (supabase-teal-window)
-- Run this script ONLY on your production database
-- This aligns category names with what the application code expects

-- Fix budget calculator FAQs
UPDATE faqs 
SET category = 'budget' 
WHERE category = 'budget-calculator';

-- Fix PPP calculator FAQs (if stored as 'ppp-calculator' or 'PPP Calculator')
UPDATE faqs 
SET category = 'ppp' 
WHERE category IN ('ppp-calculator', 'PPP Calculator', 'PPP calculator');

-- Fix salary calculator FAQs (if stored as 'salary-calculator' or 'Salary Calculator')
UPDATE faqs 
SET category = 'salary' 
WHERE category IN ('salary-calculator', 'Salary Calculator', 'Salary calculator');

-- Fix retirement calculator FAQs
UPDATE faqs 
SET category = 'retirement' 
WHERE category IN ('retirement-calculator', 'Retirement Calculator');

-- Fix student loan calculator FAQs
UPDATE faqs 
SET category = 'student-loan' 
WHERE category IN ('student-loan-calculator', 'Student Loan Calculator');

-- Fix mortgage/housing calculator FAQs
UPDATE faqs 
SET category = 'housing-affordability' 
WHERE category IN ('mortgage', 'mortgage-calculator', 'Mortgage Calculator', 'housing');

-- Fix emergency fund calculator FAQs
UPDATE faqs 
SET category = 'emergency-fund' 
WHERE category IN ('emergency-fund-calculator', 'Emergency Fund Calculator');

-- Fix ROI calculator FAQs
UPDATE faqs 
SET category = 'roi' 
WHERE category IN ('roi-calculator', 'ROI Calculator');

-- Verify the changes
SELECT category, COUNT(*) as faq_count 
FROM faqs 
GROUP BY category 
ORDER BY category;
