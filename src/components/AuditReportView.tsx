import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  FileDown,
  Lock,
  Unlock,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RotateCw,
  Search,
  ExternalLink,
  ShieldCheck,
  ListTodo,
  Gauge,
  Bug,
  Radio,
} from 'lucide-react';
import { AuditRecord, AuditRecommendation, TodoItem } from '../types.js';
import { ScoreGauge } from './ScoreGauge.js';
import { CategoryScoreCard } from './CategoryScoreCard.js';
import { RecommendationCard } from './RecommendationCard.js';
import { CoreWebVitalsGrid } from './CoreWebVitalsGrid.js';
import { AuditTodoSection } from './AuditTodoSection.js';
import { LiveTelemetryCard } from './LiveTelemetryCard.js';
import { AuditDebuggerPanel } from './AuditDebuggerPanel.js';
import { WebTrackingView } from './WebTrackingView.js';
import { exportAuditToPDF } from '../utils/pdfExport.js';

interface AuditReportViewProps {
  audit: AuditRecord;
  onNewScan: () => void;
  onOpenPayment?: (plan?: 'single' | 'pack10' | 'pack50') => void;
  onOpenShare: () => void;
  onOpenCompetitors: () => void;
  isCached?: boolean;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  audit,
  onNewScan,
  onOpenShare,
  onOpenCompetitors,
  isCached,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleExportPDF = () => {
    exportAuditToPDF(audit);
  };

  // Filter recommendations
  const allIssues: AuditRecommendation[] = audit.aiAnalysis.top10Fixes && audit.aiAnalysis.top10Fixes.length > 0
    ? audit.aiAnalysis.top10Fixes
    : audit.ruleBasedIssues;

  const filteredIssues = selectedCategory
    ? allIssues.filter((i) => {
        if (selectedCategory === 'performance') return i.category === 'Performance';
        if (selectedCategory === 'seo') return i.category === 'SEO';
        if (selectedCategory === 'accessibility') return i.category === 'Accessibility';
        if (selectedCategory === 'bestPractices') return i.category === 'BestPractices' || i.category === 'Security';
        if (selectedCategory === 'uxConversion') return i.category === 'UX' || i.category === 'Conversion';
        return true;
      })
    : allIssues;

  // Prepare initial todo list from AI analysis or rule issues
  const initialTodos: TodoItem[] = audit.aiAnalysis.todoChecklist && audit.aiAnalysis.todoChecklist.length > 0
    ? audit.aiAnalysis.todoChecklist
    : allIssues.map((item, idx) => ({
        id: `todo-${idx + 1}-${item.id || item.category.toLowerCase()}`,
        text: `[${item.category}] ${item.problem} -> Fix: ${item.fix}`,
        category: item.category,
        priority: item.priority,
        completed: false,
        recommendationId: item.id,
      }));

  return (
    <div id="audit-report-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <button
          id="btn-back-to-scan"
          onClick={onNewScan}
          className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Run Another Audit
        </button>

        <div className="flex items-center gap-2">
          {isCached && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#0A0D12] border border-white/10 text-[10px] text-slate-400 font-mono uppercase">
              <RotateCw className="w-3 h-3" /> Cached (2h)
            </span>
          )}

          {/* Jump to Real Web Tracking */}
          <a
            href="#web-tracking-panel"
            className="px-3.5 py-1.5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Web Tracking</span>
          </a>

          {/* Jump to Audit Debugger */}
          <a
            href="#audit-debugger-panel"
            className="px-3.5 py-1.5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Audit Debugger</span>
          </a>

          {/* Jump to To-Dos */}
          <a
            href="#audit-todo-section"
            className="px-3.5 py-1.5 rounded-sm bg-[#0A0D12] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
          >
            <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">To-Do List</span>
          </a>

          {/* Competitor Benchmarking */}
          <button
            id="btn-open-competitor-matrix"
            onClick={onOpenCompetitors}
            className="px-3.5 py-1.5 rounded-sm bg-[#0A0D12] border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Benchmark Competitors</span>
          </button>

          {/* Share Report */}
          <button
            id="btn-open-share-modal"
            onClick={onOpenShare}
            className="px-3.5 py-1.5 rounded-sm bg-[#0A0D12] border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Export PDF Button */}
          <button
            id="btn-export-pdf-report"
            onClick={handleExportPDF}
            className="px-3.5 py-1.5 rounded-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Target Domain Title Banner */}
      <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase text-slate-500">Target Domain</span>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-red-400" /> Strict Criteria Applied
            </span>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Full Report Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {audit.domain}
            </h1>
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Open Target URL"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-xs text-slate-400 font-mono mt-1">{audit.url}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          <button
            id="btn-header-pdf"
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-sm font-black uppercase tracking-wider text-xs text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download Executive PDF</span>
          </button>
          <button
            id="btn-header-benchmark-cta"
            onClick={onOpenCompetitors}
            className="px-3.5 py-2 rounded-sm font-mono font-bold uppercase tracking-wider text-xs text-slate-300 bg-[#05070A] hover:bg-[#0D1117] border border-white/10 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compare Competitors</span>
          </button>
        </div>
      </div>

      {/* Main Score & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Overall Score Gauge Card */}
        <div className="lg:col-span-4 p-6 rounded-sm bg-[#0A0D12] border border-white/10 flex flex-col items-center justify-center">
          <ScoreGauge score={audit.overallScore} size={190} />
          <div className="text-center mt-3 pt-3 border-t border-white/5 w-full">
            <span className="inline-block px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[10px] text-amber-400 font-mono uppercase font-bold mb-1">
              Strict Standard Rating
            </span>
            <p className="text-xs text-slate-500 font-mono uppercase">
              Rigorous weighting: Performance 30%, SEO 25%, UX 20%, A11y 15%, BP 10%.
            </p>
          </div>
        </div>

        {/* 5 Category Breakdown Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CategoryScoreCard
            category="performance"
            score={audit.categoryScores.performance}
            weight="30%"
            issueCount={allIssues.filter((i) => i.category === 'Performance').length}
            isSelected={selectedCategory === 'performance'}
            onClick={() => setSelectedCategory(selectedCategory === 'performance' ? null : 'performance')}
          />
          <CategoryScoreCard
            category="seo"
            score={audit.categoryScores.seo}
            weight="25%"
            issueCount={allIssues.filter((i) => i.category === 'SEO').length}
            isSelected={selectedCategory === 'seo'}
            onClick={() => setSelectedCategory(selectedCategory === 'seo' ? null : 'seo')}
          />
          <CategoryScoreCard
            category="uxConversion"
            score={audit.categoryScores.uxConversion}
            weight="20%"
            issueCount={allIssues.filter((i) => i.category === 'UX' || i.category === 'Conversion').length}
            isSelected={selectedCategory === 'uxConversion'}
            onClick={() => setSelectedCategory(selectedCategory === 'uxConversion' ? null : 'uxConversion')}
          />
          <CategoryScoreCard
            category="accessibility"
            score={audit.categoryScores.accessibility}
            weight="15%"
            issueCount={allIssues.filter((i) => i.category === 'Accessibility').length}
            isSelected={selectedCategory === 'accessibility'}
            onClick={() => setSelectedCategory(selectedCategory === 'accessibility' ? null : 'accessibility')}
          />
          <CategoryScoreCard
            category="bestPractices"
            score={audit.categoryScores.bestPractices}
            weight="10%"
            issueCount={allIssues.filter((i) => i.category === 'BestPractices' || i.category === 'Security').length}
            isSelected={selectedCategory === 'bestPractices'}
            onClick={() => setSelectedCategory(selectedCategory === 'bestPractices' ? null : 'bestPractices')}
          />

          {/* Reset filter card */}
          {selectedCategory && (
            <div
              onClick={() => setSelectedCategory(null)}
              className="p-4 rounded-sm border border-dashed border-cyan-500/50 bg-cyan-500/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-cyan-500/10 transition-colors"
            >
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Clear Category Filter</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Show all findings</span>
            </div>
          )}
        </div>
      </div>

      {/* NEW: Actionable Implementation To-Do Checklist */}
      <AuditTodoSection initialTodos={initialTodos} domain={audit.domain} />

      {/* Executive Summary Section */}
      <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">AI Executive Summary (Strict Marking)</h3>
              <p className="text-xs text-slate-400">Synthesized with rigorous Core Web Vitals and SEO penalties</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-sm text-xs font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <Unlock className="w-3 h-3" /> Full Analysis
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-200 leading-relaxed font-serif italic text-base">
            {audit.aiAnalysis.executiveSummary}
          </p>

          {/* Top 3 Most Important Fixes & Strategic Recommendation (Master Prompt Section 21) */}
          {audit.aiAnalysis.top3Fixes && audit.aiAnalysis.top3Fixes.length > 0 && (
            <div className="p-4 rounded-sm bg-[#05070A] border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your 3 Most Important Fixes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {audit.aiAnalysis.top3Fixes.map((f, i) => (
                  <div key={i} className="p-3 rounded-sm bg-black/40 border border-white/5 space-y-1">
                    <span className="text-xs font-black uppercase text-white block">
                      {i + 1}. {f.issue}
                    </span>
                    <p className="text-xs text-slate-400">{f.explanation}</p>
                  </div>
                ))}
              </div>

              {audit.aiAnalysis.overallRecommendation && (
                <div className="pt-2.5 border-t border-white/10 text-xs text-slate-300">
                  <span className="font-mono font-bold uppercase text-cyan-400 text-[10px] block mb-1">
                    Senior Auditor Strategic Recommendation:
                  </span>
                  <p className="font-mono text-slate-200">{audit.aiAnalysis.overallRecommendation}</p>
                </div>
              )}
            </div>
          )}

          {/* Technical Observations */}
          {audit.aiAnalysis.observedFacts && audit.aiAnalysis.observedFacts.length > 0 && (
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/10 mt-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-2.5">
                Verified Technical Signals & Fact Checks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                {audit.aiAnalysis.observedFacts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Web Tracking & Live Uptime Monitor */}
      <WebTrackingView
        trackingAudit={audit.trackingAudit || audit.extractedData?.trackingAudit}
        targetUrl={audit.url}
        domain={audit.domain}
      />

      {/* Verified Live Crawl Telemetry & Ground Truth */}
      {audit.extractedData && (
        <LiveTelemetryCard data={audit.extractedData} domain={audit.domain} />
      )}

      {/* Audit Debugger Panel: JavaScript Errors, Network Warnings & Metric Correlation */}
      <AuditDebuggerPanel
        debuggerData={audit.extractedData?.debuggerData || audit.debuggerData}
        domain={audit.domain}
        url={audit.url}
      />

      {/* Core Web Vitals Section */}
      <div className="p-6 rounded-sm bg-[#0A0D12] border border-white/10">
        <CoreWebVitalsGrid
          mobileData={audit.pageSpeed.mobile}
          desktopData={audit.pageSpeed.desktop}
        />
      </div>

      {/* Prioritized Implementation Action Plan Matrix */}
      <div id="action-plan-section" className="p-6 rounded-sm bg-[#0A0D12] border border-white/10 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Prioritized Implementation Action Plan</h3>
            <p className="text-xs text-slate-400">Step-by-step roadmap to eliminate drop-offs and rank higher</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Priority 1 */}
          <div className="p-4 rounded-sm bg-red-950/20 border border-red-500/30 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" /> Priority 1: Fix Immediately
            </div>
            <div className="space-y-2.5">
              {(audit.aiAnalysis.prioritizedActionPlan.priority1Immediate || []).map((p, i) => (
                <div key={i} className="p-3 rounded-sm bg-[#05070A] border border-red-500/20 text-xs">
                  <span className="font-black uppercase tracking-tight text-white block mb-1">[{p.category}] {p.problem}</span>
                  <p className="text-[11px] text-slate-400 font-mono">{p.fix}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Priority 2 */}
          <div className="p-4 rounded-sm bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Priority 2: Fix Next Sprint
            </div>
            <div className="space-y-2.5">
              {(audit.aiAnalysis.prioritizedActionPlan.priority2Next || []).map((p, i) => (
                <div key={i} className="p-3 rounded-sm bg-[#05070A] border border-amber-500/20 text-xs">
                  <span className="font-black uppercase tracking-tight text-white block mb-1">[{p.category}] {p.problem}</span>
                  <p className="text-[11px] text-slate-400 font-mono">{p.fix}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Priority 3 */}
          <div className="p-4 rounded-sm bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Priority 3: Continuous Tuning
            </div>
            <div className="space-y-2.5">
              {(audit.aiAnalysis.prioritizedActionPlan.priority3Improvements || []).map((p, i) => (
                <div key={i} className="p-3 rounded-sm bg-[#05070A] border border-emerald-500/20 text-xs">
                  <span className="font-black uppercase tracking-tight text-white block mb-1">[{p.category}] {p.problem}</span>
                  <p className="text-[11px] text-slate-400 font-mono">{p.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Audit Findings & Recommendations List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              Detailed Audit Findings ({filteredIssues.length})
            </h3>
            <p className="text-xs text-slate-400">
              {selectedCategory
                ? `Showing findings in ${selectedCategory} category.`
                : 'All detected technical, performance, SEO, accessibility & conversion issues with full fix code.'}
            </p>
          </div>

          <div className="text-xs font-mono font-bold uppercase text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-sm border border-cyan-500/20">
            All {allIssues.length} Findings Unlocked
          </div>
        </div>

        {/* List of cards */}
        <div className="space-y-3">
          {filteredIssues.map((item, idx) => (
            <RecommendationCard
              key={item.id || idx}
              item={item}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
