import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Search, Cpu, Sparkles, Check } from 'lucide-react';

interface ScanningOverlayProps {
  url: string;
}

const SCAN_STEPS = [
  {
    icon: ShieldCheck,
    title: 'SSRF & Domain Security Verification',
    desc: 'Validating public hostname, DNS resolution, and security certificates...',
    duration: 1800,
  },
  {
    icon: Activity,
    title: 'Core Web Vitals & Real-Time Performance',
    desc: 'Measuring LCP, FCP, CLS, TBT, and server response times across devices...',
    duration: 2600,
  },
  {
    icon: Search,
    title: 'DOM Extraction & Technical Signals',
    desc: 'Extracting metadata, headings, images, schema.org, CTAs & trust indicators...',
    duration: 2200,
  },
  {
    icon: Cpu,
    title: 'Deterministic Rule-Based Audit Engine',
    desc: 'Calculating weighted scores for SEO, Performance, Accessibility & Conversion...',
    duration: 2400,
  },
  {
    icon: Sparkles,
    title: 'Neural AI Executive Synthesis',
    desc: 'Formulating executive summary, top 5 problems & prioritized action plan...',
    duration: 3500,
  },
];

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ url }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    let active = true;
    let step = 0;

    const interval = setInterval(() => {
      if (!active) return;
      step++;
      if (step < SCAN_STEPS.length) {
        setCurrentStepIndex(step);
        setProgress(Math.min(95, Math.round(((step + 1) / SCAN_STEPS.length) * 100)));
      }
    }, 2200);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div id="scanning-overlay-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-lg bg-[#0A0D12] border border-white/10 rounded-sm p-6 shadow-2xl overflow-hidden text-center">
        {/* Animated Scanner Laser Beam */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Radar Pulse Icon */}
        <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping opacity-75" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#05070A] border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        {/* Status Header */}
        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">
          WebsiteXRay Scanning in Progress
        </h3>
        <p className="text-xs font-mono text-cyan-400 truncate max-w-sm mx-auto mb-5">
          {url}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#05070A] border border-white/10 rounded-sm h-2 overflow-hidden mb-6">
          <div
            className="h-full bg-cyan-400 transition-all duration-500 rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Progress Checklist */}
        <div className="space-y-2.5 text-left">
          {SCAN_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-sm border transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                    : isDone
                    ? 'bg-[#05070A] border-white/10 text-slate-300'
                    : 'bg-[#05070A]/50 border-white/5 text-slate-600 opacity-40'
                }`}
              >
                <div
                  className={`p-1.5 rounded-sm mt-0.5 ${
                    isDone
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : isCurrent
                      ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                      : 'bg-white/5 text-slate-600'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-tight">{step.title}</h4>
                    {isCurrent && (
                      <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider animate-pulse">
                        Analyzing...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
