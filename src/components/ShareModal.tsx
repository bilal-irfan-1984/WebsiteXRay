import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { AuditRecord } from '../types.js';

interface ShareModalProps {
  audit: AuditRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ audit, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?audit=${audit.id}`;
  const shareTitle = `I just analyzed ${audit.domain} with WebsiteXRay AI. Health Score: ${audit.overallScore}/100!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(`I analyzed ${audit.domain} with @WebsiteXRay AI!\n\nOverall Score: ${audit.overallScore}/100\nPerformance: ${audit.categoryScores.performance}/100\nSEO: ${audit.categoryScores.seo}/100\n\nFind what's costing your website customers:\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`, '_blank');
  };

  return (
    <div id="share-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div id="share-modal-container" className="relative w-full max-w-lg bg-[#0A0D12] border border-white/10 rounded-sm p-6 shadow-2xl text-slate-100">
        <button
          id="btn-close-share"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-sm bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-white">Share Website Audit Results</h3>
            <p className="text-xs text-slate-400 font-mono">Public shareable report link for {audit.domain}</p>
          </div>
        </div>

        {/* Visual Social Card Preview */}
        <div className="p-4 rounded-sm bg-[#05070A] border border-white/10 mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">WebsiteXRay Report</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{audit.domain}</span>
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Health Score</div>
              <div className="text-3xl font-black font-mono text-cyan-400">{audit.overallScore}/100</div>
            </div>
            <div className="text-right space-y-0.5 text-xs font-mono">
              <div className="text-slate-400">Perf: <span className="font-bold text-white">{audit.categoryScores.performance}</span></div>
              <div className="text-slate-400">SEO: <span className="font-bold text-white">{audit.categoryScores.seo}</span></div>
              <div className="text-slate-400">UX: <span className="font-bold text-white">{audit.categoryScores.uxConversion}</span></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-2">
            {audit.aiAnalysis.executiveSummary.slice(0, 120)}...
          </p>
        </div>

        {/* Copy Link Input */}
        <div className="mb-5">
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">Shareable Audit URL</label>
          <div className="flex items-center gap-2">
            <input
              id="input-share-url"
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2 rounded-sm bg-[#05070A] border border-white/15 text-xs font-mono text-slate-300 select-all"
            />
            <button
              id="btn-copy-share-url"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-sm bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
          <button
            id="btn-share-x"
            onClick={handleShareX}
            className="py-2 px-3 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 font-bold uppercase text-white transition-colors cursor-pointer"
          >
            Post to X
          </button>
          <button
            id="btn-share-linkedin"
            onClick={handleShareLinkedIn}
            className="py-2 px-3 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 font-bold uppercase text-white transition-colors cursor-pointer"
          >
            LinkedIn
          </button>
          <button
            id="btn-share-whatsapp"
            onClick={handleShareWhatsApp}
            className="py-2 px-3 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 font-bold uppercase text-white transition-colors cursor-pointer"
          >
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
