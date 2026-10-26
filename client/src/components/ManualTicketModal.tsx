import React, { useState } from 'react';
import { X, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { TicketTypeItem, User as PartnerUser, TicketItem } from '../types/index.js';
import { api } from '../services/api.js';
import { BoardingPass } from './BoardingPass.js';

interface ManualTicketModalProps {
  eventId: string;
  ticketTypes: TicketTypeItem[];
  partners: PartnerUser[];
  onClose: () => void;
  onSuccess: (newTicket: TicketItem) => void;
}

export const ManualTicketModal: React.FC<ManualTicketModalProps> = ({
  eventId,
  ticketTypes,
  partners,
  onClose,
  onSuccess,
}) => {
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [ticketTypeId, setTicketTypeId] = useState(ticketTypes[0]?._id || '');
  const [referralCode, setReferralCode] = useState(partners[0]?.referralCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<TicketItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!attendeeName.trim() || !attendeeEmail.trim() || !ticketTypeId) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.registerTicket({
        eventId,
        ticketTypeId,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
        attendeePhone: attendeePhone.trim(),
        referralCode: referralCode || undefined,
      });

      setCreatedTicket(res.ticket);
      onSuccess(res.ticket);
    } catch (err: any) {
      setError(err.message || 'Error al emitir el pase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-allstar-navy-800 rounded-3xl border border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-allstar-navy-900 border-b border-allstar-gold/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-allstar-gold" />
            <h3 className="font-bold text-white text-base">
              {createdTicket ? '¡Pase Emitido Exitosamente!' : 'Emitir Pase de Entrada Manual'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {createdTicket ? (
            <div className="space-y-6">
              <BoardingPass ticket={createdTicket} showActions={true} />
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
              >
                Cerrar y Volver a la Lista
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Nombre Completo del Invitado / Asistente *
                </label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="Ej: Laura Sofía Daniels"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="laura@ejemplo.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    WhatsApp / Móvil (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Tipo de Entrada *
                  </label>
                  <select
                    value={ticketTypeId}
                    onChange={(e) => setTicketTypeId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                  >
                    {ticketTypes.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.price > 0 ? `$${t.price}` : 'Gratis'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Socio Referidor
                  </label>
                  <select
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                  >
                    <option value="">Sin Referidor (Directo)</option>
                    {partners.map((p) => (
                      <option key={p._id} value={p.referralCode}>
                        {p.fullName} (@{p.referralCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-bold text-sm shadow-gold hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? 'Generando...' : 'Generar Pase'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
