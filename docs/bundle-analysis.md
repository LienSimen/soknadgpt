# Bundle Analysis and Performance Budgets

This document explains how to use the bundle analysis tools and performance budget enforcement system.

## Performance Budgets

The application has the following performance budgets configured:

- **Total Bundle Size**: < 500 KiB
- **Individual Chunk Size**: < 200 KiB  
- **Asset Size**: < 100 KiB
- **Warning Threshold**: 80% of budget

## Available Commands

### Build with Analysis
```bash
# Build with bundle analysis enabled
npm run build:analyze

# Generate comprehensive bundle report
npm run bundle:report
```

### Analysis Commands
```bash
# Analyze current bundle report
npm run bundle:analyze

# Compare with previous build
npm run bundle:compare

# Run full analysis with comparison
npm run bundle:full
```

## Generated Reports

### 1. Interactive Visualizations
- `bundle-stats.html` - Treemap visualization of bundle composition
- `bundle-analyzer-detailed.html` - Detailed sunburst chart (when ANALYZE_BUNDLE=true)

### 2. Data Reports
- `bundle-report.json` - Raw bundle analysis data
- `bundle-analysis-summary.json` - Summary for CI/CD integration
- `bundle-analysis-previous.json` - Previous build data for comparison

## CI/CD Integration

The performance budget is automatically enforced in CI/CD:

1. **Pull Requests**: Bundle analysis runs automatically and comments on PRs
2. **Build Failures**: Builds fail if bundle size exceeds 500 KiB
3. **Warnings**: Alerts when approaching 80% of budget (400 KiB)
4. **Comparisons**: Tracks bundle size changes between builds

## Understanding the Reports

### Bundle Analysis Output
```
📊 Bundle Analysis Report
Generated: 12/20/2024, 10:30:00 AM

Total Bundle Size:
✅ 387.2 KiB (77.4% of budget) - OK
Budget: 500.0 KiB

Chunk Analysis:
✅ OK index-a1b2c3d4.js: 245.1 KiB (122.6% of chunk budget)
⚠️  WARNING chakra-core-e5f6g7h8.js: 89.3 KiB (44.7% of chunk budget)
✅ OK vendor-i9j0k1l2.js: 52.8 KiB (26.4% of chunk budget)
```

### Status Indicators
- ✅ **PASSED**: Bundle size within acceptable limits
- ⚠️ **WARNING**: Approaching budget limit (>80%)
- ❌ **FAILED**: Budget exceeded

## Optimization Recommendations

When bundle size warnings occur, consider:

1. **Code Splitting**: Break large chunks into smaller ones
2. **Tree Shaking**: Remove unused code imports
3. **Lazy Loading**: Load non-critical components asynchronously
4. **Library Alternatives**: Replace heavy libraries with lighter alternatives
5. **Dynamic Imports**: Use dynamic imports for conditional features

## Manual Analysis

To manually analyze bundle composition:

1. Run `npm run build:analyze`
2. Open `bundle-stats.html` in your browser
3. Explore the interactive treemap to identify large modules
4. Focus optimization efforts on the largest contributors

## Troubleshooting

### Bundle Analysis Not Generated
- Ensure the build completes successfully
- Check that `bundle-report.json` exists after build
- Verify Node.js version compatibility (requires Node 14+)

### CI Build Failures
- Check the bundle analysis summary in build logs
- Review which chunks exceeded size limits
- Consider breaking large chunks or removing unused dependencies

### Comparison Issues
- First run won't have comparison data (normal)
- Previous analysis data is stored in `bundle-analysis-previous.json`
- Delete this file to reset comparison baseline

## Configuration

Bundle analysis settings are configured in:
- `vite.config.ts` - Performance budgets and build hooks
- `scripts/bundle-analysis.js` - Analysis logic and reporting
- `.github/workflows/performance-budget.yml` - CI/CD integration

To modify performance budgets, update the `PERFORMANCE_BUDGETS` constant in both `vite.config.ts` and `scripts/bundle-analysis.js`.