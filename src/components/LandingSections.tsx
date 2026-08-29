import React, { useState } from 'react';
import {
  Zap,
  Search,
  Eye,
  ShieldCheck,
  Target,
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  FileDown,
  Trophy,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface LandingSectionsProps {
  onOpenPricing?: (plan?: 'single' | 'pack10' | 'pack50') => void;
  onScanSample: (url: string) => void;
}

export const LandingSections: React.FC<LandingSectionsProps> = ({ onScanSample }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is WebsiteXRay really 100% free with no charges?',
      a: 'Yes! WebsiteXRay is completely free with zero charges, no subscription fees, no credit card requirements, and no paywalls. You get full access to every technical finding, prioritized to-do items, AI executive summaries, and downloadable PDF reports at no cost.',
    },
    {
      q: 'How does WebsiteXRay analyze my website?',
      a: 'WebsiteXRay performs a live server-side analysis combining real-time Core Web Vitals performance telemetry, headless DOM parsing, deterministic rule engines (checking 30+ SEO, accessibility, and UX parameters), and neural AI synthesis for prioritized business recommendations.',
    },
    {
      q: 'Can I download and share the report with my team or clients?',
      a: 'Yes! Every audit includes high-resolution executive PDF exports, an interactive checkable to-do list, shareable public links, and side-by-side competitor benchmarking matrices — completely free.',
    },
    {
      q: 'Are there limits on how many audits or competitor benchmarks I can run?',
      a: 'No artificial limits. You can scan as many public websites as you need, compare up to 3 competitors simultaneously, and export customized executive audit reports whenever you wish.',
    },
    {
      q: 'Is my data secure and private?',
      a: 'Absolutely. We only crawl publicly accessible URLs and strictly enforce SSRF protection. We never store confidential server keys or expose private network details.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1 h-3 bg-cyan-500 block"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Seamless 3-Step Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
            How WebsiteXRay Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            No complex setups, Chrome extensions, or long waitlists. Get actionable insights in under a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 relative group hover:border-cyan-500/40 transition-colors">
            <span className="text-5xl font-black font-mono text-white/5 absolute top-4 right-5 select-none">01</span>
            <div className="p-3 rounded-sm bg-white/5 border border-white/10 text-cyan-400 w-fit mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-white mb-2">Enter Any Public URL</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input your homepage, landing page, or SaaS domain. Our crawler extracts performance signals, DOM metadata, and user conversion funnels.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 relative group hover:border-cyan-500/40 transition-colors">
            <span className="text-5xl font-black font-mono text-white/5 absolute top-4 right-5 select-none">02</span>
            <div className="p-3 rounded-sm bg-white/5 border border-white/10 text-cyan-400 w-fit mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-white mb-2">AI & Rule-Based Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time Core Web Vitals telemetry and 30+ technical checks are analyzed by the neural AI engine to identify exact problems, business impact, and concrete code fixes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 relative group hover:border-cyan-500/40 transition-colors">
            <span className="text-5xl font-black font-mono text-white/5 absolute top-4 right-5 select-none">03</span>
            <div className="p-3 rounded-sm bg-white/5 border border-white/10 text-emerald-400 w-fit mb-4">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-white mb-2">Actionable Report & PDF</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review your prioritized action plan, benchmark competitors, and download a polished PDF report ready to share with developers or clients.
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHAT WE CHECK */}
      <section id="what-we-check" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1 h-3 bg-cyan-500 block"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Comprehensive Analysis
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
            What WebsiteXRay Evaluates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            We inspect every crucial layer that influences your search rankings, bounce rates, and revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* SEO */}
          <div className="p-5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">SEO & Discoverability</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Page titles, meta descriptions, H1-H3 structural hierarchies, canonical tags, OpenGraph/Twitter cards, and Schema.org JSON-LD structured data.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Title & Meta length validation</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Social snippet cards</li>
            </ul>
          </div>

          {/* Performance */}
          <div className="p-5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Core Web Vitals</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Mobile and desktop Largest Contentful Paint (LCP), First Contentful Paint (FCP), Cumulative Layout Shift (CLS), and Total Blocking Time (TBT).
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Real device render times</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Render-blocking asset savings</li>
            </ul>
          </div>

          {/* Accessibility */}
          <div className="p-5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Accessibility & WCAG</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Image alt attributes, accessible landmark elements, button names, viewport zoom scalability, and semantic HTML compliance.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Missing alt text detection</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Mobile viewport configuration</li>
            </ul>
          </div>

          {/* UX & Conversion */}
          <div className="p-5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">UX & Conversion Funnel</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Call-to-action visibility, above-the-fold value proposition clarity, contact information presence, and friction points.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Primary CTA density check</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Value proposition evaluation</li>
            </ul>
          </div>

          {/* Trust Signals */}
          <div className="p-5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-sm bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Trust & Social Proof</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Customer testimonials, review widgets, satisfaction guarantees, security badges, client logos, and contact legitimacy.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Social proof scoring</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Guarantee & review presence</li>
            </ul>
          </div>

          {/* Competitor Benchmarking */}
          <div className="p-5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-sm bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Competitor Benchmarking</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Side-by-side comparison against top industry rivals to spot opportunities, speed advantages, and market gaps.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Up to 3 competitor URLs</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Comparative matrix report</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. SAMPLE AUDIT PREVIEW */}
      <section id="sample-audit" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="p-8 rounded-sm bg-[#0A0D12] border border-white/10 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-3 bg-cyan-500 block"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Interactive Report Preview
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic mb-3">
                See What a Real WebsiteXRay Audit Looks Like
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-medium">
                Explore an actual scan of a modern SaaS website. See how our AI prioritizes critical speed bottlenecks, missing metadata, and conversion roadblocks.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="btn-preview-demo"
                  onClick={() => onScanSample('https://example.com')}
                  className="px-5 py-2.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Analyze Live Demo <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  id="btn-preview-docs"
                  onClick={() => onScanSample('https://developer.mozilla.org')}
                  className="px-5 py-2.5 rounded-sm bg-[#080A0F] hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Analyze MDN Docs <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mock Report Card Graphic */}
            <div className="w-full max-w-md bg-[#05070A] p-5 rounded-sm border border-white/10 shadow-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-400">
                <span className="uppercase font-bold">domain: saas-app.io</span>
                <span className="text-cyan-400 font-bold">HEALTH: 92/100</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-sm bg-[#0A0D12] border border-white/10">
                  <div className="text-slate-500 uppercase font-bold">Perf</div>
                  <div className="text-amber-400 font-black text-sm">82/100</div>
                </div>
                <div className="p-2 rounded-sm bg-[#0A0D12] border border-white/10">
                  <div className="text-slate-500 uppercase font-bold">SEO</div>
                  <div className="text-cyan-400 font-black text-sm">96/100</div>
                </div>
                <div className="p-2 rounded-sm bg-[#0A0D12] border border-white/10">
                  <div className="text-slate-500 uppercase font-bold">UX/Conv</div>
                  <div className="text-cyan-400 font-black text-sm">92/100</div>
                </div>
              </div>
              <div className="p-2.5 rounded-sm bg-[#0A0D12] border-l-2 border-red-500 text-[11px] text-slate-300">
                <span className="text-red-400 font-bold uppercase">[Critical]</span> Render-blocking JavaScript on mobile slows LCP by 1.1s.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 100% FREE FOREVER SHOWCASE */}
      <section id="free-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1 h-3 bg-emerald-500 block"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              100% Free • Zero Charges • No Paywalls
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
            Full Audit Power. Completely Free.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            No credit cards, no monthly subscriptions, and no gated reports. Every tool, finding, and download is completely free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  FREE ALWAYS
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">$0</span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-white mb-1">Deep AI & Core Vitals Audit</h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">Complete technical analysis with industrial grading.</p>
              <ul className="text-xs text-slate-300 space-y-2.5 mb-6 font-mono">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Full AI Executive Summary</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Top 3 Most Important Fixes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Mobile & Desktop Core Web Vitals</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> 30+ SEO, A11y & UX Checks</li>
              </ul>
            </div>
            <a
              href="#hero-section"
              className="w-full py-3 rounded-sm font-black text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors text-center block"
            >
              Start Free Audit
            </a>
          </div>

          {/* Card 2: Highlighted */}
          <div className="p-6 rounded-sm bg-[#0A0D12] border-2 border-emerald-500/40 relative flex flex-col justify-between shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-black shadow-md">
              Complete Access • 100% Free
            </span>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ALL FEATURES INCLUDED
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">$0</span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-white mb-1">To-Do Checklist & Code Fixes</h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">Actionable step-by-step developer tasks.</p>
              <ul className="text-xs text-slate-200 space-y-2.5 mb-6 font-mono">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Interactive To-Do Checklist</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Copy-Paste Code Remedies</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 3-Tier Priority Matrix (P1, P2, P3)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Live Telemetry & Evidence Checks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> No Registration Required</li>
              </ul>
            </div>
            <a
              href="#hero-section"
              className="w-full py-3 rounded-sm font-black text-xs uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all text-center block"
            >
              Analyze Any Site Free
            </a>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  UNLIMITED EXPORTS
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">$0</span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-white mb-1">Competitor Benchmark & PDF</h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">Export and share executive reports freely.</p>
              <ul className="text-xs text-slate-300 space-y-2.5 mb-6 font-mono">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> High-Resolution PDF Download</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> 3-Competitor Side-by-Side Matrix</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Instant Shareable Links</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Senior Consultant Recommendations</li>
              </ul>
            </div>
            <a
              href="#hero-section"
              className="w-full py-3 rounded-sm font-black text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors text-center block"
            >
              Get Free PDF Reports
            </a>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq-section" className="max-w-3xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1 h-3 bg-cyan-500 block"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Clear Answers
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className="rounded-sm bg-[#0A0D12] border border-white/10 overflow-hidden"
              >
                <button
                  id={`btn-faq-toggle-${idx}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <span className="uppercase tracking-tight">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-sm bg-[#0A0D12] border border-emerald-500/30 text-center relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase italic mb-3">
            Ready to Find What's Costing You Customers?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6 font-medium">
            Run a live WebsiteXRay audit in under 60 seconds. 100% free with full insights, to-do list, and PDF download.
          </p>
          <a
            href="#hero-section"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm font-black text-xs uppercase tracking-widest text-black bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
          >
            <span>Analyze Website Free</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </a>
        </div>
      </section>
    </div>
  );
};
