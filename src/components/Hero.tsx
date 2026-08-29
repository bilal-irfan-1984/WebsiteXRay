import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, Shield, Clock, Zap, CheckCircle2, AlertCircle, ListTodo, Gauge } from 'lucide-react';

interface HeroProps {
  onScan: (url: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

const SAMPLE_SITES = [
  { name: 'Example.com', url: 'https://example.com' },
  { name: 'MDN Web', url: 'https://developer.mozilla.org' },
  { name: 'W3C.org', url: 'https://w3.org' },
  { name: 'Wikipedia', url: 'https://wikipedia.org' },
];

export const Hero: React.FC<HeroProps> = ({ onScan, isLoading, errorMessage }) => {
  const [urlInput, setUrlInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setLocalError('Wrong link: Please enter a website link.');
      return;
    }

    // Client pre-validation for domain structure
    const hostPart = trimmed.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0];
    if (!hostPart.includes('.') || hostPart.startsWith('.') || hostPart.endsWith('.')) {
      setLocalError('Wrong link: Please enter a valid website address with a domain extension (e.g. example.com or https://example.com)');
      return;
    }

    onScan(trimmed);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setLocalError(null);
    setUrlInput(sampleUrl);
    onScan(sampleUrl);
  };

  const displayError = localError || errorMessage;

  return (
    <section id="hero-section" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-[#05070A]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-sm bg-[#080A0F] border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span>100% Free • No Charges • Industrial Marking Criteria & Actionable To-Dos</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[1.02] mb-6">
          Find What's Costing Your Website{' '}
          <span className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-8">
            Customers.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
          Instant 100% free AI audit combining strict Core Web Vitals grading, rigorous technical SEO evaluation, WCAG accessibility checks, competitor benchmarking, and an interactive to-do checklist with executive PDF export.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-4">
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center p-2 rounded-sm bg-[#0A0D12] border border-white/15 shadow-2xl shadow-black focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/50 transition-all gap-2">
            <div className="flex items-center flex-1 px-3 py-2">
              <Search className="w-5 h-5 text-slate-400 mr-2.5 flex-shrink-0" />
              <input
                id="input-website-url"
                type="text"
                required
                disabled={isLoading}
                placeholder="Enter website URL (e.g. quantum-studio.io)"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (localError) setLocalError(null);
                }}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none font-mono"
              />
            </div>

            <button
              id="btn-analyze-website"
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="px-8 py-3.5 rounded-sm font-black text-xs uppercase tracking-widest text-black bg-cyan-500 hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              <span>Analyze Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {displayError && (
            <div className="mt-3 p-3.5 rounded-sm bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 text-left font-mono shadow-lg animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span className="font-semibold">{displayError}</span>
            </div>
          )}
        </form>

        {/* Quick Sample Websites */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 mb-8 font-bold uppercase tracking-wider">
          <span className="text-[10px]">Try sample:</span>
          {SAMPLE_SITES.map((sample) => (
            <button
              key={sample.name}
              id={`btn-sample-${sample.name.toLowerCase()}`}
              type="button"
              onClick={() => handleSelectSample(sample.url)}
              className="px-2.5 py-1 rounded-sm bg-[#080A0F] border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors cursor-pointer text-[11px] font-mono"
            >
              {sample.name}
            </button>
          ))}
        </div>

        {/* 4 Feature Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-white/5 text-left font-mono text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="uppercase font-bold tracking-wider text-emerald-300">100% Free Forever</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="uppercase font-bold tracking-wider">Strict Criteria</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ListTodo className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="uppercase font-bold tracking-wider">To-Do Checklist</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="uppercase font-bold tracking-wider">Full PDF Export</span>
          </div>
        </div>
      </div>
    </section>
  );
};
