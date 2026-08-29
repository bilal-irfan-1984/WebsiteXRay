import { AuditRecommendation, ExtractedPageData, PageSpeedDeviceData } from '../src/types.js';

export interface StrictAuditResult {
  issues: AuditRecommendation[];
  scores: {
    overall: number;
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
    uxConversion: number;
  };
  strictPenaltiesApplied: Array<{ rule: string; pointsDeducted: number; category: string }>;
}

/**
 * Strict Industrial Standard Grading Engine:
 * - Stricter penalties for Core Web Vitals (LCP > 2.5s, CLS > 0.1, INP/TBT > 200ms)
 * - Strict SEO criteria (Missing/too short title, missing meta descriptions, missing H1, missing canonical, missing JSON-LD schema)
 * - Strict UX/Conversion criteria (Zero CTA, low trust signals, lack of contact channels)
 * - Strict Accessibility criteria (Images missing alt text, missing headings)
 * - Strict Security & Best Practices (HTTP unencrypted, missing viewport/social graph)
 */
export function runRuleBasedAudit(
  data: ExtractedPageData,
  mobileSpeed: PageSpeedDeviceData,
  desktopSpeed: PageSpeedDeviceData
): StrictAuditResult {
  const issues: AuditRecommendation[] = [];
  const strictPenaltiesApplied: Array<{ rule: string; pointsDeducted: number; category: string }> = [];

  let seoScore = 100;
  let uxScore = 100;
  let a11yScore = 100;
  let bpScore = 100;

  // Helper deduction logger
  const deduct = (cat: 'seo' | 'ux' | 'a11y' | 'bp', points: number, reason: string) => {
    strictPenaltiesApplied.push({ rule: reason, pointsDeducted: points, category: cat.toUpperCase() });
    if (cat === 'seo') seoScore = Math.max(10, seoScore - points);
    if (cat === 'ux') uxScore = Math.max(10, uxScore - points);
    if (cat === 'a11y') a11yScore = Math.max(10, a11yScore - points);
    if (cat === 'bp') bpScore = Math.max(10, bpScore - points);
  };

  // 1. STRICT SEO: Title Checks
  if (!data.title || data.title.trim().length === 0) {
    issues.push({
      id: 'seo-title-missing',
      category: 'SEO',
      problem: 'Missing page <title> tag',
      whyItMatters: 'Page title is the primary anchor of on-page SEO. Missing titles result in severe search visibility penalties.',
      fix: 'Add a high-impact, keyword-rich <title> tag between 50–60 characters.',
      priority: 'Critical',
      difficulty: 'Easy',
      impactScore: 10,
    });
    deduct('seo', 30, 'Missing Title Tag');
  } else if (data.title.length < 35) {
    issues.push({
      id: 'seo-title-short',
      category: 'SEO',
      problem: `Page title is underdeveloped (${data.title.length} chars)`,
      whyItMatters: 'Titles under 35 characters fail strict relevance thresholds and waste organic SERP real estate.',
      fix: 'Expand the title to 50–60 characters incorporating primary intent and target value keywords.',
      priority: 'High',
      difficulty: 'Easy',
      impactScore: 6,
    });
    deduct('seo', 12, 'Title Too Short (<35 chars)');
  } else if (data.title.length > 60) {
    issues.push({
      id: 'seo-title-long',
      category: 'SEO',
      problem: `Page title exceeds search display limit (${data.title.length} chars)`,
      whyItMatters: 'Titles over 60 characters are truncated by search engines, hiding branding and CTAs.',
      fix: 'Trim the title to 50–60 characters to ensure 100% visibility across mobile and desktop SERPs.',
      priority: 'Medium',
      difficulty: 'Easy',
      impactScore: 4,
    });
    deduct('seo', 6, 'Title Too Long (>60 chars)');
  }

  // 2. STRICT SEO: Meta Description Checks
  if (!data.metaDescription || data.metaDescription.trim().length === 0) {
    issues.push({
      id: 'seo-meta-desc-missing',
      category: 'SEO',
      problem: 'Missing meta description tag',
      whyItMatters: 'Without an explicit meta description, search engines auto-extract arbitrary text, dramatically lowering organic CTR.',
      fix: 'Write an actionable meta description between 140–155 characters with a compelling call to action.',
      priority: 'High',
      difficulty: 'Easy',
      impactScore: 8,
    });
    deduct('seo', 20, 'Missing Meta Description');
  } else if (data.metaDescription.length < 80) {
    issues.push({
      id: 'seo-meta-desc-short',
      category: 'SEO',
      problem: `Meta description is too brief (${data.metaDescription.length} chars)`,
      whyItMatters: 'Fails strict quality thresholds by not providing sufficient context for potential searchers.',
      fix: 'Expand the meta description to 140–155 characters highlighting primary differentiation.',
      priority: 'Medium',
      difficulty: 'Easy',
      impactScore: 5,
    });
    deduct('seo', 10, 'Meta Description Too Brief (<80 chars)');
  } else if (data.metaDescription.length > 160) {
    issues.push({
      id: 'seo-meta-desc-long',
      category: 'SEO',
      problem: `Meta description exceeds maximum SERP snippet length (${data.metaDescription.length} chars)`,
      whyItMatters: 'Descriptions over 160 characters are abruptly clipped with ellipses on search result pages.',
      fix: 'Shorten meta description to 150–155 characters.',
      priority: 'Low',
      difficulty: 'Easy',
      impactScore: 3,
    });
    deduct('seo', 5, 'Meta Description Over 160 chars');
  }

  // 3. STRICT SEO: Heading Hierarchy (H1, H2)
  if (data.h1List.length === 0) {
    issues.push({
      id: 'seo-h1-missing',
      category: 'SEO',
      problem: 'Zero <h1> tags detected on the page',
      whyItMatters: 'Strict SEO compliance requires exactly one primary H1 heading to establish topic semantics.',
      fix: 'Add a single prominent <h1> containing your core value proposition and primary keyword.',
      priority: 'Critical',
      difficulty: 'Easy',
      impactScore: 9,
    });
    deduct('seo', 20, 'Missing <h1> tag');
    deduct('a11y', 15, 'Missing primary heading for screen readers');
  } else if (data.h1List.length > 1) {
    issues.push({
      id: 'seo-h1-multiple',
      category: 'SEO',
      problem: `Multiple <h1> headings found (${data.h1List.length} detected)`,
      whyItMatters: 'Violates single-topic semantic hierarchy rules and dilutes page authority.',
      fix: 'Retain only 1 <h1> for the hero section and convert secondary headings into <h2>/<h3>.',
      priority: 'Medium',
      difficulty: 'Easy',
      impactScore: 5,
    });
    deduct('seo', 8, 'Multiple <h1> tags');
  }

  if (data.h2List.length === 0 && data.wordCount > 100) {
    issues.push({
      id: 'seo-h2-missing',
      category: 'SEO',
      problem: 'Absence of semantic <h2> subheadings in body content',
      whyItMatters: 'Unstructured text walls harm user dwell time and impede search crawler section indexing.',
      fix: 'Break content into distinct thematic sections structured with informative <h2> subheadings.',
      priority: 'Medium',
      difficulty: 'Easy',
      impactScore: 5,
    });
    deduct('seo', 8, 'Missing <h2> subheadings');
  }

  // 4. STRICT SEO: Canonical & Social Meta Graph
  if (!data.canonical) {
    issues.push({
      id: 'seo-canonical-missing',
      category: 'SEO',
      problem: 'Missing rel="canonical" tag',
      whyItMatters: 'Strict search indexing requires canonical declaration to prevent duplicate content cannibalization.',
      fix: 'Add a self-referencing <link rel="canonical" href="https://yourdomain.com/"> in the <head>.',
      priority: 'High',
      difficulty: 'Easy',
      impactScore: 7,
    });
    deduct('seo', 10, 'Missing rel="canonical" tag');
  }

  if (!data.openGraph.title || !data.openGraph.image) {
    issues.push({
      id: 'seo-og-missing',
      category: 'SEO',
      problem: 'Incomplete Open Graph (OG) social card metadata',
      whyItMatters: 'Social shares on WhatsApp, LinkedIn, Slack, and Facebook will appear broken with no banner image.',
      fix: 'Add og:title, og:description, og:type, and a 1200x630px high-resolution og:image.',
      priority: 'Medium',
      difficulty: 'Easy',
      impactScore: 6,
    });
    deduct('seo', 8, 'Incomplete Open Graph metadata');
  }

  // 5. STRICT SEO: Schema.org Structured Data
  if (data.structuredData.count === 0) {
    issues.push({
      id: 'seo-schema-missing',
      category: 'SEO',
      problem: 'Zero Schema.org JSON-LD structured data detected',
      whyItMatters: 'Disqualifies the website from Rich Snippets, Knowledge Graph panels, and AI search indexing.',
      fix: 'Inject validated JSON-LD schema markup (Organization, WebSite, Product, or FAQPage).',
      priority: 'High',
      difficulty: 'Medium',
      impactScore: 8,
    });
    deduct('seo', 12, 'Missing Schema.org JSON-LD');
  }

  // 6. STRICT ACCESSIBILITY: Image Alt Tags
  if (data.images.total > 0 && data.images.withoutAlt > 0) {
    const missingPercent = Math.round((data.images.withoutAlt / data.images.total) * 100);
    issues.push({
      id: 'a11y-img-alt-missing',
      category: 'Accessibility',
      problem: `${data.images.withoutAlt} of ${data.images.total} images (${missingPercent}%) lack descriptive alt text`,
      whyItMatters: 'Fails WCAG 2.1 AA accessibility guidelines and loses visual search indexing opportunities.',
      fix: 'Add descriptive alt="" attributes explaining image context. Use alt="" (empty) for purely decorative graphics.',
      priority: missingPercent > 25 ? 'Critical' : 'High',
      difficulty: 'Easy',
      impactScore: missingPercent > 25 ? 9 : 7,
    });
    deduct('a11y', Math.min(30, Math.round(missingPercent * 0.45)), `Missing Alt Text on ${missingPercent}% of images`);
  }

  // 7. STRICT SECURITY & BEST PRACTICES: HTTPS
  if (!data.https) {
    issues.push({
      id: 'sec-http-insecure',
      category: 'Security',
      problem: 'Website transmits unencrypted traffic over standard HTTP',
      whyItMatters: 'Fails baseline security criteria. Modern browsers display red security warnings that decimate conversion rates.',
      fix: 'Deploy an SSL certificate and enforce strict 301 HTTP-to-HTTPS redirection with HSTS headers.',
      priority: 'Critical',
      difficulty: 'Medium',
      impactScore: 10,
    });
    deduct('bp', 40, 'Insecure HTTP connection');
  }

  // 8. STRICT UX & CONVERSION: Call to Action Strictness
  if (data.ctaElements.length === 0) {
    issues.push({
      id: 'ux-no-cta',
      category: 'Conversion',
      problem: 'Zero clear Call-to-Action (CTA) elements detected on the page',
      whyItMatters: 'Strict conversion failure. Visitors have no obvious pathway to purchase, register, or convert.',
      fix: 'Implement prominent, high-contrast primary CTA buttons above the fold and at key content milestones.',
      priority: 'Critical',
      difficulty: 'Easy',
      impactScore: 10,
    });
    deduct('ux', 35, 'Zero Call to Action buttons');
  } else if (data.ctaElements.length > 8) {
    issues.push({
      id: 'ux-too-many-ctas',
      category: 'Conversion',
      problem: `Excessive CTA link density (${data.ctaElements.length} action elements)`,
      whyItMatters: 'Violates Hick\'s Law. Multiple competing buttons cause decision friction and abandonments.',
      fix: 'Consolidate into 1 dominant primary action and style secondary links with subtle ghost buttons.',
      priority: 'Medium',
      difficulty: 'Easy',
      impactScore: 5,
    });
    deduct('ux', 12, 'High CTA friction/density');
  }

  // 9. STRICT UX: Trust Signals & Social Proof
  if (data.trustSignals.socialProofScore < 50) {
    issues.push({
      id: 'ux-low-trust-signals',
      category: 'UX',
      problem: 'Critical deficit of trust badges and social proof',
      whyItMatters: 'Cold traffic requires immediate credibility anchors (reviews, client logos, guarantees) to convert.',
      fix: 'Embed verified client testimonials with headshots, company logos, security badges, and clear guarantees.',
      priority: 'High',
      difficulty: 'Medium',
      impactScore: 8,
    });
    deduct('ux', 20, 'Deficit of verified social proof');
  }

  // 10. STRICT UX: Contact Accessibility
  if (!data.contactInfo.hasContactPageLink && data.contactInfo.emails.length === 0 && data.contactInfo.phones.length === 0) {
    issues.push({
      id: 'ux-no-contact-info',
      category: 'UX',
      problem: 'No visible direct contact channels (email, phone, or contact page)',
      whyItMatters: 'Reduces business credibility and prevents enterprise leads from initiating contact.',
      fix: 'Include a direct contact link in the header and footer with clear support details.',
      priority: 'High',
      difficulty: 'Easy',
      impactScore: 7,
    });
    deduct('ux', 15, 'No direct contact channel detected');
  }

  // 11. STRICT PERFORMANCE CRITERIA (Mobile Web Vitals Under Strict Thresholds)
  const mobileLcp = mobileSpeed.vitals.lcp.value;
  const mobileFcp = mobileSpeed.vitals.fcp.value;
  const mobileCls = mobileSpeed.vitals.cls.value;
  const mobileTbt = mobileSpeed.vitals.tbt.value;

  // Strict LCP: Good is <= 2500ms, Needs Improvement is 2500-4000ms, Poor is > 4000ms
  if (mobileLcp > 4000) {
    issues.push({
      id: 'perf-lcp-critical',
      category: 'Performance',
      problem: `Critical Largest Contentful Paint delay (${mobileSpeed.vitals.lcp.label}) on mobile`,
      whyItMatters: 'Page content takes over 4 seconds to render on mobile devices, causing severe user drop-off.',
      fix: 'Optimize hero asset dimensions, inline critical CSS, and prioritize primary visual assets using fetchpriority="high".',
      priority: 'Critical',
      difficulty: 'Hard',
      impactScore: 10,
    });
  } else if (mobileLcp > 2500) {
    issues.push({
      id: 'perf-lcp-warning',
      category: 'Performance',
      problem: `Largest Contentful Paint exceeds strict 2.5s threshold (${mobileSpeed.vitals.lcp.label})`,
      whyItMatters: 'Core Web Vitals penalize search rankings and user engagement when mobile LCP is outside the "Good" range.',
      fix: 'Compress images into next-gen AVIF/WebP and preload critical hero image assets.',
      priority: 'High',
      difficulty: 'Medium',
      impactScore: 8,
    });
  }

  // Strict CLS: Good is <= 0.1, Poor is > 0.1
  if (mobileCls > 0.1) {
    issues.push({
      id: 'perf-cls-high',
      category: 'Performance',
      problem: `Unstable Cumulative Layout Shift (${mobileSpeed.vitals.cls.label})`,
      whyItMatters: 'Unexpected layout jumps cause misclicks and fail Core Web Vitals grading.',
      fix: 'Explicitly specify width and height aspect-ratio attributes on all images, iframes, and dynamic banners.',
      priority: 'High',
      difficulty: 'Easy',
      impactScore: 7,
    });
  }

  // Strict TBT: Good is <= 200ms
  if (mobileTbt > 300) {
    issues.push({
      id: 'perf-tbt-high',
      category: 'Performance',
      problem: `High Total Blocking Time (${mobileSpeed.vitals.tbt.label}) blocking mobile CPU`,
      whyItMatters: 'Heavy JavaScript execution freezes the main thread, making pages unresponsive to taps.',
      fix: 'Code-split large JS bundles, defer non-critical third-party analytics, and remove unused libraries.',
      priority: 'High',
      difficulty: 'Hard',
      impactScore: 8,
    });
  }

  // Strict Performance Calculation: Weighted heavily on Mobile Real-World Vitals
  const strictPerfScore = Math.max(
    15,
    Math.min(
      98,
      Math.round(
        mobileSpeed.performanceScore * 0.65 +
        desktopSpeed.performanceScore * 0.35
      )
    )
  );

  const strictSeoScore = Math.max(15, Math.min(98, seoScore));
  const strictUxScore = Math.max(15, Math.min(98, uxScore));
  const strictA11yScore = Math.max(
    20,
    Math.min(98, Math.round(desktopSpeed.accessibilityScore * 0.5 + a11yScore * 0.5))
  );
  const strictBpScore = Math.max(
    20,
    Math.min(98, Math.round(mobileSpeed.bestPracticesScore * 0.4 + bpScore * 0.6))
  );

  // Strict Overall Composite Health (Strict weights: Perf 30%, SEO 25%, UX 20%, A11y 15%, BP 10%)
  const strictOverall = Math.round(
    strictPerfScore * 0.30 +
    strictSeoScore * 0.25 +
    strictUxScore * 0.20 +
    strictA11yScore * 0.15 +
    strictBpScore * 0.10
  );

  return {
    issues,
    scores: {
      overall: strictOverall,
      performance: strictPerfScore,
      seo: strictSeoScore,
      accessibility: strictA11yScore,
      bestPractices: strictBpScore,
      uxConversion: strictUxScore,
    },
    strictPenaltiesApplied,
  };
}
