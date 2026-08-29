import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sparkles, Key, Lock, Mail, User, ShieldCheck, LogOut, ArrowRight, CheckCircle2 } from 'lucide-react';

// Attempt to load the real Clerk components safely. If they throw or are missing keys, we handle it gracefully.
import {
  ClerkProvider as RealClerkProvider,
  SignedIn as RealSignedIn,
  SignedOut as RealSignedOut,
  useUser as useRealUser,
  useAuth as useRealAuth,
  useClerk as useRealClerk,
  SignIn,
  SignUp,
} from '@clerk/clerk-react';

const PUBLISHABLE_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';
const hasClerkKey = typeof PUBLISHABLE_KEY === 'string' && PUBLISHABLE_KEY.trim().startsWith('pk_');

function getIsClerkBypassed(): boolean {
  return localStorage.getItem('website_xray_use_sandbox_override') === 'true';
}

function getIsClerkConfiguredAndActive(): boolean {
  return hasClerkKey && !getIsClerkBypassed();
}

interface AppUser {
  email: string;
  fullName: string;
  imageUrl?: string;
  isDemoUser?: boolean;
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AppUser | null;
  signOut: () => void;
  signInWithDemo: (email: string, fullName: string) => void;
  isClerkConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signOut: () => {},
  signInWithDemo: () => {},
  isClerkConfigured: false,
});

export const useAppAuth = () => useContext(AuthContext);

// 1. Mock Clerk Fallback Provider for local/development run without configured keys
function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user was previously signed in to Demo Mode
    const saved = localStorage.getItem('website_xray_demo_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setIsSignedIn(true);
      } catch {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

  const signInWithDemo = (email: string, fullName: string) => {
    const demoUser: AppUser = {
      email: email.trim().toLowerCase() || 'developer@websitexray.com',
      fullName: fullName.trim() || 'XRay Developer',
      imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email || 'xray')}`,
      isDemoUser: true,
    };
    setUser(demoUser);
    setIsSignedIn(true);
    localStorage.setItem('website_xray_demo_auth', JSON.stringify(demoUser));
  };

  const signOut = () => {
    setIsSignedIn(false);
    setUser(null);
    localStorage.removeItem('website_xray_demo_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn,
        user,
        signOut,
        signInWithDemo,
        isClerkConfigured: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 2. Real Clerk Adaptor Component
function RealClerkAdaptor({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isUserLoaded } = useRealUser();
  const { signOut: realSignOut } = useRealClerk();
  const { isSignedIn } = useRealAuth();

  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      setAppUser({
        email: clerkUser.primaryEmailAddress?.emailAddress || 'user@websitexray.com',
        fullName: clerkUser.fullName || clerkUser.username || 'Clerk User',
        imageUrl: clerkUser.imageUrl,
        isDemoUser: false,
      });
    } else {
      setAppUser(null);
    }
  }, [isSignedIn, clerkUser]);

  return (
    <AuthContext.Provider
      value={{
        isLoaded: isUserLoaded,
        isSignedIn: !!isSignedIn,
        user: appUser,
        signOut: () => realSignOut(),
        signInWithDemo: () => {}, // Disabled in real mode
        isClerkConfigured: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 3. Main Global Wrapper Provider
export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  if (getIsClerkConfiguredAndActive()) {
    return (
      <RealClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <RealClerkAdaptor>{children}</RealClerkAdaptor>
      </RealClerkProvider>
    );
  }

  // Fallback to beautiful Offline Sandbox Auth Provider when keys aren't provided or bypassed
  return <DemoAuthProvider>{children}</DemoAuthProvider>;
}

// 4. Premium Auth Lock Gateway Screen
export function AuthGateway({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, signInWithDemo, isClerkConfigured: configured } = useAppAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-t-cyan-500 border-white/10 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 tracking-widest uppercase">Initializing Secure Auth Layer...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return <>{children}</>;
  }

  // 1. If real Clerk is configured, render official Clerk widgets
  if (configured) {
    return (
      <div className="min-h-screen bg-[#05070A] text-slate-200 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="px-8 py-5 border-b border-white/5 bg-[#0A0D12]/40 backdrop-blur-md flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              Website<span className="text-cyan-400">XRay</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            <span>SECURE GATEWAY ACTIVE</span>
          </div>
        </header>

        {/* Dynamic Iframe Error Handler / Sandbox Toggle Box */}
        <div className="max-w-md mx-auto w-full mt-6 px-4 z-20">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm text-amber-300 text-xs font-mono space-y-2">
            <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
              <Lock className="w-4 h-4 animate-pulse" />
              <span>"accounts.dev refused to connect"?</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-300">
              Because the AI Studio preview runs in an embedded <span className="text-white">iframe</span>, standard security protections block live Clerk authentication widgets. To fix this, you can open the app in a new browser tab or instantly use the Sandbox Bypass.
            </p>
            <div className="flex gap-2 pt-1.5">
              <a
                href={window.location.href}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 bg-cyan-500 text-black text-center font-black uppercase text-[9px] tracking-wider rounded-sm hover:bg-cyan-400 transition-colors"
              >
                Open in New Tab
              </a>
              <button
                onClick={() => {
                  localStorage.setItem('website_xray_use_sandbox_override', 'true');
                  window.location.reload();
                }}
                className="flex-1 py-1.5 px-3 bg-white/10 text-white text-center font-black uppercase text-[9px] tracking-wider rounded-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                Use Sandbox Bypass
              </button>
            </div>
          </div>
        </div>

        {/* Central Auth Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
          <div className="w-full max-w-md flex justify-center">
            {isSignUp ? (
              <SignUp
                routing="virtual"
                signInUrl="#"
                appearance={{
                  variables: {
                    colorPrimary: '#06b6d4',
                    colorBackground: '#0a0d12',
                    colorText: '#f1f5f9',
                    colorInputBackground: '#05070a',
                    colorInputText: '#ffffff',
                    colorTextOnPrimaryBackground: '#000000',
                    fontFamily: 'system-ui, sans-serif',
                  },
                  elements: {
                    card: 'border border-white/10 shadow-2xl bg-[#0a0d12]',
                    headerTitle: 'font-sans uppercase tracking-tight text-white font-black',
                    headerSubtitle: 'font-mono text-slate-400 text-xs',
                    footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-bold',
                    formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-wider transition-all',
                  }
                }}
              />
            ) : (
              <SignIn
                routing="virtual"
                signUpUrl="#"
                appearance={{
                  variables: {
                    colorPrimary: '#06b6d4',
                    colorBackground: '#0a0d12',
                    colorText: '#f1f5f9',
                    colorInputBackground: '#05070a',
                    colorInputText: '#ffffff',
                    colorTextOnPrimaryBackground: '#000000',
                    fontFamily: 'system-ui, sans-serif',
                  },
                  elements: {
                    card: 'border border-white/10 shadow-2xl bg-[#0a0d12]',
                    headerTitle: 'font-sans uppercase tracking-tight text-white font-black',
                    headerSubtitle: 'font-mono text-slate-400 text-xs',
                    footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-bold',
                    formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-wider transition-all',
                  }
                }}
              />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-white/5 bg-[#080A0F] text-[10px] text-slate-500 font-mono text-center relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          <span>WebsiteXRay Protected by Clerk Security Node</span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider text-[9px]"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </footer>
      </div>
    );
  }

  // 2. If Clerk is NOT configured, run our Sandbox-Mode fallback Auth with standard validation AND a single-click developer bypass!
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    const displayName = isSignUp ? name : email.split('@')[0];
    signInWithDemo(email, displayName || 'XRay Engineer');
  };

  const handleQuickLogin = () => {
    // Immediate, fail-safe bypass login with pre-populated developer account info
    signInWithDemo('irfanbilal019@gmail.com', 'Irfan Bilal');
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-200 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Decorative ambient blurred nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-5 border-b border-white/5 bg-[#0A0D12]/40 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Website<span className="text-cyan-400">XRay</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          <span>DEVELOPER SANDBOX BYPASS</span>
        </div>
      </header>

      {/* Primary Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md bg-[#0A0D12] border border-white/10 rounded-sm shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              {isSignUp ? 'Create Sandbox Session' : 'Sign In to Sandbox'}
            </h1>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Explore professional performance auditing & SEO intelligence.
            </p>
          </div>

          {hasClerkKey && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-sm text-cyan-300 text-[10px] font-mono leading-normal flex items-center justify-between gap-2">
              <span>Clerk keys detected but currently bypassed due to iframe constraints.</span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('website_xray_use_sandbox_override');
                  window.location.reload();
                }}
                className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-[9px] tracking-wider rounded-sm transition-colors cursor-pointer shrink-0"
              >
                Restore
              </button>
            </div>
          )}

          {/* Quick Login Button - ALWAYS WORKS, 100% SUCCESS RATE */}
          <div className="p-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-sm border border-cyan-500/30">
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-3 px-4 bg-[#0A0D12] hover:bg-cyan-950/20 text-white rounded-sm font-black uppercase text-[11px] tracking-widest transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>1-Click Sandbox Bypass</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono font-bold uppercase">
                <span>GO INSTANTLY</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[9px] uppercase font-bold tracking-widest font-mono">Or Use Credentials</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Fallback Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#05070A] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                />
              </div>
            </div>

            {isSignUp ? (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Irfan Bilal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#05070A] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#05070A] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <span>{isSignUp ? 'Create Sandbox Session' : 'Access Application'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          {/* Setup Instructions Drawer/Expandable Block */}
          <div className="border-t border-white/5 pt-4">
            <details className="group">
              <summary className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono hover:text-slate-300 transition-colors list-none cursor-pointer flex items-center justify-between">
                <span>Configure Live Clerk Accounts</span>
                <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 space-y-3 font-mono text-[11px] text-slate-400 leading-relaxed bg-[#05070A] p-3.5 border border-white/5 rounded-sm">
                <p>To hook up real user accounts using Clerk:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[10px]">
                  <li>Register for a free account at <a href="https://clerk.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">clerk.com</a>.</li>
                  <li>Copy your unique <span className="text-cyan-300">Publishable Key</span>.</li>
                  <li>In the AI Studio Settings panel, add this environment variable:</li>
                </ol>
                <div className="bg-[#0A0D12] p-2.5 border border-white/5 rounded font-mono text-[10px] text-emerald-400 break-all select-all">
                  VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
                </div>
              </div>
            </details>
          </div>

          <div className="text-center font-mono text-[10px] text-slate-500">
            {isSignUp ? 'Already have a session? ' : "Need to set up a new session? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-cyan-400 hover:underline font-bold font-mono"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/5 bg-[#080A0F] text-[10px] text-slate-500 font-mono text-center relative z-10">
        WebsiteXRay Protected • Sandbox Virtualization Node
      </footer>
    </div>
  );
}
