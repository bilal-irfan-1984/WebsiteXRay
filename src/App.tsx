import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { LandingSections } from './components/LandingSections.js';
import { AuditReportView } from './components/AuditReportView.js';
import { ScanningOverlay } from './components/ScanningOverlay.js';
import { ShareModal } from './components/ShareModal.js';
import { CompetitorComparisonModal } from './components/CompetitorComparisonModal.js';
import { AdminDashboardModal } from './components/AdminDashboardModal.js';
import { AuditRecord, CompetitorComparison } from './types.js';

export function App() {
  const [activeAudit, setActiveAudit] = useState<AuditRecord | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningUrl, setScanningUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Modals
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCompetitorsOpen, setIsCompetitorsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check URL query parameters for direct report links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auditId = params.get('audit');
    if (auditId) {
      fetchAuditById(auditId);
    }
  }, []);

  const fetchAuditById = async (id: string) => {
    try {
      const res = await fetch(`/api/audit/${id}`);
      const data = await res.json();
      if (res.ok && data.audit) {
        setActiveAudit(data.audit);
      }
    } catch (err) {
      console.error('Error fetching audit by ID:', err);
    }
  };

  const handleStartScan = async (url: string) => {
    setScanningUrl(url);
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/audit/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze website. Please check the URL.');
      }

      setActiveAudit(data.audit);
      setIsCached(!!data.isCached);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateCompetitors = (competitors: CompetitorComparison[]) => {
    if (activeAudit) {
      setActiveAudit({
        ...activeAudit,
        competitors,
      });
    }
  };

  const handleScrollTo = (sectionId: string) => {
    if (activeAudit && sectionId === 'hero-section') {
      setActiveAudit(null);
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveAudit(null);
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navigation */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToSection={handleScrollTo}
      />

      {/* Main View */}
      <main>
        {activeAudit ? (
          <AuditReportView
            audit={activeAudit}
            onNewScan={() => setActiveAudit(null)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenCompetitors={() => setIsCompetitorsOpen(true)}
            isCached={isCached}
          />
        ) : (
          <>
            <Hero
              onScan={handleStartScan}
              isLoading={isScanning}
              errorMessage={errorMessage}
            />
            <LandingSections
              onScanSample={handleStartScan}
            />
          </>
        )}
      </main>

      {/* Scanning Laser Beam Overlay */}
      {isScanning && <ScanningOverlay url={scanningUrl} />}

      {/* Modals */}
      {activeAudit && (
        <>
          <ShareModal
            audit={activeAudit}
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
          />

          <CompetitorComparisonModal
            audit={activeAudit}
            isOpen={isCompetitorsOpen}
            onClose={() => setIsCompetitorsOpen(false)}
            onUpdateCompetitors={handleUpdateCompetitors}
          />
        </>
      )}

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSelectAudit={(auditId) => fetchAuditById(auditId)}
      />

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/5 bg-[#080A0F] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase font-bold tracking-widest italic">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              100% Free Service
            </span>
            <span className="text-[10px] text-slate-600 font-mono">v2.5.0-free</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Powered by Core Web Vitals & Neural AI Engine
            </span>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleScrollTo('what-we-check')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              What We Check
            </button>
            <button
              onClick={() => handleScrollTo('free-features')}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
            >
              100% Free Forever
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
