import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertTriangle, XCircle, Clock, UserCheck, X } from 'lucide-react';
import { CheckInResponse } from '../types/index.js';
import { sound } from '../services/audio.js';

interface CheckInResultModalProps {
  result: CheckInResponse | null;
  onClose: () => void;
}

export const CheckInResultModal: React.FC<CheckInResultModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const isSuccess = result.success;
  const isAlreadyUsed = result.alreadyUsed;
  const isInvalid = !isSuccess && !isAlreadyUsed;

  const ticket = result.ticket;
  const ticketType = typeof ticket?.ticketTypeId === 'object' ? ticket.ticketTypeId : null;
  const referrer = typeof ticket?.invitedByUserId === 'object' && ticket.invitedByUserId ? ticket.invitedByUserId : null;

  useEffect(() => {
    if (isSuccess) {
      sound.playSuccess();
      sound.vibrate([100, 50, 100]);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f7e7a9', '#d4af37'],
        });
      } catch (e) {
        // Safe fallback
      }
    } else {
      sound.playError();
      sound.vibrate([250, 100, 250]);
    }
  }, [result]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative border-2 text-center transition-all ${
          isSuccess
            ? 'bg-[#062417] border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.35)]'
            : isAlreadyUsed
            ? 'bg-[#2b0c14] border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
            : 'bg-[#261608] border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.35)]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State Icon */}
        <div className="flex justify-center mb-4">
          {isSuccess && (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
          )}
          {isAlreadyUsed && (
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-12 h-12 text-rose-400" />
            </div>
          )}
          {isInvalid && (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-amber-400" />
            </div>
          )}
        </div>

        {/* Status Title */}
        <h2
          className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-wide mb-2 ${
            isSuccess ? 'text-emerald-300' : isAlreadyUsed ? 'text-rose-400' : 'text-amber-300'
          }`}
        >
          {isSuccess
            ? '¡ACCESO AUTORIZADO!'
            : isAlreadyUsed
            ? '¡TICKET YA UTILIZADO!'
            : 'TICKET NO VÁLIDO'}
        </h2>

        <p className="text-sm text-slate-300 mb-6">{result.message}</p>

        {/* Attendee Details Card */}
        {ticket && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Nombre del Asistente
              </span>
              <span className="text-xl font-bold text-white uppercase block">
                {ticket.attendeeName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Tipo de Pase
                </span>
                <span className="text-sm font-semibold text-allstar-gold block">
                  {ticketType?.name || 'General'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Código Ticket
                </span>
                <span className="text-sm font-mono font-bold text-slate-200 block">
                  {ticket.ticketCode}
                </span>
              </div>
            </div>

            {/* Referrer Info */}
            <div className="pt-2 border-t border-white/10 flex items-center space-x-2 text-sm text-sky-300">
              <UserCheck className="w-4 h-4 shrink-0 text-sky-400" />
              <span>
                Invitado por:{' '}
                <strong className="text-white">
                  {referrer ? `${referrer.fullName} (@${referrer.referralCode})` : 'Registro Directo'}
                </strong>
              </span>
            </div>

            {/* Already Used Warning Details */}
            {isAlreadyUsed && result.checkedInAt && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center space-x-2 text-xs text-rose-300">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  Check-in previo registrado a las:{' '}
                  <strong>{new Date(result.checkedInAt).toLocaleTimeString('es-ES')}</strong> (
                  {new Date(result.checkedInAt).toLocaleDateString('es-ES')})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onClose}
          className={`w-full py-4 rounded-xl font-bold text-base uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
            isSuccess
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          Escanear Siguiente Asistente
        </button>
      </div>
    </div>
  );
};
