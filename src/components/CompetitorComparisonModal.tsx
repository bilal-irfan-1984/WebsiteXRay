import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowRight, Trophy, Zap, Search, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';
import { AuditRecord, CompetitorComparison } from '../types.js';

interface CompetitorComparisonModalProps {
  audit: AuditRecord;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCompetitors: (competitors: CompetitorComparison[]) => void;
}

export const CompetitorComparisonModal: React.FC<CompetitorComparisonModalProps> = ({
  audit,
  isOpen,
  onClose,
  onUpdateCompetitors,
}) => {
  const [competitorInputs, setCompetitorInputs] = useState<string[]>(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddInput = () => {
    if (competitorInputs.length < 3) {
      setCompetitorInputs([...competitorInputs, '']);
    }
  };

  const handleRemoveInput = (idx: number) => {
    setCompetitorInputs(competitorInputs.filter((_, i) => i !== idx));
  };

  const handleInputChange = (idx: number, val: string) => {
    const next = [...competitorInputs];
    next[idx] = val;
    setCompetitorInputs(next);
  };

  const handleRunAnalysis = async () => {
    const filled = competitorInputs.map(u => u.trim()).filter(u => u.length > 0);
    if (filled.length === 0) {
      setError('Please enter at least 1 competitor website URL.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/audit/${audit.id}/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorUrls: filled }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze competitors');
      }

      onUpdateCompetitors(data.competitors);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error analyzing competitors';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const competitors = audit.competitors || [];

  return (
    <div id="competitor-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div id="competitor-modal-container" className="relative w-full max-w-4xl bg-[#0A0D12] border border-white/10 rounded-sm p-6 shadow-2xl text-slate-100 my-8">
        {/* Close button */}
        <button
          id="btn-close-competitors"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-sm bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Competitor Benchmark Comparison</h2>
            <p className="text-xs text-slate-400">
              Benchmark <span className="text-white font-semibold">{audit.domain}</span> against up to 3 competitors in your niche.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="p-4 rounded-sm bg-[#05070A] border border-white/10 mb-6">
          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
            Competitor Website URLs (Max 3)
          </label>
          <div className="space-y-2 mb-3">
            {competitorInputs.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  id={`input-competitor-${idx}`}
                  type="text"
                  placeholder={`e.g. competitor${idx + 1}.com`}
                  value={url}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-sm bg-[#0A0D12] border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                />
                {competitorInputs.length > 1 && (
                  <button
                    id={`btn-remove-competitor-${idx}`}
                    onClick={() => handleRemoveInput(idx)}
                    className="p-2 rounded-sm bg-white/5 text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {competitorInputs.length < 3 && (
              <button
                id="btn-add-competitor-slot"
                onClick={handleAddInput}
                className="text-xs font-mono font-bold uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add another competitor
              </button>
            )}

            <button
              id="btn-run-competitor-analysis"
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="ml-auto px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black bg-cyan-500 hover:bg-cyan-400 rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scanning Competitors...
                </>
              ) : (
                <>
                  Compare Websites <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 p-2.5 rounded-sm bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Matrix */}
        {competitors.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Comparison Results Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#05070A] text-slate-500 font-mono uppercase text-[10px]">
                    <th className="p-3 font-bold">Website</th>
                    <th className="p-3 font-bold text-center">Overall Health</th>
                    <th className="p-3 font-bold text-center">Performance</th>
                    <th className="p-3 font-bold text-center">SEO Score</th>
                    <th className="p-3 font-bold text-center">Trust Proof</th>
                    <th className="p-3 font-bold text-center">CTAs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* Your Website (Hero Row) */}
                  <tr className="bg-cyan-500/5 font-bold text-white font-mono">
                    <td className="p-3 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-sm text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        YOU
                      </span>
                      <span>{audit.domain}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-sm bg-cyan-500/20 text-cyan-300 font-black font-mono">
                        {audit.overallScore}/100
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">{audit.categoryScores.performance}/100</td>
                    <td className="p-3 text-center font-mono">{audit.categoryScores.seo}/100</td>
                    <td className="p-3 text-center font-mono">{audit.extractedData.trustSignals.socialProofScore}/100</td>
                    <td className="p-3 text-center font-mono">{audit.extractedData.ctaElements.length}</td>
                  </tr>

                  {/* Competitors */}
                  {competitors.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-white/5 text-slate-300 font-mono">
                      <td className="p-3 font-medium text-white">{comp.domain}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-sm bg-white/10 text-slate-300 font-bold font-mono">
                          {comp.overallScore}/100
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">{comp.performanceScore}/100</td>
                      <td className="p-3 text-center font-mono">{comp.seoScore}/100</td>
                      <td className="p-3 text-center font-mono">{comp.trustScore}/100</td>
                      <td className="p-3 text-center font-mono">{comp.ctaCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Strengths & Weaknesses Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {competitors.map((comp, i) => (
                <div key={i} className="p-3.5 rounded-sm bg-[#05070A] border border-white/10 text-xs">
                  <h4 className="font-black uppercase tracking-tight text-white mb-2">{comp.domain} Highlights</h4>
                  {comp.strengths.length > 0 && (
                    <div className="mb-2">
                      <span className="text-cyan-400 font-bold uppercase text-[10px]">Strengths:</span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-0.5 mt-0.5">
                        {comp.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {comp.weaknesses.length > 0 && (
                    <div>
                      <span className="text-amber-400 font-bold uppercase text-[10px]">Vulnerabilities (Your Opportunity):</span>
                      <ul className="list-disc pl-4 text-slate-400 space-y-0.5 mt-0.5">
                        {comp.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
