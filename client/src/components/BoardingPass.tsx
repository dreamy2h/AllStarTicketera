import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import {
  Download,
  Share2,
  Calendar,
  MapPin,
  UserCheck,
  Check,
  Plane,
  Compass,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { TicketItem } from '../types/index.js';
import { generateWhatsAppTicketLink } from '../services/whatsapp.js';

interface BoardingPassProps {
  ticket: TicketItem;
  showActions?: boolean;
}

export const BoardingPass: React.FC<BoardingPassProps> = ({ ticket, showActions = true }) => {
  const passRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cast populated fields
  const event = typeof ticket.eventId === 'object' ? ticket.eventId : null;
  const ticketType = typeof ticket.ticketTypeId === 'object' ? ticket.ticketTypeId : null;
  const referrer = typeof ticket.invitedByUserId === 'object' && ticket.invitedByUserId ? ticket.invitedByUserId : null;

  const eventDate = event?.eventDate ? new Date(event.eventDate) : new Date();
  const dateFormatted = eventDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  const timeFormatted = eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const clientUrl = window.location.origin;
  const ticketUrl = `${clientUrl}/ticket/${ticket.ticketCode}`;

  const handleDownloadImage = async () => {
    if (!passRef.current) return;
    try {
      setIsDownloading(true);
      // Wait for all fonts and QR to settle
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(passRef.current, {
        pixelRatio: 3,
        quality: 1,
        backgroundColor: '#09090b',
      });

      const link = document.createElement('a');
      link.download = `Pase-Abordaje-${ticket.ticketCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generando imagen del boarding pass:', err);
      alert('Hubo un problema al descargar la imagen. Puedes tomar una captura de pantalla.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ticketUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappLink = generateWhatsAppTicketLink({
    phone: ticket.attendeePhone,
    attendeeName: ticket.attendeeName,
    eventName: event?.title || 'Cumbre All-Star',
    ticketCode: ticket.ticketCode,
    ticketViewUrl: ticketUrl,
    referrerName: referrer?.fullName,
  });

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      {/* Boarding Pass Container */}
      <div
        ref={passRef}
        className="w-full bg-[#0e0e13] text-white rounded-2xl border border-allstar-gold/40 shadow-2xl overflow-hidden relative boarding-pass-isolated"
        style={{
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(255, 170, 0, 0.12) 0%, transparent 60%), radial-gradient(circle at 10% 85%, rgba(255, 85, 0, 0.08) 0%, transparent 50%)',
        }}
      >
        {/* Pass Header Banner with Official All Star Team Logo */}
        <div className="bg-gradient-to-r from-[#141419] via-[#1c1c24] to-[#141419] px-6 py-4 border-b border-allstar-gold/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <img
              src="/images/allstar-team-logo.png"
              alt="All Star Team"
              className="h-8 sm:h-9 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(255,170,0,0.35)]"
            />
            <div className="border-l border-white/15 pl-2.5">
              <div className="text-[9px] tracking-[0.25em] text-allstar-gold uppercase font-mono font-bold">
                PLATAFORMA OFICIAL
              </div>
              <h2 className="text-xs sm:text-sm font-bold font-luxury tracking-wider text-white">
                PASE DE ABORDAJE • BOARDING PASS
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-allstar-gold/20 text-allstar-gold border border-allstar-gold/40 font-bold tracking-wider shadow-sm">
              {ticketType?.name || 'PASE OFICIAL'}
            </span>
          </div>
        </div>

        {/* Pass Body (Main Coupon + Stub) */}
        <div className="flex flex-col md:flex-row relative">
          {/* LEFT: Main Flight/Cruise Coupon */}
          <div className="flex-1 p-6 sm:p-7 md:border-r md:border-dashed md:border-allstar-gold/30 relative">
            {/* Event Name & City */}
            <div className="mb-5">
              <div className="flex items-center space-x-2 text-xs text-allstar-gold font-mono tracking-widest uppercase mb-1">
                <Plane className="w-3.5 h-3.5" />
                <span>Destino Exclusivo</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-luxury text-white leading-tight">
                {event?.title || 'Cumbre All-Star 2026'}
              </h3>
              <div className="flex items-center text-xs text-slate-300 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-allstar-gold mr-1 shrink-0" />
                <span>{event?.venueName} • {event?.city}</span>
              </div>
            </div>

            {/* Passenger Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-white/10 my-4 text-left">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Pasajero / Asistente
                </span>
                <span className="text-sm sm:text-base font-bold text-white block uppercase truncate">
                  {ticket.attendeeName}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Fecha del Evento
                </span>
                <span className="text-sm font-semibold text-slate-200 block">
                  {dateFormatted}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Hora de Ingreso
                </span>
                <span className="text-sm font-semibold text-allstar-gold block">
                  {timeFormatted} HRS
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Invitado Especial por
                </span>
                <span className="text-sm font-semibold text-sky-400 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    {referrer ? `${referrer.fullName} (@${referrer.referralCode})` : 'Organización Oficial AllStar'}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Estado
                </span>
                <span
                  className={`text-xs font-mono font-bold uppercase inline-block px-2 py-0.5 rounded ${
                    ticket.status === 'checked_in'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {ticket.status === 'checked_in' ? 'Check-in Realizado' : 'Confirmado'}
                </span>
              </div>
            </div>

            {/* Bottom details & decorative strip */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Dirección:</span>
                <span className="text-slate-300 text-[11px] truncate block max-w-xs">{event?.venueAddress}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase text-slate-500 block">Identificador:</span>
                <span className="font-mono text-xs font-bold text-allstar-gold">{ticket.ticketCode}</span>
              </div>
            </div>

            {/* Decorative notches for tear coupon */}
            <div className="hidden md:block ticket-notch-right top-1/2 -mt-3"></div>
          </div>

          {/* RIGHT: Tear-off Stub with Dynamic QR */}
          <div className="w-full md:w-64 p-6 sm:p-7 bg-[#080e20] flex flex-col items-center justify-between text-center relative">
            <div className="hidden md:block ticket-notch-left top-1/2 -mt-3"></div>

            <div className="w-full">
              <span className="text-[10px] font-mono text-allstar-gold uppercase tracking-[0.2em] font-bold block mb-1">
                VALIDACIÓN EN PUERTA
              </span>
              <p className="text-xs text-slate-400 mb-3">Escanea al llegar</p>

              {/* Dynamic QR Code */}
              <div className="bg-white p-3 rounded-xl shadow-lg inline-block border-2 border-allstar-gold/50 mx-auto">
                <QRCodeSVG
                  value={ticket.ticketCode}
                  size={140}
                  level="H"
                  includeMargin={false}
                  fgColor="#0a0f1d"
                  bgColor="#ffffff"
                />
              </div>

              {/* Ticket Code */}
              <div className="mt-3">
                <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                  Código de Entrada
                </span>
                <span className="font-mono text-base font-extrabold text-allstar-gold tracking-widest">
                  {ticket.ticketCode}
                </span>
              </div>
            </div>

            {/* Decorative Barcode Lines */}
            <div className="w-full mt-4 pt-3 border-t border-white/10 flex flex-col items-center">
              <div className="h-7 w-4/5 flex items-center justify-between opacity-60">
                {Array.from({ length: 34 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-300 h-full"
                    style={{
                      width: i % 4 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px',
                      opacity: i % 3 === 0 ? 0.9 : 0.6,
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-1">
                NON-TRANSFERABLE • ALLSTAR TICKET
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-allstar-gradient text-black font-extrabold text-sm shadow-gold hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Generando Pase...' : 'Descargar Pase (HD)'}</span>
          </button>

          {/* WhatsApp Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
          </a>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-sm active:scale-95 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
