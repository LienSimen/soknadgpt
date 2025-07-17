import { Request, Response } from 'express';

// In-memory store for tracking violations (in production, use Redis or database)
const violationStore = new Map<string, { count: number; lastSeen: Date; details: any }>();

/**
 * Production-ready CSP violation handler
 * Tracks, alerts, and analyzes CSP violations
 */
export const handleCspReport = async (req: Request, res: Response) => {
  try {
    const report = req.body['csp-report'] || req.body;

    const violation = {
      blockedUri: report['blocked-uri'],
      documentUri: report['document-uri'],
      violatedDirective: report['violated-directive'],
      effectiveDirective: report['effective-directive'],
      originalPolicy: report['original-policy'],
      referrer: report['referrer'],
      sourceFile: report['source-file'],
      lineNumber: report['line-number'],
      columnNumber: report['column-number'],
      scriptSample: report['script-sample'],
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    };

    // Create a unique key for this type of violation
    const violationKey = `${violation.violatedDirective}:${violation.blockedUri}:${violation.sourceFile}`;

    // Track violation frequency
    const existing = violationStore.get(violationKey);
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
      existing.details = violation;
    } else {
      violationStore.set(violationKey, {
        count: 1,
        lastSeen: new Date(),
        details: violation
      });
    }

    const violationData = violationStore.get(violationKey)!;

    // Log structured violation data
    console.error('CSP Violation:', {
      key: violationKey,
      count: violationData.count,
      violation: {
        directive: violation.violatedDirective,
        blockedUri: violation.blockedUri,
        documentUri: violation.documentUri,
        sourceFile: violation.sourceFile,
        line: violation.lineNumber,
        timestamp: violation.timestamp
      }
    });

    // Alert on repeated violations (threshold: 5 occurrences)
    if (violationData.count === 5) {
      console.error('🚨 CSP ALERT: Repeated violation detected!', {
        violationKey,
        count: violationData.count,
        details: violation
      });

      // In production, send to monitoring service:
      // await sendAlert({
      //   type: 'CSP_VIOLATION_THRESHOLD',
      //   message: `CSP violation occurred ${violationData.count} times`,
      //   data: violation
      // });
    }

    // Critical violations that need immediate attention
    const criticalPatterns = [
      'script-src',
      'object-src',
      'base-uri'
    ];

    if (criticalPatterns.some(pattern => violation.violatedDirective?.includes(pattern))) {
      console.error('🔥 CRITICAL CSP VIOLATION:', violation);

      // In production, send immediate alert:
      // await sendCriticalAlert({
      //   type: 'CRITICAL_CSP_VIOLATION',
      //   violation
      // });
    }

    // Clean up old violations (keep last 1000 entries)
    if (violationStore.size > 1000) {
      const entries = Array.from(violationStore.entries());
      entries.sort((a, b) => b[1].lastSeen.getTime() - a[1].lastSeen.getTime());

      // Keep only the 800 most recent
      violationStore.clear();
      entries.slice(0, 800).forEach(([key, value]) => {
        violationStore.set(key, value);
      });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error processing CSP report:', error);
    res.status(500).end();
  }
};

/**
 * Get CSP violation statistics (for monitoring dashboard)
 */
export const getCspStats = () => {
  const stats = Array.from(violationStore.entries()).map(([key, data]) => ({
    violationKey: key,
    count: data.count,
    lastSeen: data.lastSeen,
    directive: data.details.violatedDirective,
    blockedUri: data.details.blockedUri,
    sourceFile: data.details.sourceFile
  }));

  return {
    totalViolations: stats.reduce((sum, stat) => sum + stat.count, 0),
    uniqueViolations: stats.length,
    topViolations: stats.sort((a, b) => b.count - a.count).slice(0, 10),
    recentViolations: stats.filter(stat =>
      Date.now() - stat.lastSeen.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    )
  };
};

/**
 * HTTP handler for CSP stats endpoint
 */
export const getCspStatsHandler = async (req: Request, res: Response) => {
  try {
    const stats = getCspStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting CSP stats:', error);
    res.status(500).json({ error: 'Failed to get CSP statistics' });
  }
};