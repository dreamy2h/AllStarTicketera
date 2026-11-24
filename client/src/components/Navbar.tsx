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
  Menu,
  X,
  History,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { Can } from './Can.js';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleTheme, logoSrc, isLight } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/' && !location.hash) return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleCopyMyReferral = () => {
    if (!user) return;
    const origin = window.location.origin;
    const currentEventMatch = location.pathname.match(/^\/eventos\/([^\/]+)/);
    const slug = currentEventMatch ? currentEventMatch[1] : '';
    const refLink = slug
      ? `${origin}/eventos/${slug}?ref=${user.referralCode}`
      : `${origin}/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white/95 dark:bg-allstar-navy-900/90 backdrop-blur-md border-b border-slate-200 dark:border-allstar-gold/20 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo ALL STAR TEAM */}
          <Link to="/" onClick={closeMenu} className="flex items-center space-x-3 group py-1">
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

          {/* Desktop Navigation Quick Links */}
          <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/')
                  ? 'bg-amber-500/10 text-amber-700 dark:text-allstar-gold border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-amber-600 dark:text-allstar-gold" />
              <span>Eventos</span>
            </Link>

            <a
              href="/#historial"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Historial</span>
            </a>

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
                <span>Scanner Puerta</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 font-mono font-bold">
                  LIVE
                </span>
              </Link>
            </Can>

            {/* Admin / Partner Panel Link - Only visible for authenticated users */}
            {user && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/admin')
                    ? 'bg-amber-500/10 text-amber-700 dark:text-allstar-gold border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-600 dark:text-allstar-gold" />
                <span>Panel Socios & Admin</span>
              </Link>
            )}
          </div>

          {/* Right Action Icons (Theme toggle + User chip / Auth + Hamburger button) */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all text-slate-600 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-slate-800/80 dark:text-amber-400 dark:border-white/10 dark:hover:bg-slate-700 shadow-sm"
              title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro (fondo blanco)'}
              aria-label="Toggle Theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Desktop User Status */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-white/10">
                <button
                  onClick={handleCopyMyReferral}
                  className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-600/40 text-sky-800 dark:text-sky-300 text-xs font-mono hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
                  title="Copiar mi enlace personal de referido"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>@{user.referralCode}</span>
                </button>

                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[11px] font-bold text-amber-700 dark:text-allstar-gold">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none">{user.fullName.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono text-amber-600 dark:text-allstar-gold uppercase block leading-none mt-0.5">
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'leader' ? '⭐ Líder' : '🤝 Socio'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-slate-400 dark:hover:text-rose-300 dark:border-transparent dark:hover:border-rose-500/30 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:block pl-2 border-l border-slate-200 dark:border-white/10">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Acceso Socios</span>
                </Link>
              </div>
            )}

            {/* Hamburger Button (Universal / Responsive toggle) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-600 dark:text-allstar-gold" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger Dropdown Drawer (Mobile & Expanded Menu) */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-white/10 bg-white/98 dark:bg-allstar-navy-900/98 backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {/* User details card in drawer if logged in */}
            {user && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-allstar-gradient flex items-center justify-center text-black font-extrabold text-sm shadow-sm">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.fullName}</h4>
                    <p className="text-xs text-amber-600 dark:text-allstar-gold font-mono font-medium mt-0.5">
                      {user.roleName || user.role} • @{user.referralCode}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyMyReferral}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-700/50 text-xs font-mono"
                  title="Copiar mi enlace"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Link</span>
                </button>
              </div>
            )}

            {/* Navigation links inside Drawer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Link
                to="/"
                onClick={closeMenu}
                className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive('/') && !location.hash
                    ? 'bg-amber-500/15 text-amber-700 dark:text-allstar-gold border border-amber-500/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-allstar-gold">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold">Próximos Eventos</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Explora eventos y registros activos</span>
                </div>
              </Link>

              <a
                href="/#historial"
                onClick={closeMenu}
                className="flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
              >
                <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold">Historial de Eventos</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Eventos pasados y cancelados</span>
                </div>
              </a>

              <Can do="scanner:access">
                <Link
                  to="/scanner"
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive('/scanner')
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold flex items-center space-x-2">
                      <span>Scanner en Puerta</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                        LIVE
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Validación de tickets con cámara QR</span>
                  </div>
                </Link>
              </Can>

              {user && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive('/admin')
                      ? 'bg-amber-500/15 text-amber-700 dark:text-allstar-gold border border-amber-500/30'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-allstar-gold">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Panel Socios & Admin</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Métricas, socios, roles y pases</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Tema:</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {isLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isLight ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
              </div>

              {user ? (
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 border border-rose-200 dark:border-rose-500/30 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Acceso Socios</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
