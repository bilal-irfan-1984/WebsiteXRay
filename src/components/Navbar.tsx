import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, BarChart2, CheckCircle2, LogOut, User, Key } from 'lucide-react';
import { useAppAuth } from './ClerkAuthProvider.js';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenPricing?: () => void;
  onScrollToSection: (sectionId: string) => void;
  userCredits?: { email: string; remainingCredits: number } | null;
  onCheckCredits?: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onScrollToSection,
}) => {
  const { user, signOut } = useAppAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0A0D12]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          id="brand-logo"
          onClick={() => onScrollToSection('hero-section')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center group-hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              Website<span className="text-cyan-400">XRay</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 hidden sm:inline">
              AUDIT AI
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <button
            id="nav-link-how"
            onClick={() => onScrollToSection('how-it-works')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            id="nav-link-check"
            onClick={() => onScrollToSection('what-we-check')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            What We Check
          </button>
          <button
            id="nav-link-sample"
            onClick={() => onScrollToSection('sample-audit')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Sample Report
          </button>
          <button
            id="nav-link-free-features"
            onClick={() => onScrollToSection('free-features')}
            className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            100% Free
          </button>
          <button
            id="nav-link-faq"
            onClick={() => onScrollToSection('faq-section')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* 100% Free Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>NO CHARGES • 100% FREE</span>
          </div>

          {/* Admin Telemetry Button */}
          <button
            id="btn-admin-telemetry"
            onClick={onOpenAdmin}
            title="Open Admin & Telemetry"
            className="p-2 rounded-sm bg-[#080A0F] border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {/* Clerk Authenticated User Menu */}
          {user && (
            <div className="relative font-mono" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-sm bg-[#080A0F] border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <img
                  src={user.imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                  alt="Avatar"
                  className="w-5 h-5 rounded-full bg-[#05070A] border border-white/15"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline max-w-[120px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0A0D12] border border-white/10 rounded-sm shadow-2xl p-4 space-y-3.5 z-50 text-left animate-in fade-in duration-150">
                  <div className="border-b border-white/5 pb-3">
                    <div className="text-xs font-black text-white uppercase truncate">{user.fullName}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</div>
                    {user.isDemoUser && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/30 text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                        <Key className="w-2.5 h-2.5" /> Sandbox Account
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onScrollToSection('hero-section');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-white/5 text-[10px] text-slate-300 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Audit Center</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-red-500/10 text-[10px] text-slate-400 hover:text-red-400 uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scan CTA */}
          <button
            id="btn-nav-scan-cta"
            onClick={() => onScrollToSection('hero-section')}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black bg-cyan-500 hover:bg-cyan-400 transition-all rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Scan Free</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};

