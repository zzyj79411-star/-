import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, History, Home, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { storage } from '../services/storage';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const history = storage.getHistory();
  const latestAnalysisId = history.length > 0 ? history[0].id : null;

  const reportPath = latestAnalysisId ? `/analysis/${latestAnalysisId}` : '/';

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/20 selection:text-primary pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/history"
              className={cn(
                "hidden md:block text-[10px] font-headline font-bold uppercase tracking-widest transition-colors",
                location.pathname === "/history" ? "text-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              历史记录
            </Link>
            
            <Link to={reportPath} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div className="block">
                <h1 className="font-headline font-extrabold text-lg tracking-tight leading-none">Lucid</h1>
                <p className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest mt-1">Brand Visual Auditor</p>
              </div>
            </Link>

            <Link
              to="/"
              className={cn(
                "hidden md:block text-[10px] font-headline font-bold uppercase tracking-widest transition-colors",
                location.pathname === "/" ? "text-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              首页
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-surface-low border border-outline-variant/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 z-50 w-full h-16 px-6 flex justify-around items-center bg-surface/90 backdrop-blur-2xl border-t border-outline-variant/10 lg:hidden">
        <Link
          to="/history"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            location.pathname === "/history" ? "text-primary" : "text-on-surface-variant hover:text-primary"
          )}
        >
          <History className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">历史记录</span>
        </Link>

        <Link to={reportPath} className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center -mt-8 shadow-lg shadow-primary/30 border-4 border-surface">
          <ShieldCheck className="text-white w-6 h-6" />
        </Link>

        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            location.pathname === "/" ? "text-primary" : "text-on-surface-variant hover:text-primary"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">首页</span>
        </Link>
      </nav>

      {/* Footer (Desktop Only) */}
      <footer className="hidden lg:block py-12 px-6 border-t border-outline-variant/10 bg-surface-low">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Lucid Brand Visual Auditor</span>
          </div>
          <div className="flex gap-8">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant cursor-pointer hover:text-primary transition-colors">Expert Methodology</span>
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant cursor-pointer hover:text-primary transition-colors">Audit Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
