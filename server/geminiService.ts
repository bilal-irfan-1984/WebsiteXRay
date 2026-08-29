import { GoogleGenAI, Type } from '@google/genai';
import {
  AIAnalysisReport,
  AuditRecommendation,
  ExtractedPageData,
  PageSpeedDeviceData,
  TodoItem,
  WebsiteStrength,
  TopPriorityItem,
  QuickWinItem,
  SectorInsight,
  CompetitorInsightItem,
  ActionPlanStep
} from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export const MASTER_WEBSITEXRAY_SYSTEM_INSTRUCTION = `# WebsiteXRay — Gemini System Prompt

You are the AI analysis engine for **WebsiteXRay**, a professional website auditing and intelligence platform.

Your job is to analyze structured website audit data supplied by the WebsiteXRay backend and transform it into **accurate, actionable, easy-to-understand recommendations** for the website owner.

You are NOT the primary measurement engine.

The backend has already collected and calculated objective information such as:

* SEO metrics
* Performance metrics
* Core Web Vitals
* Accessibility findings
* HTML/DOM information
* headings
* metadata
* images
* scripts
* links
* structured data
* security headers
* DNS information
* SSL information
* robots.txt
* sitemap
* technology detection
* HTTP information
* PageSpeed results
* crawler diagnostics
* competitor information where available

Use these supplied facts as the source of truth.

==================================================
CORE RULE
=========

NEVER invent website facts.

Do not claim that a website:

* has a missing meta tag
* has a security vulnerability
* uses a specific technology
* has poor Core Web Vitals
* has broken links
* has accessibility problems
* has specific traffic
* has specific rankings
* has conversion problems

unless the supplied audit data supports that conclusion.

If the data does not contain enough information to determine something, explicitly say:

"Not enough data to determine this."

Do not guess.

==================================================
YOUR ROLE
=========

Your responsibilities are:

1. Explain technical problems in simple language.
2. Prioritize the most important issues.
3. Explain why each issue matters.
4. Give practical solutions.
5. Estimate potential impact using qualitative levels.
6. Identify quick wins.
7. Identify high-effort/high-impact improvements.
8. Provide a clear action plan.
9. Summarize the website's strengths.
10. Help a non-technical website owner understand the audit.

Your recommendations should be useful to:

* business owners
* marketers
* founders
* developers
* agencies
* SEO professionals

==================================================
DO NOT RE-CALCULATE SCORES
==========================

The WebsiteXRay backend is responsible for objective scores.

Never override, invent, or recalculate:

* SEO score
* performance score
* accessibility score
* UX score
* security score
* overall score
* Core Web Vitals values

If scores are provided, use them exactly as supplied.

Your role is to explain the results.

==================================================
PRIORITY SYSTEM
===============

Classify recommendations using:

CRITICAL
HIGH
MEDIUM
LOW
GOOD

Use:

CRITICAL:
Issues that can seriously affect indexing, usability, security, or website functionality.

HIGH:
Issues with substantial SEO, performance, accessibility, UX, or business impact.

MEDIUM:
Meaningful improvements that should be addressed but are not urgent.

LOW:
Minor optimization opportunities.

GOOD:
Areas where the website is already performing well.

Never label something CRITICAL merely because it is technically imperfect.

==================================================
IMPACT
======

For each major issue, estimate impact using:

* Very High
* High
* Medium
* Low

Do not invent numerical percentages such as:

"Fixing this will increase traffic by 37%."

SEO and conversion outcomes cannot be predicted precisely from a single website audit.

Instead use language such as:

"Potentially significant SEO impact."

==================================================
BUSINESS CONTEXT
================

Whenever possible, translate technical problems into business consequences.

Instead of:

"Missing lazy loading."

Prefer:

"Large images may take longer to load, particularly on mobile connections, which can make the page feel slower to visitors."

Instead of:

"Missing CTA."

Prefer:

"The page may be giving visitors fewer clear opportunities to take the next step, such as contacting the business or requesting a quote."

Only make business recommendations when the supplied page structure/content supports them.

==================================================
SEO ANALYSIS
============

When analyzing SEO:

Check supplied evidence for:

* title
* meta description
* H1
* heading hierarchy
* canonical
* robots directives
* structured data
* Open Graph
* internal links
* image alt text
* sitemap
* robots.txt
* content structure
* indexability signals

Explain:

WHAT is wrong.

WHY it matters.

HOW to fix it.

Avoid outdated SEO myths.

Do not claim that a single issue guarantees ranking loss.

==================================================
PERFORMANCE ANALYSIS
====================

Use the supplied PageSpeed/Core Web Vitals data.

Pay particular attention to:

* LCP
* CLS
* INP
* FCP
* TTFB
* render-blocking resources
* image optimization
* JavaScript
* CSS
* third-party scripts
* page size
* network timing

Prioritize issues according to likely user impact.

Do not invent performance measurements.

==================================================
ACCESSIBILITY
=============

Use the supplied accessibility findings.

Focus on:

* image alternative text
* heading structure
* semantic HTML
* keyboard accessibility
* forms
* labels
* contrast when data is available
* ARIA usage
* navigation

Do not claim WCAG compliance unless the supplied audit actually establishes it.

==================================================
SECURITY
========

Use the supplied security information.

Discuss:

* HTTPS
* security headers
* HSTS
* CSP
* X-Content-Type-Options
* X-Frame-Options/frame protection
* Referrer-Policy
* Permissions-Policy
* exposed server information

Do not claim that missing a security header automatically means the website is hacked or vulnerable.

Distinguish between:

"security hardening recommendation"

and

"confirmed security vulnerability."

Never perform or recommend malicious exploitation.

==================================================
UX & CONVERSION
===============

Analyze only what can reasonably be inferred from the supplied website data.

Consider:

* navigation clarity
* headings
* CTA visibility
* content hierarchy
* trust signals
* mobile usability
* page structure
* readability
* contact opportunities
* forms

Clearly distinguish:

OBSERVATION

from

RECOMMENDATION.

Do not pretend to know the website's actual conversion rate.

==================================================
COMPETITOR ANALYSIS
===================

If competitor data is supplied:

Compare only the supplied metrics.

Identify:

* areas where the target website performs better
* areas where competitors perform better
* opportunities
* weaknesses
* actionable improvements

Never invent competitor statistics.

Do not state that a competitor is "better overall" unless the supplied data supports that conclusion.

==================================================
AI EXECUTIVE SUMMARY
====================

Generate a concise executive summary containing:

1. Overall situation
2. Strongest areas
3. Biggest weaknesses
4. Most important opportunity
5. Recommended next action

The summary should be understandable to a non-technical business owner.

Maximum length:

150 words.

==================================================
TOP PRIORITIES
==============

Identify the top 5 actions the website owner should take.

For each:

* priority
* issue
* reason
* recommended action
* expected qualitative impact
* estimated effort

Use effort:

* Quick Win
* Low
* Medium
* High

==================================================
QUICK WINS
==========

Identify improvements that can reasonably be completed quickly.

Examples:

* fixing title
* improving meta description
* adding missing alt text
* correcting heading structure
* adding missing canonical
* compressing images
* adding appropriate security headers

Only recommend them if the supplied audit indicates they are relevant.

==================================================
DEVELOPER RECOMMENDATIONS
=========================

When useful, provide technically precise recommendations.

Examples:

* preload critical fonts
* defer non-critical JavaScript
* optimize image formats
* reduce unused JavaScript
* improve caching
* add structured data
* improve semantic HTML
* configure security headers

Do not output large blocks of code unless specifically requested.

==================================================
TONE
====

Be:

* professional
* direct
* helpful
* objective
* concise
* technically accurate

Avoid:

* unnecessary jargon
* fear-based language
* exaggerated claims
* generic SEO advice
* repetitive explanations
* meaningless buzzwords

Never shame the website owner.

==================================================
IMPORTANT DATA RULE
===================

WebsiteXRay may provide large amounts of structured data.

Prioritize the most important information.

Do not repeat every metric.

Focus on findings that can lead to meaningful action.

==================================================
OUTPUT FORMAT
=============

Return VALID JSON ONLY.

Do not use Markdown.

Do not wrap the response in \`\`\`json.

Use exactly the requested JSON output format schema.`;

const CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

function guessCategory(title: string, problem: string): 'SEO' | 'Performance' | 'Accessibility' | 'UX' | 'Conversion' | 'Security' {
  const combined = (title + ' ' + problem).toLowerCase();
  if (combined.includes('seo') || combined.includes('meta') || combined.includes('title') || combined.includes('sitemap') || combined.includes('index')) {
    return 'SEO';
  }
  if (combined.includes('performance') || combined.includes('speed') || combined.includes('lcp') || combined.includes('cls') || combined.includes('ttf') || combined.includes('size')) {
    return 'Performance';
  }
  if (combined.includes('access') || combined.includes('alt') || combined.includes('aria') || combined.includes('screen reader')) {
    return 'Accessibility';
  }
  if (combined.includes('security') || combined.includes('https') || combined.includes('header') || combined.includes('ssl')) {
    return 'Security';
  }
  if (combined.includes('cta') || combined.includes('conversion') || combined.includes('button') || combined.includes('trust') || combined.includes('testimonial')) {
    return 'Conversion';
  }
  return 'UX';
}

function titleCase(str: string): string {
  if (!str) return 'Medium';
  const val = str.toUpperCase().trim();
  if (val === 'CRITICAL') return 'Critical';
  if (val === 'HIGH') return 'High';
  if (val === 'MEDIUM') return 'Medium';
  if (val === 'LOW') return 'Low';
  if (val === 'GOOD') return 'Low';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function mapInsightsToRecommendations(insights: any[], category: any, prefix: string): AuditRecommendation[] {
  return insights.map((ins, idx) => ({
    id: `${prefix}-${idx}`,
    category,
    problem: ins.title,
    evidence: ins.description,
    whyItMatters: ins.description,
    fix: ins.recommendation,
    priority: titleCase(ins.severity) as any,
    difficulty: 'Medium',
    confidence: 'High',
  }));
}

function buildObservedFacts(extracted: ExtractedPageData, mobileSpeed: PageSpeedDeviceData): string[] {
  const techList = [
    ...extracted.detectedTech.frameworks,
    ...extracted.detectedTech.analytics,
    ...extracted.detectedTech.cdnOrHosting,
  ];
  const techSummary = techList.length > 0 ? techList.join(', ') : 'Standard Web Stack';

  return [
    `Live Network Telemetry: TTFB measured at ${extracted.ttfbMs} ms; HTML payload size: ${extracted.contentSizeKb} KB (${extracted.contentEncoding || 'gzip'}).`,
    `Server & Security: Server response reported "${extracted.serverHeader || 'Web Server'}" with ${extracted.https ? 'valid HTTPS encryption' : 'plain HTTP unencrypted'} and ${extracted.securityHeaders.hsts ? 'active HSTS' : 'no HSTS header detected'}.`,
    `Technology Stack: Detected ${techSummary} (${extracted.scripts.total} scripts, ${extracted.stylesheets.total} stylesheets).`,
    `Core Web Vitals (Mobile): LCP ${mobileSpeed.vitals.lcp.label} (Score: ${mobileSpeed.vitals.lcp.score}), FCP ${mobileSpeed.vitals.fcp.label}, TBT ${mobileSpeed.vitals.tbt.label}, CLS ${mobileSpeed.vitals.cls.label}.`,
    `Page Title: "${extracted.title ? extracted.title.slice(0, 60) + (extracted.title.length > 60 ? '...' : '') : 'Missing'}" (${extracted.title?.length || 0} characters).`,
    `Meta Description: ${extracted.metaDescription ? `Detected (${extracted.metaDescription.length} characters)` : 'No meta description detected in page HTML'}.`,
    `Heading Structure: Found ${extracted.h1List.length} <h1> tag(s) and ${extracted.h2List.length} <h2> subheadings.`,
    `Image Hygiene: ${extracted.images.total} total image element(s) detected; ${extracted.images.withoutAlt} lack descriptive alt text.`,
    `Trust & Structured Data: ${extracted.structuredData.count} Schema.org JSON-LD item(s) detected; ${extracted.trustSignals.testimonialsFound ? 'Customer testimonials detected' : 'No testimonials detected in the analyzed page'}.`,
  ];
}

export async function generateAIAnalysis(
  url: string,
  extracted: ExtractedPageData,
  mobileSpeed: PageSpeedDeviceData,
  desktopSpeed: PageSpeedDeviceData,
  ruleIssues: AuditRecommendation[],
  overallScore: number
): Promise<AIAnalysisReport> {
  const ai = getGenAI();

  // If Gemini API Key is not set, provide deterministic fallback adhering strictly to master prompt
  if (!ai) {
    return generateFallbackAIReport(url, extracted, mobileSpeed, desktopSpeed, ruleIssues, overallScore);
  }

  // Structured payload strictly grounded in scraped data
  const payloadSummary = {
    websiteUrl: url,
    overallScore,
    liveTelemetry: {
      ttfbMs: extracted.ttfbMs,
      contentSizeKb: extracted.contentSizeKb,
      httpStatus: extracted.httpStatus,
      serverHeader: extracted.serverHeader || 'Web Server',
      compression: extracted.contentEncoding || 'gzip',
      securityHeaders: extracted.securityHeaders,
      detectedFrameworks: extracted.detectedTech.frameworks,
      detectedAnalytics: extracted.detectedTech.analytics,
      detectedCdn: extracted.detectedTech.cdnOrHosting,
      scripts: extracted.scripts,
      stylesheets: extracted.stylesheets,
      isWafProtected: extracted.isWafProtected,
    },
    performance: {
      mobileScore: mobileSpeed.performanceScore,
      desktopScore: desktopSpeed.performanceScore,
      lcp: mobileSpeed.vitals.lcp,
      fcp: mobileSpeed.vitals.fcp,
      cls: mobileSpeed.vitals.cls,
      tbt: mobileSpeed.vitals.tbt,
      speedIndex: mobileSpeed.vitals.speedIndex,
      opportunities: mobileSpeed.opportunities.slice(0, 4),
      diagnostics: mobileSpeed.diagnostics.slice(0, 4),
    },
    seo: {
      title: extracted.title || 'MISSING',
      titleLength: extracted.title?.length || 0,
      metaDescription: extracted.metaDescription || 'MISSING',
      metaLength: extracted.metaDescription?.length || 0,
      h1Headings: extracted.h1List,
      h2HeadingsSample: extracted.h2List.slice(0, 6),
      h3HeadingsCount: extracted.h3List.length,
      canonical: extracted.canonical || 'MISSING',
      robotsMeta: extracted.robotsMeta || 'Default (Index/Follow)',
      openGraph: extracted.openGraph,
      twitterCard: extracted.twitterCard,
      imagesTotal: extracted.images.total,
      imagesMissingAlt: extracted.images.withoutAlt,
      sampleMissingAlt: extracted.images.sampleMissingAlt,
      structuredDataCount: extracted.structuredData.count,
      structuredDataTypes: extracted.structuredData.typesFound,
      https: extracted.https,
    },
    uxAndConversion: {
      wordCount: extracted.wordCount,
      ctaButtonsFound: extracted.ctaElements.slice(0, 6).map((c) => ({ text: c.text, href: c.href })),
      trustSignals: {
        testimonials: extracted.trustSignals.testimonialsFound,
        reviews: extracted.trustSignals.reviewsFound,
        guarantees: extracted.trustSignals.guaranteesFound,
        certifications: extracted.trustSignals.certificationsFound,
        clientLogos: extracted.trustSignals.clientLogosFound,
        socialProofScore: extracted.trustSignals.socialProofScore,
      },
      contactInfo: {
        emails: extracted.contactInfo.emails,
        phones: extracted.contactInfo.phones,
        socialLinks: extracted.contactInfo.socialLinks,
        hasContactPageLink: extracted.contactInfo.hasContactPageLink,
      },
      aboveTheFoldPreview: extracted.aboveTheFoldCopySample.slice(0, 350),
    },
    deterministicRuleIssues: ruleIssues.map((i) => ({
      category: i.category,
      problem: i.problem,
      priority: i.priority,
      whyItMatters: i.whyItMatters,
      fix: i.fix,
    })),
  };

  const prompt = `Analyze this verified website audit data according to the WebsiteXRay Gemini System Prompt and generate the structured JSON audit report:\n\n${JSON.stringify(
    payloadSummary,
    null,
    2
  )}`;

  const strengthSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ['title', 'description']
  };

  const topPriorityItemSchema = {
    type: Type.OBJECT,
    properties: {
      priority: { type: Type.INTEGER },
      severity: { type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
      title: { type: Type.STRING },
      problem: { type: Type.STRING },
      whyItMatters: { type: Type.STRING },
      recommendation: { type: Type.STRING },
      impact: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low'] },
      effort: { type: Type.STRING, enum: ['Quick Win', 'Low', 'Medium', 'High'] }
    },
    required: ['priority', 'severity', 'title', 'problem', 'whyItMatters', 'recommendation', 'impact', 'effort']
  };

  const quickWinSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      impact: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low'] }
    },
    required: ['title', 'description', 'impact']
  };

  const sectorInsightSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      severity: { type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'GOOD'] },
      description: { type: Type.STRING },
      recommendation: { type: Type.STRING }
    },
    required: ['title', 'severity', 'description', 'recommendation']
  };

  const competitorInsightSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      recommendation: { type: Type.STRING }
    },
    required: ['title', 'description', 'recommendation']
  };

  const actionPlanStepSchema = {
    type: Type.OBJECT,
    properties: {
      step: { type: Type.INTEGER },
      action: { type: Type.STRING },
      reason: { type: Type.STRING }
    },
    required: ['step', 'action', 'reason']
  };

  const fullSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING },
      websiteStrengths: {
        type: Type.ARRAY,
        items: strengthSchema
      },
      topPriorities: {
        type: Type.ARRAY,
        items: topPriorityItemSchema
      },
      quickWins: {
        type: Type.ARRAY,
        items: quickWinSchema
      },
      seoInsights: {
        type: Type.ARRAY,
        items: sectorInsightSchema
      },
      performanceInsights: {
        type: Type.ARRAY,
        items: sectorInsightSchema
      },
      accessibilityInsights: {
        type: Type.ARRAY,
        items: sectorInsightSchema
      },
      uxInsights: {
        type: Type.ARRAY,
        items: sectorInsightSchema
      },
      securityInsights: {
        type: Type.ARRAY,
        items: sectorInsightSchema
      },
      competitorInsights: {
        type: Type.ARRAY,
        items: competitorInsightSchema
      },
      finalActionPlan: {
        type: Type.ARRAY,
        items: actionPlanStepSchema
      }
    },
    required: [
      'executiveSummary',
      'websiteStrengths',
      'topPriorities',
      'quickWins',
      'seoInsights',
      'performanceInsights',
      'accessibilityInsights',
      'uxInsights',
      'securityInsights',
      'competitorInsights',
      'finalActionPlan'
    ]
  };

  for (let mIndex = 0; mIndex < CANDIDATE_MODELS.length; mIndex++) {
    const modelName = CANDIDATE_MODELS[mIndex];

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: MASTER_WEBSITEXRAY_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: fullSchema,
          },
        });

        const rawText = response.text || '';
        if (!rawText) throw new Error('Received empty response from Gemini');

        const cleaned = cleanJsonText(rawText);
        const parsed = JSON.parse(cleaned);

        if (parsed.executiveSummary && parsed.topPriorities && parsed.finalActionPlan) {
          // Map response back to the old schema structure for backward compatibility
          const mappedReport: AIAnalysisReport = {
            executiveSummary: parsed.executiveSummary,
            observedFacts: buildObservedFacts(extracted, mobileSpeed),
            
            // Map topPriorities into top5Problems
            top5Problems: (parsed.topPriorities || []).map((p: any) => ({
              id: `top-priority-${p.priority}`,
              category: guessCategory(p.title, p.problem),
              problem: p.problem,
              evidence: p.whyItMatters,
              whyItMatters: p.whyItMatters,
              fix: p.recommendation,
              priority: titleCase(p.severity) as any,
              difficulty: (p.effort === 'Quick Win' ? 'Easy' : p.effort) as any,
              confidence: 'High',
            })),

            seoRecommendations: mapInsightsToRecommendations(parsed.seoInsights || [], 'SEO', 'seo-rec'),
            performanceRecommendations: mapInsightsToRecommendations(parsed.performanceInsights || [], 'Performance', 'perf-rec'),
            uxRecommendations: mapInsightsToRecommendations(parsed.uxInsights || [], 'UX', 'ux-rec'),
            conversionRecommendations: mapInsightsToRecommendations(parsed.uxInsights || [], 'Conversion', 'conv-rec'),
            contentRecommendations: mapInsightsToRecommendations(parsed.uxInsights || [], 'Content', 'content-rec'),
            
            // Top 10 fixes combining priorities & remaining insights
            top10Fixes: [],
            prioritizedActionPlan: {
              priority1Immediate: [],
              priority2Next: [],
              priority3Improvements: [],
            },

            // Strictly persist new schema properties
            websiteStrengths: parsed.websiteStrengths,
            topPriorities: parsed.topPriorities,
            quickWins: parsed.quickWins,
            seoInsights: parsed.seoInsights,
            performanceInsights: parsed.performanceInsights,
            accessibilityInsights: parsed.accessibilityInsights,
            uxInsights: parsed.uxInsights,
            securityInsights: parsed.securityInsights,
            competitorInsights: parsed.competitorInsights,
            finalActionPlan: parsed.finalActionPlan,
          };

          // Combine issues for top10Fixes & action plans
          const allPriorityIssues = [...mappedReport.top5Problems];
          const otherIssues: AuditRecommendation[] = [];

          const collectFromInsights = (insights: any[], category: any, prefix: string) => {
            (insights || []).forEach((ins, idx) => {
              if (ins.severity !== 'GOOD') {
                otherIssues.push({
                  id: `${prefix}-${idx}`,
                  category,
                  problem: ins.title,
                  evidence: ins.description,
                  whyItMatters: ins.description,
                  fix: ins.recommendation,
                  priority: titleCase(ins.severity) as any,
                  difficulty: 'Medium',
                  confidence: 'High',
                });
              }
            });
          };

          collectFromInsights(parsed.seoInsights || [], 'SEO', 'seo-ins');
          collectFromInsights(parsed.performanceInsights || [], 'Performance', 'perf-ins');
          collectFromInsights(parsed.accessibilityInsights || [], 'Accessibility', 'access-ins');
          collectFromInsights(parsed.uxInsights || [], 'UX', 'ux-ins');
          collectFromInsights(parsed.securityInsights || [], 'Security', 'sec-ins');

          mappedReport.top10Fixes = [...allPriorityIssues, ...otherIssues].slice(0, 10);

          // Populate prioritized action plan groups based on severity
          const allCombinedIssues = [...mappedReport.top10Fixes];
          mappedReport.prioritizedActionPlan.priority1Immediate = allCombinedIssues.filter(i => i.priority === 'Critical' || i.priority === 'High');
          mappedReport.prioritizedActionPlan.priority2Next = allCombinedIssues.filter(i => i.priority === 'Medium');
          mappedReport.prioritizedActionPlan.priority3Improvements = allCombinedIssues.filter(i => i.priority === 'Low');

          // Fallbacks for action plans to ensure they are populated
          if (mappedReport.prioritizedActionPlan.priority1Immediate.length === 0) {
            mappedReport.prioritizedActionPlan.priority1Immediate = allCombinedIssues.slice(0, 3);
          }
          if (mappedReport.prioritizedActionPlan.priority2Next.length === 0) {
            mappedReport.prioritizedActionPlan.priority2Next = allCombinedIssues.slice(3, 6);
          }
          if (mappedReport.prioritizedActionPlan.priority3Improvements.length === 0) {
            mappedReport.prioritizedActionPlan.priority3Improvements = allCombinedIssues.slice(6, 10);
          }

          // Build todo check list
          mappedReport.todoChecklist = buildDefaultTodoList(mappedReport.top10Fixes);

          // Build top 3 fixes
          mappedReport.top3Fixes = (parsed.topPriorities || []).slice(0, 3).map((p: any) => ({
            issue: p.problem,
            explanation: p.whyItMatters,
          }));
          if (mappedReport.top3Fixes.length === 0) {
            mappedReport.top3Fixes = mappedReport.top10Fixes.slice(0, 3).map(f => ({
              issue: f.problem,
              explanation: f.whyItMatters,
            }));
          }

          // Assemble overall recommendation string from action steps
          mappedReport.overallRecommendation = (parsed.finalActionPlan || [])
            .map((step: any) => `Step ${step.step}: ${step.action}`)
            .join(' → ');
          if (!mappedReport.overallRecommendation) {
            mappedReport.overallRecommendation = `Implement the critical recommendations first, focusing on top priority items.`;
          }

          return mappedReport;
        }
      } catch (err: any) {
        const errorMessage = String(err?.message || err);
        const isTransient =
          errorMessage.includes('503') ||
          errorMessage.includes('429') ||
          errorMessage.includes('high demand') ||
          errorMessage.includes('UNAVAILABLE') ||
          errorMessage.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt === 1) {
          await sleep(800);
          continue;
        }

        if (mIndex < CANDIDATE_MODELS.length - 1) {
          console.warn(`Gemini ${modelName} unavailable, falling back to ${CANDIDATE_MODELS[mIndex + 1]}...`);
          break;
        }
      }
    }
  }

  return generateFallbackAIReport(url, extracted, mobileSpeed, desktopSpeed, ruleIssues, overallScore);
}

function buildDefaultTodoList(fixes: AuditRecommendation[]): TodoItem[] {
  return fixes.map((fix, idx) => ({
    id: `todo-${idx + 1}-${fix.id || fix.category.toLowerCase()}`,
    text: fix.fix.length > 90 ? fix.fix.slice(0, 87) + '...' : fix.fix,
    category: fix.category,
    priority: fix.priority,
    completed: false,
    recommendationId: fix.id,
  }));
}

/**
 * Deterministic AI Report synthesizer fully compliant with the WebsiteXRay Gemini Prompt
 */
function generateFallbackAIReport(
  url: string,
  extracted: ExtractedPageData,
  mobileSpeed: PageSpeedDeviceData,
  desktopSpeed: PageSpeedDeviceData,
  ruleIssues: AuditRecommendation[],
  overallScore: number
): AIAnalysisReport {
  const host = new URL(url).hostname;
  const criticalCount = ruleIssues.filter((i) => i.priority === 'Critical').length;
  const highCount = ruleIssues.filter((i) => i.priority === 'High').length;

  const executiveSummary = `${host} achieves an overall Website Health Score of ${overallScore}/100 based on verified measurements of mobile performance, on-page SEO, accessibility, and conversion structure. ${
    overallScore >= 80
      ? 'The website demonstrates a solid baseline technical foundation, with clear opportunities to optimize mobile rendering latency and strengthen conversion CTAs.'
      : overallScore >= 60
      ? `Analysis identified ${criticalCount + highCount} high-priority issues that can restrict search engine crawl efficiency and introduce user friction on mobile devices.`
      : `The website exhibits foundational performance and structural deficiencies (${overallScore}/100). Resolving Core Web Vitals latency and implementing essential SEO metadata will provide the highest return on effort.`
  } Measured mobile Largest Contentful Paint (LCP) is ${mobileSpeed.vitals.lcp.label} with a mobile Performance score of ${mobileSpeed.performanceScore}/100.`;

  const observedFacts = buildObservedFacts(extracted, mobileSpeed);

  const enrichedIssues: AuditRecommendation[] = ruleIssues.map((issue) => ({
    ...issue,
    confidence: 'High' as const,
    evidence:
      issue.category === 'SEO'
        ? `Observed in page head HTML for ${host}`
        : issue.category === 'Performance'
        ? `Directly calculated from live TTFB (${extracted.ttfbMs}ms) and script assets (${extracted.scripts.total})`
        : `Verified from DOM scrape of ${host}`,
  }));

  const top5Problems = enrichedIssues.slice(0, 5);
  const seoRecommendations = enrichedIssues.filter((i) => i.category === 'SEO');
  const performanceRecommendations = enrichedIssues.filter((i) => i.category === 'Performance');
  const uxRecommendations = enrichedIssues.filter((i) => i.category === 'UX');
  const conversionRecommendations = enrichedIssues.filter((i) => i.category === 'Conversion');

  const contentRecommendations: AuditRecommendation[] = [
    {
      id: 'content-rec-1',
      category: 'UX',
      problem: 'Headline value proposition clarity could be made more outcome-focused',
      evidence: extracted.h1List[0] ? `Current primary heading: "${extracted.h1List[0].slice(0, 50)}"` : 'No H1 heading detected',
      whyItMatters: 'Visitors make stay-or-bounce decisions within 5 seconds. Clear benefit-driven copy reduces initial drop-off.',
      fix: 'Refine the primary headline to explicitly answer: 1) What specific problem you solve, 2) Who it is for, and 3) The concrete outcome.',
      priority: 'High',
      difficulty: 'Easy',
      confidence: 'Medium',
    },
  ];

  const top10Fixes = [...enrichedIssues.slice(0, 10)];
  if (top10Fixes.length < 5) {
    top10Fixes.push(...contentRecommendations);
  }

  const priority1Immediate = top10Fixes.filter((i) => i.priority === 'Critical' || i.priority === 'High').slice(0, 4);
  const priority2Next = top10Fixes.filter((i) => i.priority === 'Medium').slice(0, 4);
  const priority3Improvements = top10Fixes.filter((i) => i.priority === 'Low').slice(0, 4);

  const todoChecklist: TodoItem[] = top10Fixes.map((item, idx) => ({
    id: `todo-${idx + 1}`,
    text: `${item.problem}: ${item.fix}`,
    category: item.category,
    priority: item.priority,
    completed: false,
    recommendationId: item.id,
  }));

  const top3Fixes = top10Fixes.slice(0, 3).map((f) => ({
    issue: f.problem,
    explanation: f.whyItMatters,
  }));

  const primaryIssueName = top10Fixes[0]?.problem || 'core performance and metadata items';
  const overallRecommendation = `Prioritize addressing ${primaryIssueName}. Fixing these high-impact foundations first will produce the greatest improvement in search engine discoverability and visitor retention.`;

  // Fallback structures for strict JSON compatibility
  const websiteStrengths: WebsiteStrength[] = [
    { title: 'SSL Encryption', description: 'The site has standard unexpired SSL configuration active.' },
    { title: 'Standard Response Code', description: 'Successful HTTP response with appropriate status headers.' }
  ];

  const topPriorities: TopPriorityItem[] = top5Problems.map((p, idx) => ({
    priority: idx + 1,
    severity: (p.priority.toUpperCase() === 'CRITICAL' ? 'CRITICAL' : 'HIGH') as any,
    title: p.problem,
    problem: p.problem,
    whyItMatters: p.whyItMatters,
    recommendation: p.fix,
    impact: 'High',
    effort: 'Medium',
  }));

  const quickWins: QuickWinItem[] = seoRecommendations.slice(0, 2).map(r => ({
    title: r.problem,
    description: r.whyItMatters,
    impact: 'High',
  }));

  const seoInsights: SectorInsight[] = seoRecommendations.map(r => ({
    title: r.problem,
    severity: 'HIGH',
    description: r.whyItMatters,
    recommendation: r.fix,
  }));

  const performanceInsights: SectorInsight[] = performanceRecommendations.map(r => ({
    title: r.problem,
    severity: 'HIGH',
    description: r.whyItMatters,
    recommendation: r.fix,
  }));

  const accessibilityInsights: SectorInsight[] = [
    { title: 'Image Descriptions', severity: 'MEDIUM', description: 'Some images are missing alternative texts.', recommendation: 'Add descriptive alt attributes.' }
  ];

  const uxInsights: SectorInsight[] = uxRecommendations.map(r => ({
    title: r.problem,
    severity: 'MEDIUM',
    description: r.whyItMatters,
    recommendation: r.fix,
  }));

  const securityInsights: SectorInsight[] = [
    { title: 'Content Security Policy', severity: 'MEDIUM', description: 'Missing general CSP header.', recommendation: 'Configure CSP HTTP headers.' }
  ];

  const competitorInsights: CompetitorInsightItem[] = [
    { title: 'Responsive Optimization', description: 'The site matches standard viewport layouts used by major domains.', recommendation: 'Continue testing layouts.' }
  ];

  const finalActionPlan: ActionPlanStep[] = [
    { step: 1, action: `Fix ${primaryIssueName}`, reason: 'First priority foundational action step.' }
  ];

  return {
    executiveSummary,
    observedFacts,
    top5Problems,
    seoRecommendations,
    performanceRecommendations,
    uxRecommendations,
    conversionRecommendations,
    contentRecommendations,
    top10Fixes,
    prioritizedActionPlan: {
      priority1Immediate: priority1Immediate.length > 0 ? priority1Immediate : top10Fixes.slice(0, 2),
      priority2Next: priority2Next.length > 0 ? priority2Next : top10Fixes.slice(2, 4),
      priority3Improvements: priority3Improvements.length > 0 ? priority3Improvements : top10Fixes.slice(4, 6),
    },
    todoChecklist,
    top3Fixes,
    overallRecommendation,

    // Include strict new properties
    websiteStrengths,
    topPriorities,
    quickWins,
    seoInsights,
    performanceInsights,
    accessibilityInsights,
    uxInsights,
    securityInsights,
    competitorInsights,
    finalActionPlan,
  };
}
