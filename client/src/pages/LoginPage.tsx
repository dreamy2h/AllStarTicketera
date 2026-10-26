import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Sparkles, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, UserCheck, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';

  // If already logged in, redirect to admin
  React.useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('AllStar2026!');
    setError(null);
    try {
      setIsLoading(true);
      await login(demoEmail, 'AllStar2026!');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión de demostración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-allstar-gold to-amber-600 flex items-center justify-center shadow-gold">
            <Lock className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-3xl font-extrabold font-luxury text-white">
            Portal de Socios & Líderes
          </h1>
          <p className="text-xs text-slate-400">
            Accede para gestionar tus invitaciones, monitorear prospectos y registrar nuevos socios.
          </p>
        </div>

        {/* Card */}
        <div className="card-luxury rounded-3xl p-7 border border-allstar-gold/30 shadow-gold">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-semibold">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="socio@allstarticket.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-gold hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
            >
              <span>{isLoading ? 'Verificando...' : 'Entrar al Panel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block text-center">
              Acceso Rápido de Prueba (Demo Cuentas):
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('zamyr@allstarticket.com')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">👑 Zamyr Pedreros (Admin)</span>
                  <span className="text-[10px] text-amber-300 font-mono">Todos los permisos + Crear eventos</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-bold">
                  Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('andrea.gomez@allstarticket.com')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">⭐ Andrea Gómez (Líder)</span>
                  <span className="text-[10px] text-sky-300 font-mono">Permiso: Gestionar y Crear Nuevos Socios</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 font-bold">
                  Líder
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('carlos.m@allstarticket.com')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">🤝 Carlos Mendoza (Socio General)</span>
                  <span className="text-[10px] text-purple-300 font-mono">Permiso: Invitar prospectos y ver sus tickets</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold">
                  Socio
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-slate-400 hover:text-allstar-gold transition-colors">
            ← Volver a la página principal de eventos
          </Link>
        </div>
      </div>
    </div>
  );
};
