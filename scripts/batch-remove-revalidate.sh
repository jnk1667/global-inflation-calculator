#!/bin/bash

# Remove all instances of "export const revalidate = 86400" from page files

files=(
  "app/accessibility/page.tsx"
  "app/auto-loan-calculator/page.tsx"
  "app/budget-calculator/page.tsx"
  "app/emergency-fund-calculator/page.tsx"
  "app/global-compound-interest/page.tsx"
  "app/insurance-inflation-calculator/page.tsx"
  "app/legacy-planner/page.tsx"
  "app/mortgage-calculator/page.tsx"
  "app/ppp-calculator/page.tsx"
  "app/privacy/page.tsx"
  "app/retirement-calculator/page.tsx"
  "app/roi-calculator/page.tsx"
  "app/salary-calculator/page.tsx"
  "app/salary-calculator/regional-cost-of-living/page.tsx"
  "app/student-loan-calculator/page.tsx"
  "app/terms/page.tsx"
)

count=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Remove the line containing "export const revalidate = 86400"
    sed -i '/export const revalidate = 86400/d' "$file"
    # Remove empty lines that may have been left
    sed -i '/^$/N;/^\n$/d' "$file"
    echo "✓ Updated $file"
    ((count++))
  else
    echo "✗ File not found: $file"
  fi
done

echo ""
echo "✓ Removed revalidate from $count file(s)"
echo "Google can now crawl fresh content with structured data!"
