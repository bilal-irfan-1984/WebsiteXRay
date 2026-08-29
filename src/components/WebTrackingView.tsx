import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Radio,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Zap,
  Globe,
  Lock,
  Server,
  Filter,
  Play,
  Pause,
  RefreshCw,
  Eye,
  BarChart3,
  Flame,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';
import { WebTrackingAudit, WebTrackerItem, LiveTrackingPoint } from '../types';

interface WebTrackingViewProps {
  trackingAudit?: WebTrackingAudit;
  targetUrl: string;
  domain: string;
}

export const WebTrackingView: React.FC<WebTrackingViewProps> = ({
  trackingAudit: initialAudit,
  targetUrl,
  domain,
}) => {
  const [auditData, setAuditData] = useState<WebTrackingAudit | undefined>(initialAudit);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [streamIntervalSec, setStreamIntervalSec] = useState<number>(5);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [history, setHistory] = useState<LiveTrackingPoint[]>(
    initialAudit?.trackingHistory || []
  );
  const [latestPoint, setLatestPoint] = useState<LiveTrackingPoint | undefined>(
    initialAudit?.liveTelemetry
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync if prop updates
  useEffect(() => {
    if (initialAudit) {
      setAuditData(initialAudit);
      setLatestPoint(initialAudit.liveTelemetry);
      if (initialAudit.trackingHistory?.length) {
        setHistory(initialAudit.trackingHistory);
      }
    }
  }, [initialAudit]);

  // Execute real live ping probe
  const triggerLivePing = async () => {
    setIsPinging(true);
    try {
      const res = await fetch('/api/track/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.telemetry) {
          setLatestPoint(data.telemetry);
          setHistory((prev) => {
            const next = [...prev, data.telemetry];
            return next.slice(-25);
          });
        }
      }
    } catch (err) {
      console.error('Live ping failed:', err);
    } finally {
      setIsPinging(false);
    }
  };

  // Live streaming toggle
  useEffect(() => {
    if (isLiveStreaming) {
      triggerLivePing();
      intervalRef.current = setInterval(() => {
        triggerLivePing();
      }, streamIntervalSec * 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLiveStreaming, streamIntervalSec, targetUrl]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const trackers = auditData?.trackers || [];
  const privacy = auditData?.privacy;
  const summary = auditData?.summary;

  const categories = [
    { id: 'all', label: 'All Trackers', count: trackers.length },
    {
      id: 'analytics',
      label: 'Analytics',
      count: trackers.filter((t) => t.category === 'analytics').length,
    },
    {
      id: 'advertising',
      label: 'Ad Pixels',
      count: trackers.filter((t) => t.category === 'advertising').length,
    },
    {
      id: 'session_replay',
      label: 'Session Replay',
      count: trackers.filter((t) => t.category === 'session_replay').length,
    },
    {
      id: 'tag_manager',
      label: 'Tag Manager',
      count: trackers.filter((t) => t.category === 'tag_manager').length,
    },
    {
      id: 'cdp',
      label: 'CDP & Data',
      count: trackers.filter((t) => t.category === 'cdp').length,
    },
  ];

  const filteredTrackers =
    selectedCategory === 'all'
      ? trackers
      : trackers.filter((t) => t.category === selectedCategory);

  const getPrivacyGradeBadge = (grade?: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'B':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'C':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'D':
      case 'F':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-300';
    }
  };

  return (
    <div className="space-y-8" id="web-tracking-panel">
      {/* Top Banner: Real-time status & Live Probe Controller */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                Real Web Tracking & Telemetry Engine
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPrivacyGradeBadge(
                  privacy?.privacyGrade || summary?.trackingHealthGrade
                )}`}
              >
                Privacy Grade: {privacy?.privacyGrade || summary?.trackingHealthGrade || 'B'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Real-time Web Tracking & Live Uptime Monitor
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Active socket telemetry, tag manager inspection, Consent Mode v2 audit, and live latency streams for <span className="font-semibold text-slate-800">{domain}</span>
            </p>
          </div>

          {/* Action controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live stream toggle */}
            <button
              id="btn-toggle-live-stream"
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLiveStreaming
                  ? 'bg-rose-600 text-white shadow-sm hover:bg-rose-700'
                  : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
              }`}
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="w-4 h-4" /> Stop Live Stream
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Live Stream
                </>
              )}
            </button>

            {/* Manual Ping Probe */}
            <button
              id="btn-send-live-ping"
              onClick={triggerLivePing}
              disabled={isPinging}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin text-indigo-600' : ''}`} />
              {isPinging ? 'Pinging Host...' : 'Send Live Ping'}
            </button>

            {/* Stream Interval */}
            {isLiveStreaming && (
              <select
                value={streamIntervalSec}
                onChange={(e) => setStreamIntervalSec(Number(e.target.value))}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>Every 3s</option>
                <option value={5}>Every 5s</option>
                <option value={10}>Every 10s</option>
                <option value={30}>Every 30s</option>
              </select>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Live Uptime</span>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {summary?.uptimePercentage ?? 100}%
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] font-medium text-emerald-700">Online & Serving</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Response Time</span>
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {latestPoint?.responseTimeMs ?? 145} <span className="text-xs font-normal text-slate-500">ms</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              TTFB: <span className="font-semibold text-slate-700">{latestPoint?.ttfbMs ?? 110}ms</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Detected Trackers</span>
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {summary?.totalTrackers ?? trackers.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary?.advertisingPixels ?? 0} Ad Pixels · {summary?.analyticsTrackers ?? 0} Analytics
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Consent Mode v2</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {privacy?.consentModeV2.configured ? 'Configured' : 'Not Detected'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              State: <span className="font-medium capitalize text-slate-700">{privacy?.consentModeV2.defaultState || 'None'}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>SSL Health</span>
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {latestPoint?.sslDaysRemaining !== undefined ? `${latestPoint.sslDaysRemaining}d` : 'Valid'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              TLS Handshake: {latestPoint?.tlsHandshakeMs ?? 35}ms
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Edge Server</span>
              <Server className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-sm font-bold text-slate-900 truncate" title={latestPoint?.server || 'Edge'}>
              {latestPoint?.server || 'Edge Gateway'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              IP: {latestPoint?.ip || 'Resolving...'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Latency Waterfall & Historical Stream */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live Network Timing Breakdown & Ping Timeline</h3>
            <p className="text-xs text-slate-500">Sub-millisecond connection socket breakdown and real-time telemetry stream</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
            HTTP {latestPoint?.status || 200} {latestPoint?.statusText || 'OK'}
          </span>
        </div>

        {/* Timing Waterfall Bar */}
        {latestPoint && (
          <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Total Response Time: <strong className="text-slate-900">{latestPoint.responseTimeMs}ms</strong></span>
              <span>Payload: <strong className="text-slate-900">{Math.round((latestPoint.contentLengthBytes || 0) / 1024)} KB</strong></span>
            </div>

            {/* Segmented Bar */}
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.max(5, (latestPoint.dnsLookupMs / Math.max(1, latestPoint.responseTimeMs)) * 100)}%` }}
                className="bg-blue-500 h-full"
                title={`DNS Lookup: ${latestPoint.dnsLookupMs}ms`}
              />
              <div
                style={{ width: `${Math.max(5, (latestPoint.tcpConnectMs / Math.max(1, latestPoint.responseTimeMs)) * 100)}%` }}
                className="bg-purple-500 h-full"
                title={`TCP Connect: ${latestPoint.tcpConnectMs}ms`}
              />
              <div
                style={{ width: `${Math.max(5, (latestPoint.tlsHandshakeMs / Math.max(1, latestPoint.responseTimeMs)) * 100)}%` }}
                className="bg-emerald-500 h-full"
                title={`TLS Handshake: ${latestPoint.tlsHandshakeMs}ms`}
              />
              <div
                style={{ width: `${Math.max(10, (latestPoint.ttfbMs / Math.max(1, latestPoint.responseTimeMs)) * 100)}%` }}
                className="bg-amber-500 h-full"
                title={`TTFB: ${latestPoint.ttfbMs}ms`}
              />
              <div
                style={{ width: `${Math.max(5, (latestPoint.contentDownloadMs / Math.max(1, latestPoint.responseTimeMs)) * 100)}%` }}
                className="bg-indigo-500 h-full"
                title={`Content Download: ${latestPoint.contentDownloadMs}ms`}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span>DNS ({latestPoint.dnsLookupMs}ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                <span>TCP Connect ({latestPoint.tcpConnectMs}ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>TLS Handshake ({latestPoint.tlsHandshakeMs}ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span>TTFB ({latestPoint.ttfbMs}ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span>Content Download ({latestPoint.contentDownloadMs}ms)</span>
              </div>
            </div>
          </div>
        )}

        {/* History Stream Timeline */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Historical Ping Timeline (Last {history.length} Probes)</span>
            <span className="text-slate-400 font-normal">Auto-records each probe</span>
          </div>

          <div className="flex items-end gap-1.5 h-20 bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto">
            {history.map((pt, idx) => {
              const maxMs = Math.max(...history.map((h) => h.responseTimeMs), 300);
              const heightPct = Math.max(15, Math.min(100, (pt.responseTimeMs / maxMs) * 100));
              const isLatest = idx === history.length - 1;
              const isError = !pt.isUp;
              return (
                <div
                  key={pt.id || idx}
                  className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full group relative"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      isError
                        ? 'bg-rose-500'
                        : isLatest
                        ? 'bg-indigo-600'
                        : pt.responseTimeMs > 400
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap font-mono">
                      {pt.responseTimeMs}ms · {pt.status} {pt.statusText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tracker Inventory & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Detected Tracking Pixels & Telemetry SDKs</h3>
            <p className="text-xs text-slate-500">Live extracted measurement IDs, session replays, and conversion pixels</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {filteredTrackers.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Trackers Found in this Category</h4>
            <p className="text-xs text-slate-500 mt-1">This site does not load third-party scripts matching this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrackers.map((t) => (
              <div
                key={t.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <span className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">
                      {t.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.privacyImpact === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : t.privacyImpact === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {t.privacyImpact} Privacy Impact
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3">{t.details}</p>

                {/* Extracted ID block */}
                {t.extractedId && (
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 mb-3">
                    <span className="font-semibold truncate">{t.extractedId}</span>
                    <button
                      onClick={() => copyToClipboard(t.extractedId || '', t.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-indigo-600 hover:text-indigo-800 ml-2"
                    >
                      {copiedId === t.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Cookie & Compliance Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 text-[11px]">
                  {t.cookiesCreated.length > 0 && (
                    <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-mono">
                      Cookies: {t.cookiesCreated.slice(0, 3).join(', ')}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${
                      t.consentModeCompliant
                        ? 'bg-emerald-100/70 text-emerald-800'
                        : 'bg-amber-100/70 text-amber-800'
                    }`}
                  >
                    {t.consentModeCompliant ? 'Consent Compliant' : 'Unconsented Trigger Risk'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Google Consent Mode v2 & Privacy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Google Consent Mode v2 Matrix</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Mandatory in the European Economic Area (EEA) for Google Ads, remarketing lists, and conversion bidding.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs font-semibold text-slate-700">ad_storage</div>
              <div className="text-xs text-slate-500 mt-0.5">Enables storage for advertising cookies</div>
              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                privacy?.consentModeV2.adStorage ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {privacy?.consentModeV2.adStorage ? 'Detected' : 'Default / Not Set'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs font-semibold text-slate-700">analytics_storage</div>
              <div className="text-xs text-slate-500 mt-0.5">Enables storage for analytics cookies</div>
              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                privacy?.consentModeV2.analyticsStorage ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {privacy?.consentModeV2.analyticsStorage ? 'Detected' : 'Default / Not Set'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs font-semibold text-slate-700">ad_user_data (v2)</div>
              <div className="text-xs text-slate-500 mt-0.5">Sends user data to Google for ads</div>
              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                privacy?.consentModeV2.adUserData ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {privacy?.consentModeV2.adUserData ? 'Configured' : 'Missing (EEA Risk)'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs font-semibold text-slate-700">ad_personalization (v2)</div>
              <div className="text-xs text-slate-500 mt-0.5">Enables personalized remarketing</div>
              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                privacy?.consentModeV2.adPersonalization ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {privacy?.consentModeV2.adPersonalization ? 'Configured' : 'Missing (EEA Risk)'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900">
            <span className="font-semibold">CMP Detected:</span> {privacy?.cmpDetected || 'None (Custom or Unmanaged)'}
          </div>
        </div>

        {/* Privacy & Tag Bloat Warnings */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Privacy & Tag Bloat Diagnostics</h3>
            </div>

            <div className="space-y-3">
              {privacy?.thirdPartyCookieWarnings?.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{warning}</span>
                </div>
              ))}

              {privacy?.piiQueryWarnings?.map((pii, idx) => (
                <div key={`pii-${idx}`} className="flex items-start gap-2 p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{pii}</span>
                </div>
              ))}

              {(!privacy?.thirdPartyCookieWarnings || privacy.thirdPartyCookieWarnings.length === 0) &&
                (!privacy?.piiQueryWarnings || privacy.piiQueryWarnings.length === 0) && (
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No unmasked PII query strings or major tracking compliance warnings detected.</span>
                  </div>
                )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tag Overhead Impact Score: <strong className="text-slate-800">{privacy?.trackingBloatScore || 20}/100</strong></span>
            <span>Total Active Tags: <strong className="text-slate-800">{trackers.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
