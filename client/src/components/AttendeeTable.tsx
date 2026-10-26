import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  QrCode,
  User,
} from 'lucide-react';
import { TicketItem, User as PartnerUser } from '../types/index.js';
import { api } from '../services/api.js';
import { generateWhatsAppTicketLink } from '../services/whatsapp.js';

interface AttendeeTableProps {
  attendees: TicketItem[];
  partners: PartnerUser[];
  eventId: string;
  onRefresh: () => void;
  onSelectTicketForPass: (ticket: TicketItem) => void;
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({
  attendees,
  partners,
  eventId,
  onRefresh,
  onSelectTicketForPass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [checkingInCode, setCheckingInCode] = useState<string | null>(null);

  // Client-side quick filter
  const filteredAttendees = attendees.filter((t) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      t.attendeeName.toLowerCase().includes(term) ||
      t.attendeeEmail.toLowerCase().includes(term) ||
      t.ticketCode.toLowerCase().includes(term) ||
      (t.attendeePhone && t.attendeePhone.includes(term));

    // Partner
    const partner = typeof t.invitedByUserId === 'object' ? t.invitedByUserId : null;
    const matchesPartner =
      selectedPartnerId === 'all' ||
      (selectedPartnerId === 'direct' && !partner) ||
      (partner && partner._id === selectedPartnerId);

    // Status
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchesSearch && matchesPartner && matchesStatus;
  });

  const handleManualCheckIn = async (code: string) => {
    try {
      setCheckingInCode(code);
      await api.checkInTicket(code);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error al realizar check-in');
    } finally {
      setCheckingInCode(null);
    }
  };

  const handleDownloadCsv = () => {
    const url = api.getExportCsvUrl(eventId);
    window.open(url, '_blank');
  };

  return (
    <div className="card-luxury rounded-2xl border border-white/10 overflow-hidden">
      {/* Controls Header */}
      <div className="p-5 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o código..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold"
          />
        </div>

        {/* Filters and CSV Export */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Partner filter */}
          <select
            value={selectedPartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-allstar-gold"
          >
            <option value="all">Todos los Socios</option>
            <option value="direct">Directo / Sin Referidor</option>
            {partners.map((p) => (
              <option key={p._id} value={p._id}>
                {p.fullName} (@{p.referralCode})
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-allstar-gold"
          >
            <option value="all">Todos los Estados</option>
            <option value="registered">Inscritos (Pendientes)</option>
            <option value="checked_in">Check-in Realizado</option>
          </select>

          {/* CSV Export Button */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs active:scale-95 transition-all shadow-md ml-auto"
            title="Descargar lista completa compatible con Excel"
          >
            <Download className="w-4 h-4 text-allstar-gold" />
            <span>Exportar CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/60 border-b border-white/10 text-[11px] font-mono uppercase text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Código / Pase</th>
              <th className="py-3 px-4 font-semibold">Asistente</th>
              <th className="py-3 px-4 font-semibold">Tipo Entrada</th>
              <th className="py-3 px-4 font-semibold">Invitado Por</th>
              <th className="py-3 px-4 font-semibold text-center">Estado</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAttendees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No se encontraron asistentes con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredAttendees.map((t) => {
                const partner = typeof t.invitedByUserId === 'object' ? t.invitedByUserId : null;
                const ticketType = typeof t.ticketTypeId === 'object' ? t.ticketTypeId : null;
                const event = typeof t.eventId === 'object' ? t.eventId : null;

                const whatsappUrl = generateWhatsAppTicketLink({
                  phone: t.attendeePhone,
                  attendeeName: t.attendeeName,
                  eventName: event?.title || 'Evento AllStar',
                  ticketCode: t.ticketCode,
                  ticketViewUrl: `${window.location.origin}/ticket/${t.ticketCode}`,
                  referrerName: partner?.fullName,
                });

                return (
                  <tr key={t._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Code */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectTicketForPass(t)}
                        className="font-mono text-xs font-bold text-allstar-gold hover:underline flex items-center space-x-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{t.ticketCode}</span>
                      </button>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {new Date(t.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </td>

                    {/* Attendee Info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{t.attendeeName}</div>
                      <div className="text-xs text-slate-400">{t.attendeeEmail}</div>
                      {t.attendeePhone && (
                        <div className="text-xs text-slate-500">{t.attendeePhone}</div>
                      )}
                    </td>

                    {/* Ticket Type */}
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">
                        {ticketType?.name || 'General'}
                      </span>
                      {ticketType && ticketType.price > 0 && (
                        <span className="text-xs text-allstar-gold ml-1 font-bold">
                          ${ticketType.price}
                        </span>
                      )}
                    </td>

                    {/* Referrer Partner */}
                    <td className="py-3 px-4">
                      {partner ? (
                        <div>
                          <div className="text-xs font-semibold text-sky-400">{partner.fullName}</div>
                          <span className="text-[10px] font-mono text-slate-400">
                            @{partner.referralCode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Directo</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {t.status === 'checked_in' ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            <CheckCircle className="w-3 h-3" />
                            <span>En Recinto</span>
                          </span>
                          {t.checkedInAt && (
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {new Date(t.checkedInAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>Pendiente</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Manual Check-in Button */}
                        {t.status !== 'checked_in' && (
                          <button
                            onClick={() => handleManualCheckIn(t.ticketCode)}
                            disabled={checkingInCode === t.ticketCode}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                            title="Marcar ingreso manual en puerta"
                          >
                            {checkingInCode === t.ticketCode ? '...' : 'Check-in'}
                          </button>
                        )}

                        {/* WhatsApp Send Link */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors"
                          title="Enviar Pase por WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* View Boarding Pass Modal */}
                        <button
                          onClick={() => onSelectTicketForPass(t)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Ver Boarding Pass"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-900/60 border-t border-white/10 text-xs text-slate-400 flex justify-between items-center">
        <span>Mostrando {filteredAttendees.length} de {attendees.length} asistentes</span>
        <span className="font-mono text-[11px] text-slate-500">Actualizado en tiempo real</span>
      </div>
    </div>
  );
};
