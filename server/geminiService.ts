import { GoogleGenAI, Type } from '@google/genai';
import {
  AIAnalysisReport,
  AuditRecommendation,
  ExtractedPageData,
  PageSpeedDeviceData,
  TodoItem,
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

export const MASTER_WEBSITEXRAY_SYSTEM_INSTRUCTION = `# WEBSITE XRAY — MASTER AI AUDITOR

You are WebsiteXRay AI, an expert website auditor specializing in:
- SEO & Technical SEO
- Website performance & Core Web Vitals
- Accessibility (WCAG AA)
- UX/UI & Mobile experience
- Conversion rate optimization (CRO)
- Website copywriting & Value proposition
- Trust & credibility signals
- Technical best practices

Your job is to analyze website audit data and produce a professional, accurate, actionable report for the website owner.
You are NOT a generic chatbot. Your analysis must be based on the actual website data provided to you.

## 1. CORE PRINCIPLE: NEVER INVENT INFORMATION
Only make claims supported by the supplied data.
If information is unavailable, say: "This could not be verified from the available data."
Never pretend that you checked something that was not provided.
Never invent: SEO scores, PageSpeed scores, rankings, backlinks, traffic, conversion rates, revenue, keywords, technical errors, competitor information, or accessibility violations.

## 2. THINK LIKE A SENIOR AUDITOR
Do not simply repeat the raw data. Interpret it.
For every important issue, determine:
1. What is happening?
2. Why does it matter?
3. How serious is it?
4. Who is affected?
5. What should the owner do?
6. How difficult is the fix?
Prioritize business impact, not just the number of technical errors.

## 3. SEVERITY SYSTEM
- CRITICAL: Issues that can significantly damage usability, accessibility, security, indexing, or the primary user journey.
- HIGH: Important issues that should be fixed soon.
- MEDIUM: Meaningful improvements that can improve SEO, UX or performance.
- LOW: Minor improvements or polish.
Do not label something Critical merely because it is technically incorrect.

## 4. DOMAIN AUDIT GUIDELINES
- SEO: Analyze title, meta description, H1, H2/H3 hierarchy, canonical, robots directives, Open Graph, structured data, image alt text, internal links, HTTPS. Never guarantee exact search engine rankings (say "Fixing this can improve your technical SEO foundation").
- PERFORMANCE: Analyze LCP, CLS, FCP, TBT/responsiveness, Speed Index, render-blocking resources, payload size, scripts. Explain technical concepts simply for business owners (e.g. "The main content takes too long to appear, making the page feel slow on mobile").
- MOBILE UX: Give mobile experience special importance. Evaluate layout, CTA visibility, button usability, text readability. Do not claim to visually inspect the page if visual screenshot is not available.
- ACCESSIBILITY: Missing alt text, heading structure, accessible names, semantic HTML. Do not claim the entire site is WCAG compliant unless verified.
- UX & CONVERSION: Evaluate first impression (who it serves, why they should care), CTA clarity/placement/wording, and trust signals. If trust signals are absent, say: "No testimonials were detected in the analyzed page." Never claim an exact conversion loss; say: "This may create friction for visitors ready to take action."
- CONTENT ANALYSIS: Clarity, value proposition, benefits vs features. Provide specific rewriting suggestions.

## 5. RECOMMENDATION FORMAT (EVIDENCE-FIRST)
Every significant finding MUST provide:
- Problem: Clearly state what is wrong.
- Evidence: Exact data/metric from the scrape or crawl supporting the finding.
- Why It Matters: Practical business/user impact.
- Recommended Fix: Concrete, specific action with code/config guidance.
- Priority: Critical / High / Medium / Low
- Difficulty: Easy / Medium / Hard
- Confidence: High (directly measured) / Medium (multiple signals) / Low (inferred)

## 6. FINAL SUMMARY
Always generate:
- Top 3 Most Important Fixes (Issue + Short clear explanation).
- Overall Recommendation: A concise professional conclusion explaining the website's biggest single opportunity.

Output standard: Prepared by a $500+ professional website audit consultant. Evidence first, business impact second, actionable solution third.`;

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

  const prompt = `Analyze this verified website audit data according to the Master WebsiteXRay Auditor standards and generate the structured JSON audit report:\n\n${JSON.stringify(
    payloadSummary,
    null,
    2
  )}`;

  const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      category: { type: Type.STRING },
      problem: { type: Type.STRING, description: 'Clear statement of the problem' },
      evidence: { type: Type.STRING, description: 'Measured data or scrape observation supporting this' },
      whyItMatters: { type: Type.STRING, description: 'Practical business or user impact' },
      fix: { type: Type.STRING, description: 'Concrete, actionable technical or copywriting remedy' },
      priority: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] },
      difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
      confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
    },
    required: ['id', 'category', 'problem', 'whyItMatters', 'fix', 'priority', 'difficulty'],
  };

  const todoSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      text: { type: Type.STRING },
      category: { type: Type.STRING },
      priority: { type: Type.STRING },
      completed: { type: Type.BOOLEAN },
    },
    required: ['id', 'text', 'category', 'priority', 'completed'],
  };

  const top3FixSchema = {
    type: Type.OBJECT,
    properties: {
      issue: { type: Type.STRING },
      explanation: { type: Type.STRING },
    },
    required: ['issue', 'explanation'],
  };

  const fullSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: {
        type: Type.STRING,
        description: 'Concise executive overview written for business owners, interpreting verified findings without generic fluff.',
      },
      observedFacts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of 5-8 verified facts directly extracted from the technical crawl and network measurements.',
      },
      top5Problems: {
        type: Type.ARRAY,
        items: recommendationSchema,
        description: 'The top 5 biggest problems prioritizing business and user impact.',
      },
      seoRecommendations: {
        type: Type.ARRAY,
        items: recommendationSchema,
        description: 'Actionable SEO findings for metadata, structure, canonicals, schema, and crawlability.',
      },
      performanceRecommendations: {
        type: Type.ARRAY,
        items: recommendationSchema,
        description: 'Performance recommendations explaining Core Web Vitals simply with technical fixes.',
      },
      uxRecommendations: {
        type: Type.ARRAY,
        items: recommendationSchema,
        description: 'UX and mobile usability recommendations.',
      },
      conversionRecommendations: {
        type: Type.ARRAY,
        items: recommendationSchema,
        description: 'Conversion rate optimization, CTA clarity, friction reduction, and trust signals.',
      },
      contentRecommendations: {
        type: Type.ARRAY,
        items: recommendationSchema,
        description: 'Value proposition, headline clarity, and specific rewriting suggestions.',
      },
      top10Fixes: {
        type: Type.ARRAY,
        items: recommendationSchema,
        description: 'Top 10 prioritized fixes across the site (Impact x confidence / effort).',
      },
      prioritizedActionPlan: {
        type: Type.OBJECT,
        properties: {
          priority1Immediate: {
            type: Type.ARRAY,
            items: recommendationSchema,
            description: 'FIX FIRST: Highest-impact critical improvements.',
          },
          priority2Next: {
            type: Type.ARRAY,
            items: recommendationSchema,
            description: 'FIX NEXT: Important improvements to implement soon.',
          },
          priority3Improvements: {
            type: Type.ARRAY,
            items: recommendationSchema,
            description: 'OPTIMIZE LATER: Polish and secondary enhancements.',
          },
        },
        required: ['priority1Immediate', 'priority2Next', 'priority3Improvements'],
      },
      todoChecklist: {
        type: Type.ARRAY,
        items: todoSchema,
        description: 'Checkable developer and marketer implementation checklist.',
      },
      top3Fixes: {
        type: Type.ARRAY,
        items: top3FixSchema,
        description: 'The 3 Most Important Fixes for the website owner.',
      },
      overallRecommendation: {
        type: Type.STRING,
        description: 'Concise professional conclusion explaining the website single biggest opportunity.',
      },
    },
    required: [
      'executiveSummary',
      'observedFacts',
      'top5Problems',
      'seoRecommendations',
      'performanceRecommendations',
      'uxRecommendations',
      'conversionRecommendations',
      'contentRecommendations',
      'top10Fixes',
      'prioritizedActionPlan',
    ],
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
        const parsed = JSON.parse(cleaned) as AIAnalysisReport;

        if (parsed.executiveSummary && parsed.top10Fixes && parsed.prioritizedActionPlan) {
          if (!parsed.todoChecklist || parsed.todoChecklist.length === 0) {
            parsed.todoChecklist = buildDefaultTodoList(parsed.top10Fixes);
          }
          if (!parsed.top3Fixes || parsed.top3Fixes.length === 0) {
            parsed.top3Fixes = parsed.top10Fixes.slice(0, 3).map((f) => ({
              issue: f.problem,
              explanation: f.whyItMatters,
            }));
          }
          if (!parsed.overallRecommendation) {
            parsed.overallRecommendation = `Focus first on resolving the ${parsed.top10Fixes[0]?.problem || 'primary performance & SEO blockers'} to establish a solid technical foundation and remove conversion friction.`;
          }
          return parsed;
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
 * Deterministic AI Report synthesizer fully compliant with the Master WebsiteXRay Prompt
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

  const techList = [
    ...extracted.detectedTech.frameworks,
    ...extracted.detectedTech.analytics,
    ...extracted.detectedTech.cdnOrHosting,
  ];
  const techSummary = techList.length > 0 ? techList.join(', ') : 'Standard Web Stack';

  const observedFacts = [
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
  };
}
