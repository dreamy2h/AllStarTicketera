import React from 'react';
import { QRScanner } from '../components/QRScanner.js';
import { ShieldCheck, Sparkles, Smartphone, Volume2, Info } from 'lucide-react';

export const ScannerPage: React.FC = () => {
  return (
    <div className="min-h-screen py-6 px-4 max-w-xl mx-auto flex flex-col justify-center">
      {/* Top Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Control de Acceso en Puerta</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-luxury text-white">
          Scanner de Pases de Abordaje
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Optimizado para lectura ultrarrápida con cámara móvil y confirmación instantánea.
        </p>
      </div>

      {/* Main Scanner Component */}
      <QRScanner />

      {/* Receptionist Tips */}
      <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-1">
          <Info className="w-4 h-4 text-allstar-gold" />
          <span>Instrucciones para el Equipo de Recepción:</span>
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
