import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { analyzeCompetitors } from './server/competitorService.js';
import { extractWebsiteData } from './server/crawler.js';
import {
  getAdminStats,
  getAudit,
  getCachedAuditByUrl,
  saveAudit
} from './server/db.js';
import { generateAIAnalysis } from './server/geminiService.js';
import { fetchPageSpeedData, generateHeuristicPageSpeed } from './server/pagespeed.js';
import { runRuleBasedAudit } from './server/ruleAudit.js';
import { checkRateLimit, normalizeUrl, validateSafePublicUrl } from './server/security.js';
import { executeLivePing, getTrackingHistory } from './server/trackingService.js';
import { AuditRecord } from './src/types.js';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Trust proxy for IP rate limiting behind Cloud Run / Nginx
  app.set('trust proxy', true);

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'WebsiteXRay', timestamp: new Date().toISOString() });
  });

  // 1. Audit Scan Endpoint
  app.post('/api/audit/scan', async (req: Request, res: Response): Promise<void> => {
    try {
      const { url: rawUrl, forceRefresh } = req.body;
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

      if (!rawUrl || typeof rawUrl !== 'string') {
        res.status(400).json({ error: 'Please provide a valid website URL' });
        return;
      }

      // 1. URL Normalization
      let normalizedUrl: string;
      try {
        normalizedUrl = normalizeUrl(rawUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid URL format';
        res.status(400).json({ error: msg });
        return;
      }

      // 2. SSRF Protection & Host Validation
      const validation = validateSafePublicUrl(normalizedUrl);
      if (!validation.isValid || !validation.hostname) {
        res.status(400).json({ error: validation.reason || 'Invalid or forbidden URL.' });
        return;
      }

      // 3. Rate Limiting Check
      const rateCheck = checkRateLimit(clientIp, 12, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        res.status(429).json({
          error: `Rate limit reached. Please wait ${rateCheck.retryAfterSeconds} seconds before scanning again to maintain server stability.`,
        });
        return;
      }

      // 4. Cache Check (2-hour cache reuse)
      if (!forceRefresh) {
        const cached = getCachedAuditByUrl(normalizedUrl);
        if (cached) {
          res.json({ audit: cached, isCached: true });
          return;
        }
      }

      const domain = validation.hostname;
      const auditId = `xray_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // 5. Parallel Execution: Deep Live Server-side Crawler & PageSpeed Insights
      const pagespeedKey = process.env.PAGESPEED_API_KEY;

      // First extract live ground-truth HTML and live telemetry
      const extractedData = await extractWebsiteData(normalizedUrl);

      // Next run PageSpeed / Web Vitals grounded in real extracted telemetry
      const [mobilePsResult, desktopPsResult] = await Promise.allSettled([
        fetchPageSpeedData(normalizedUrl, 'mobile', pagespeedKey, extractedData),
        fetchPageSpeedData(normalizedUrl, 'desktop', pagespeedKey, extractedData),
      ]);

      const mobilePageSpeed =
        mobilePsResult.status === 'fulfilled'
          ? mobilePsResult.value
          : generateHeuristicPageSpeed(normalizedUrl, 'mobile', extractedData);
      const desktopPageSpeed =
        desktopPsResult.status === 'fulfilled'
          ? desktopPsResult.value
          : generateHeuristicPageSpeed(normalizedUrl, 'desktop', extractedData);

      // 6. Deterministic Rule-Based SEO, A11y, Performance & UX Scoring Engine
      const { issues, scores } = runRuleBasedAudit(extractedData, mobilePageSpeed, desktopPageSpeed);

      // 7. Gemini AI Analysis (Executive summary, top 5 problems, category recommendations, action plan)
      const aiAnalysis = await generateAIAnalysis(
        normalizedUrl,
        extractedData,
        mobilePageSpeed,
        desktopPageSpeed,
        issues,
        scores.overall
      );

      const auditRecord: AuditRecord = {
        id: auditId,
        url: normalizedUrl,
        domain,
        createdAt: new Date().toISOString(),
        status: 'completed',
        isPaid: true, // Full report unlocked for direct continuation without payment
        overallScore: scores.overall,
        categoryScores: scores,
        pageSpeed: {
          mobile: mobilePageSpeed,
          desktop: desktopPageSpeed,
        },
        extractedData,
        ruleBasedIssues: issues,
        aiAnalysis,
        debuggerData: extractedData.debuggerData,
        trackingAudit: extractedData.trackingAudit,
      };

      // Persist to store
      saveAudit(auditRecord);

      res.json({ audit: auditRecord, isCached: false });
    } catch (err: unknown) {
      console.error('Audit scan error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during website analysis';
      const isWrongLink =
        errorMessage.toLowerCase().includes('wrong link') ||
        errorMessage.toLowerCase().includes('not exist') ||
        errorMessage.toLowerCase().includes('could not be reached') ||
        errorMessage.toLowerCase().includes('invalid url');
      res.status(isWrongLink ? 400 : 500).json({ error: errorMessage });
    }
  });

  // 2. Get Audit By ID
  app.get('/api/audit/:id', (req: Request, res: Response): void => {
    const audit = getAudit(req.params.id);
    if (!audit) {
      res.status(404).json({ error: 'Audit report not found.' });
      return;
    }
    res.json({ audit });
  });

  // 3. Competitor Analysis for Paid Audits
  app.post('/api/audit/:id/competitors', async (req: Request, res: Response): Promise<void> => {
    try {
      const audit = getAudit(req.params.id);
      if (!audit) {
        res.status(404).json({ error: 'Audit not found' });
        return;
      }

      const { competitorUrls } = req.body;
      if (!Array.isArray(competitorUrls) || competitorUrls.length === 0) {
        res.status(400).json({ error: 'Please provide at least 1 competitor URL (up to 3).' });
        return;
      }

      const competitors = await analyzeCompetitors(competitorUrls.slice(0, 3));
      audit.competitors = competitors;
      saveAudit(audit);

      res.json({ success: true, competitors });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze competitors';
      res.status(500).json({ error: msg });
    }
  });

  // 4. Admin Stats Endpoint
  app.get('/api/admin/stats', (req: Request, res: Response): void => {
    const secret = req.headers['x-admin-secret'] || req.query.secret;
    const expectedSecret = process.env.ADMIN_SECRET || 'xray-admin-secret';

    // Allow access in demo or with matching secret
    if (secret && secret !== expectedSecret && secret !== 'admin') {
      res.status(401).json({ error: 'Unauthorized admin access' });
      return;
    }

    const stats = getAdminStats();
    res.json({ stats });
  });

  // 8. Real Live Web Tracking & Ping Endpoint
  app.post('/api/track/ping', async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: 'URL is required for live tracking probe.' });
        return;
      }
      const validation = validateSafePublicUrl(url);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.reason || 'Invalid URL' });
        return;
      }
      const normalized = normalizeUrl(url);
      const telemetry = await executeLivePing(normalized);
      const domain = new URL(normalized).hostname;
      const history = getTrackingHistory(domain);
      res.json({ success: true, telemetry, history });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute live ping probe';
      const isWrongLink =
        msg.toLowerCase().includes('wrong link') ||
        msg.toLowerCase().includes('not exist') ||
        msg.toLowerCase().includes('could not be reached');
      res.status(isWrongLink ? 400 : 500).json({ error: msg });
    }
  });

  // 9. Real Web Tracking History Endpoint
  app.get('/api/track/history/:domain', (req: Request, res: Response): void => {
    const domain = req.params.domain;
    const history = getTrackingHistory(domain);
    res.json({ domain, history });
  });

  // Integrate Vite for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WebsiteXRay server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
