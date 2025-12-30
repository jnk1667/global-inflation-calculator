# Fix Production FAQ Categories

## Problem
FAQs exist in the production database but don't show up on the website because the category names don't match what the code expects.

## Root Cause
When FAQs were initially created, they used different category naming conventions (e.g., "budget-calculator", "PPP Calculator") than what the code requests (e.g., "budget", "ppp").

## Solution
Run the SQL migration script to update all category values in your PRODUCTION database.

## Steps to Fix

### Option 1: Using Supabase Dashboard SQL Editor (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your **production project** (supabase-teal-window)
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the contents of `scripts/fix-production-faq-categories.sql`
6. Paste into the SQL editor
7. Click "Run" to execute
8. Check the results - you should see a table showing the updated category counts

### Option 2: Using Supabase CLI (Alternative)

```bash
# Connect to production database
supabase link --project-ref aklzirtdgceaxcseuvsy

# Run the migration
supabase db execute --file scripts/fix-production-faq-categories.sql
```

## Expected Category Mappings

The script will update these categories:

| Old Category (Database) | New Category (Code Expects) | Page |
|------------------------|----------------------------|------|
| budget-calculator | budget | 50/30/20 Budget Calculator |
| ppp-calculator, PPP Calculator | ppp | PPP Calculator |
| salary-calculator, Salary Calculator | salary | Salary Calculator |
| retirement-calculator | retirement | Retirement Calculator |
| student-loan-calculator | student-loan | Student Loan Calculator |
| mortgage, mortgage-calculator | housing-affordability | Mortgage Calculator |
| emergency-fund-calculator | emergency-fund | Emergency Fund Calculator |
| roi-calculator | roi | ROI Calculator |

## Verification

After running the script:

1. Check the query results in Supabase to confirm categories were updated
2. Visit your live site pages:
   - https://globalinflationcalculator.com/ppp-calculator
   - https://globalinflationcalculator.com/salary-calculator
   - https://globalinflationcalculator.com/budget-calculator
3. Scroll to the FAQ section - FAQs should now appear
4. If still not working, check browser console for any error messages

## Prevention

Going forward, the admin panel at `/admin-manage-content` now uses the correct category values, so new FAQs will work automatically.

## Rollback (If Needed)

If something goes wrong, you can manually update categories back through:
1. Supabase dashboard → Table Editor → faqs table
2. Click any row to edit the category field
3. Or create a reverse migration script
