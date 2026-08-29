import React, { useEffect, useState } from 'react';
import { X, DollarSign, Users, FileText, CheckCircle2, TrendingUp, Globe, Activity, RefreshCw, Eye } from 'lucide-react';
import { AdminStats, AuditRecord } from '../types.js';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAudit: (auditId: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onSelectAudit,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-secret': secret || 'xray-admin-secret' },
      });
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div id="admin-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div id="admin-modal-container" className="relative w-full max-w-5xl bg-[#0A0D12] border border-white/10 rounded-sm p-6 shadow-2xl text-slate-100 my-8">
        {/* Close Button */}
        <button
          id="btn-close-admin"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-sm bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">WebsiteXRay SaaS Telemetry & Admin</h2>
              <p className="text-xs text-slate-400 font-mono">Real-time revenue, conversion telemetry, and audit inspection.</p>
            </div>
          </div>

          <button
            id="btn-refresh-admin"
            onClick={fetchStats}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-sm bg-white/5 border border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {stats ? (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
              <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Audits</span>
                <div className="text-xl font-black text-white mt-0.5">{stats.totalAudits}</div>
              </div>
              <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-500">Paid Audits</span>
                <div className="text-xl font-black text-cyan-400 mt-0.5">{stats.paidAudits}</div>
              </div>
              <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Revenue</span>
                <div className="text-xl font-black text-emerald-400 mt-0.5">${stats.totalRevenue}</div>
              </div>
              <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-500">Conversion Rate</span>
                <div className="text-xl font-black text-cyan-300 mt-0.5">{stats.conversionRate}%</div>
              </div>
              <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Users</span>
                <div className="text-xl font-black text-purple-400 mt-0.5">{stats.totalUsers}</div>
              </div>
              <div className="p-3.5 rounded-sm bg-[#05070A] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-500">Access Mode</span>
                <div className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> 100% Free
                </div>
              </div>
            </div>

            {/* Two Column Layout: Top Domains & Recent Purchases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
              {/* Top Audited Domains */}
              <div className="p-4 rounded-sm bg-[#05070A] border border-white/10">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Most Audited Websites
                </h3>
                <div className="space-y-2">
                  {stats.topDomains.length > 0 ? (
                    stats.topDomains.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-sm bg-[#0A0D12] border border-white/5 text-xs">
                        <span className="font-medium text-slate-200">{d.domain}</span>
                        <span className="font-mono text-cyan-400 font-bold">{d.count} scan{d.count > 1 ? 's' : ''}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No domain scan history yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Purchases */}
              <div className="p-4 rounded-sm bg-[#05070A] border border-white/10">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Recent Purchases
                </h3>
                <div className="space-y-2">
                  {stats.recentPurchases.length > 0 ? (
                    stats.recentPurchases.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-sm bg-[#0A0D12] border border-white/5 text-xs">
                        <div>
                          <div className="font-medium text-white">{p.email}</div>
                          <span className="text-[10px] text-slate-500 uppercase">{p.plan}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">${p.amount}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No purchases recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Inspector List */}
            <div className="p-4 rounded-sm bg-[#05070A] border border-white/10">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Recent Audits Inspector
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 font-mono uppercase text-[10px]">
                      <th className="p-2 font-bold">URL</th>
                      <th className="p-2 font-bold">Score</th>
                      <th className="p-2 font-bold">Status</th>
                      <th className="p-2 font-bold">Date</th>
                      <th className="p-2 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {stats.recentAudits.map((a) => (
                      <tr key={a.id} className="hover:bg-white/5">
                        <td className="p-2 text-slate-200 truncate max-w-xs">{a.url}</td>
                        <td className="p-2 font-black text-white">{a.overallScore}/100</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${a.isPaid ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-slate-400'}`}>
                            {a.isPaid ? 'Paid Unlocked' : 'Free Preview'}
                          </span>
                        </td>
                        <td className="p-2 text-slate-400 text-[11px]">{new Date(a.createdAt).toLocaleTimeString()}</td>
                        <td className="p-2 text-right">
                          <button
                            id={`btn-inspect-${a.id}`}
                            onClick={() => {
                              onSelectAudit(a.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-sm bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs font-mono uppercase">
            Loading administrative telemetry...
          </div>
        )}
      </div>
    </div>
  );
};
