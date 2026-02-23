import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Pages to remove revalidate from
const pagesToUpdate = [
  'app/about/page.tsx',
  'app/accessibility/page.tsx',
  'app/auto-loan-calculator/page.tsx',
  'app/budget-calculator/page.tsx',
  'app/deflation-calculator/page.tsx',
  'app/emergency-fund-calculator/page.tsx',
  'app/global-compound-interest/page.tsx',
  'app/insurance-inflation-calculator/page.tsx',
  'app/legacy-planner/page.tsx',
  'app/mortgage-calculator/page.tsx',
  'app/ppp-calculator/page.tsx',
  'app/privacy/page.tsx',
  'app/retirement-calculator/page.tsx',
  'app/roi-calculator/page.tsx',
  'app/salary-calculator/page.tsx',
  'app/salary-calculator/regional-cost-of-living/page.tsx',
  'app/student-loan-calculator/page.tsx',
  'app/terms/page.tsx',
];

let updatedCount = 0;

for (const filePath of pagesToUpdate) {
  try {
    const fullPath = join(process.cwd(), filePath);
    let content = readFileSync(fullPath, 'utf8');
    
    // Remove the revalidate export line and any comments above it
    const patterns = [
      /\n\/\/ Serve from edge cache.*\nexport const revalidate = 86400\n/g,
      /\nexport const revalidate = 86400.*\n/g,
    ];
    
    let modified = false;
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, '\n');
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Updated ${filePath}`);
      updatedCount++;
    } else {
      console.log(`- Skipped ${filePath} (no revalidate found)`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
}

console.log(`\n✓ Removed revalidate from ${updatedCount} page(s)`);
console.log('Google can now crawl fresh content with structured data!');
