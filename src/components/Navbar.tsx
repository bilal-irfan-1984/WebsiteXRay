import React from 'react';
import { Sparkles, ArrowRight, BarChart2, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenPricing?: () => void;
  onScrollToSection: (sectionId: string) => void;
  userCredits?: { email: string; remainingCredits: number } | null;
  onCheckCredits?: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onScrollToSection,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0A0D12]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          id="brand-logo"
          onClick={() => onScrollToSection('hero-section')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center group-hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              Website<span className="text-cyan-400">XRay</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 hidden sm:inline">
              AUDIT AI
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <button
            id="nav-link-how"
            onClick={() => onScrollToSection('how-it-works')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            id="nav-link-check"
            onClick={() => onScrollToSection('what-we-check')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            What We Check
          </button>
          <button
            id="nav-link-sample"
            onClick={() => onScrollToSection('sample-audit')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Sample Report
          </button>
          <button
            id="nav-link-free-features"
            onClick={() => onScrollToSection('free-features')}
            className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            100% Free
          </button>
          <button
            id="nav-link-faq"
            onClick={() => onScrollToSection('faq-section')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* 100% Free Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>NO CHARGES • 100% FREE</span>
          </div>

          {/* Admin Telemetry Button */}
          <button
            id="btn-admin-telemetry"
            onClick={onOpenAdmin}
            title="Open Admin & Telemetry"
            className="p-2 rounded-sm bg-[#080A0F] border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {/* Scan CTA */}
          <button
            id="btn-nav-scan-cta"
            onClick={() => onScrollToSection('hero-section')}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black bg-cyan-500 hover:bg-cyan-400 transition-all rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Scan Free</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
