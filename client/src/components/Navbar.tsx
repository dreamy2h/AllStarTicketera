import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  QrCode,
  LayoutDashboard,
  Ticket,
  Sparkles,
  LogIn,
  LogOut,
  User,
  Copy,
  Check,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { Can } from './Can.js';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout, canScanTickets } = useAuth();
  const { theme, toggleTheme, logoSrc, isLight } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleCopyMyReferral = () => {
    if (!user) return;
    const origin = window.location.origin;
    const refLink = `${origin}/eventos/cumbre-cruceros-2026?ref=${user.referralCode}`;
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <nav className="bg-white/95 dark:bg-allstar-navy-900/90 backdrop-blur-md border-b border-slate-200 dark:border-allstar-gold/20 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo ALL STAR TEAM */}
          <Link to="/" className="flex items-center space-x-3 group py-1">
            <img
              src={logoSrc}
              alt="All Star Team"
              className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(255,170,0,0.35)] group-hover:scale-105 transition-transform duration-200"
            />
            <div className="hidden sm:block border-l border-slate-200 dark:border-white/10 pl-2.5">
              <span className="font-luxury font-bold text-xs tracking-widest text-amber-600 dark:text-allstar-gold block uppercase leading-none">
                TICKETS
              </span>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-0.5">
                Plataforma Oficial
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-allstar-gold border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eventos</span>
            </Link>

            {/* Scanner Link - Only visible with scanner:access permission */}
            <Can do="scanner:access">
              <Link
                to="/scanner"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/scanner')
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Scanner Puerta</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 font-mono font-bold">
                  LIVE
                </span>
              </Link>
            </Can>

            {/* Admin / Partner Panel Link */}
            <Link
              to="/admin"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/admin')
                  ? 'bg-amber-500/10 text-amber-700 dark:text-allstar-gold border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panel Socios & Admin</span>
            </Link>

            {/* Theme Toggle Button (Light/Dark) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border transition-all text-slate-600 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-slate-800/80 dark:text-amber-400 dark:border-white/10 dark:hover:bg-slate-700"
              title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro (fondo blanco)'}
              aria-label="Toggle Theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-white/10">
                {/* Copy My Referral Link Button */}
                <button
                  onClick={handleCopyMyReferral}
                  className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-600/40 text-sky-800 dark:text-sky-300 text-xs font-mono hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
                  title="Copiar mi enlace personal de referido"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>@{user.referralCode}</span>
                </button>

                {/* User chip */}
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10">
                  <div className="w-6 h-6 rounded-full bg-allstar-gold/20 border border-allstar-gold/40 flex items-center justify-center text-[11px] font-bold text-amber-700 dark:text-allstar-gold">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none">{user.fullName.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono text-amber-600 dark:text-allstar-gold uppercase block leading-none mt-0.5">
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'leader' ? '⭐ Líder' : '🤝 Socio'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-slate-400 dark:hover:text-rose-300 dark:border-transparent dark:hover:border-rose-500/30 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="pl-2 border-l border-slate-200 dark:border-white/10">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Acceso Socios</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
