import React, { useState } from 'react';
import { Smartphone, Monitor, Clock, Gauge, Layers, Activity, Sparkles } from 'lucide-react';
import { PageSpeedDeviceData } from '../types.js';

interface CoreWebVitalsGridProps {
  mobileData: PageSpeedDeviceData;
  desktopData: PageSpeedDeviceData;
}

export const CoreWebVitalsGrid: React.FC<CoreWebVitalsGridProps> = ({ mobileData, desktopData }) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const current = device === 'mobile' ? mobileData : desktopData;

  const getMetricStatus = (key: string, value: number) => {
    switch (key) {
      case 'lcp': // ms: < 2500 good, 2500-4000 needs imp, > 4000 poor
        if (value <= 2500) return { label: 'Good', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        if (value <= 4000) return { label: 'Needs Imp.', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Poor', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'fcp': // ms: < 1800 good, 1800-3000 needs imp, > 3000 poor
        if (value <= 1800) return { label: 'Good', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        if (value <= 3000) return { label: 'Needs Imp.', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Poor', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'cls': // < 0.1 good, 0.1-0.25 needs imp, > 0.25 poor
        if (value <= 0.1) return { label: 'Good', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        if (value <= 0.25) return { label: 'Needs Imp.', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Poor', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'tbt': // ms: < 200 good, 200-600 needs imp, > 600 poor
        if (value <= 200) return { label: 'Good', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        if (value <= 600) return { label: 'Needs Imp.', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Poor', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default: // Speed Index
        if (value <= 3400) return { label: 'Good', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        if (value <= 5800) return { label: 'Needs Imp.', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Poor', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
  };

  const lcpStatus = getMetricStatus('lcp', current.vitals.lcp.value);
  const fcpStatus = getMetricStatus('fcp', current.vitals.fcp.value);
  const clsStatus = getMetricStatus('cls', current.vitals.cls.value);
  const tbtStatus = getMetricStatus('tbt', current.vitals.tbt.value);
  const siStatus = getMetricStatus('si', current.vitals.speedIndex.value);

  return (
    <div id="core-web-vitals-section" className="space-y-5">
      {/* Device Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0A0D12] rounded-sm border border-white/10">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Core Web Vitals & Real-Time Performance
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real performance telemetry measuring loading speed, visual stability, and responsiveness.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#05070A] p-1 rounded-sm border border-white/10">
          <button
            id="btn-switch-mobile"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm transition-all cursor-pointer ${
              device === 'mobile'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile ({mobileData.performanceScore}/100)
          </button>
          <button
            id="btn-switch-desktop"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm transition-all cursor-pointer ${
              device === 'desktop'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop ({desktopData.performanceScore}/100)
          </button>
        </div>
      </div>

      {/* 5 Vitals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* LCP */}
        <div className="p-4 rounded-sm bg-[#0A0D12] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono">LCP</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-mono font-bold uppercase ${lcpStatus.badge}`}>
              {lcpStatus.label}
            </span>
          </div>
          <div className="text-2xl font-mono font-black text-white mb-1">
            {current.vitals.lcp.label}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Largest Contentful Paint. Time to render main visible content.
          </p>
        </div>

        {/* FCP */}
        <div className="p-4 rounded-sm bg-[#0A0D12] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono">FCP</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-mono font-bold uppercase ${fcpStatus.badge}`}>
              {fcpStatus.label}
            </span>
          </div>
          <div className="text-2xl font-mono font-black text-white mb-1">
            {current.vitals.fcp.label}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            First Contentful Paint. Initial visual feedback to user.
          </p>
        </div>

        {/* CLS */}
        <div className="p-4 rounded-sm bg-[#0A0D12] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono">CLS</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-mono font-bold uppercase ${clsStatus.badge}`}>
              {clsStatus.label}
            </span>
          </div>
          <div className="text-2xl font-mono font-black text-white mb-1">
            {current.vitals.cls.label}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Cumulative Layout Shift. Visual stability of elements.
          </p>
        </div>

        {/* TBT */}
        <div className="p-4 rounded-sm bg-[#0A0D12] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono">TBT</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-mono font-bold uppercase ${tbtStatus.badge}`}>
              {tbtStatus.label}
            </span>
          </div>
          <div className="text-2xl font-mono font-black text-white mb-1">
            {current.vitals.tbt.label}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Total Blocking Time. Main-thread execution delay.
          </p>
        </div>

        {/* Speed Index */}
        <div className="p-4 rounded-sm bg-[#0A0D12] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono">Speed Index</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-mono font-bold uppercase ${siStatus.badge}`}>
              {siStatus.label}
            </span>
          </div>
          <div className="text-2xl font-mono font-black text-white mb-1">
            {current.vitals.speedIndex.label}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Speed Index. How quickly content is visually populated.
          </p>
        </div>
      </div>

      {/* Opportunities & Diagnostics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opportunities */}
        <div className="p-4 rounded-sm bg-[#0A0D12] border border-white/10">
          <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Performance Opportunities
          </h4>
          <div className="space-y-2.5">
            {current.opportunities.length > 0 ? (
              current.opportunities.map((opp, i) => (
                <div key={i} className="p-3 rounded-sm bg-[#05070A] border border-white/5 text-xs">
                  <div className="flex items-center justify-between text-slate-200 font-bold uppercase text-[11px] mb-1">
                    <span>{opp.title}</span>
                    {opp.savings && (
                      <span className="px-1.5 py-0.5 rounded-sm text-[10px] bg-cyan-500/10 text-cyan-300 font-mono font-bold">
                        {opp.savings}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opp.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No critical render-blocking opportunities identified.</p>
            )}
          </div>
        </div>

        {/* Diagnostics */}
        <div className="p-4 rounded-sm bg-[#0A0D12] border border-white/10">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Technical Diagnostics
          </h4>
          <div className="space-y-2.5">
            {current.diagnostics.length > 0 ? (
              current.diagnostics.map((diag, i) => (
                <div key={i} className="p-3 rounded-sm bg-[#05070A] border border-white/5 text-xs">
                  <div className="text-slate-200 font-bold uppercase text-[11px] mb-1">{diag.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{diag.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">All standard technical diagnostics passed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
