-- Fixed to include id, updated_at, order_index, and is_active columns
-- Add FAQ data for Charts & Analytics page
INSERT INTO faqs (id, question, answer, category, order_index, is_active, created_at, updated_at) VALUES
(
  'charts-1',
  'What inflation data do the charts show?',
  'The charts display historical inflation rates across multiple countries from 1913 to 2025, sourced from official government statistics bureaus including the US Bureau of Labor Statistics, UK Office for National Statistics, Eurostat, Statistics Canada, Australian Bureau of Statistics, and other central banks worldwide.',
  'charts',
  1,
  true,
  NOW(),
  NOW()
),
(
  'charts-2',
  'How do I compare inflation across countries?',
  'Use the interactive charts to select multiple countries and view their inflation rates side by side. The comparison feature helps you understand how different economies experience inflation differently due to monetary policy, economic conditions, and regional factors. You can filter by date range to focus on specific periods.',
  'charts',
  2,
  true,
  NOW(),
  NOW()
),
(
  'charts-3',
  'What time periods can I analyze?',
  'The charts cover inflation data from 1913 to 2025, allowing you to analyze over a century of inflation trends. You can zoom into specific periods like the Great Depression, post-war inflation, the 1970s stagflation, the 2008 financial crisis, or recent pandemic-era inflation spikes.',
  'charts',
  3,
  true,
  NOW(),
  NOW()
),
(
  'charts-4',
  'How often is the inflation data updated?',
  'The inflation data is updated monthly with the latest releases from official government sources. Historical data remains stable, while current year data is refreshed as new CPI reports are published by national statistics bureaus, typically within the first two weeks of each month.',
  'charts',
  4,
  true,
  NOW(),
  NOW()
),
(
  'charts-5',
  'Can I download or export the chart data?',
  'Yes, you can export chart data and visualizations for your own analysis or presentations. The charts are interactive and allow you to hover over data points to see specific values, making it easy to extract the information you need for research, reports, or financial planning.',
  'charts',
  5,
  true,
  NOW(),
  NOW()
);
