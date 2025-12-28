-- Fixed to include id, updated_at, order_index, and is_active columns
-- Add FAQ data for Budget Calculator page
INSERT INTO faqs (id, question, answer, category, order_index, is_active, created_at, updated_at) VALUES
(
  'budget-1',
  'What is the budget calculator?',
  'The budget calculator helps you create and manage a comprehensive household budget by tracking your income, fixed expenses, variable expenses, and savings goals. It provides a clear picture of your financial health and helps identify areas for improvement.',
  'budget-calculator',
  1,
  true,
  NOW(),
  NOW()
),
(
  'budget-2',
  'How do I create an effective budget?',
  'Start by listing all sources of income, then categorize your expenses into fixed (rent, insurance) and variable (groceries, entertainment). Aim to allocate at least 20% to savings and investments, 50% to needs, and 30% to wants. Adjust these percentages based on your financial goals and circumstances.',
  'budget-calculator',
  2,
  true,
  NOW(),
  NOW()
),
(
  'budget-3',
  'What expenses should I track in my budget?',
  'Track all expenses including housing (rent/mortgage, utilities, insurance), transportation (car payments, gas, maintenance), food (groceries, dining out), healthcare, debt payments, entertainment, personal care, and savings. Don''t forget irregular expenses like annual subscriptions or seasonal costs.',
  'budget-calculator',
  3,
  true,
  NOW(),
  NOW()
),
(
  'budget-4',
  'How often should I review my budget?',
  'Review your budget monthly to track spending patterns and make adjustments. Conduct a more thorough review quarterly to assess progress toward financial goals. Annual reviews help you plan for the coming year and adjust for major life changes like job transitions, marriage, or having children.',
  'budget-calculator',
  4,
  true,
  NOW(),
  NOW()
),
(
  'budget-5',
  'What is the 50/30/20 budgeting rule?',
  'The 50/30/20 rule suggests allocating 50% of after-tax income to needs (housing, utilities, groceries), 30% to wants (entertainment, dining out, hobbies), and 20% to savings and debt repayment. This provides a simple framework, though you may need to adjust percentages based on your cost of living and financial goals.',
  'budget-calculator',
  5,
  true,
  NOW(),
  NOW()
),
(
  'budget-6',
  'How can inflation affect my budget?',
  'Inflation reduces your purchasing power over time, meaning your money buys less. As prices rise, you may need to adjust your budget allocations, reduce discretionary spending, or seek ways to increase income. Regular budget reviews help you adapt to inflationary pressures and maintain financial stability.',
  'budget-calculator',
  6,
  true,
  NOW(),
  NOW()
);
