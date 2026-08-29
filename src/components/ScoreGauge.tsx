import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showGrade?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  label = 'Website Health Score',
  showGrade = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use a 270 degree arc for gauge look
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75;

  let color = '#ef4444'; // Red < 50
  let badgeBg = 'bg-red-500/10 text-red-400 border-red-500/20';
  let grade = 'F';
  let statusText = 'Critical Remediation Needed';

  if (score >= 90) {
    color = '#10b981'; // Emerald 90+
    badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    grade = 'A+';
    statusText = 'Excellent Optimization';
  } else if (score >= 80) {
    color = '#06b6d4'; // Cyan 80-89
    badgeBg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    grade = 'A';
    statusText = 'Solid Web Standards';
  } else if (score >= 70) {
    color = '#3b82f6'; // Blue 70-79
    badgeBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    grade = 'B';
    statusText = 'Good with High-Impact Fixes';
  } else if (score >= 50) {
    color = '#f59e0b'; // Amber 50-69
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    grade = 'C';
    statusText = 'Needs Serious Attention';
  }

  return (
    <div id="score-gauge-container" className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-135">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Active Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline font-black italic tracking-tighter text-white" style={{ fontSize: size * 0.28 }}>
            <span>{score}</span>
            <span className="text-xs text-slate-500 font-mono font-bold not-italic ml-0.5">/100</span>
          </div>
          {showGrade && (
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest font-mono rounded-sm border mt-1 ${badgeBg}`}>
              Grade {grade}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</h4>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-200 mt-1">{statusText}</p>
      </div>
    </div>
  );
};
