#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Generates comprehensive bundle analysis reports and enforces performance budgets
 */

const fs = require('fs');
const path = require('path');

// Performance budget configuration (matching vite.config.ts)
const PERFORMANCE_BUDGETS = {
  maxBundleSize: 500 * 1024, // 500 KiB in bytes
  maxChunkSize: 200 * 1024,  // 200 KiB per chunk
  maxAssetSize: 100 * 1024,  // 100 KiB per asset
  warningThreshold: 0.8,     // Warn at 80% of budget
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(1) + ' KiB';
}

function formatPercentage(value) {
  return (value * 100).toFixed(1) + '%';
}

function analyzeBundleReport() {
  const reportPath = path.join(process.cwd(), 'bundle-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error(`${colors.red}❌ Bundle report not found at ${reportPath}${colors.reset}`);
    console.log('Run the build first to generate the bundle report.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  console.log(`${colors.bold}${colors.blue}📊 Bundle Analysis Report${colors.reset}`);
  console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  console.log('');

  // Total bundle size analysis
  const totalSize = report.totalSize;
  const budgetUsage = totalSize / PERFORMANCE_BUDGETS.maxBundleSize;
  
  console.log(`${colors.bold}Total Bundle Size:${colors.reset}`);
  if (budgetUsage > 1) {
    console.log(`${colors.red}❌ ${formatBytes(totalSize)} (${formatPercentage(budgetUsage)} of budget) - EXCEEDED!${colors.reset}`);
  } else if (budgetUsage > PERFORMANCE_BUDGETS.warningThreshold) {
    console.log(`${colors.yellow}⚠️  ${formatBytes(totalSize)} (${formatPercentage(budgetUsage)} of budget) - Warning${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ ${formatBytes(totalSize)} (${formatPercentage(budgetUsage)} of budget) - OK${colors.reset}`);
  }
  
  console.log(`Budget: ${formatBytes(PERFORMANCE_BUDGETS.maxBundleSize)}`);
  console.log('');

  // Individual chunk analysis
  console.log(`${colors.bold}Chunk Analysis:${colors.reset}`);
  const chunks = report.chunks
    .filter(chunk => chunk.type === 'chunk' && chunk.size > 0)
    .sort((a, b) => b.size - a.size);

  chunks.forEach(chunk => {
    const chunkBudgetUsage = chunk.size / PERFORMANCE_BUDGETS.maxChunkSize;
    let status = '';
    let color = colors.green;
    
    if (chunkBudgetUsage > 1) {
      status = '❌ EXCEEDED';
      color = colors.red;
    } else if (chunkBudgetUsage > PERFORMANCE_BUDGETS.warningThreshold) {
      status = '⚠️  WARNING';
      color = colors.yellow;
    } else {
      status = '✅ OK';
      color = colors.green;
    }
    
    console.log(`${color}${status}${colors.reset} ${chunk.name}: ${formatBytes(chunk.size)} (${formatPercentage(chunkBudgetUsage)} of chunk budget)`);
  });

  console.log('');

  // Performance recommendations
  console.log(`${colors.bold}Performance Recommendations:${colors.reset}`);
  
  const largeChunks = chunks.filter(chunk => chunk.size > PERFORMANCE_BUDGETS.maxChunkSize * PERFORMANCE_BUDGETS.warningThreshold);
  if (largeChunks.length > 0) {
    console.log(`${colors.yellow}• Consider code splitting for large chunks:${colors.reset}`);
    largeChunks.forEach(chunk => {
      console.log(`  - ${chunk.name} (${formatBytes(chunk.size)})`);
    });
  }

  if (budgetUsage > PERFORMANCE_BUDGETS.warningThreshold) {
    console.log(`${colors.yellow}• Bundle size approaching limit - consider:${colors.reset}`);
    console.log('  - Tree shaking unused code');
    console.log('  - Lazy loading non-critical components');
    console.log('  - Using lighter alternatives for heavy libraries');
  }

  if (chunks.length > 10) {
    console.log(`${colors.yellow}• Many chunks detected (${chunks.length}) - consider:${colors.reset}`);
    console.log('  - Consolidating related chunks');
    console.log('  - Reviewing manual chunk configuration');
  }

  console.log('');

  // Generate summary for CI/CD
  const summary = {
    status: budgetUsage > 1 ? 'FAILED' : budgetUsage > PERFORMANCE_BUDGETS.warningThreshold ? 'WARNING' : 'PASSED',
    totalSize: formatBytes(totalSize),
    totalSizeBytes: totalSize,
    budgetUsage: formatPercentage(budgetUsage),
    chunksCount: chunks.length,
    largeChunksCount: largeChunks.length,
    timestamp: report.timestamp,
  };

  fs.writeFileSync('bundle-analysis-summary.json', JSON.stringify(summary, null, 2));
  console.log(`${colors.blue}📄 Summary saved to bundle-analysis-summary.json${colors.reset}`);

  // Exit with error code if budget exceeded (for CI/CD)
  if (budgetUsage > 1 && process.env.CI) {
    console.log(`${colors.red}${colors.bold}Build failed due to bundle size budget violation!${colors.reset}`);
    process.exit(1);
  }

  return summary;
}

function compareWithPrevious() {
  const currentPath = path.join(process.cwd(), 'bundle-analysis-summary.json');
  const previousPath = path.join(process.cwd(), 'bundle-analysis-previous.json');
  
  if (!fs.existsSync(currentPath)) {
    console.error(`${colors.red}❌ Current bundle analysis not found${colors.reset}`);
    return;
  }

  if (!fs.existsSync(previousPath)) {
    console.log(`${colors.yellow}ℹ️  No previous bundle analysis found for comparison${colors.reset}`);
    // Save current as previous for next comparison
    fs.copyFileSync(currentPath, previousPath);
    return;
  }

  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
  const previous = JSON.parse(fs.readFileSync(previousPath, 'utf8'));

  console.log(`${colors.bold}${colors.blue}📈 Bundle Size Comparison${colors.reset}`);
  
  const currentBytes = current.totalSizeBytes || (parseFloat(current.totalSize) * 1024);
  const previousBytes = previous.totalSizeBytes || (parseFloat(previous.totalSize) * 1024);
  const difference = currentBytes - previousBytes;
  const percentageChange = (difference / previousBytes) * 100;

  if (Math.abs(difference) < 1024) {
    console.log(`${colors.green}📊 Bundle size unchanged: ${current.totalSize}${colors.reset}`);
  } else if (difference > 0) {
    const color = percentageChange > 10 ? colors.red : colors.yellow;
    console.log(`${color}📈 Bundle size increased: ${previous.totalSize} → ${current.totalSize} (+${formatBytes(difference)}, +${percentageChange.toFixed(1)}%)${colors.reset}`);
    
    if (percentageChange > 10 && process.env.CI) {
      console.log(`${colors.red}${colors.bold}⚠️  Significant bundle size increase detected!${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}📉 Bundle size decreased: ${previous.totalSize} → ${current.totalSize} (${formatBytes(difference)}, ${percentageChange.toFixed(1)}%)${colors.reset}`);
  }

  // Update previous for next comparison
  fs.copyFileSync(currentPath, previousPath);
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      analyzeBundleReport();
      break;
    case 'compare':
      compareWithPrevious();
      break;
    case 'full':
      analyzeBundleReport();
      compareWithPrevious();
      break;
    default:
      console.log('Usage: node bundle-analysis.js [analyze|compare|full]');
      console.log('  analyze - Analyze current bundle report');
      console.log('  compare - Compare with previous build');
      console.log('  full    - Run both analyze and compare');
      process.exit(1);
  }
}

module.exports = { analyzeBundleReport, compareWithPrevious };