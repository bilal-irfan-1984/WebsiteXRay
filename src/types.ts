export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type IssueCategory = 'SEO' | 'Performance' | 'Accessibility' | 'UX' | 'Conversion' | 'BestPractices' | 'Security';

export interface AuditRecommendation {
  id: string;
  category: IssueCategory;
  problem: string;
  evidence?: string;
  whyItMatters: string;
  fix: string;
  priority: Severity;
  difficulty: Difficulty;
  confidence?: 'High' | 'Medium' | 'Low';
  impactScore?: number; // 1-10
  selectorOrContext?: string;
  todoItems?: string[]; // Actionable checklist to-dos
}

export interface CoreWebVitals {
  fcp: { value: number; unit: string; score: number; label: string };
  lcp: { value: number; unit: string; score: number; label: string };
  cls: { value: number; unit: string; score: number; label: string };
  tbt: { value: number; unit: string; score: number; label: string };
  speedIndex: { value: number; unit: string; score: number; label: string };
}

export interface PageSpeedDeviceData {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  vitals: CoreWebVitals;
  opportunities: Array<{
    title: string;
    description: string;
    savings?: string;
  }>;
  diagnostics: Array<{
    title: string;
    description: string;
  }>;
}

export interface DnsRecords {
  a: string[];
  aaaa: string[];
  mx: Array<{ exchange: string; priority: number }>;
  txt: string[];
  ns: string[];
  cname: string[];
  ptr?: string;
  soa?: { nsname?: string; hostmaster?: string; serial?: number };
}

export interface NetworkTiming {
  dnsLookupMs: number;
  tcpHandshakeMs: number;
  tlsHandshakeMs: number;
  ttfbMs: number;
  contentDownloadMs: number;
  totalDurationMs: number;
}

export interface SslCertificateInfo {
  valid: boolean;
  issuer: { commonName?: string; org?: string; country?: string };
  subject: { commonName?: string; org?: string };
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  cipher: string;
  sans: string[];
  isExpired: boolean;
  fingerprint256?: string;
}

export interface SecurityAuditItem {
  header: string;
  present: boolean;
  value?: string;
  rating: 'pass' | 'warn' | 'fail';
  description: string;
  recommendation: string;
}

export interface RobotsTxtInfo {
  found: boolean;
  url: string;
  statusCode: number;
  contentSnippet: string;
  sitemapsDeclared: string[];
  rules: Array<{ userAgent: string; disallow: string[]; allow: string[]; crawlDelay?: string }>;
}

export interface SitemapInfo {
  found: boolean;
  url: string;
  statusCode: number;
  type: 'index' | 'urlset' | 'unknown';
  estimatedUrls: number;
  sampleUrls: string[];
}

export interface DomMetrics {
  totalNodes: number;
  maxDepth: number;
  textToHtmlRatio: number;
  htmlLengthBytes: number;
  textLengthChars: number;
}

export interface HeadingItem {
  level: number;
  text: string;
  warning?: string;
}

export interface SerpPreview {
  desktopTitleSnippet: string;
  mobileTitleSnippet: string;
  metaDescriptionSnippet: string;
  urlDisplay: string;
}

export interface ImageAuditDetail {
  total: number;
  withAlt: number;
  withoutAlt: number;
  lazyLoaded: number;
  dimensionSpecified: number;
  formats: { webp: number; avif: number; svg: number; png: number; jpeg: number; other: number };
  sampleMissingAlt: Array<{ src: string; context?: string }>;
  sampleImages: Array<{ src: string; alt: string; loading?: string; width?: string; height?: string }>;
}

export interface ScriptsAuditDetail {
  total: number;
  external: number;
  inline: number;
  asyncCount: number;
  deferCount: number;
  moduleCount: number;
  externalList: Array<{ src: string; domain: string; async: boolean; defer: boolean; isModule: boolean }>;
}

export interface StylesheetsAuditDetail {
  total: number;
  external: number;
  inline: number;
  fontsDetected: string[];
  externalList: Array<{ href: string; domain: string }>;
}

export interface LinksAuditDetail {
  total: number;
  internalCount: number;
  externalCount: number;
  nofollowCount: number;
  blankWithoutNoopenerCount: number;
  hasTelOrMailto: boolean;
  sampleExternalDomains: string[];
}

export interface StructuredDataSchema {
  type: string;
  rawJson: string;
  parsed: Record<string, unknown>;
}

export interface TechStackCategory {
  name: string;
  category: string;
  version?: string;
  confidence: 'High' | 'Medium';
  description?: string;
}

export interface ResponseHeaderItem {
  name: string;
  value: string;
  category: 'security' | 'caching' | 'server' | 'content' | 'other';
}

export interface RedirectHop {
  url: string;
  status: number;
  durationMs?: number;
}

export interface JsDiagnosticItem {
  id: string;
  type: 'js_error' | 'syntax_error' | 'deprecated_api' | 'render_blocking' | 'heavy_script' | 'unhandled_promise' | 'csp_violation';
  severity: 'error' | 'warning' | 'info';
  title: string;
  source: string;
  line?: number;
  message: string;
  impact: string; // Explains why metric is lower (e.g. "Blocks DOM parser by 320ms, directly increasing LCP & TBT")
  metricAffected: 'Performance' | 'SEO' | 'BestPractices' | 'Security' | 'Accessibility';
  scoreImpactEst: number;
  recommendation: string;
  codeSnippet?: string;
}

export interface NetworkWarningItem {
  id: string;
  type: 'slow_ttfb' | 'redirect_chain' | 'missing_compression' | 'mixed_content' | 'cors_issue' | 'dns_latency' | 'ssl_weakness' | 'missing_hsts' | 'oversized_dom' | 'missing_robots' | 'asset_error';
  severity: 'error' | 'warning' | 'info';
  title: string;
  metricAffected: 'Performance' | 'SEO' | 'Security' | 'BestPractices' | 'Accessibility';
  scoreImpactEst: number;
  details: string;
  technicalContext: string;
  impact: string; // Explains why metric is lower
  suggestedFix: string;
}

export interface RuntimeCrawlerLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  phase: 'DNS' | 'TLS_HANDSHAKE' | 'HTTP_GET' | 'HTML_PARSER' | 'JS_AUDIT' | 'SECURITY_PROBE' | 'LIGHTHOUSE_CORRELATION';
  message: string;
  elapsedMs: number;
}

export interface MetricImpactSummary {
  category: 'Performance' | 'SEO' | 'BestPractices' | 'Security' | 'Accessibility';
  estimatedDeduction: number;
  reasons: string[];
  primaryFix: string;
}

export interface AuditDebuggerData {
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    noticeCount: number;
    overallHealth: 'Optimal' | 'Degraded' | 'Critical Bottlenecks';
    topRootCause: string;
    impactExplanation: string;
  };
  jsDiagnostics: JsDiagnosticItem[];
  networkWarnings: NetworkWarningItem[];
  runtimeLogs: RuntimeCrawlerLog[];
  metricImpacts: MetricImpactSummary[];
}

export interface WebTrackerItem {
  id: string;
  name: string;
  category: 'analytics' | 'advertising' | 'session_replay' | 'cdp' | 'tag_manager' | 'error_tracking' | 'crm_chat';
  extractedId?: string;
  snippet?: string;
  source: string;
  privacyImpact: 'High' | 'Medium' | 'Low';
  cookiesCreated: string[];
  consentModeCompliant: boolean;
  cookielessSupport: boolean;
  details: string;
  status: 'active' | 'passive' | 'blocked';
}

export interface ConsentAndPrivacyAudit {
  cmpDetected: string | null;
  consentModeV2: {
    configured: boolean;
    defaultState: 'denied' | 'granted' | 'not_set';
    adStorage: boolean;
    analyticsStorage: boolean;
    adUserData: boolean;
    adPersonalization: boolean;
  };
  privacyScore: number;
  privacyGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  unmaskedPiiRisk: boolean;
  piiQueryWarnings: string[];
  thirdPartyCookieWarnings: string[];
  trackingBloatScore: number;
  thirdPartyTrackersCount: number;
}

export interface LiveTrackingPoint {
  id: string;
  timestamp: string;
  url: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  dnsLookupMs: number;
  tcpConnectMs: number;
  tlsHandshakeMs: number;
  ttfbMs: number;
  contentDownloadMs: number;
  contentLengthBytes: number;
  isUp: boolean;
  ip?: string;
  server?: string;
  sslDaysRemaining?: number;
  driftStatus: 'optimal' | 'degraded' | 'down';
}

export interface WebTrackingAudit {
  trackers: WebTrackerItem[];
  privacy: ConsentAndPrivacyAudit;
  liveTelemetry: LiveTrackingPoint;
  trackingHistory: LiveTrackingPoint[];
  summary: {
    totalTrackers: number;
    advertisingPixels: number;
    analyticsTrackers: number;
    sessionRecorders: number;
    hasTagManager: boolean;
    hasConsentManagement: boolean;
    averageResponseTimeMs: number;
    uptimePercentage: number;
    trackingHealthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  };
}

export interface ExtractedPageData {
  url: string;
  normalizedUrl: string;
  title: string;
  metaDescription: string;
  canonical: string;
  robotsMeta: string;
  h1List: string[];
  h2List: string[];
  h3List: string[];
  headingStructureIssue?: string;
  headingTree?: HeadingItem[];
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
  };
  twitterCard: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    sampleMissingAlt: string[];
  };
  imagesAudit?: ImageAuditDetail;
  links: {
    internalCount: number;
    externalCount: number;
    hasTelOrMailto: boolean;
  };
  linksAudit?: LinksAuditDetail;
  ctaElements: Array<{
    text: string;
    tag: string;
    href?: string;
  }>;
  wordCount: number;
  https: boolean;
  favicon: string;
  contactInfo: {
    emails: string[];
    phones: string[];
    socialLinks: string[];
    hasContactPageLink: boolean;
  };
  trustSignals: {
    testimonialsFound: boolean;
    reviewsFound: boolean;
    guaranteesFound: boolean;
    certificationsFound: boolean;
    clientLogosFound: boolean;
    socialProofScore: number; // 0-100
  };
  structuredData: {
    typesFound: string[];
    count: number;
  };
  structuredDataSchemas?: StructuredDataSchema[];
  aboveTheFoldCopySample: string;
  // Live network & technical telemetry
  ttfbMs: number;
  contentSizeKb: number;
  httpStatus: number;
  httpStatusText?: string;
  httpVersion?: string;
  serverHeader?: string;
  contentEncoding?: string;
  ipAddress?: string;
  ipLocation?: { country?: string; isp?: string };
  rawHeaders?: Record<string, string>;
  responseHeadersList?: ResponseHeaderItem[];
  redirectChain?: RedirectHop[];
  dnsRecords?: DnsRecords;
  networkTiming?: NetworkTiming;
  ssl?: SslCertificateInfo;
  securityGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  securityScore?: number;
  securityAuditList?: SecurityAuditItem[];
  securityHeaders: {
    hsts: boolean;
    csp: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy?: boolean;
    permissionsPolicy?: boolean;
    coop?: boolean;
    corp?: boolean;
  };
  robotsTxt?: RobotsTxtInfo;
  sitemap?: SitemapInfo;
  domMetrics?: DomMetrics;
  serpPreview?: SerpPreview;
  detectedTech: {
    frameworks: string[];
    analytics: string[];
    cdnOrHosting: string[];
    cms?: string[];
    uiLibraries?: string[];
    securityAndWaf?: string[];
    paymentsAndChat?: string[];
  };
  techStackCategories?: TechStackCategory[];
  scripts: {
    total: number;
    external: number;
    inline: number;
  };
  scriptsAudit?: ScriptsAuditDetail;
  stylesheets: {
    total: number;
    external: number;
  };
  stylesheetsAudit?: StylesheetsAuditDetail;
  isWafProtected?: boolean;
  debuggerData?: AuditDebuggerData;
  trackingAudit?: WebTrackingAudit;
}

export interface ActionPlan {
  priority1Immediate: AuditRecommendation[];
  priority2Next: AuditRecommendation[];
  priority3Improvements: AuditRecommendation[];
}

export interface TodoItem {
  id: string;
  text: string;
  category: IssueCategory;
  priority: Severity;
  completed: boolean;
  recommendationId?: string;
}

export interface AIAnalysisReport {
  executiveSummary: string;
  observedFacts: string[];
  top5Problems: AuditRecommendation[];
  seoRecommendations: AuditRecommendation[];
  performanceRecommendations: AuditRecommendation[];
  uxRecommendations: AuditRecommendation[];
  conversionRecommendations: AuditRecommendation[];
  contentRecommendations: AuditRecommendation[];
  top10Fixes: AuditRecommendation[];
  prioritizedActionPlan: ActionPlan;
  todoChecklist?: TodoItem[];
  top3Fixes?: Array<{ issue: string; explanation: string }>;
  overallRecommendation?: string;
}

export interface CompetitorComparison {
  url: string;
  domain: string;
  overallScore: number;
  performanceScore: number;
  seoScore: number;
  wordCount: number;
  trustScore: number;
  ctaCount: number;
  strengths: string[];
  weaknesses: string[];
}

export interface AuditRecord {
  id: string;
  url: string;
  domain: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  isPaid?: boolean;
  userEmail?: string;
  overallScore: number;
  gradingCriteria?: 'strict' | 'standard';
  categoryScores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
    uxConversion: number;
  };
  pageSpeed: {
    mobile: PageSpeedDeviceData;
    desktop: PageSpeedDeviceData;
  };
  extractedData: ExtractedPageData;
  ruleBasedIssues: AuditRecommendation[];
  aiAnalysis: AIAnalysisReport;
  competitors?: CompetitorComparison[];
  debuggerData?: AuditDebuggerData;
  trackingAudit?: WebTrackingAudit;
}

export interface AdminStats {
  totalAudits: number;
  totalUsers: number;
  topDomains: Array<{ domain: string; count: number }>;
  recentAudits: Array<{
    id: string;
    url: string;
    overallScore: number;
    createdAt: string;
  }>;
  apiHealth: {
    geminiStatus: 'operational' | 'degraded' | 'mock';
    pageSpeedStatus: 'operational' | 'quota_fallback';
  };
}
