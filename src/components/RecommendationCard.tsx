import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ListTodo,
  CheckSquare,
  Square,
} from 'lucide-react';
import { AuditRecommendation } from '../types.js';

interface RecommendationCardProps {
  item: AuditRecommendation;
  index?: number;
  isUnlocked?: boolean;
  onUnlockClick?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  index,
}) => {
  const [copied, setCopied] = useState(false);
  const [todoDone, setTodoDone] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`[${item.category}] ${item.problem}\nWhy: ${item.whyItMatters}\nFix: ${item.fix}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return {
          icon: AlertCircle,
          classes: 'bg-red-500/10 text-red-400 border-red-500/30',
          borderLeft: 'border-l-2 border-red-500',
          label: 'Critical Priority',
        };
      case 'High':
        return {
          icon: AlertTriangle,
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          borderLeft: 'border-l-2 border-amber-500',
          label: 'High Priority',
        };
      case 'Medium':
        return {
          icon: Info,
          classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          borderLeft: 'border-l-2 border-blue-500',
          label: 'Medium Priority',
        };
      default:
        return {
          icon: CheckCircle2,
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          borderLeft: 'border-l-2 border-emerald-500',
          label: 'Low Priority',
        };
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Hard':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'Medium':
        return 'bg-white/10 text-slate-300 border-white/10';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  };

  const priorityMeta = getPriorityBadge(item.priority);
  const PriorityIcon = priorityMeta.icon;

  return (
    <div
      id={`rec-card-${item.id}`}
      className={`rounded-sm border border-white/10 bg-[#0A0D12] hover:border-cyan-500/40 transition-all p-5 shadow-sm group ${priorityMeta.borderLeft}`}
    >
      {/* Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {typeof index === 'number' && (
            <span className="flex items-center justify-center w-5 h-5 rounded-sm bg-white/10 text-[10px] font-black text-slate-300 font-mono">
              {index + 1}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase bg-white/5 text-slate-300 border border-white/10">
            {item.category}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase border ${priorityMeta.classes}`}>
            <PriorityIcon className="w-3 h-3" />
            {priorityMeta.label}
          </span>
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase border ${getDifficultyBadge(item.difficulty)}`}>
            Difficulty: {item.difficulty}
          </span>
          {item.confidence && (
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Confidence: {item.confidence}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick toggle to-do button */}
          <button
            id={`btn-todo-toggle-${item.id}`}
            onClick={() => setTodoDone(!todoDone)}
            className={`px-2 py-1 rounded-sm text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
              todoDone
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-[#080A0F] text-slate-400 border-white/10 hover:text-cyan-400 hover:border-cyan-500/30'
            }`}
          >
            {todoDone ? <CheckSquare className="w-3 h-3 text-emerald-400" /> : <Square className="w-3 h-3" />}
            <span>{todoDone ? 'Completed' : 'Mark as To-Do'}</span>
          </button>

          <button
            id={`btn-copy-fix-${item.id}`}
            onClick={handleCopy}
            title="Copy problem and recommendation"
            className="p-1.5 rounded-sm bg-[#080A0F] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs transition-colors flex items-center gap-1 cursor-pointer font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase font-bold hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Problem */}
      <div className="mb-2.5">
        <h4 className={`text-sm sm:text-base font-black uppercase tracking-tight leading-snug ${todoDone ? 'line-through text-slate-400' : 'text-white'}`}>
          {item.problem}
        </h4>
      </div>

      {/* Evidence */}
      {item.evidence && (
        <div className="mb-2.5 text-xs text-slate-300 leading-relaxed bg-[#05070A] p-2.5 rounded-sm border border-cyan-500/10 flex items-start gap-2">
          <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider shrink-0 font-mono">
            Evidence:
          </span>
          <span className="text-slate-300 font-mono text-[11px]">{item.evidence}</span>
        </div>
      )}

      {/* Why it matters */}
      <div className="mb-3 text-xs text-slate-300 leading-relaxed bg-[#05070A] p-3 rounded-sm border border-white/5">
        <span className="font-bold text-slate-200 uppercase text-[10px] tracking-wider block mb-0.5">Why It Matters:</span>
        <span className="text-slate-300">{item.whyItMatters}</span>
      </div>

      {/* Recommended Fix */}
      <div className="p-3 bg-[#05070A] rounded-sm border border-cyan-500/20 text-xs leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-400 text-[10px] mb-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Actionable Fix & Code Remedy:</span>
        </div>
        <p className="text-slate-200 font-mono text-[11px] select-all">{item.fix}</p>
      </div>
    </div>
  );
};
