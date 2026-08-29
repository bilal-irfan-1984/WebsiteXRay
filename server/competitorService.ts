import { CompetitorComparison } from '../src/types.js';
import { extractWebsiteData } from './crawler.js';
import { fetchPageSpeedData } from './pagespeed.js';
import { normalizeUrl, validateSafePublicUrl } from './security.js';

export async function analyzeCompetitors(competitorUrls: string[]): Promise<CompetitorComparison[]> {
  const results: CompetitorComparison[] = [];

  // Limit to max 3 competitors
  const sanitizedUrls = competitorUrls.slice(0, 3);

  for (const rawUrl of sanitizedUrls) {
    try {
      const normalized = normalizeUrl(rawUrl);
      const validation = validateSafePublicUrl(normalized);
      if (!validation.isValid || !validation.hostname) {
        continue;
      }

      const domain = validation.hostname;
      const extracted = await extractWebsiteData(normalized);
      const speed = await fetchPageSpeedData(normalized, 'mobile');

      const seoScore = Math.min(
        100,
        Math.max(
          40,
          (extracted.title ? 25 : 0) +
          (extracted.metaDescription ? 25 : 0) +
          (extracted.h1List.length > 0 ? 20 : 0) +
          (extracted.canonical ? 15 : 0) +
          (extracted.structuredData.count > 0 ? 15 : 0)
        )
      );

      const overall = Math.round(speed.performanceScore * 0.4 + seoScore * 0.4 + extracted.trustSignals.socialProofScore * 0.2);

      const strengths: string[] = [];
      const weaknesses: string[] = [];

      if (speed.performanceScore > 75) strengths.push('Fast mobile page load');
      else weaknesses.push('Slow mobile performance');

      if (extracted.metaDescription) strengths.push('Optimized search snippet');
      else weaknesses.push('Missing meta description');

      if (extracted.trustSignals.socialProofScore > 50) strengths.push('Strong customer social proof & reviews');
      else weaknesses.push('Limited visible trust & proof signals');

      if (extracted.ctaElements.length >= 1 && extracted.ctaElements.length <= 4) strengths.push('Focused clear conversion funnel');
      else if (extracted.ctaElements.length === 0) weaknesses.push('No obvious direct CTA buttons');

      results.push({
        url: normalized,
        domain,
        overallScore: overall,
        performanceScore: speed.performanceScore,
        seoScore,
        wordCount: extracted.wordCount,
        trustScore: extracted.trustSignals.socialProofScore,
        ctaCount: extracted.ctaElements.length,
        strengths,
        weaknesses,
      });
    } catch (err) {
      console.warn(`Competitor analysis skipped for ${rawUrl}:`, err);
    }
  }

  return results;
}
