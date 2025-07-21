#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BUNDLE_SIZE_BUDGET = 500 * 1024; // 500 KiB in bytes
const WARNING_THRESHOLD = 0.8; // 80% of budget

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function findBuildDirectory() {
  // Try different possible build paths for Wasp
  const possiblePaths = [
    '.wasp/build/web-app/build',
    '.wasp/build/web-app/dist', 
    '.wasp/build/web-app',
    '.wasp/out/web-app/build',
    '.wasp/out/web-app/dist',
    'build',
    'dist'
  ];
  
  for (const buildPath of possiblePaths) {
    if (fs.existsSync(buildPath)) {
      console.log(`Found build directory: ${buildPath}`);
      return buildPath;
    }
  }
  
  console.error('Build directory not found. Tried paths:', possiblePaths);
  return null;
}

function analyzeBuildOutput() {
  const buildDir = findBuildDirectory();
  
  if (!buildDir) {
    console.error('No build directory found. Please run build first.');
    process.exit(1);
  }

  // Find all JS and CSS files in the build directory
  const files = [];
  
  function scanDirectory(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath, prefix + item + '/');
        } else if (item.endsWith('.js') || item.endsWith('.css')) {
          files.push({
            name: prefix + item,
            path: fullPath,
            size: stat.size,
            type: item.endsWith('.js') ? 'js' : 'css'
          });
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory ${dir}:`, error.message);
    }
  }
  
  scanDirectory(buildDir);
  
  // If no files found in main build dir, try static subdirectory
  if (files.length === 0) {
    const staticDir = path.join(buildDir, 'static');
    scanDirectory(staticDir);
  }
  
  // If still no files, try assets subdirectory
  if (files.length === 0) {
    const assetsDir = path.join(buildDir, 'assets');
    scanDirectory(assetsDir);
  }
  
  console.log(`Found ${files.length} files to analyze`);
  
  // Calculate totals
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const jsSize = files.filter(f => f.type === 'js').reduce((sum, file) => sum + file.size, 0);
  const cssSize = files.filter(f => f.type === 'css').reduce((sum, file) => sum + file.size, 0);
  
  // Find large chunks (> 100 KiB)
  const largeChunks = files.filter(f => f.size > 100 * 1024);
  
  // Determine status
  let status = 'PASSED';
  if (totalSize > BUNDLE_SIZE_BUDGET) {
    status = 'FAILED';
  } else if (totalSize > BUNDLE_SIZE_BUDGET * WARNING_THRESHOLD) {
    status = 'WARNING';
  }
  
  const budgetUsage = `${formatBytes(totalSize)} / ${formatBytes(BUNDLE_SIZE_BUDGET)} (${Math.round((totalSize / BUNDLE_SIZE_BUDGET) * 100)}%)`;
  
  return {
    status,
    totalSize: formatBytes(totalSize),
    totalSizeBytes: totalSize,
    jsSize: formatBytes(jsSize),
    cssSize: formatBytes(cssSize),
    budgetUsage,
    chunksCount: files.length,
    largeChunksCount: largeChunks.length,
    files: files.sort((a, b) => b.size - a.size),
    largeChunks: largeChunks.sort((a, b) => b.size - a.size),
    timestamp: new Date().toISOString(),
    buildDirectory: buildDir
  };
}

function generateSimpleHtmlReport(analysis) {
  const html = `<!DOCTYPE html>
<html><head><title>Bundle Analysis</title></head>
<body>
<h1>Bundle Analysis Report</h1>
<p><strong>Status:</strong> ${analysis.status}</p>
<p><strong>Total Size:</strong> ${analysis.totalSize}</p>
<p><strong>Budget Usage:</strong> ${analysis.budgetUsage}</p>
<p><strong>Build Directory:</strong> ${analysis.buildDirectory}</p>
<p><strong>Files Analyzed:</strong> ${analysis.chunksCount}</p>
<p><strong>Generated:</strong> ${new Date(analysis.timestamp).toLocaleString()}</p>
</body></html>`;
  return html;
}

function main() {
  const command = process.argv[2] || 'analyze';
  
  try {
    switch (command) {
      case 'analyze':
      case 'full':
        console.log('🔍 Analyzing bundle...');
        const analysis = analyzeBuildOutput();
        
        // Save summary for GitHub Actions
        fs.writeFileSync('bundle-analysis-summary.json', JSON.stringify(analysis, null, 2));
        
        // Generate simple reports
        const htmlReport = generateSimpleHtmlReport(analysis);
        fs.writeFileSync('bundle-stats.html', htmlReport);
        fs.writeFileSync('bundle-analyzer-detailed.html', htmlReport);
        fs.writeFileSync('bundle-report.json', JSON.stringify(analysis, null, 2));
        
        console.log(`\n📊 Bundle Analysis Complete`);
        console.log(`Status: ${analysis.status}`);
        console.log(`Total Size: ${analysis.totalSize}`);
        console.log(`Budget Usage: ${analysis.budgetUsage}`);
        console.log(`Build Directory: ${analysis.buildDirectory}`);
        console.log(`Files: ${analysis.chunksCount}`);
        console.log(`Large Chunks: ${analysis.largeChunksCount}`);
        
        if (analysis.status === 'FAILED') {
          console.log('\n❌ Bundle size exceeds budget!');
          process.exit(1);
        } else if (analysis.status === 'WARNING') {
          console.log('\n⚠️  Bundle size approaching budget limit.');
        } else {
          console.log('\n✅ Bundle size within budget.');
        }
        break;
        
      case 'compare':
        console.log('📈 Compare functionality not implemented yet');
        break;
        
      default:
        console.log('Usage: node bundle-analysis.js [analyze|compare|full]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error during bundle analysis:', error.message);
    
    // Create minimal files so workflow doesn't fail completely
    const fallbackAnalysis = {
      status: 'ERROR',
      totalSize: '0 B',
      totalSizeBytes: 0,
      budgetUsage: '0 B / 500 KiB (0%)',
      chunksCount: 0,
      largeChunksCount: 0,
      timestamp: new Date().toISOString(),
      error: error.message
    };
    
    fs.writeFileSync('bundle-analysis-summary.json', JSON.stringify(fallbackAnalysis, null, 2));
    fs.writeFileSync('bundle-stats.html', `<html><body><h1>Analysis Error</h1><p>${error.message}</p></body></html>`);
    fs.writeFileSync('bundle-analyzer-detailed.html', `<html><body><h1>Analysis Error</h1><p>${error.message}</p></body></html>`);
    fs.writeFileSync('bundle-report.json', JSON.stringify(fallbackAnalysis, null, 2));
    
    process.exit(1);
  }
}

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeBuildOutput, formatBytes };