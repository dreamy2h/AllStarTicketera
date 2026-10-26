import React from 'react';
import { Link } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner.js';
import { ShieldCheck, Info, Lock, ShieldAlert, ArrowLeft, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const ScannerPage: React.FC = () => {
  const { user, can, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <RefreshCw className="w-8 h-8 text-allstar-gold animate-spin mb-3" />
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Verificando credenciales de acceso...
        </span>
      </div>
    );
  }

  // Case 1: Unauthenticated visitor
  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Lock className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-2">
          Terminal de Puerta Protegida
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white mb-3">
          Acceso Exclusivo para Recepción
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
          El escáner de validación de entradas no está expuesto al público. Para operar esta terminal en la recepción del evento, debes iniciar sesión con una cuenta de socio o staff autorizada.
        </p>
        <Link
          to="/login"
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 transition-all"
        >
          Iniciar Sesión de Socio
        </Link>
      </div>
    );
  }

  // Case 2: Authenticated user without scanner:access permission
  if (!can('scanner:access')) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-2">
          Permiso Requerido: scanner:access
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white mb-3">
          Permiso No Asignado
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
          Hola <strong className="text-white">{user.fullName}</strong>. Tu cuenta tiene el rol <strong className="text-allstar-gold uppercase">({user.roleName || user.role})</strong>, el cual actualmente no cuenta con autorización para operar el scanner en puerta.
        </p>
        <p className="text-slate-500 text-xs mb-6">
          Si formas parte del equipo de recepción, solicita a un administrador que asigne el permiso <code className="text-amber-300 font-mono">scanner:access</code> a tu rol o usuario.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel de Socios</span>
        </Link>
      </div>
    );
  }

  // Case 3: Authorized operator
  return (
    <div className="min-h-screen py-6 px-4 max-w-xl mx-auto flex flex-col justify-center">
      {/* Top Banner */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-between mb-3">
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Panel de Socios</span>
          </Link>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[11px] font-mono text-slate-300">
            <User className="w-3 h-3 text-allstar-gold" />
            <span>Operador: <strong className="text-white">{user.fullName.split(' ')[0]}</strong></span>
          </div>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Control de Acceso en Puerta • scanner:access</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-luxury text-white">
          Scanner de Pases de Abordaje
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Lectura con cámara móvil o webcam y validación instantánea contra base de datos.
        </p>
      </div>

      {/* Main Scanner Component */}
      <QRScanner />

      {/* Receptionist Tips */}
      <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-1">
          <Info className="w-4 h-4 text-allstar-gold" />
          <span>Instrucciones para el Operador de Recepción:</span>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-emerald-400 font-bold">•</span>
          <span>
            <strong>Luz Verde + Campanilla:</strong> Acceso autorizado, da la bienvenida al invitado por su nombre.
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-rose-400 font-bold">•</span>
          <span>
            <strong>Alerta Roja + Zumbador:</strong> El ticket ya fue escaneado antes. Revisa la hora de ingreso en pantalla.
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-allstar-gold font-bold">•</span>
          <span>
            Si la cámara tiene reflejo de luz, puedes ingresar el código alfanumérico manualmente abajo.
          </span>
        </div>
      </div>
    </div>
  );
};

