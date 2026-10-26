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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Can } from './Can.js';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout, canScanTickets } = useAuth();
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
    <nav className="bg-allstar-navy-900/90 backdrop-blur-md border-b border-allstar-gold/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-allstar-gold to-amber-600 flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-luxury font-bold text-lg tracking-wider text-white">ALLSTAR</span>
                <span className="font-luxury font-bold text-lg tracking-wider text-allstar-gold">TICKET</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest -mt-1 font-mono">
                Pases de Abordaje & Eventos
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-allstar-gold/15 text-allstar-gold border border-allstar-gold/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eventos</span>
            </Link>

            {/* Scanner Link - Only visible with scanner:access permission */}
            <Can do="scanner:access">
              <Link
                to="/scanner"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive('/scanner')
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Scanner Puerta</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono">
                  LIVE
                </span>
              </Link>
            </Can>

            {/* Admin / Partner Panel Link */}
            <Link
              to="/admin"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-allstar-gold/15 text-allstar-gold border border-allstar-gold/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panel Socios & Admin</span>
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
                {/* Copy My Referral Link Button */}
                <button
                  onClick={handleCopyMyReferral}
                  className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/80 border border-sky-600/40 text-sky-300 text-xs font-mono hover:bg-sky-900 transition-colors"
                  title="Copiar mi enlace personal de referido"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>@{user.referralCode}</span>
                </button>

                {/* User chip */}
                <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-allstar-gold/20 border border-allstar-gold/40 flex items-center justify-center text-[11px] font-bold text-allstar-gold">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-white block leading-none">{user.fullName.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono text-allstar-gold uppercase block leading-none mt-0.5">
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'leader' ? '⭐ Líder' : '🤝 Socio'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-transparent hover:border-rose-500/30 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="pl-2 border-l border-white/10">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-allstar-gold text-black font-bold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 transition-all"
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
