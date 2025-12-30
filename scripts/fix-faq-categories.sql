-- Fix FAQ category mismatches to align with code expectations
-- This script updates category names in the database to match what the FAQ components expect

-- Update budget-calculator to budget
UPDATE faqs SET category = 'budget', updated_at = NOW()
WHERE category = 'budget-calculator';

-- Update housing-affordability to mortgage-affordability (for mortgage calculator)
UPDATE faqs SET category = 'mortgage-affordability', updated_at = NOW()
WHERE category = 'housing-affordability';

-- Verify all categories are now correct
SELECT category, COUNT(*) as count FROM faqs 
WHERE is_active = true 
GROUP BY category 
ORDER BY category;
