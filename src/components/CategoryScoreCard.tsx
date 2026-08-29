import React from 'react';
import { Zap, Search, Eye, ShieldCheck, Target } from 'lucide-react';

interface CategoryScoreCardProps {
  category: 'performance' | 'seo' | 'accessibility' | 'bestPractices' | 'uxConversion';
  score: number;
  weight: string;
  issueCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const CATEGORY_META = {
  performance: {
    title: 'Performance',
    desc: 'Core Web Vitals, speed, asset sizing & render times',
    icon: Zap,
    color: 'text-amber-400',
    barColor: 'bg-amber-500',
    borderActive: 'border-amber-500/50 bg-amber-500/5',
  },
  seo: {
    title: 'SEO & Metadata',
    desc: 'Titles, meta, headings, canonicals, OG & schema.org',
    icon: Search,
    color: 'text-blue-400',
    barColor: 'bg-blue-500',
    borderActive: 'border-blue-500/50 bg-blue-500/5',
  },
  accessibility: {
    title: 'Accessibility',
    desc: 'Image alt tags, heading hierarchy & accessible names',
    icon: Eye,
    color: 'text-emerald-400',
    barColor: 'bg-emerald-500',
    borderActive: 'border-emerald-500/50 bg-emerald-500/5',
  },
  bestPractices: {
    title: 'Best Practices',
    desc: 'HTTPS security, modern web standards & protocols',
    icon: ShieldCheck,
    color: 'text-purple-400',
    barColor: 'bg-purple-500',
    borderActive: 'border-purple-500/50 bg-purple-500/5',
  },
  uxConversion: {
    title: 'UX & Conversion',
    desc: 'CTAs, above-the-fold clarity, trust signals & proof',
    icon: Target,
    color: 'text-cyan-400',
    barColor: 'bg-cyan-500',
    borderActive: 'border-cyan-500/50 bg-cyan-500/5',
  },
};

export const CategoryScoreCard: React.FC<CategoryScoreCardProps> = ({
  category,
  score,
  weight,
  issueCount,
  isSelected = false,
  onClick,
}) => {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  let scoreColor = 'text-red-400';
  let badgeBg = 'bg-red-500/10 text-red-400 border-red-500/20';
  if (score >= 85) {
    scoreColor = 'text-emerald-400';
    badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (score >= 70) {
    scoreColor = 'text-blue-400';
    badgeBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (score >= 50) {
    scoreColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div
      id={`cat-card-${category}`}
      onClick={onClick}
      className={`p-4 rounded-sm border transition-all cursor-pointer select-none ${
        isSelected
          ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/50'
          : 'bg-[#0A0D12] border-white/10 hover:border-cyan-500/40 hover:bg-[#0D1117]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-sm bg-white/5 border border-white/10 ${meta.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-tight text-white">{meta.title}</h4>
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">{weight} weight</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xl font-black font-mono ${scoreColor}`}>{score}</span>
          <span className="text-xs text-slate-500 font-mono">/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-none overflow-hidden mt-3.5">
        <div
          className={`h-full transition-all duration-700 ${meta.barColor}`}
          style={{ width: `${Math.min(100, Math.max(8, score))}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5 text-xs">
        <p className="text-slate-400 text-[11px] line-clamp-1">{meta.desc}</p>
        {typeof issueCount === 'number' && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-mono font-bold uppercase ml-2 whitespace-nowrap ${badgeBg}`}>
            {issueCount} {issueCount === 1 ? 'Finding' : 'Findings'}
          </span>
        )}
      </div>
    </div>
  );
};
