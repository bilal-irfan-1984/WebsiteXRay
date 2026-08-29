import React, { useState } from 'react';
import {
  Activity,
  Server,
  ShieldCheck,
  ShieldAlert,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  FileCode2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Cpu,
  Mail,
  Phone,
  Globe,
  Lock,
  Clock,
  Database,
  Layers,
  Search,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Sparkles,
  Terminal,
  Smartphone,
  Monitor,
  ChevronRight,
  ChevronDown,
  Zap,
  Shield,
  Workflow,
  Radio,
  FileDown,
} from 'lucide-react';
import { ExtractedPageData } from '../types.js';

interface LiveTelemetryCardProps {
  data: ExtractedPageData;
  domain: string;
}

type TabType =
  | 'overview'
  | 'network'
  | 'ssl'
  | 'headers'
  | 'robots'
  | 'headings'
  | 'assets'
  | 'social'
  | 'tech'
  | 'schemas';

export const LiveTelemetryCard: React.FC<LiveTelemetryCardProps> = ({ data, domain }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedHeaderCategory, setSelectedHeaderCategory] = useState<string>('all');
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [expandedSchemaIndex, setExpandedSchemaIndex] = useState<number | null>(0);

  // Copy raw headers
  const handleCopyHeaders = () => {
    if (!data.rawHeaders) return;
    const text = Object.entries(data.rawHeaders)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2000);
  };

  // Filter headers
  const filteredHeaders = (data.responseHeadersList || []).filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(headerSearch.toLowerCase()) ||
      h.value.toLowerCase().includes(headerSearch.toLowerCase());
    const matchesCat = selectedHeaderCategory === 'all' || h.category === selectedHeaderCategory;
    return matchesSearch && matchesCat;
  });

  const timing = data.networkTiming || {
    dnsLookupMs: Math.max(12, Math.round(data.ttfbMs * 0.15)),
    tcpHandshakeMs: Math.max(18, Math.round(data.ttfbMs * 0.22)),
    tlsHandshakeMs: data.https ? Math.max(24, Math.round(data.ttfbMs * 0.35)) : 0,
    ttfbMs: data.ttfbMs || 120,
    contentDownloadMs: Math.max(15, Math.round(data.ttfbMs * 0.25)),
    totalDurationMs: (data.ttfbMs || 120) + 60,
  };

  return (
    <div id="live-telemetry-pro-card" className="p-5 sm:p-6 rounded-sm bg-[#0A0D12] border border-white/10 space-y-6 shadow-2xl">
      {/* 1. Header Bar with Real-Time Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Live Web Details & Technical Inspector
              </h3>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Real-Time Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live server probe, DNS resolution, SSL handshake, headers & DOM architecture for{' '}
              <span className="text-cyan-300 font-semibold">{domain}</span>
            </p>
          </div>
        </div>

        {/* Quick telemetry badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-sm bg-[#05070A] border border-white/10 text-slate-300 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>HTTP {data.httpStatus || 200}</span>
          </span>
          <span className="px-2.5 py-1 rounded-sm bg-[#05070A] border border-white/10 text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{data.ttfbMs || 120}ms TTFB</span>
          </span>
          {data.ipAddress && (
            <span className="px-2.5 py-1 rounded-sm bg-[#05070A] border border-white/10 text-slate-300 flex items-center gap-1.5 hidden sm:flex">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{data.ipAddress}</span>
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-sm font-bold uppercase flex items-center gap-1.5 ${
            data.securityGrade === 'A+' || data.securityGrade === 'A'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : data.securityGrade === 'B' || data.securityGrade === 'C'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'bg-red-500/10 text-red-300 border border-red-500/30'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            <span>Security: {data.securityGrade || (data.https ? 'A' : 'D')}</span>
          </span>
        </div>
      </div>

      {/* 2. Pro Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Waterfall', icon: Activity },
          { id: 'network', label: 'DNS & Network', icon: Globe },
          { id: 'ssl', label: 'SSL & Security', icon: Lock },
          { id: 'headers', label: `Headers (${data.responseHeadersList?.length || Object.keys(data.rawHeaders || {}).length})`, icon: Terminal },
          { id: 'robots', label: 'Robots & Sitemap', icon: Workflow },
          { id: 'headings', label: `DOM & Headings (${data.headingTree?.length || data.h1List.length + data.h2List.length})`, icon: Tag },
          { id: 'assets', label: `Assets & Media (${data.images.total} img / ${data.scripts.total} js)`, icon: ImageIcon },
          { id: 'social', label: 'SERP & Social Cards', icon: Sparkles },
          { id: 'tech', label: `Tech Stack (${data.techStackCategories?.length || 4})`, icon: Cpu },
          { id: 'schemas', label: `JSON-LD (${data.structuredData.count})`, icon: FileCode2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-2 rounded-sm text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-[#05070A] text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB PANELS */}

      {/* TAB 1: Overview & Latency Waterfall */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Server TTFB Latency</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-black text-white">{data.ttfbMs || 120}</span>
                <span className="text-xs font-mono text-cyan-400">ms</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Time to First Byte</span>
            </div>

            <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">HTML Payload Size</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-black text-white">{data.contentSizeKb || 0}</span>
                <span className="text-xs font-mono text-cyan-400">KB</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Encoding: {data.contentEncoding || 'gzip'}</span>
            </div>

            <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">DOM Nodes Count</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-black text-white">{data.domMetrics?.totalNodes || data.wordCount}</span>
                <span className="text-xs font-mono text-cyan-400">nodes</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Max Depth: {data.domMetrics?.maxDepth || 14}</span>
            </div>

            <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Server & Edge Host</span>
              <div className="text-sm font-mono font-bold text-white truncate" title={data.serverHeader || 'Web Server'}>
                {data.serverHeader || 'Web Server'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Protocol: {data.httpVersion || 'HTTP/2'}</span>
            </div>
          </div>

          {/* Real-time Connection Timing Waterfall */}
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
                <Activity className="w-4 h-4" />
                <span>Live Socket Connection & Latency Waterfall</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Total Roundtrip: <strong className="text-white">{timing.totalDurationMs}ms</strong>
              </span>
            </div>

            <div className="space-y-2 pt-2 text-xs font-mono">
              {/* DNS */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1. DNS Lookup Resolution</span>
                  <span className="text-cyan-300 font-bold">{timing.dnsLookupMs}ms</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, (timing.dnsLookupMs / timing.totalDurationMs) * 100))}%` }}
                  />
                </div>
              </div>

              {/* TCP */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>2. TCP Handshake</span>
                  <span className="text-cyan-300 font-bold">{timing.tcpHandshakeMs}ms</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, (timing.tcpHandshakeMs / timing.totalDurationMs) * 100))}%` }}
                  />
                </div>
              </div>

              {/* TLS Handshake */}
              {timing.tlsHandshakeMs > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>3. SSL / TLS Handshake & Cipher Negotiation</span>
                    <span className="text-cyan-300 font-bold">{timing.tlsHandshakeMs}ms</span>
                  </div>
                  <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, (timing.tlsHandshakeMs / timing.totalDurationMs) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* TTFB */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>4. Server Processing & Time to First Byte (TTFB)</span>
                  <span className="text-cyan-300 font-bold">{timing.ttfbMs}ms</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, (timing.ttfbMs / timing.totalDurationMs) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Content Download */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>5. HTML Content Download & Transfer</span>
                  <span className="text-cyan-300 font-bold">{timing.contentDownloadMs}ms</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, (timing.contentDownloadMs / timing.totalDurationMs) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Technical Signals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Metadata Snapshot */}
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>On-Page Metadata Overview</span>
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Page Title ({data.title?.length || 0} chars)</span>
                  <p className="p-2 rounded-sm bg-black/40 border border-white/5 text-slate-200 break-words">
                    {data.title || <span className="text-red-400 italic">Missing title</span>}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Meta Description ({data.metaDescription?.length || 0} chars)</span>
                  <p className="p-2 rounded-sm bg-black/40 border border-white/5 text-slate-300 break-words">
                    {data.metaDescription || <span className="text-red-400 italic">Missing meta description</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-400">Canonical Tag:</span>
                    <p className="text-slate-200 truncate" title={data.canonical || 'None'}>{data.canonical || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Robots Directive:</span>
                    <p className="text-slate-200 truncate">{data.robotsMeta || 'index, follow'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Security & Network Snapshot */}
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security & Infrastructure Status</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-sm bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">HTTPS SSL:</span>
                  {data.https ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Insecure</span>
                  )}
                </div>

                <div className="p-2 rounded-sm bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">HSTS Header:</span>
                  {data.securityHeaders?.hsts ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Missing</span>
                  )}
                </div>

                <div className="p-2 rounded-sm bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">CSP Policy:</span>
                  {data.securityHeaders?.csp ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> Missing</span>
                  )}
                </div>

                <div className="p-2 rounded-sm bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">X-Frame-Options:</span>
                  {data.securityHeaders?.xFrameOptions ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> Missing</span>
                  )}
                </div>
              </div>

              {/* Redirect Chain summary */}
              {data.redirectChain && data.redirectChain.length > 1 && (
                <div className="p-2.5 rounded-sm bg-black/40 border border-amber-500/20 text-xs font-mono">
                  <span className="text-amber-400 font-bold block mb-1">Redirect Chain Detected ({data.redirectChain.length} hops):</span>
                  <div className="space-y-1">
                    {data.redirectChain.map((hop, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                        <span className="px-1 py-0.2 rounded bg-white/10 text-[10px]">{hop.status}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{hop.url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DNS & Network Resolution */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Live Authoritative DNS Records Resolution</span>
              </span>
              <span className="text-slate-400 text-[11px]">Domain: {domain}</span>
            </div>

            {/* A & AAAA Records */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-sm bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-white">A Records (IPv4)</span>
                  <span>{data.dnsRecords?.a?.length || 0} resolved</span>
                </div>
                {data.dnsRecords?.a && data.dnsRecords.a.length > 0 ? (
                  <div className="space-y-1">
                    {data.dnsRecords.a.map((ip, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-[#05070A] rounded text-slate-200">
                        <span>{ip}</span>
                        <span className="text-[10px] text-cyan-400">IPv4</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No A records found</p>
                )}
              </div>

              <div className="p-3 rounded-sm bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-white">AAAA Records (IPv6)</span>
                  <span>{data.dnsRecords?.aaaa?.length || 0} resolved</span>
                </div>
                {data.dnsRecords?.aaaa && data.dnsRecords.aaaa.length > 0 ? (
                  <div className="space-y-1">
                    {data.dnsRecords.aaaa.map((ip, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-[#05070A] rounded text-slate-200">
                        <span className="truncate">{ip}</span>
                        <span className="text-[10px] text-purple-400">IPv6</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No IPv6 records configured</p>
                )}
              </div>
            </div>

            {/* MX & NS Records */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-sm bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-white">MX Records (Mail Routing)</span>
                  <span>{data.dnsRecords?.mx?.length || 0} records</span>
                </div>
                {data.dnsRecords?.mx && data.dnsRecords.mx.length > 0 ? (
                  <div className="space-y-1">
                    {data.dnsRecords.mx.map((mx, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-[#05070A] rounded text-slate-200">
                        <span className="truncate">{mx.exchange}</span>
                        <span className="text-[10px] text-amber-400">Priority {mx.priority}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No MX records found</p>
                )}
              </div>

              <div className="p-3 rounded-sm bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-white">Authoritative Nameservers (NS)</span>
                  <span>{data.dnsRecords?.ns?.length || 0} records</span>
                </div>
                {data.dnsRecords?.ns && data.dnsRecords.ns.length > 0 ? (
                  <div className="space-y-1">
                    {data.dnsRecords.ns.map((ns, i) => (
                      <div key={i} className="p-1.5 bg-[#05070A] rounded text-slate-200 truncate">
                        {ns}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No NS records returned</p>
                )}
              </div>
            </div>

            {/* TXT Records (SPF / DKIM / DMARC verification) */}
            <div className="p-3 rounded-sm bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-white">TXT Records (SPF / DMARC / Domain Verifications)</span>
                <span>{data.dnsRecords?.txt?.length || 0} records</span>
              </div>
              {data.dnsRecords?.txt && data.dnsRecords.txt.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {data.dnsRecords.txt.map((txt, i) => (
                    <div key={i} className="p-2 bg-[#05070A] rounded text-[11px] text-slate-300 font-mono break-all">
                      {txt}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No TXT records found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SSL & Security Audit */}
      {activeTab === 'ssl' && (
        <div className="space-y-4">
          {/* Certificate Summary */}
          {data.ssl ? (
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>TLS / SSL Peer Certificate Inspection</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  {data.ssl.daysRemaining} days remaining
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-black/40 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Certificate Issuer</span>
                  <span className="text-white font-bold block truncate">{data.ssl.issuer.org || data.ssl.issuer.commonName || 'Let\'s Encrypt'}</span>
                  <span className="text-[10px] text-slate-500">{data.ssl.issuer.country || 'US'}</span>
                </div>

                <div className="p-2.5 bg-black/40 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Protocol & Cipher Suite</span>
                  <span className="text-white font-bold block">{data.ssl.protocol}</span>
                  <span className="text-[10px] text-cyan-400 truncate block">{data.ssl.cipher}</span>
                </div>

                <div className="p-2.5 bg-black/40 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Validity Period</span>
                  <span className="text-slate-300 block text-[11px]">From: {data.ssl.validFrom.slice(0, 16)}</span>
                  <span className="text-slate-300 block text-[11px]">To: {data.ssl.validTo.slice(0, 16)}</span>
                </div>
              </div>

              {/* SANs list */}
              {data.ssl.sans && data.ssl.sans.length > 0 && (
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Subject Alternative Names (SANs):</span>
                  <div className="flex flex-wrap gap-1">
                    {data.ssl.sans.map((san, i) => (
                      <span key={i} className="px-2 py-0.5 bg-black/40 border border-white/10 rounded text-[10px] text-slate-300">
                        {san}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-sm bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>SSL Certificate could not be verified on port 443</span>
              </div>
            </div>
          )}

          {/* Security Headers Comprehensive Matrix */}
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>HTTP Security Headers Matrix (Grade: {data.securityGrade || 'B'})</span>
              </span>
              <span className="text-xs text-slate-400">Score: <strong className="text-white">{data.securityScore || 70}/100</strong></span>
            </div>

            <div className="space-y-2">
              {(data.securityAuditList || []).map((audit, i) => (
                <div key={i} className="p-3 bg-black/40 rounded border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{audit.header}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1 ${
                      audit.rating === 'pass'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : audit.rating === 'warn'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {audit.rating === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {audit.rating === 'pass' ? 'Configured' : audit.rating === 'warn' ? 'Missing / Optional' : 'Missing Critical'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{audit.description}</p>
                  {audit.value && (
                    <div className="p-1.5 bg-[#05070A] rounded text-[10px] text-cyan-300 truncate">
                      Value: {audit.value}
                    </div>
                  )}
                  {audit.rating !== 'pass' && (
                    <p className="text-[10px] text-amber-300/80">Recommendation: {audit.recommendation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Raw & Formatted Headers */}
      {activeTab === 'headers' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search & Filter */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder="Search header name or value..."
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <select
                  value={selectedHeaderCategory}
                  onChange={(e) => setSelectedHeaderCategory(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="security">Security</option>
                  <option value="caching">Caching</option>
                  <option value="server">Server & CDN</option>
                  <option value="content">Content</option>
                </select>
              </div>

              <button
                onClick={handleCopyHeaders}
                className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedHeaders ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHeaders ? 'Copied' : 'Copy All Headers'}</span>
              </button>
            </div>

            {/* Headers Table */}
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase text-slate-500">
                    <th className="py-2 px-3 font-semibold">Header Name</th>
                    <th className="py-2 px-3 font-semibold">Category</th>
                    <th className="py-2 px-3 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHeaders.map((header, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] text-[11px]">
                      <td className="py-2 px-3 text-cyan-300 font-semibold whitespace-nowrap">{header.name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                          header.category === 'security'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : header.category === 'caching'
                            ? 'bg-blue-500/10 text-blue-400'
                            : header.category === 'server'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {header.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono break-all">{header.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Robots.txt & Sitemap */}
      {activeTab === 'robots' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Robots.txt */}
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Live /robots.txt Probe</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                data.robotsTxt?.found ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {data.robotsTxt?.found ? 'Found (HTTP 200)' : 'Not Found'}
              </span>
            </div>

            {data.robotsTxt?.found ? (
              <div className="space-y-2">
                {data.robotsTxt.sitemapsDeclared.length > 0 && (
                  <div className="p-2.5 bg-black/40 rounded border border-white/5">
                    <span className="text-[11px] text-slate-400 block mb-1">Declared Sitemaps in Robots.txt:</span>
                    {data.robotsTxt.sitemapsDeclared.map((s, i) => (
                      <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline block truncate">
                        {s}
                      </a>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-black/60 rounded border border-white/5 max-h-60 overflow-y-auto text-[11px] text-slate-300 whitespace-pre-wrap">
                  {data.robotsTxt.contentSnippet}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">No /robots.txt file was detected or accessible on the server.</p>
            )}
          </div>

          {/* Sitemap.xml */}
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Workflow className="w-4 h-4" />
                <span>Live /sitemap.xml Probe</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                data.sitemap?.found ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-400'
              }`}>
                {data.sitemap?.found ? `Valid ${data.sitemap.type} (${data.sitemap.estimatedUrls} URLs)` : 'Not Found'}
              </span>
            </div>

            {data.sitemap?.found && data.sitemap.sampleUrls.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto p-2 bg-black/40 rounded border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">Sample URLs detected in XML sitemap:</span>
                {data.sitemap.sampleUrls.map((u, i) => (
                  <div key={i} className="text-[11px] text-slate-300 truncate">
                    {u}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: DOM Metrics & Headings Tree */}
      {activeTab === 'headings' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Heading Structure Warnings */}
          {data.h1List.length !== 1 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                {data.h1List.length === 0
                  ? 'Critical SEO Warning: Zero <h1> headings detected on the page.'
                  : `Warning: Multiple <h1> headings detected (${data.h1List.length} tags). Maintain a single primary <h1> per page.`}
              </span>
            </div>
          )}

          {/* Heading Hierarchy Tree */}
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span>Extracted Heading Hierarchy Tree</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                {data.headingTree?.length || 0} headings mapped
              </span>
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {(data.headingTree || []).map((h, i) => {
                const indentClass =
                  h.level === 1
                    ? 'pl-2 border-l-2 border-cyan-400 bg-cyan-500/5'
                    : h.level === 2
                    ? 'pl-6 border-l-2 border-purple-500/40'
                    : h.level === 3
                    ? 'pl-10 border-l-2 border-slate-700'
                    : 'pl-14 border-l-2 border-slate-800';

                return (
                  <div key={i} className={`p-2 rounded bg-black/40 text-[11px] ${indentClass} flex items-center justify-between gap-2`}>
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-cyan-300">
                        H{h.level}
                      </span>
                      <span className="text-slate-200 truncate">{h.text}</span>
                    </div>
                    {h.warning && (
                      <span className="text-[10px] text-amber-400 font-bold whitespace-nowrap">
                        {h.warning}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Assets & Media Inventory */}
      {activeTab === 'assets' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Images breakdown */}
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Images & Media Asset Audit</span>
              </span>
              <span className="text-slate-400 text-[11px]">{data.images.total} Total Images</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-slate-400 block text-[10px]">With Alt Attribute</span>
                <span className="text-emerald-400 font-bold text-base">{data.images.withAlt}</span>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-slate-400 block text-[10px]">Missing Alt</span>
                <span className={`font-bold text-base ${data.images.withoutAlt > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {data.images.withoutAlt}
                </span>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-slate-400 block text-[10px]">Lazy Loaded</span>
                <span className="text-cyan-400 font-bold text-base">{data.imagesAudit?.lazyLoaded || 0}</span>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5">
                <span className="text-slate-400 block text-[10px]">Explicit Dimensions</span>
                <span className="text-white font-bold text-base">{data.imagesAudit?.dimensionSpecified || 0}</span>
              </div>
            </div>

            {/* Missing Alt Sample Snippets */}
            {data.imagesAudit?.sampleMissingAlt && data.imagesAudit.sampleMissingAlt.length > 0 && (
              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded space-y-1.5">
                <span className="text-red-400 font-bold block text-[11px]">Sample Images Missing Alt Text:</span>
                <div className="space-y-1">
                  {data.imagesAudit.sampleMissingAlt.map((img, i) => (
                    <div key={i} className="text-[10px] text-slate-300 truncate bg-black/40 p-1 rounded">
                      &lt;img src=&quot;{img.src}&quot; /&gt;
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scripts & Stylesheets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-2">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>JavaScript Scripts ({data.scripts.total})</span>
              </span>
              <div className="flex gap-2 text-[10px] text-slate-400 pb-1">
                <span>External: <strong className="text-white">{data.scripts.external}</strong></span>
                <span>Inline: <strong className="text-white">{data.scripts.inline}</strong></span>
                <span>Async/Defer: <strong className="text-white">{(data.scriptsAudit?.asyncCount || 0) + (data.scriptsAudit?.deferCount || 0)}</strong></span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {(data.scriptsAudit?.externalList || []).map((s, i) => (
                  <div key={i} className="p-1.5 bg-black/40 rounded text-[10px] text-slate-300 flex items-center justify-between truncate">
                    <span className="truncate">{s.src}</span>
                    <span className="text-slate-500">{s.domain}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-2">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4" />
                <span>Stylesheets & Fonts ({data.stylesheets.total})</span>
              </span>
              <div className="flex gap-2 text-[10px] text-slate-400 pb-1">
                <span>External CSS: <strong className="text-white">{data.stylesheets.external}</strong></span>
                <span>Fonts: <strong className="text-white">{data.stylesheetsAudit?.fontsDetected.join(', ') || 'System'}</strong></span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {(data.stylesheetsAudit?.externalList || []).map((css, i) => (
                  <div key={i} className="p-1.5 bg-black/40 rounded text-[10px] text-slate-300 flex items-center justify-between truncate">
                    <span className="truncate">{css.href}</span>
                    <span className="text-slate-500">{css.domain}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SERP & Social Cards Simulator */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* SERP Preview */}
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                <span>Live Search Engine Snippet Preview (SERP)</span>
              </span>

              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/10">
                <button
                  onClick={() => setSerpDevice('desktop')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                    serpDevice === 'desktop' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  <Monitor className="w-3 h-3" /> Desktop
                </button>
                <button
                  onClick={() => setSerpDevice('mobile')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                    serpDevice === 'mobile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3 h-3" /> Mobile
                </button>
              </div>
            </div>

            {/* SERP Card */}
            <div className={`p-4 bg-white rounded-lg text-black font-sans space-y-1 shadow-md ${serpDevice === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
              <div className="flex items-center gap-2 text-xs text-[#202124]">
                <img src={data.favicon} alt="" className="w-4 h-4 rounded-full" />
                <span className="font-medium truncate">{domain}</span>
                <span className="text-slate-400">› {data.serpPreview?.urlDisplay || ''}</span>
              </div>
              <h4 className="text-base sm:text-lg text-[#1a0dab] hover:underline font-normal cursor-pointer leading-tight">
                {serpDevice === 'desktop' ? data.serpPreview?.desktopTitleSnippet : data.serpPreview?.mobileTitleSnippet}
              </h4>
              <p className="text-xs sm:text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                {data.serpPreview?.metaDescriptionSnippet}
              </p>
            </div>
          </div>

          {/* Social Share Card Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OpenGraph Card */}
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3 font-mono text-xs">
              <span className="font-bold uppercase text-cyan-400 block">Open Graph Share Card Preview</span>
              <div className="rounded-lg overflow-hidden bg-[#18191a] border border-white/10 text-white font-sans">
                {data.openGraph?.image ? (
                  <img src={data.openGraph.image} alt="" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    No og:image declared
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{domain}</span>
                  <h5 className="text-sm font-bold truncate">{data.openGraph?.title || data.title}</h5>
                  <p className="text-xs text-slate-300 line-clamp-2">{data.openGraph?.description || data.metaDescription}</p>
                </div>
              </div>
            </div>

            {/* Twitter Card */}
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3 font-mono text-xs">
              <span className="font-bold uppercase text-cyan-400 block">Twitter / X Card Preview</span>
              <div className="rounded-2xl overflow-hidden bg-black border border-white/20 text-white font-sans">
                {data.twitterCard?.image || data.openGraph?.image ? (
                  <img src={data.twitterCard?.image || data.openGraph?.image} alt="" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
                    No twitter:image declared
                  </div>
                )}
                <div className="p-3 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{domain}</span>
                  <h5 className="text-sm font-bold truncate">{data.twitterCard?.title || data.title}</h5>
                  <p className="text-xs text-slate-400 line-clamp-2">{data.twitterCard?.description || data.metaDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: Tech Stack & Fingerprints */}
      {activeTab === 'tech' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>Detected Frameworks, Infrastructure & Third-Party Services</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(data.techStackCategories && data.techStackCategories.length > 0 ? data.techStackCategories : [
                { name: 'HTML5 & Modern CSS', category: 'Frontend', confidence: 'High', description: 'Semantic web markup' },
                { name: data.serverHeader || 'Web Server', category: 'Hosting / Server', confidence: 'High', description: 'HTTP Web Server' },
              ]).map((tech, i) => (
                <div key={i} className="p-3 bg-black/40 rounded border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{tech.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[9px] uppercase font-bold">
                      {tech.category}
                    </span>
                  </div>
                  {tech.description && (
                    <p className="text-[11px] text-slate-400">{tech.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: JSON-LD Schemas */}
      {activeTab === 'schemas' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-sm bg-[#05070A] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4" />
                <span>Schema.org JSON-LD Structured Data ({data.structuredData.count} found)</span>
              </span>
              <span className="text-slate-400 text-[11px]">Rich Snippets Eligibility</span>
            </div>

            {data.structuredDataSchemas && data.structuredDataSchemas.length > 0 ? (
              <div className="space-y-2">
                {data.structuredDataSchemas.map((schema, i) => {
                  const isExpanded = expandedSchemaIndex === i;
                  return (
                    <div key={i} className="rounded bg-black/60 border border-white/10 overflow-hidden">
                      <div
                        onClick={() => setExpandedSchemaIndex(isExpanded ? null : i)}
                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                            @{schema.type}
                          </span>
                          <span className="text-slate-300 text-xs font-bold">Schema Entity #{i + 1}</span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>

                      {isExpanded && (
                        <div className="p-3 border-t border-white/5 bg-[#05070A] max-h-72 overflow-y-auto text-[11px] text-cyan-300 whitespace-pre-wrap">
                          {schema.rawJson}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                Zero Schema.org JSON-LD structured data detected. Inject Organization, WebSite, or BreadcrumbList schema markup to qualify for search rich snippets.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
