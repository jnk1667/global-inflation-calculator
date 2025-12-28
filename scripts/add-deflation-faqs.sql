-- Fixed to include id, updated_at, order_index, and is_active columns
-- Add FAQ data for Deflation Calculator page
INSERT INTO faqs (id, question, answer, category, order_index, is_active, created_at, updated_at) VALUES
(
  'deflation-1',
  'What is the deflation calculator?',
  'The deflation calculator helps you understand how the purchasing power of money changes over time due to deflation. It allows you to compare the value of money between different time periods, accounting for negative inflation rates.',
  'deflation',
  1,
  true,
  NOW(),
  NOW()
),
(
  'deflation-2',
  'How does deflation affect my money?',
  'During deflation, prices decrease over time, which means your money can buy more goods and services in the future. This increases the real value of your savings and fixed-income investments. However, deflation can also lead to economic challenges like reduced spending and lower business revenues.',
  'deflation',
  2,
  true,
  NOW(),
  NOW()
),
(
  'deflation-3',
  'How accurate is the deflation calculator?',
  'The calculator uses historical deflation data from reliable sources like the Bureau of Labor Statistics and Federal Reserve. While it provides accurate historical calculations, it cannot predict future deflation rates. Past performance does not guarantee future results.',
  'deflation',
  3,
  true,
  NOW(),
  NOW()
),
(
  'deflation-4',
  'What is the difference between deflation and inflation?',
  'Deflation is when prices decrease over time, making money more valuable. Inflation is when prices increase over time, making money less valuable. Both affect purchasing power but in opposite directions. The deflation calculator helps you understand periods when deflation occurred.',
  'deflation',
  4,
  true,
  NOW(),
  NOW()
);
